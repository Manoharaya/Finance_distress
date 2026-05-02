from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from app.models.models import DistressScore
import structlog

logger = structlog.get_logger()

class RiskMomentumService:

    def get_momentum(self, db: Session, company_id: int) -> dict:
        scores = db.query(DistressScore).filter(
            DistressScore.company_id == company_id
        ).order_by(DistressScore.calculated_at.asc()).all()

        if len(scores) < 2:
            return {
                "momentum": "Insufficient Data",
                "label": "No trend established",
                "pct_change": 0,
                "direction": "flat",
                "drivers": []
            }

        latest = scores[-1]
        previous = scores[-2]
        oldest = scores[0]

        # Short-term: last two
        pct_change = 0
        if previous.score and previous.score > 0:
            pct_change = round(((latest.score - previous.score) / previous.score) * 100, 1)

        # Days between oldest and latest
        days_span = 1
        if oldest.calculated_at and latest.calculated_at:
            delta = latest.calculated_at - oldest.calculated_at
            days_span = max(delta.days, 1)

        # Overall trajectory
        total_increase = latest.score - oldest.score

        # Classify momentum
        if pct_change >= 30:
            momentum = "Rapid Escalation"
            direction = "up"
            label = f"Risk score surged {abs(pct_change)}% — immediate attention required."
        elif pct_change >= 15:
            momentum = "Accelerating"
            direction = "up"
            label = f"Distress velocity increasing — score up {abs(pct_change)}% recently."
        elif pct_change >= 5:
            momentum = "Rising"
            direction = "up"
            label = f"Score trending upward — {abs(pct_change)}% increase detected."
        elif pct_change <= -10:
            momentum = "Improving"
            direction = "down"
            label = "Risk profile improving — signals stabilising."
        else:
            momentum = "Stable"
            direction = "flat"
            label = "No significant change in risk trajectory."

        return {
            "momentum": momentum,
            "label": label,
            "pct_change": pct_change,
            "direction": direction,
            "total_change": total_increase,
            "days_span": days_span,
            "current_score": latest.score,
            "baseline_score": oldest.score
        }


risk_momentum_service = RiskMomentumService()
