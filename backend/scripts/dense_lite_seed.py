import sys
import os
from datetime import datetime, timedelta, timezone
import random

# Add backend to path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from app.core.db import SessionLocal, Base, engine
from app.models.models import (
    Company, DistressEvent, DistressScore, Director, 
    CompanyDirector, Alert, ScoreHistory, IntelligenceFeed, ScraperRun
)

def seed_dense_lite():
    db = SessionLocal()
    print("🎬 Seeding Dense History (Lite)...")

    try:
        # Reset
        Base.metadata.drop_all(bind=engine)
        Base.metadata.create_all(bind=engine)

        # Directors
        directors = []
        for name in ["Gregory Vance", "Sarah Miller", "David Chen", "Elena Rodriguez"]:
            d = Director(full_name=name, normalized_name=name.lower().replace(" ", "_"), reputation_index=random.randint(30, 80))
            db.add(d)
            directors.append(d)
        db.flush()

        # 8 Companies
        for i in range(8):
            c = Company(
                company_name=f"Entity-{i} {random.choice(['Logistics', 'Solutions', 'Group'])}",
                abn=f"ABN-{i}000",
                entity_status="Active",
                industry=random.choice(["Construction", "Transport", "Retail"]),
                registration_date=datetime.now() - timedelta(days=1000)
            )
            db.add(c)
            db.flush()
            
            # Link to random director
            db.add(CompanyDirector(company_id=c.id, director_id=random.choice(directors).id, role="Director"))

            # 20 History Points
            for d in range(0, 100, 5):
                score = random.randint(20, 80)
                db.add(ScoreHistory(
                    company_id=c.id,
                    score=score,
                    risk_level="High" if score > 50 else "Medium",
                    change_delta=random.randint(-5, 10),
                    momentum="RISING",
                    reason="Historical snapshot",
                    calculated_at=datetime.now() - timedelta(days=d)
                ))
            
            # 15 Events
            for e in range(15):
                db.add(DistressEvent(
                    company_id=c.id,
                    event_type="Surveillance Signal",
                    severity=random.randint(10, 70),
                    source="Registry",
                    title="Registry Ingestion",
                    summary="Historical intelligence record.",
                    event_date=datetime.now() - timedelta(days=random.randint(0, 100))
                ))
            
            # Final Score
            db.add(DistressScore(company_id=c.id, score=random.randint(40, 90), risk_level="High", recommendation="Monitor", recommended_action="Action"))

        # Feed
        for f in range(20):
            db.add(IntelligenceFeed(
                company_id=random.randint(1, 8),
                feed_type="MONITORING",
                severity="HIGH",
                source="System",
                title="Historical Feed Item",
                summary="System heartbeat.",
                event_time=datetime.now() - timedelta(minutes=random.randint(10, 1000))
            ))

        db.commit()
        print("✅ DENSE LITE SEEDED.")
    except Exception as e:
        db.rollback()
        print(f"❌ FAILED: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    seed_dense_lite()
