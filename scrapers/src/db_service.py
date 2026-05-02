from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from scrapers.src.config import scraper_settings
# Note: Importing models requires path setup if run directly, 
# but here we assume it's part of the package execution
from app.models.models import DistressEvent

engine = create_engine(scraper_settings.DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

class DBService:
    @staticmethod
    def save_distress_event(company_id: int, event_data: dict):
        db = SessionLocal()
        try:
            new_event = DistressEvent(
                company_id=company_id,
                event_type=event_data.get("event_type", "Generic"),
                source=event_data.get("source", "Scraper"),
                severity=event_data.get("severity", 10),
                title=event_data.get("title", "Scraper Alert"),
                summary=event_data.get("summary", ""),
                event_date=event_data.get("event_date"),
                status=event_data.get("status", "Active"),
                raw_data=event_data.get("raw_data")
            )
            db.add(new_event)
            db.commit()
            return new_event
        except Exception:
            db.rollback()
            raise
        finally:
            db.close()

db_service = DBService()
