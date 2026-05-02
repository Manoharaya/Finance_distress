from typing import List, Dict, Any
from app.models.models import Company, DistressEvent

class ScoringEngine:
    def __init__(self):
        self.rules = {
            "ATO winding-up": 40,
            "Director linked to failed entity": 20,
            "Negative news": 10,
            "Late filing": 10
        }

    def calculate_score(self, company: Company, events: List[DistressEvent]) -> Dict[str, Any]:
        base_score = 0
        breakdown = []

        for event in events:
            if event.event_type in self.rules:
                points = self.rules[event.event_type]
                base_score += points
                breakdown.append({
                    "event": event.event_type,
                    "points": points,
                    "date": event.event_date.isoformat() if event.event_date else None
                })

        # Cap score at 100
        final_score = min(base_score, 100)
        
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
            "recommendation": recommendation,
            "breakdown": breakdown
        }

scoring_engine = ScoringEngine()
