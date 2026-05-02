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

def seed_shock_demo():
    db = SessionLocal()
    print("Initializing 'Shockingly Good' Cinematic Demo Narrative...")

    try:
        # 1. Reset Database for clean demo
        Base.metadata.drop_all(bind=engine)
        Base.metadata.create_all(bind=engine)

        # 2. THE MASTER ARCHITECT: Gregory Vance
        vance = Director(
            full_name="Gregory Vance", 
            normalized_name="gregory_vance",
            reputation_index=15 # Very low/High risk
        )
        db.add(vance)
        db.flush()

        # --- COMPANY 1: THE COLLAPSE (Vance Civil Group) ---
        vance_civil = Company(
            company_name="Vance Civil Group Pty Ltd",
            abn="12345678901",
            entity_status="Deregistered",
            industry="Construction",
            registration_date=datetime.now() - timedelta(days=1200)
        )
        db.add(vance_civil)
        db.flush()
        db.add(CompanyDirector(company_id=vance_civil.id, director_id=vance.id, role="Executive Director"))

        # Timeline of the collapse
        civil_events = [
            ("ASIC", "Late Financial Reporting", 10, 90),
            ("PPSR", "Security Interest Lodged - Major Bank", 30, 75),
            ("News", "Reports of Subcontractor Non-Payment", 50, 45),
            ("Federal Court", "Winding-Up Application (ATO vs Vance Civil)", 85, 10),
            ("ASIC", "Appointment of Liquidator", 95, 2),
        ]
        for src, title, sev, days in civil_events:
            db.add(DistressEvent(
                company_id=vance_civil.id,
                event_type=title,
                severity=sev,
                source=src,
                title=title,
                summary=f"Automated detection of {title.lower()} via {src} registry surveillance.",
                event_date=datetime.now() - timedelta(days=days)
            ))

        # Final Score
        db.add(DistressScore(
            company_id=vance_civil.id,
            score=96,
            risk_level="Critical",
            recommendation="Entity has entered formal liquidation. Network contagion risk is EXTREME.",
            recommended_action="Post-Insolvency Investigation"
        ))

        # --- COMPANY 2: THE ACTIVE THREAT (Horizon Transport Logistics) ---
        horizon = Company(
            company_name="Horizon Transport Logistics",
            abn="98765432109",
            entity_status="Active",
            industry="Transport",
            registration_date=datetime.now() - timedelta(days=730)
        )
        db.add(horizon)
        db.flush()
        db.add(CompanyDirector(company_id=horizon.id, director_id=vance.id, role="Managing Director"))

        # Chronological Worsening
        horizon_history = [
            (15, 0, "STABLE", "Initial surveillance - No flags"),
            (22, 7, "STABLE", "Minor ASIC late filing"),
            (35, 13, "RISING", "PPSR activity spike detected"),
            (52, 17, "ESCALATING", "Director resignation + Network risk alert"),
            (72, 20, "CRITICAL", "Legal action detected in peer network"),
            (81, 9, "CRITICAL", "Elevated creditor activity reported"),
        ]
        for i, (score, delta, mom, reason) in enumerate(horizon_history):
            db.add(ScoreHistory(
                company_id=horizon.id,
                score=score,
                risk_level="Critical" if score >= 70 else "High" if score >= 50 else "Medium",
                change_delta=delta,
                momentum=mom,
                reason=reason,
                calculated_at=datetime.now() - timedelta(days=60 - i*10)
            ))

        db.add(DistressScore(
            company_id=horizon.id,
            score=81,
            risk_level="Immediate Engagement",
            recommendation="Critical distress momentum detected. Director associated with recently liquidated entity.",
            recommended_action="Priority Outreach - Restructuring Advisory"
        ))

        # --- COMPANY 3: THE EARLY DETECTION (Harbor Hospitality Group) ---
        harbor = Company(
            company_name="Harbor Hospitality Group",
            abn="55443322110",
            entity_status="Active",
            industry="Hospitality",
            registration_date=datetime.now() - timedelta(days=400)
        )
        db.add(harbor)
        db.flush()
        db.add(CompanyDirector(company_id=harbor.id, director_id=vance.id, role="Strategic Advisor"))

        # Rapid Escalation
        harbor_history = [
            (12, 0, "STABLE", "Initial baseline"),
            (25, 13, "RISING", "First director risk association identified"),
            (48, 23, "ESCALATING", "Score spike following Horizon Transport deterioration"),
            (68, 20, "ESCALATING", "Recent credit limit queries detected"),
        ]
        for i, (score, delta, mom, reason) in enumerate(harbor_history):
            db.add(ScoreHistory(
                company_id=harbor.id,
                score=score,
                risk_level="High" if score >= 50 else "Medium",
                change_delta=delta,
                momentum=mom,
                reason=reason,
                calculated_at=datetime.now() - timedelta(days=45 - i*12)
            ))

        db.add(DistressScore(
            company_id=harbor.id,
            score=68,
            risk_level="High",
            recommendation="Early-stage contagion detected via shared director node. Monitoring frequency increased.",
            recommended_action="Soft Engagement - Relationship Development"
        ))

        # --- LIVE INTELLIGENCE FEED (The 'Just Now' Feel) ---
        now = datetime.now(timezone.utc)
        feed_items = [
            (horizon.id, "LEGAL_ESCALATION", "CRITICAL", "Federal Court", "Winding-Up Filing Detected", "ATO has officially moved to wind up Horizon Transport Logistics following persistent non-compliance.", 8),
            (harbor.id, "NETWORK_CONTAGION", "HIGH", "Relationship Intelligence", "Contagion Signal: Gregory Vance", "Distress momentum from Horizon Transport is now impacting Harbor Hospitality risk score.", 14),
            (horizon.id, "RISK_SPIKE", "CRITICAL", "Scoring Engine", "Distress Score Escalated to 81", "Rapid score acceleration detected. 22% increase in 7 days.", 22),
            (vance_civil.id, "HISTORICAL_INSIGHT", "MEDIUM", "AI Enrichment", "Liquidation Pattern Analysis Complete", "Pattern confirms strategic asset migration tactics used by Gregory Vance.", 45),
            (harbor.id, "MONITORING_SIGNAL", "MEDIUM", "ASIC", "Director Role Change", "Gregory Vance moved from 'Strategic Advisor' to 'Shadow Director' status.", 58),
        ]
        for cid, ftype, sev, src, title, summ, mins in feed_items:
            db.add(IntelligenceFeed(
                company_id=cid,
                feed_type=ftype,
                severity=sev,
                source=src,
                title=title,
                summary=summ,
                event_time=now - timedelta(minutes=mins)
            ))

        # --- SCRAPER RUNS (Freshness) ---
        for name in ["Federal Court", "ASIC", "PPSR", "Relationship Graph"]:
            db.add(ScraperRun(
                scraper_name=name,
                status="SUCCESS",
                records_processed=random.randint(100, 500),
                records_inserted=random.randint(5, 20),
                duration_ms=random.randint(5000, 15000),
                completed_at=now - timedelta(minutes=random.randint(2, 5))
            ))

        # --- ALERTS ---
        db.add(Alert(
            company_id=horizon.id,
            alert_type="CRITICAL_LEGAL",
            priority="CRITICAL",
            message="IMMEDIATE: Federal Court action detected for Horizon Transport.",
            is_read=None
        ))

        db.commit()
        print("CINEMATIC NARRATIVE SEEDED: The 'Gregory Vance' Collapse Story is live.")
        
    except Exception as e:
        db.rollback()
        print(f"SEEDING FAILED: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    seed_shock_demo()
