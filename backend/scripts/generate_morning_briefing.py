import asyncio
import sys
import os
import json

# Add backend to path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from app.services.ai_service import ai_service
from app.core.db import SessionLocal
from app.models.models import Company, DistressEvent, DistressScore

async def generate_morning_briefing():
    print("Generating Morning Intelligence Briefing...\n")
    db = SessionLocal()
    
    try:
        # Get top companies with highest recent scores
        top_companies = db.query(Company, DistressScore).join(
            DistressScore, Company.id == DistressScore.company_id
        ).order_by(DistressScore.score.desc()).limit(5).all()
        
        briefing_data = []
        for company, score in top_companies:
            events = db.query(DistressEvent).filter(DistressEvent.company_id == company.id).limit(3).all()
            briefing_data.append({
                "company_name": company.company_name,
                "current_score": score.score,
                "risk_level": score.risk_level,
                "recent_signals": [e.event_type for e in events]
            })
            
        # Generate the report using Gemini
        report = await ai_service.generate_daily_intelligence_report(briefing_data)
        
        print(f"REPORT DATE: {report.get('report_date')}")
        print(f"MARKET SENTIMENT: {report.get('market_sentiment')}\n")
        
        print("--- PRIORITY LEADS FOR TODAY ---")
        for lead in report.get("priority_leads", []):
            print(f"ENTITY: {lead.get('company_name')}")
            print(f"URGENCY: {lead.get('urgency')}")
            print(f"INTELLIGENCE: {lead.get('narrative_summary')}")
            print(f"NETWORK: {lead.get('network_context')}")
            print(f"PLAYBOOK: {lead.get('action_plan')}")
            print("-" * 30)
            
    finally:
        db.close()

if __name__ == "__main__":
    asyncio.run(generate_morning_briefing())
