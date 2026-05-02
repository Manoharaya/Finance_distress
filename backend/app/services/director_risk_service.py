from sqlalchemy.orm import Session
from app.models.models import Company, DistressEvent, DistressScore, Director, CompanyDirector
import structlog

logger = structlog.get_logger()


class DirectorRiskService:
    """Analyses the distress reputation and exposure profile of individual directors."""

    def get_director_profile(self, db: Session, director_id: int) -> dict:
        director = db.query(Director).filter(Director.id == director_id).first()
        if not director:
            return {}

        # All companies this director has been linked to
        links = db.query(CompanyDirector).filter(
            CompanyDirector.director_id == director_id
        ).all()

        company_ids = [l.company_id for l in links]
        companies = db.query(Company).filter(Company.id.in_(company_ids)).all()

        active       = [c for c in companies if c.entity_status == "Active"]
        deregistered = [c for c in companies if c.entity_status in ["Deregistered", "In Liquidation"]]

        # Score contribution per linked entity
        raw_risk = 0
        raw_risk += len(deregistered) * 30   # liquidated = heavy hit
        raw_risk += len(active) * 5           # active = minor exposure
        raw_risk = min(raw_risk, 100)

        # Count legal events across all linked entities
        court_events = db.query(DistressEvent).filter(
            DistressEvent.company_id.in_(company_ids),
            DistressEvent.event_type.ilike("%winding%")
        ).count()

        insights = []
        if deregistered:
            insights.append(
                f"Director associated with {len(deregistered)} previously liquidated entity(ies)"
            )
        if len(active) > 1:
            insights.append(
                f"Currently directs {len(active)} active companies — concentration risk"
            )
        if court_events > 0:
            insights.append(
                f"{court_events} court action(s) detected across director network"
            )
        if len(deregistered) >= 2:
            insights.append("Serial insolvency pattern detected — Phoenix indicator flagged")

        reputation_index = max(0, 100 - raw_risk)

        return {
            "director_id": director_id,
            "full_name": director.full_name,
            "total_companies": len(companies),
            "active_companies": len(active),
            "liquidated_companies": len(deregistered),
            "court_event_count": court_events,
            "reputation_index": reputation_index,
            "risk_score": raw_risk,
            "insights": insights,
            "companies": [
                {
                    "id": c.id,
                    "name": c.company_name,
                    "status": c.entity_status,
                    "industry": c.industry
                } for c in companies
            ]
        }

    def get_directors_for_company(self, db: Session, company_id: int) -> list:
        links = db.query(CompanyDirector).filter(
            CompanyDirector.company_id == company_id
        ).all()
        profiles = []
        for link in links:
            p = self.get_director_profile(db, link.director_id)
            if p:
                p["role"] = link.role
                profiles.append(p)
        return profiles


director_risk_service = DirectorRiskService()
