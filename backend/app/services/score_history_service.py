from sqlalchemy.orm import Session
from datetime import datetime
from app.models.models import ScoreHistory, DistressScore
import structlog

logger = structlog.get_logger()

MOMENTUM_THRESHOLDS = [
    (40, 3,  "CRITICAL"),
    (25, 7,  "ESCALATING"),
    (5,  30, "RISING"),
]

def classify_momentum(delta: int, days: int) -> str:
    for threshold_delta, threshold_days, label in MOMENTUM_THRESHOLDS:
        if delta >= threshold_delta and days <= threshold_days:
            return label
    if delta <= -5:
        return "IMPROVING"
    return "STABLE"


class ScoreHistoryService:

    def save_snapshot(
        self,
        db: Session,
        company_id: int,
        score: int,
        risk_level: str,
        reason: str = "",
        calculated_at: datetime = None
    ) -> ScoreHistory:
        """Persist a score snapshot and compute delta/momentum vs previous entry."""
        # Get previous snapshot
        prev = db.query(ScoreHistory).filter(
            ScoreHistory.company_id == company_id
        ).order_by(ScoreHistory.calculated_at.desc()).first()

        delta = 0
        days_since_prev = 30
        if prev:
            delta = score - prev.score
            if prev.calculated_at and calculated_at:
                diff = calculated_at - prev.calculated_at
                days_since_prev = max(diff.days, 1)

        momentum = classify_momentum(delta, days_since_prev)

        snapshot = ScoreHistory(
            company_id=company_id,
            score=score,
            risk_level=risk_level,
            change_delta=delta,
            momentum=momentum,
            reason=reason or f"Score updated to {score}",
            calculated_at=calculated_at or datetime.now()
        )
        db.add(snapshot)
        db.commit()
        logger.info("Score snapshot saved", company_id=company_id, score=score, momentum=momentum)
        return snapshot

    def get_history(self, db: Session, company_id: int, limit: int = 30) -> list:
        """Return chronological score history."""
        rows = db.query(ScoreHistory).filter(
            ScoreHistory.company_id == company_id
        ).order_by(ScoreHistory.calculated_at.asc()).limit(limit).all()

        return [
            {
                "date": r.calculated_at.strftime("%Y-%m-%d") if r.calculated_at else None,
                "score": r.score,
                "risk_level": r.risk_level,
                "change_delta": r.change_delta,
                "momentum": r.momentum,
                "reason": r.reason
            }
            for r in rows
        ]

    def get_momentum_summary(self, db: Session, company_id: int) -> dict:
        """Produce a rich momentum summary for the intelligence panel."""
        history = db.query(ScoreHistory).filter(
            ScoreHistory.company_id == company_id
        ).order_by(ScoreHistory.calculated_at.asc()).all()

        if not history:
            return {"status": "STABLE", "delta_7d": 0, "delta_30d": 0,
                    "current_score": 0, "label": "No historical data."}

        current = history[-1]
        now = current.calculated_at or datetime.now()

        # 7-day delta
        delta_7d = 0
        for h in reversed(history[:-1]):
            if h.calculated_at and (now - h.calculated_at).days <= 7:
                delta_7d = current.score - h.score
                break
            elif h.calculated_at:
                delta_7d = current.score - h.score
                break

        # 30-day delta
        delta_30d = current.score - history[0].score

        # Overall momentum
        status = current.momentum or "STABLE"
        if delta_7d >= 30:
            label = f"Risk score surged +{delta_7d} pts — critical escalation underway."
        elif delta_7d >= 15:
            label = f"Distress velocity accelerating — +{delta_7d} pts in recent period."
        elif delta_7d >= 5:
            label = f"Score trending upward — +{delta_7d} pts detected."
        elif delta_7d < 0:
            label = f"Risk profile improving — score down {abs(delta_7d)} pts."
        else:
            label = "No significant momentum change detected."

        return {
            "status": status,
            "delta_7d": delta_7d,
            "delta_30d": delta_30d,
            "current_score": current.score,
            "baseline_score": history[0].score,
            "total_snapshots": len(history),
            "label": label
        }


score_history_service = ScoreHistoryService()
