from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import text
from app.core.db import get_db
from app.services.system_status_service import system_status_service
from app.services.data_freshness_service import data_freshness_service
from app.models.models import (
    Company, Director, CompanyDirector, 
    ScoreHistory, DistressScore, DistressEvent
)
import random
from datetime import datetime, timedelta

router = APIRouter()

@router.get("/status")
def get_system_status(db: Session = Depends(get_db)):
    """Returns overall platform health, monitoring status and freshness."""
    return system_status_service.get_overall_status(db)

@router.post("/seed-density")
def seed_density_endpoint(db: Session = Depends(get_db)):
    """Generates 180 days of deep historical intelligence history."""
    try:
        # Surgical clear
        db.execute(text("DELETE FROM intelligence_feed"))
        db.execute(text("DELETE FROM scraper_runs"))
        db.execute(text("DELETE FROM alerts"))
        db.execute(text("DELETE FROM score_history"))
        db.execute(text("DELETE FROM distress_scores"))
        db.execute(text("DELETE FROM distress_events"))
        db.execute(text("DELETE FROM company_directors"))
        db.execute(text("DELETE FROM directors"))
        db.execute(text("DELETE FROM companies"))
        db.commit()

        # Directors
        directors = []
        names = ["Gregory Vance", "Sarah Miller", "David Chen", "Elena Rodriguez", "Marcus Thorne", "Julianna Sterling", "Robert Blackwood", "Fiona Gallagher"]
        for name in names:
            d = Director(full_name=name, normalized_name=name.lower().replace(" ", "_"), reputation_index=random.randint(20, 95))
            db.add(d)
            directors.append(d)
        db.flush()

        # Companies
        companies = []
        for i in range(15):
            name_prefix = ["Apex", "Global", "Vance", "Miller", "Horizon", "Harbor", "Pacific", "Strategic", "Iron", "Quantum", "Beacon", "Core", "Prime", "Legacy", "Delta"]
            name_suffix = ["Solutions", "Logistics", "Group", "Enterprises", "Consulting", "Infrastructure", "Venues", "Holdings", "Capital", "Systems"]
            cname = f"{name_prefix[i]} {random.choice(name_suffix)} Pty Ltd"
            c = Company(company_name=cname, abn=f"{random.randint(10, 99)}{random.randint(100, 999)}{random.randint(100, 999)}{random.randint(10, 99)}", entity_status="Active", industry=random.choice(["Construction", "Transport", "Retail", "Manufacturing"]), registration_date=datetime.now() - timedelta(days=random.randint(500, 3000)))
            db.add(c)
            companies.append(c)
        db.flush()

        # Linkage
        for c in companies:
            assigned_directors = random.sample(directors, random.randint(1, 2))
            for d in assigned_directors:
                db.add(CompanyDirector(company_id=c.id, director_id=d.id, role="Director"))

        # History
        for i, c in enumerate(companies):
            start_score, end_score = (20, 85) if i < 5 else (30, 50) if i < 10 else (10, 20)
            arc_days = 120
            
            # Scores
            curr = start_score
            for d in range(0, arc_days, 10):
                change = random.randint(-2, 8) if end_score > start_score else random.randint(-5, 5)
                curr = max(0, min(100, curr + change))
                db.add(ScoreHistory(company_id=c.id, score=curr, risk_level="High" if curr >= 50 else "Medium", change_delta=change, momentum="RISING" if change > 0 else "STABLE", reason="Periodic scan", calculated_at=datetime.now() - timedelta(days=arc_days - d)))
            
            db.add(DistressScore(company_id=c.id, score=end_score, risk_level="High" if end_score >= 50 else "Medium", recommendation="Monitor", recommended_action="Check"))

            # Events
            for _ in range(20):
                db.add(DistressEvent(company_id=c.id, event_type="Surveillance Signal", severity=random.randint(10, 80), source="Registry", title="Registry Update", summary="Historical signal.", event_date=datetime.now() - timedelta(days=random.randint(0, arc_days))))

        db.commit()
        
        from app.services.demo_history_service import demo_history_service
        demo_history_service.ensure_density(db)
        
        return {"status": "success", "message": "Deep history and density simulation seeded."}
    except Exception as e:
        db.rollback()
        return {"status": "error", "message": str(e)}
