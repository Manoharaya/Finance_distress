from sqlalchemy.orm import Session
from app.models.models import IntelligenceFeed, Company
from datetime import datetime, timedelta, timezone
import structlog

logger = structlog.get_logger()

class IntelligenceFeedService:
    """
    Manages the latest intelligence feed, aggregating events and ranking them.
    """

    def get_latest_feed(self, db: Session, limit: int = 20, severity: str = None) -> list:
        query = db.query(IntelligenceFeed, Company).join(Company).order_by(IntelligenceFeed.event_time.desc())
        
        if severity:
            query = query.filter(IntelligenceFeed.severity == severity)
            
        items = query.limit(limit).all()
        
        feed = []
        for feed_item, company in items:
            feed.append({
                "id": feed_item.id,
                "company_id": company.id,
                "company_name": company.company_name,
                "feed_type": feed_item.feed_type,
                "severity": feed_item.severity,
                "source": feed_item.source,
                "title": feed_item.title,
                "summary": feed_item.summary,
                "event_time": feed_item.event_time.isoformat() if feed_item.event_time else None,
                "metadata": feed_item.metadata_json
            })
            
        return feed

    def add_feed_item(self, db: Session, company_id: int, feed_type: str, severity: str, source: str, title: str, summary: str, metadata: dict = None):
        """Adds a new intelligence item to the feed."""
        item = IntelligenceFeed(
            company_id=company_id,
            feed_type=feed_type,
            severity=severity,
            source=source,
            title=title,
            summary=summary,
            metadata_json=metadata,
            event_time=datetime.now(timezone.utc)
        )
        db.add(item)
        db.commit()
        db.refresh(item)
        return item

intelligence_feed_service = IntelligenceFeedService()
