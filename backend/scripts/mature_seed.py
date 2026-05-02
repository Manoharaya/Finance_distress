import sys
import os
from datetime import datetime, timedelta
import random

# Add backend to path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from app.core.db import SessionLocal, Base, engine
from app.models.models import Company, DistressEvent, DistressScore, Director, CompanyDirector, Alert, ScoreHistory, IntelligenceFeed, ScraperRun

def seed_mature_data():
    db = SessionLocal()
    print("Seeding Mature Intelligence Data with Demo Scenarios...")

    try:
        # 1. Reset Database
        Base.metadata.drop_all(bind=engine)
        Base.metadata.create_all(bind=engine)

        # 2. Shared Directors
        vance = Director(full_name="Gregory Vance", normalized_name="gregory_vance")
        miller = Director(full_name="Sarah Miller", normalized_name="sarah_miller")
        db.add_all([vance, miller])
        db.flush()

        # --- SCENARIO 1: THE CRITICAL CONSTRUCTION COLLAPSE ---
        construction = Company(
            company_name="Vance Civil & Infrastructure",
            abn="11222333444",
            entity_status="Active",
            industry="Construction",
            registration_date=datetime.now() - timedelta(days=500)
        )
        db.add(construction)
        db.flush()
        db.add(CompanyDirector(company_id=construction.id, director_id=vance.id, role="CEO"))
        
        # Events
        db.add(DistressEvent(company_id=construction.id, event_type="Winding Up Application", severity=50, source="Federal Court", title="ATO vs Vance Civil", summary="Tax-related liquidation application filed.", event_date=datetime.now() - timedelta(days=2)))
        db.add(DistressEvent(company_id=construction.id, event_type="Director Resignation", severity=20, source="ASIC", title="CFO Resignation", summary="Financial officer departed abruptly.", event_date=datetime.now() - timedelta(days=15)))
        db.add(DistressScore(company_id=construction.id, score=85, risk_level="Critical", recommendation="Critical distress detected.", recommended_action="Immediate Outreach"))

        # --- SCENARIO 2: THE HIGH-RISK TRANSPORT LOGISTICS ---
        transport = Company(
            company_name="Miller Global Logistics",
            abn="55666777888",
            entity_status="Active",
            industry="Transport",
            registration_date=datetime.now() - timedelta(days=800)
        )
        db.add(transport)
        db.flush()
        db.add(CompanyDirector(company_id=transport.id, director_id=miller.id, role="Director"))

        # Events
        db.add(DistressEvent(company_id=transport.id, event_type="Late Filing", severity=10, source="ASIC", title="Missed Financial Reporting", summary="2025 Financials overdue.", event_date=datetime.now() - timedelta(days=30)))
        db.add(DistressEvent(company_id=transport.id, event_type="Security Interest Lodged", severity=30, source="PPSR", title="Tier-1 Bank Security", summary="All assets encumbered.", event_date=datetime.now() - timedelta(days=10)))
        db.add(DistressScore(company_id=transport.id, score=75, risk_level="High", recommendation="Increasing risk signals detected.", recommended_action="Warm Contact"))

        # --- SCENARIO 3: THE MONITORING HOSPITALITY GROUP ---
        hospitality = Company(
            company_name="Pacific Coast Venues",
            abn="99000111222",
            entity_status="Active",
            industry="Hospitality",
            registration_date=datetime.now() - timedelta(days=1200)
        )
        db.add(hospitality)
        db.flush()
        db.add(CompanyDirector(company_id=hospitality.id, director_id=miller.id, role="Shareholder"))

        # Events
        db.add(DistressEvent(company_id=hospitality.id, event_type="Address Change", severity=5, source="ASIC", title="Head Office Relocation", summary="Moved to shared workspace.", event_date=datetime.now() - timedelta(days=45)))
        db.add(DistressScore(company_id=hospitality.id, score=45, risk_level="Medium", recommendation="Baseline distress detected.", recommended_action="Monitor Closely"))

        # --- THE PHOENIX LINK (FAILED COMPANY) ---
        failed = Company(
            company_name="Vance & Co (In Liquidation)",
            abn="00011122233",
            entity_status="Deregistered",
            industry="Construction",
            registration_date=datetime.now() - timedelta(days=2000)
        )
        db.add(failed)
        db.flush()
        db.add(CompanyDirector(company_id=failed.id, director_id=vance.id, role="Director"))

        # --- SCORE HISTORY: RICH TREND DATA ---
        # Scenario 1: Construction — rapid escalation arc
        construction_history = [
            (90, 15, "STABLE",     "Initial registration — no flags"),
            (85, 20, "STABLE",     "Clean compliance record"),
            (80, 22, "STABLE",     "Minor late filing detected"),
            (75, 25, "RISING",     "ASIC compliance warning issued"),
            (60, 30, "RISING",     "Director resignation filed"),
            (45, 45, "ESCALATING", "Director resignation + late financials"),
            (35, 60, "ESCALATING", "PPSR security interest detected"),
            (20, 75, "CRITICAL",   "ATO winding-up application filed"),
            (10, 90, "CRITICAL",   "Federal Court hearing scheduled"),
        ]
        scores = [10, 15, 25, 35, 48, 60, 72, 80, 85]
        deltas = [0,   5, 10, 10, 13, 12, 12,  8,  5]
        momentums = ["STABLE","STABLE","RISING","RISING","RISING","ESCALATING","ESCALATING","CRITICAL","CRITICAL"]
        reasons = [
            "Initial assessment", "Routine monitoring",
            "Late filing detected", "Director resignation",
            "PPSR security interest", "Multiple compliance failures",
            "Director linked to failed entity", "ATO winding-up application",
            "Federal Court action filed"
        ]
        for i, (score, delta, mom, reason) in enumerate(zip(scores, deltas, momentums, reasons)):
            db.add(ScoreHistory(
                company_id=construction.id,
                score=score,
                risk_level="Critical" if score >= 70 else "High" if score >= 50 else "Medium",
                change_delta=delta,
                momentum=mom,
                reason=reason,
                calculated_at=datetime.now() - timedelta(days=90 - i*11)
            ))

        # Scenario 2: Transport — gradual rise
        t_scores   = [5, 10, 20, 35, 50, 65, 75]
        t_deltas   = [0,  5, 10, 15, 15, 15, 10]
        t_momentums= ["STABLE","STABLE","RISING","RISING","ESCALATING","ESCALATING","ESCALATING"]
        t_reasons  = ["Initial scan","Late filing","Second late filing","PPSR lodged","Bank security extended","Asset restrictions","Creditor action"]
        for i, (sc, de, mo, re) in enumerate(zip(t_scores, t_deltas, t_momentums, t_reasons)):
            db.add(ScoreHistory(
                company_id=transport.id, score=sc,
                risk_level="High" if sc >= 50 else "Medium",
                change_delta=de, momentum=mo, reason=re,
                calculated_at=datetime.now() - timedelta(days=70 - i*10)
            ))

        # Scenario 3: Hospitality — low and slow
        h_scores   = [5, 8, 12, 15, 20, 22, 25, 28, 32, 35, 38, 42, 45]
        h_deltas   = [0, 3, 4, 3, 5, 2, 3, 3, 4, 3, 3, 4, 3]
        h_momentums= ["STABLE","STABLE","RISING","RISING","RISING","RISING","RISING","RISING","RISING","RISING","RISING","RISING","RISING"]
        h_reasons  = ["Baseline","Minor change","Address change","Director query","Sector headwind","Monitoring escalation", "Credit check", "Registry update", "Industry shift", "Compliance check", "Late filing", "Risk review", "Final assessment"]
        for i, (sc, de, mo, re) in enumerate(zip(h_scores, h_deltas, h_momentums, h_reasons)):
            db.add(ScoreHistory(
                company_id=hospitality.id, score=sc,
                risk_level="Medium" if sc >= 30 else "Low",
                change_delta=de, momentum=mo, reason=re,
                calculated_at=datetime.now() - timedelta(days=90 - i*7)
            ))

        # --- INTELLIGENCE FEED: LIVE OPERATIONS CENTER ---
        feed_items = [
            {
                "company_id": construction.id,
                "feed_type": "LEGAL_ESCALATION",
                "severity": "CRITICAL",
                "source": "Federal Court",
                "title": "ATO Winding-Up Application Filed",
                "summary": "The Deputy Commissioner of Taxation has filed an application to wind up Vance Civil & Infrastructure (ABN: 11222333444) in insolvency.",
                "minutes_ago": 42
            },
            {
                "company_id": transport.id,
                "feed_type": "RISK_SPIKE",
                "severity": "HIGH",
                "source": "Scoring Engine",
                "title": "Risk Momentum Escalated to CRITICAL",
                "summary": "Intelligence velocity for Miller Global Logistics has spiked 22% in the last 4 hours following detection of cross-network director risk.",
                "minutes_ago": 115
            },
            {
                "company_id": construction.id,
                "feed_type": "NETWORK_CONTAGION",
                "severity": "HIGH",
                "source": "Relationship Intelligence",
                "title": "Director Linked to Failed Entity",
                "summary": "Director Gregory Vance identified as having 3 previous associations with deregistered or liquidated entities in the construction sector.",
                "minutes_ago": 230
            },
            {
                "company_id": hospitality.id,
                "feed_type": "MONITORING_SIGNAL",
                "severity": "MEDIUM",
                "source": "ASIC",
                "title": "Head Office Relocation Detected",
                "summary": "Pacific Coast Venues has moved its primary place of business to a known virtual office provider in the CBD.",
                "minutes_ago": 310
            },
            {
                "company_id": transport.id,
                "feed_type": "LEGAL_ALERT",
                "severity": "HIGH",
                "source": "PPSR",
                "title": "All-Assets Security Interest Registered",
                "summary": "A new general security interest has been registered by a Tier-1 lender covering all present and after-acquired property.",
                "minutes_ago": 450
            },
            {
                "company_id": construction.id,
                "feed_type": "AI_ENRICHMENT",
                "severity": "CRITICAL",
                "source": "AI Enrichment",
                "title": "Phoenix Activity Pattern Identified",
                "summary": "AI pattern analysis indicates high probability of asset migration from Vance & Co (In Liquidation) to Vance Civil & Infrastructure.",
                "minutes_ago": 580
            }
        ]

        for item in feed_items:
            db.add(IntelligenceFeed(
                company_id=item["company_id"],
                feed_type=item["feed_type"],
                severity=item["severity"],
                source=item["source"],
                title=item["title"],
                summary=item["summary"],
                event_time=datetime.now() - timedelta(minutes=item["minutes_ago"])
            ))

        # --- SCRAPER RUNS: SYSTEM FRESHNESS ---
        scrapers = ["Federal Court", "ASIC", "PPSR", "News Crawler"]
        for name in scrapers:
            db.add(ScraperRun(
                scraper_name=name,
                status="SUCCESS",
                records_processed=random.randint(10, 50),
                records_inserted=random.randint(1, 5),
                duration_ms=random.randint(2000, 8000),
                completed_at=datetime.now() - timedelta(minutes=random.randint(2, 12))
            ))

        db.commit()
        print("PASS | Mature Demo Scenarios + Score History Seeded.")
        
    except Exception as e:
        db.rollback()
        print(f"FAIL | Seeding Failed: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    seed_mature_data()
