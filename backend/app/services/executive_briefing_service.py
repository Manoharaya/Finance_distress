from sqlalchemy.orm import Session
from app.services.sector_risk_service import sector_risk_service
from app.models.models import DistressEvent
from datetime import datetime, timedelta
from typing import Dict, Any, List

from app.services.ai_output_refinement_service import ai_output_refinement_service

class ExecutiveBriefingService:
    """
    Synthesizes sector analysis and intelligence signals into an executive-grade narrative.
    """

    def generate_daily_briefing(self, db: Session) -> Dict[str, Any]:
        sector_analysis = sector_risk_service.get_sector_analysis(db)
        
        # Identify top risk sectors
        top_sectors = [s for s in sector_analysis if s["risk_level"] in ["CRITICAL", "ELEVATED"]]
        
        if not top_sectors:
            return {
                "title": "Today's Risk Overview",
                "summary": "System monitoring continues across all tracked entities. No elevated sector-level distress signals detected in the current window.",
                "key_insights": ["Sector stability maintained across monitoring graph", "Baseline compliance activity recorded"],
                "risk_level": "STABLE",
                "sectors": []
            }

        # Simulate AI generation of briefing
        sector_names = [s["sector"] for s in top_sectors]
        raw_summary = f"{' and '.join(sector_names)} sectors show elevated distress velocity due to increased court activity and director overlap patterns detected in recent monitoring cycles."
        
        insights = []
        for s in top_sectors:
            if s["risk_level"] == "CRITICAL":
                insights.append(f"{s['sector']} sector shows critical score escalation with {s['recent_events']} new events this week.")
            else:
                insights.append(f"Early-stage risk signals emerging in {s['sector']} linked to emerging network exposure.")

        return {
            "title": "Today's Risk Overview",
            "summary": ai_output_refinement_service.refine(raw_summary),
            "key_insights": ai_output_refinement_service.refine_list(insights),
            "risk_level": "ELEVATED" if any(s["risk_level"] == "CRITICAL" for s in top_sectors) else "STABLE",
            "sectors": sector_analysis[:3] # Return top 3 sectors for chips
        }

executive_briefing_service = ExecutiveBriefingService()
