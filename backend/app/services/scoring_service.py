from typing import List, Dict, Any
from app.models.models import Company, DistressEvent

class ScoringService:
    @staticmethod
    def calculate_score(company: Company, events: List[DistressEvent]) -> Dict[str, Any]:
        score = 0
        
        for event in events:
            # Rule 1: Winding-up application = +40
            if "Winding Up" in event.event_type:
                score += 40
            
            # Rule 2: Repeated court filing = +20 (if more than 1 event)
            if len(events) > 1:
                score += 20
                
            # Rule 3: Negative status = +10
            if company.entity_status in ["Cancelled", "Strike-off Action"]:
                score += 10

        # Cap score at 100
        final_score = min(score, 100)
        
        risk_level = "Monitor"
        recommendation = "Maintain regular monitoring."
        
        if final_score >= 70:
            risk_level = "Immediate Engagement"
            recommendation = "Priority target. Significant distress signals detected. Immediate outreach recommended."
        elif final_score >= 40:
            risk_level = "Warm Outreach"
            recommendation = "Early signs of distress. Start building relationships."

        return {
            "score": final_score,
            "risk_level": risk_level,
            "recommendation": recommendation
        }

scoring_service = ScoringService()
