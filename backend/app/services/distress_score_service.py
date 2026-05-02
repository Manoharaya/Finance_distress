from sqlalchemy.orm import Session
from app.models.models import Company, DistressEvent, DistressScore
from typing import List

class DistressScoreService:
    @staticmethod
    def calculate_and_save_score(db: Session, company_id: int):
        events = db.query(DistressEvent).filter(
            DistressEvent.company_id == company_id,
            DistressEvent.is_active == True
        ).all()
        
        # Scoring Logic
        total_score = 0
        for event in events:
            # We use the severity as the base score contribution
            total_score += event.severity
            
            # Additional logic for repeated activity
            if len(events) > 2 and event.severity > 50:
                total_score += 10

        final_score = min(total_score, 100)
        
        # Recommended Action Engine
        risk_level = "Monitor"
        action = "Baseline Monitoring"
        recommendation = "Maintain regular monitoring."
        
        if final_score >= 80:
            risk_level = "Critical"
            action = "Immediate Outreach"
            recommendation = "Critical distress detected. Priority target for legal and financial services."
        elif final_score >= 60:
            risk_level = "High"
            action = "Warm Contact"
            recommendation = "Significant distress signals. Recommended to initiate contact within 24-48 hours."
        elif final_score >= 40:
            risk_level = "Medium"
            action = "Monitor Closely"
            recommendation = "Early signs of distress. Continue tracking for escalation signals."

        score_record = DistressScore(
            company_id=company_id,
            score=final_score,
            risk_level=risk_level,
            recommendation=recommendation,
            recommended_action=action
        )
        db.add(score_record)
        db.commit()
        return score_record

distress_score_service = DistressScoreService()
