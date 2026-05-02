import structlog
from sqlalchemy.orm import Session
from app.models.models import Alert, DistressScore, DistressEvent, Company
from app.constants.event_types import Priority
from datetime import datetime, timedelta

logger = structlog.get_logger()

class AlertService:
    @staticmethod
    def check_velocity_alert(db: Session, company_id: int):
        """Checks if score increased significantly in a short period."""
        recent_scores = db.query(DistressScore).filter(
            DistressScore.company_id == company_id
        ).order_by(DistressScore.calculated_at.desc()).limit(2).all()

        if len(recent_scores) < 2:
            return

        score_diff = recent_scores[0].score - recent_scores[1].score
        if score_diff >= 20:
            alert = Alert(
                company_id=company_id,
                alert_type="VELOCITY_SURGE",
                message=f"Critical Risk Velocity: Score increased by {score_diff}pts in 48h.",
                priority=Priority.CRITICAL
            )
            db.add(alert)
            db.commit()
            logger.info("Velocity alert triggered", company_id=company_id, increase=score_diff)

    @staticmethod
    def trigger_court_alert(db: Session, event: DistressEvent):
        """Triggers high priority alert for court actions."""
        if "Court" in event.source or "Winding Up" in event.event_type:
            alert = Alert(
                company_id=event.company_id,
                alert_type="LEGAL_ACTION",
                message=f"Urgent: {event.title} detected.",
                priority=Priority.CRITICAL
            )
            db.add(alert)
            db.commit()
            logger.info("Court alert triggered", company_id=event.company_id)

alert_service = AlertService()
