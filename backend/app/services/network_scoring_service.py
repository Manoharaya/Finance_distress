from sqlalchemy.orm import Session
from app.models.models import Company, DistressScore, DistressEvent, CompanyDirector
import structlog

logger = structlog.get_logger()

SCORE_RULES = {
    "liquidated_entity":      30,
    "distressed_entity":      20,
    "active_legal_exposure":  20,
    "repeated_director":      15,
    "high_risk_association":  10,
    "multi_company_cluster":  10,
}

RISK_LEVELS = [
    (70, "HIGH"),
    (40, "MODERATE"),
    (0,  "LOW"),
]


class NetworkScoringService:

    def calculate_network_score(
        self,
        distressed_count:  int,
        liquidated_count:  int,
        legal_cross_count: int,
        repeat_directors:  int,
        high_risk_dirs:    int
    ) -> dict:
        score = 0
        breakdown = []

        if liquidated_count > 0:
            pts = min(liquidated_count * SCORE_RULES["liquidated_entity"], 60)
            score += pts
            breakdown.append({"factor": "Liquidated entities in network",  "points": pts})

        if distressed_count > 0:
            pts = min(distressed_count * SCORE_RULES["distressed_entity"], 40)
            score += pts
            breakdown.append({"factor": "Active distressed entities",       "points": pts})

        if legal_cross_count > 0:
            pts = min(legal_cross_count * SCORE_RULES["active_legal_exposure"], 20)
            score += pts
            breakdown.append({"factor": "Cross-network legal actions",      "points": pts})

        if repeat_directors > 0:
            pts = min(repeat_directors * SCORE_RULES["repeated_director"], 30)
            score += pts
            breakdown.append({"factor": "Repeated-distress director pattern", "points": pts})

        if high_risk_dirs > 0:
            pts = min(high_risk_dirs * SCORE_RULES["high_risk_association"], 20)
            score += pts
            breakdown.append({"factor": "High-risk director associations",  "points": pts})

        final = min(score, 100)
        level = next(lvl for threshold, lvl in RISK_LEVELS if final >= threshold)

        return {
            "network_exposure_score": final,
            "risk_level": level,
            "score_breakdown": breakdown
        }


network_scoring_service = NetworkScoringService()
