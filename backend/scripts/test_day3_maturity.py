import asyncio
import sys
import os
from sqlalchemy import text, func

# Add backend to path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from app.core.db import SessionLocal, engine
from app.models.models import Company, DistressEvent, DistressScore, Alert, Director, CompanyDirector
from app.services.alert_service import alert_service
from app.services.ai_service import ai_service

class Day3Tester:
    def __init__(self):
        self.report = []

    def log(self, test, status, details=""):
        res = f"[{'PASS' if status else 'FAIL'}] {test}: {details}"
        self.report.append(res)
        print(res)

    async def run_tests(self):
        print("Starting Day 3 Maturity Audit...\n")
        db = SessionLocal()

        try:
            # Test 1: Data Maturity (Seeded Entities)
            gv_infra = db.query(Company).filter(Company.company_name == "GV Infrastructure Pty Ltd").first()
            if gv_infra:
                scores = db.query(DistressScore).filter(DistressScore.company_id == gv_infra.id).count()
                self.log("DATA_MATURITY", True, f"Found GV Infra with {scores} historical scores.")
            else:
                self.log("DATA_MATURITY", False, "GV Infrastructure not found in DB.")

            # Test 2: Relationship Intelligence
            vance = db.query(Director).filter(Director.full_name == "Gregory Vance").first()
            if vance:
                links = db.query(CompanyDirector).filter(CompanyDirector.director_id == vance.id).count()
                self.log("RELATIONSHIP_LINKING", links == 2, f"Director Gregory Vance linked to {links} entities.")
            else:
                self.log("RELATIONSHIP_LINKING", False, "Director Gregory Vance not found.")

            # Test 3: Alert Engine (Velocity Trigger)
            print("Simulating Velocity Surge...")
            # We already have scores from the seeder (45 -> 85)
            # Let's manually trigger the check
            alert_service.check_velocity_alert(db, gv_infra.id)
            velocity_alert = db.query(Alert).filter(
                Alert.company_id == gv_infra.id, 
                Alert.alert_type == "VELOCITY_SURGE"
            ).first()
            self.log("ALERT_SYSTEM_VELOCITY", velocity_alert is not None, "Velocity surge correctly triggered alert.")

            # Test 4: AI Narrative Enrichment
            print("Testing Gemini Narrative Enrichment...")
            test_events = [{"event_type": "Winding Up", "source": "Federal Court"}]
            analysis = await ai_service.analyze_company_distress("GV Infrastructure", test_events)
            has_summary = len(analysis.get("summary", "")) > 20
            self.log("AI_ENRICHMENT", has_summary, "Gemini generated a sophisticated narrative summary.")

            # Test 5: Morning Briefing Integration
            print("Testing Morning Briefing Generator...")
            # We'll just check if the service method returns a valid structure
            briefing = await ai_service.generate_daily_intelligence_report([{"name": "GV Infra", "score": 85}])
            is_valid = "priority_leads" in briefing and len(briefing["priority_leads"]) > 0
            self.log("MORNING_BRIEFING", is_valid, "Daily intelligence report successfully structured.")

        finally:
            db.close()

        print("\n" + "="*50)
        print("DAY 3 FINAL TEST REPORT")
        print("="*50)
        for line in self.report:
            print(line)
        print("="*50)

if __name__ == "__main__":
    tester = Day3Tester()
    asyncio.run(tester.run_all() if hasattr(tester, 'run_all') else tester.run_tests())
