from sqlalchemy.orm import Session
from app.models.models import Company, DistressEvent, CompanyDirector, Director, DistressScore
from app.services.source_reliability_service import source_reliability_service
from app.services.freshness_service import freshness_service
from app.constants.confidence_levels import classify_confidence
import structlog

logger = structlog.get_logger()

# High-value source types that confirm serious distress
HIGH_IMPACT_SOURCES = {"Federal Court", "Federal Court Registry", "ASIC", "ASIC Registry", "PPSR", "PPSR Register"}

class ConfidenceEngine:

    def calculate(self, db: Session, company_id: int) -> dict:
        """
        Master confidence calculation pipeline.
        Returns a full structured confidence report.
        """
        events = db.query(DistressEvent).filter(
            DistressEvent.company_id == company_id,
            DistressEvent.is_active == True
        ).all()

        company = db.query(Company).filter(Company.id == company_id).first()
        latest_score = db.query(DistressScore).filter(
            DistressScore.company_id == company_id
        ).order_by(DistressScore.calculated_at.desc()).first()

        raw_score = 0
        reasoning = []
        source_breakdown = []

        if not events:
            return self._empty_report(company_id)

        # ── 1. Source reliability contribution ───────────────────────────────
        sources_seen = set()
        high_trust_count = 0
        for event in events:
            src = event.source or "Unknown"
            trust = source_reliability_service.get_trust_score(src)
            tier  = source_reliability_service.to_reliability_tier(trust)
            contribution = round(trust * 0.30)   # max 30pts per source capped below
            raw_score += min(contribution, 30)
            sources_seen.add(src)
            if src not in {s["source"] for s in source_breakdown}:
                source_breakdown.append({
                    "source": src,
                    "trust_score": trust,
                    "tier": tier,
                    "contribution": min(contribution, 30)
                })
            if src in HIGH_IMPACT_SOURCES:
                high_trust_count += 1

        if high_trust_count >= 1:
            reasoning.append(f"{high_trust_count} high-reliability source(s) confirmed (Federal Court / ASIC / PPSR)")

        # ── 2. Signal corroboration ───────────────────────────────────────────
        event_count = len(events)
        if event_count >= 3:
            raw_score += 20
            reasoning.append(f"Strong corroboration — {event_count} independent signals detected")
        elif event_count == 2:
            raw_score += 10
            reasoning.append("Dual-signal corroboration detected")
        else:
            raw_score -= 10
            reasoning.append("Single signal only — limited corroboration")

        # Repeated legal actions
        legal_events = [e for e in events if any(
            k in (e.event_type or "") for k in ["Winding Up", "Court", "Legal"]
        )]
        if len(legal_events) >= 2:
            raw_score += 15
            reasoning.append(f"Repeated legal events ({len(legal_events)}) escalate confidence")
        elif legal_events:
            raw_score += 8
            reasoning.append("Legal action detected — confidence elevated")

        # High severity signals
        high_sev = [e for e in events if (e.severity or 0) >= 40]
        if high_sev:
            raw_score += min(len(high_sev) * 8, 20)
            reasoning.append(f"{len(high_sev)} high-severity signal(s) detected")

        # ── 3. Freshness analysis ─────────────────────────────────────────────
        dates = [e.event_date for e in events if e.event_date]
        freshness = freshness_service.get_portfolio_freshness(dates)
        bonus = min(max(freshness["score"], -15), 20)
        raw_score += bonus
        reasoning.append(freshness["label"])

        # ── 4. Network confidence boost ───────────────────────────────────────
        network_boost = self._network_boost(db, company_id, reasoning)
        raw_score += network_boost

        # ── 5. Penalty for stale/weak signals ────────────────────────────────
        old_events = [e for e in events if e.event_date and
                      (e.event_date).replace(tzinfo=None) is not None]
        low_sev = [e for e in events if (e.severity or 0) < 10]
        if low_sev and event_count == 1:
            raw_score -= 10
            reasoning.append("Sole signal has low severity — confidence penalised")

        # Final cap
        final = min(max(raw_score, 0), 100)
        level = classify_confidence(final)

        logger.info("Confidence calculated", company_id=company_id, score=final, level=level)

        return {
            "company_id": company_id,
            "confidence_score": final,
            "confidence_level": level.value,
            "reasoning": reasoning,
            "source_breakdown": sorted(source_breakdown, key=lambda x: -x["trust_score"]),
            "freshness": freshness,
            "event_count": event_count,
            "high_trust_sources": high_trust_count,
            "corroboration_count": event_count,
            "distress_score": latest_score.score if latest_score else 0
        }

    def _network_boost(self, db: Session, company_id: int, reasoning: list) -> int:
        """Boost confidence if directors are linked to historically distressed entities."""
        boost = 0
        director_links = db.query(CompanyDirector).filter(
            CompanyDirector.company_id == company_id
        ).all()

        distressed_linked = 0
        for link in director_links:
            other_links = db.query(CompanyDirector).filter(
                CompanyDirector.director_id == link.director_id,
                CompanyDirector.company_id != company_id
            ).all()
            for ol in other_links:
                other = db.query(Company).filter(Company.id == ol.company_id).first()
                if other and other.entity_status in ["Deregistered", "In Liquidation"]:
                    distressed_linked += 1

        if distressed_linked > 0:
            boost = min(distressed_linked * 10, 20)
            reasoning.append(
                f"Director network contains {distressed_linked} historically distressed entity(ies) — confidence elevated"
            )
        return boost

    def _empty_report(self, company_id: int) -> dict:
        return {
            "company_id": company_id,
            "confidence_score": 0,
            "confidence_level": "LOW",
            "reasoning": ["No distress signals on record — confidence cannot be established"],
            "source_breakdown": [],
            "freshness": {"score": 0, "label": "No signals", "tier": "UNKNOWN"},
            "event_count": 0,
            "high_trust_sources": 0,
            "corroboration_count": 0,
            "distress_score": 0
        }


confidence_engine = ConfidenceEngine()
