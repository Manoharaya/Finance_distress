from sqlalchemy.orm import Session
from datetime import datetime
import structlog
from app.models.models import Company, DistressEvent, Alert
from app.services.event_severity_service import severity_service
from app.services.distress_score_service import distress_score_service
from app.constants.event_types import Priority

logger = structlog.get_logger()

class EventPipeline:
    @staticmethod
    def process_raw_signal(db: Session, raw_signal: dict):
        """
        Processes a raw signal from a scraper into a standardized DistressEvent.
        """
        try:
            # 1. Normalize/Validate
            company_id = raw_signal.get("company_id")
            event_type = raw_signal.get("event_type")
            
            # 2. Check for duplicates
            existing = db.query(DistressEvent).filter(
                DistressEvent.company_id == company_id,
                DistressEvent.event_type == event_type,
                DistressEvent.event_date == raw_signal.get("event_date")
            ).first()
            
            if existing:
                logger.info("Skipping duplicate event", company_id=company_id, type=event_type)
                return existing

            # 3. Assign Severity
            severity = severity_service.get_severity(event_type)
            
            # 4. Create Event
            new_event = DistressEvent(
                company_id=company_id,
                event_type=event_type,
                severity=severity,
                source=raw_signal.get("source"),
                title=raw_signal.get("title"),
                summary=raw_signal.get("summary"),
                event_date=raw_signal.get("event_date"),
                recommendation=raw_signal.get("recommendation", "Monitor entity closely."),
                metadata_json=raw_signal.get("metadata", {}),
                raw_data=raw_signal.get("raw_data", {}),
                status="Detected"
            )
            db.add(new_event)
            db.flush()
            
            # 5. Update Distress Score
            distress_score_service.calculate_and_save_score(db, company_id)
            
            # 6. Generate Alert for High Severity
            if severity >= 70:
                alert = Alert(
                    company_id=company_id,
                    alert_type="CRITICAL_SIGNAL",
                    message=f"Critical event detected: {new_event.title}",
                    priority=Priority.CRITICAL if severity >= 90 else Priority.HIGH
                )
                db.add(alert)
            
            db.commit()
            logger.info("Successfully processed event", company_id=company_id, type=event_type)
            return new_event
            
        except Exception as e:
            db.rollback()
            logger.error("Event processing failed", error=str(e))
            raise e

event_pipeline = EventPipeline()
