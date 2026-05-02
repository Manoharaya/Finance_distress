import asyncio
import sys
import os
from sqlalchemy import text

# Add backend to path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from app.core.db import SessionLocal, engine
from app.services.event_pipeline import event_pipeline
from app.services.ai_service import ai_service
from app.models.models import Company, DistressEvent, DistressScore

class IntegrationTester:
    def __init__(self):
        self.results = []

    def log_test(self, name, success, message=""):
        status = "PASS" if success else "FAIL"
        self.results.append(f"{status} | {name}: {message}")
        print(f"{status} | {name}")

    async def run_all(self):
        print("Starting Platform Integration Tests...\n")
        
        # 1. Database Connectivity
        try:
            with engine.connect() as conn:
                conn.execute(text("SELECT 1"))
            self.log_test("DB_CONNECTIVITY", True, "Successfully connected to PostgreSQL")
        except Exception as e:
            self.log_test("DB_CONNECTIVITY", False, str(e))

        # 2. Intelligence Pipeline (Scrape to Score)
        try:
            db = SessionLocal()
            company = db.query(Company).first()
            if not company:
                 company = Company(company_name="Integration Test Co", abn="999", entity_status="Active")
                 db.add(company)
                 db.commit()

            test_signal = {
                "company_id": company.id,
                "company_name": company.company_name,
                "event_type": "Winding Up Application",
                "source": "Integration Test",
                "event_date": "2026-04-29",
                "title": "Test Winding Up",
                "summary": "This is a test signal.",
                "raw_data": {"test": "data"}
            }
            # Simulate pipeline
            event = event_pipeline.process_raw_signal(db, test_signal)
            
            # Verify score was updated
            score = db.query(DistressScore).filter(DistressScore.company_id == company.id).order_by(DistressScore.calculated_at.desc()).first()
            if score and score.score >= 40:
                self.log_test("PIPELINE_INTEGRITY", True, f"Event processed and scored: {score.score}")
            else:
                self.log_test("PIPELINE_INTEGRITY", False, f"Score result: {score.score if score else 'None'}")
            db.close()
        except Exception as e:
            self.log_test("PIPELINE_INTEGRITY", False, str(e))

        # 3. Gemini AI Engine Check
        try:
            print("Checking Gemini Engine (Live)...")
            analysis = await ai_service.analyze_company_distress("Vertex Solutions", [{"type": "Winding Up"}])
            if "distress_score" in analysis:
                self.log_test("GEMINI_AI_ENGINE", True, f"AI Analysis returned: {analysis['risk_level']}")
            else:
                self.log_test("GEMINI_AI_ENGINE", False, "AI response missing fields")
        except Exception as e:
            self.log_test("GEMINI_AI_ENGINE", False, str(e))

        # 4. Summary
        print("\n" + "="*40)
        print("FINAL TEST REPORT")
        print("="*40)
        for res in self.results:
            print(res)
        print("="*40)

if __name__ == "__main__":
    tester = IntegrationTester()
    asyncio.run(tester.run_all())
