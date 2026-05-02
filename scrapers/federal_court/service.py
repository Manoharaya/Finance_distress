# Path fixed for module resolution
import sys
import os

from app.models.models import Company, DistressEvent
from scrapers.src.db_service import SessionLocal
import structlog

logger = structlog.get_logger()

class CourtService:
    @staticmethod
    def process_event(event_data: dict):
        db = SessionLocal()
        try:
            # 1. Find or create company
            company = db.query(Company).filter(
                (Company.normalized_name == event_data["normalized_name"]) |
                (Company.company_name == event_data["company_name"])
            ).first()

            if not company:
                company = Company(
                    company_name=event_data["company_name"],
                    normalized_name=event_data["normalized_name"],
                    entity_status="Monitor"
                )
                db.add(company)
                db.flush() # Get company ID
                logger.info("Created new company", name=company.company_name)

            # 2. Check for duplicate event
            existing_event = db.query(DistressEvent).filter(
                DistressEvent.company_id == company.id,
                DistressEvent.event_type == event_data["case_type"],
                DistressEvent.event_date == event_data["filing_date"]
            ).first()

            if not existing_event:
                new_event = DistressEvent(
                    company_id=company.id,
                    event_type=event_data["case_type"],
                    source=event_data["court"],
                    severity=40 if "Winding Up" in event_data["case_type"] else 10,
                    title=f"Court Filing: {event_data['case_type']}",
                    summary=f"New filing detected in {event_data['court']}",
                    event_date=event_data["filing_date"],
                    status=event_data.get("status", "Active"),
                    raw_data=event_data.get("raw_data")
                )
                db.add(new_event)
                db.commit()
                logger.info("Saved new court event", company=company.company_name, type=new_event.event_type)
                return new_event
            
            # If we created a company but no new event, we still need to commit the company
            db.commit()
            return None
        except Exception as e:
            db.rollback()
            logger.error("Failed to process event", error=str(e))
            raise e
        finally:
            db.close()
