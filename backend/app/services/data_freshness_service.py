from sqlalchemy.orm import Session
from app.models.models import ScraperRun, IntelligenceFeed
from app.constants.freshness_levels import get_freshness_label, FreshnessLevel
from datetime import datetime, timezone
import structlog

logger = structlog.get_logger()

class DataFreshnessService:
    """
    Calculates operational freshness across all intelligence sources.
    """

    def get_system_freshness(self, db: Session) -> dict:
        # Get last successful run across all scrapers
        last_run = db.query(ScraperRun).filter(
            ScraperRun.status == "SUCCESS"
        ).order_by(ScraperRun.completed_at.desc()).first()

        if not last_run:
            return {
                "status": "UNKNOWN",
                "last_updated": "Never",
                "last_updated_mins": 0,
                "label": "NO DATA",
                "level": FreshnessLevel.STALE,
                "active_scrapers": 0
            }

        now = datetime.now(timezone.utc)
        completed_at = last_run.completed_at
        if completed_at.tzinfo is None:
            completed_at = completed_at.replace(tzinfo=timezone.utc)

        diff = now - completed_at
        mins = int(diff.total_seconds() / 60)
        
        level = get_freshness_label(mins)
        
        # Calculate human readable label
        if mins < 1:
            label = "Just now"
        elif mins < 60:
            label = f"{mins}m ago"
        else:
            label = f"{mins // 60}h ago"

        return {
            "last_updated": label,
            "last_updated_mins": mins,
            "level": level,
            "last_scrape_time": completed_at.strftime("%I:%M %p"),
            "active_scrapers": db.query(ScraperRun.scraper_name).distinct().count()
        }

    def get_source_freshness(self, db: Session) -> list:
        sources = db.query(ScraperRun.scraper_name).distinct().all()
        report = []
        for (name,) in sources:
            last = db.query(ScraperRun).filter(
                ScraperRun.scraper_name == name,
                ScraperRun.status == "SUCCESS"
            ).order_by(ScraperRun.completed_at.desc()).first()
            
            if last:
                completed_at = last.completed_at.replace(tzinfo=timezone.utc) if last.completed_at.tzinfo is None else last.completed_at
                mins = int((datetime.now(timezone.utc) - completed_at).total_seconds() / 60)
                report.append({
                    "source": name,
                    "minutes_ago": mins,
                    "level": get_freshness_label(mins)
                })
        return report

data_freshness_service = DataFreshnessService()
