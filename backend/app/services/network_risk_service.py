from sqlalchemy.orm import Session
from app.models.models import Company, DistressScore, DistressEvent, Director, CompanyDirector
from app.services.director_risk_service import director_risk_service
from app.services.network_scoring_service import network_scoring_service
import structlog

logger = structlog.get_logger()

DISTRESS_STATUSES = {"Deregistered", "In Liquidation"}


class NetworkRiskService:
    """
    Master network risk analysis engine.
    Maps all entity/director relationships and produces an
    intelligence-grade network exposure report.
    """

    def analyze(self, db: Session, company_id: int) -> dict:
        company = db.query(Company).filter(Company.id == company_id).first()
        if not company:
            return {}

        # ── 1. Map directors ───────────────────────────────────────────────
        director_links = db.query(CompanyDirector).filter(
            CompanyDirector.company_id == company_id
        ).all()

        director_ids = [l.director_id for l in director_links]

        # ── 2. Find peer companies through shared directors ─────────────────
        peer_links = db.query(CompanyDirector).filter(
            CompanyDirector.director_id.in_(director_ids),
            CompanyDirector.company_id != company_id
        ).all()

        peer_company_ids = list({l.company_id for l in peer_links})
        peer_companies   = db.query(Company).filter(Company.id.in_(peer_company_ids)).all()

        # ── 3. Classify peers ───────────────────────────────────────────────
        liquidated   = [c for c in peer_companies if c.entity_status in DISTRESS_STATUSES]
        distressed   = []
        for c in peer_companies:
            if c.entity_status not in DISTRESS_STATUSES:
                score_row = db.query(DistressScore).filter(
                    DistressScore.company_id == c.id
                ).order_by(DistressScore.calculated_at.desc()).first()
                if score_row and score_row.score >= 60:
                    distressed.append(c)

        # ── 4. Director profiles ────────────────────────────────────────────
        director_profiles = []
        repeat_distress_directors = 0
        high_risk_directors       = 0
        for d_id in director_ids:
            profile = director_risk_service.get_director_profile(db, d_id)
            director_profiles.append(profile)
            if profile.get("liquidated_companies", 0) >= 1:
                repeat_distress_directors += 1
            if profile.get("risk_score", 0) >= 50:
                high_risk_directors += 1

        # ── 5. Cross-network legal exposure ─────────────────────────────────
        cross_legal = db.query(DistressEvent).filter(
            DistressEvent.company_id.in_(peer_company_ids),
            DistressEvent.event_type.ilike("%winding%")
        ).count()

        # ── 6. Network score ───────────────────────────────────────────────
        scoring = network_scoring_service.calculate_network_score(
            distressed_count  = len(distressed),
            liquidated_count  = len(liquidated),
            legal_cross_count = cross_legal,
            repeat_directors  = repeat_distress_directors,
            high_risk_dirs    = high_risk_directors
        )

        # ── 7. Intelligence summary bullets ───────────────────────────────
        summary = []
        if liquidated:
            names = ", ".join(c.company_name for c in liquidated[:2])
            summary.append(
                f"{len(liquidated)} historically liquidated entity(ies) in director network ({names})"
            )
        if distressed:
            summary.append(
                f"{len(distressed)} actively distressed entity(ies) detected across shared directors"
            )
        if cross_legal > 0:
            summary.append(
                f"{cross_legal} legal action(s) detected across connected entity network"
            )
        if repeat_distress_directors > 0:
            summary.append(
                f"{repeat_distress_directors} director(s) with prior insolvency association — Phoenix pattern indicators active"
            )
        if high_risk_directors > 0:
            summary.append(
                f"{high_risk_directors} high-risk director association(s) detected"
            )
        if not summary:
            summary.append("No significant network risk exposure detected at this time")

        # ── 8. Cascading risk detection ────────────────────────────────────
        cascading_risk = len(distressed) > 0 and len(liquidated) > 0
        cascade_label  = "Active" if cascading_risk else "None detected"

        # ── 9. Linked entities detail ──────────────────────────────────────
        linked_entities = []
        for c in peer_companies:
            s = db.query(DistressScore).filter(
                DistressScore.company_id == c.id
            ).order_by(DistressScore.calculated_at.desc()).first()

            is_liquidated = c.entity_status in DISTRESS_STATUSES
            linked_entities.append({
                "id":           c.id,
                "name":         c.company_name,
                "industry":     c.industry,
                "status":       c.entity_status,
                "distress_score": s.score if s else 0,
                "risk_level":   s.risk_level if s else "Unknown",
                "is_liquidated":is_liquidated,
                "is_distressed":any(d.id == c.id for d in distressed),
            })

        return {
            "company_id":              company_id,
            "company_name":            company.company_name,
            "network_exposure_score":  scoring["network_exposure_score"],
            "risk_level":              scoring["risk_level"],
            "score_breakdown":         scoring["score_breakdown"],
            "summary":                 summary,
            "metrics": {
                "total_linked_entities": len(peer_companies),
                "distressed_entities":   len(distressed),
                "liquidated_entities":   len(liquidated),
                "shared_directors":      len(director_ids),
                "high_risk_directors":   high_risk_directors,
                "repeat_distress_directors": repeat_distress_directors,
                "cross_legal_actions":   cross_legal,
            },
            "cascading_risk":           cascade_label,
            "is_cascading":             cascading_risk,
            "linked_entities":          linked_entities,
            "director_profiles":        director_profiles,
        }


network_risk_service = NetworkRiskService()
