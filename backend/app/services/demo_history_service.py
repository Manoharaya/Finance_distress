from sqlalchemy.orm import Session
from app.models.models import Company, DistressEvent, DistressScore, ScoreHistory, IntelligenceFeed
from datetime import datetime, timedelta, timezone
import random

class DemoHistoryService:
    """
    Service to ensure platform density and historical richness for demos.
    """

    def ensure_density(self, db: Session):
        """
        Check if data is sparse and backfill history if needed.
        """
        companies = db.query(Company).all()
        for company in companies:
            # Check history count
            history_count = db.query(ScoreHistory).filter(ScoreHistory.company_id == company.id).count()
            if history_count < 10:
                self._backfill_company_history(db, company.id)
        
        db.commit()

    def _backfill_company_history(self, db: Session, company_id: int):
        # Generate 12 weeks of history
        for i in range(12):
            score = random.randint(20, 80)
            db.add(ScoreHistory(
                company_id=company_id,
                score=score,
                risk_level="High" if score > 60 else "Medium" if score > 30 else "Low",
                change_delta=random.randint(-5, 10),
                momentum="RISING" if i > 6 else "STABLE",
                reason="Historical intelligence backfill",
                calculated_at=datetime.now() - timedelta(days=i * 7)
            ))
        
        # Add some historical events
        for _ in range(5):
            db.add(DistressEvent(
                company_id=company_id,
                event_type="Registry Update",
                severity=random.randint(10, 50),
                source="System",
                title="Historical Signal Ingested",
                summary="Auto-captured historical event for density simulation.",
                event_date=datetime.now() - timedelta(days=random.randint(10, 90))
            ))

demo_history_service = DemoHistoryService()
