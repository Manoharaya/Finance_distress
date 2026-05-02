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

INDUSTRIES = ["Construction", "Transport", "Hospitality", "Retail", "Manufacturing", "Finance", "Healthcare"]
EVENT_TYPES = [
    ("ASIC", "Late Financial Reporting", 15),
    ("ASIC", "Director Resignation", 30),
    ("ASIC", "Address Change", 5),
    ("PPSR", "Security Interest Registered", 40),
    ("PPSR", "Amendment to Security Interest", 20),
    ("Federal Court", "Winding-Up Application", 90),
    ("Federal Court", "Garnishee Order", 75),
    ("News", "Reports of Financial Instability", 50),
    ("News", "Major Contract Cancellation", 60),
    ("AI Enrichment", "Phoenix Activity Pattern", 85),
    ("AI Enrichment", "Network Contagion Detected", 70),
    ("Relationship Intelligence", "Director linked to insolvent entity", 80),
]

def generate_realistic_score_history(company_id, start_score, end_score, days):
    history = []
    current_score = start_score
    for i in range(days):
        if i % 7 == 0: # Update every week-ish
            # Add some volatility
            change = random.randint(-2, 5)
            if end_score > start_score: # Worsening
                change += random.randint(1, 4)
            current_score = max(0, min(100, current_score + change))
            
            history.append({
                "score": current_score,
                "delta": change,
                "days_ago": days - i
            })
    # Final boost to reach end_score
    history[-1]["score"] = end_score
    return history

