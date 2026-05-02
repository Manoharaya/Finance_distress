import asyncio
import sys
import os
import json

# Add backend to path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from app.services.ai_service import ai_service
from app.core.db import SessionLocal
from app.models.models import Company, DistressEvent

async def run_intelligence_analysis():
    print("Initializing Intelligence Analysis Engine...\n")
    db = SessionLocal()
    
    try:
        companies = db.query(Company).all()
        
        for company in companies:
            print(f"--- Analyzing: {company.company_name} ---")
            
            # Fetch events for this company
            events = db.query(DistressEvent).filter(DistressEvent.company_id == company.id).all()
            event_list = [{"type": e.event_type, "date": str(e.event_date)} for e in events]
            
            # Run AI Engine
            analysis = await ai_service.analyze_company_distress(company.company_name, event_list)
            
            # Display results in the requested format
            print(json.dumps(analysis, indent=2))
            print("\n")
            
    finally:
        db.close()

if __name__ == "__main__":
    asyncio.run(run_intelligence_analysis())