def seed_historical_density():
    db = SessionLocal()
    print("🎬 Initializing Deep Historical Intelligence Simulation (Perception Engineering Mode)...")

    try:
        # 1. Full Reset
        Base.metadata.drop_all(bind=engine)
        Base.metadata.create_all(bind=engine)

        # 2. Directors (The Network Core)
        directors = []
        names = [
            "Gregory Vance", "Sarah Miller", "David Chen", "Elena Rodriguez", 
            "Marcus Thorne", "Julianna Sterling", "Robert Blackwood", "Fiona Gallagher"
        ]
        for name in names:
            d = Director(full_name=name, normalized_name=name.lower().replace(" ", "_"), reputation_index=random.randint(20, 95))
            db.add(d)
            directors.append(d)
        db.flush()

        # 3. Companies (15 Entities)
        companies = []
        for i in range(15):
            is_distressed = i < 5 # First 5 are highly distressed
            is_stable = i > 10    # Last 4 are stable
            
            name_prefix = ["Apex", "Global", "Vance", "Miller", "Horizon", "Harbor", "Pacific", "Strategic", "Iron", "Quantum", "Beacon", "Core", "Prime", "Legacy", "Delta"]
            name_suffix = ["Solutions", "Logistics", "Group", "Enterprises", "Consulting", "Infrastructure", "Venues", "Holdings", "Capital", "Systems"]
            
            cname = f"{name_prefix[i]} {random.choice(name_suffix)} Pty Ltd"
            status = "Deregistered" if i == 0 else "Active"
            
            c = Company(
                company_name=cname,
                abn=f"{random.randint(10, 99)}{random.randint(100, 999)}{random.randint(100, 999)}{random.randint(10, 99)}",
                entity_status=status,
                industry=random.choice(INDUSTRIES),
                registration_date=datetime.now() - timedelta(days=random.randint(500, 3000))
            )
            db.add(c)
            companies.append(c)
        db.flush()

        # 4. Linkage (Relationships)
        for c in companies:
            # Assign 1-3 directors to each company
            assigned_directors = random.sample(directors, random.randint(1, 3))
            for d in assigned_directors:
                db.add(CompanyDirector(company_id=c.id, director_id=d.id, role=random.choice(["Director", "Managing Director", "Executive", "Secretary"])))

        # 5. Historical Events & Scores
        for i, c in enumerate(companies):
            # Determine narrative arc
            if i == 0: # The Liquidated King
                start_score, end_score, arc_days = 20, 96, 180
            elif i < 5: # Deteriorating
                start_score, end_score, arc_days = random.randint(15, 30), random.randint(70, 85), 120
            elif i < 10: # Volatile
                start_score, end_score, arc_days = random.randint(30, 45), random.randint(40, 60), 90
            else: # Stable
                start_score, end_score, arc_days = random.randint(10, 20), random.randint(15, 25), 60

            # Generate Score History
            score_history = generate_realistic_score_history(c.id, start_score, end_score, arc_days)
            for entry in score_history:
                db.add(ScoreHistory(
                    company_id=c.id,
                    score=entry["score"],
                    risk_level="Critical" if entry["score"] >= 70 else "High" if entry["score"] >= 50 else "Medium" if entry["score"] >= 30 else "Low",
                    change_delta=entry["delta"],
                    momentum="ESCALATING" if entry["delta"] > 3 else "RISING" if entry["delta"] > 0 else "STABLE",
                    reason="Automated scoring update",
                    calculated_at=datetime.now() - timedelta(days=entry["days_ago"])
                ))

            # Final Score
            db.add(DistressScore(
                company_id=c.id,
                score=end_score,
                risk_level="Critical" if end_score >= 70 else "High" if end_score >= 50 else "Medium",
                recommendation="Action recommended based on historical trajectory." if end_score > 50 else "Maintain routine monitoring.",
                recommended_action="Urgent Engagement" if end_score >= 70 else "Relationship Review" if end_score >= 50 else "Ongoing Monitoring"
            ))

            # Generate 15-40 Events
            num_events = random.randint(15, 40)
            for j in range(num_events):
                src, etype, sev_base = random.choice(EVENT_TYPES)
                # Spread them across the arc
                days_ago = random.randint(0, arc_days)
                db.add(DistressEvent(
                    company_id=c.id,
                    event_type=etype,
                    severity=sev_base + random.randint(-5, 5),
                    source=src,
                    title=etype,
                    summary=f"Historical record of {etype.lower()} captured during routine {src} monitoring cycle.",
                    event_date=datetime.now() - timedelta(days=days_ago)
                ))

            # Generate Alerts
            if end_score > 50:
                db.add(Alert(
                    company_id=c.id,
                    alert_type="HISTORICAL_TREND",
                    priority="HIGH" if end_score >= 70 else "MEDIUM",
                    message=f"Persistent distress momentum detected over {arc_days} days for {c.company_name}.",
                    is_read=None if random.random() > 0.5 else datetime.now() - timedelta(days=1)
                ))

        # 6. Intelligence Feed (The Pulse)
        now = datetime.now(timezone.utc)
        for i in range(50): # 50 feed items
            c = random.choice(companies)
            mins_ago = random.randint(10, 2000) # Spread over ~33 hours
            db.add(IntelligenceFeed(
                company_id=c.id,
                feed_type=random.choice(["LEGAL_ALERT", "RISK_SPIKE", "NETWORK_CONTAGION", "AI_ENRICHMENT"]),
                severity=random.choice(["CRITICAL", "HIGH", "MEDIUM"]),
                source=random.choice(["Federal Court", "ASIC", "PPSR", "AI Engine"]),
                title=f"Automated Signal: {c.company_name}",
                summary="Strategic intelligence signal generated via multi-source correlation engine.",
                event_time=now - timedelta(minutes=mins_ago)
            ))

        # 7. Scraper Runs (Operational History)
        for name in ["Federal Court", "ASIC", "PPSR", "Relationship Graph", "News Engine"]:
            for d in range(14): # 14 days of history
                db.add(ScraperRun(
                    scraper_name=name,
                    status="SUCCESS" if random.random() > 0.1 else "FAILED",
                    records_processed=random.randint(200, 1000),
                    records_inserted=random.randint(5, 50),
                    duration_ms=random.randint(3000, 20000),
                    completed_at=now - timedelta(days=d, minutes=random.randint(0, 1440))
                ))

        db.commit()
        print("✅ DEEP HISTORY SEEDED: Platform is now in 'Perception Maturity' mode.")
        
    except Exception as e:
        db.rollback()
        print(f"❌ SEEDING FAILED: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    seed_historical_density()
