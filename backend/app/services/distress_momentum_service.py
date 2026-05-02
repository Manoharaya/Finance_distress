from sqlalchemy.orm import Session
from sqlalchemy import desc
from app.models.models import ScoreHistory, DistressScore, DistressEvent
from datetime import datetime, timedelta
from typing import Dict, Any
import structlog

logger = structlog.get_logger()

class DistressMomentumService:
    """
    Analyzes historical distress score data to calculate velocity, momentum, and trends.
    """

    def calculate_momentum(self, db: Session, company_id: int) -> Dict[str, Any]:
        """Calculates 7-day score delta and trend direction."""
        # 1. Get current score
        current_score_obj = db.query(DistressScore).filter(DistressScore.company_id == company_id).first()
        if not current_score_obj:
            return {
                "momentum": 0,
                "trend": "STABLE",
                "label": "Insufficient historical signals to calculate momentum.",
                "direction": "NEUTRAL",
                "current_score": 0,
                "previous_score": 0
            }

        current_score = current_score_obj.score

        # 2. Get score from 7 days ago
        week_ago = datetime.now() - timedelta(days=7)
        past_score_obj = db.query(ScoreHistory).filter(
            ScoreHistory.company_id == company_id,
            ScoreHistory.calculated_at <= week_ago
        ).order_by(desc(ScoreHistory.calculated_at)).first()

        # Fallback to the earliest available if no score was recorded 7 days ago
        if not past_score_obj:
            past_score_obj = db.query(ScoreHistory).filter(
                ScoreHistory.company_id == company_id
            ).order_by(ScoreHistory.calculated_at.asc()).first()

        past_score = past_score_obj.score if past_score_obj else current_score
        momentum = current_score - past_score

        # 3. Classify Trend
        trend = "STABLE"
        label = "Risk profile is holding steady."
        
        if momentum >= 15:
            trend = "ACCELERATING"
            label = "Distress momentum is accelerating rapidly."
        elif momentum >= 5:
            trend = "RISING"
            label = "Risk profile is trending upward."
        elif momentum <= -5:
            trend = "IMPROVING"
            label = "Distress signals show improvement trajectory."
        
        return {
            "current_score": current_score,
            "previous_score": past_score,
            "momentum": momentum,
            "trend": trend,
            "direction": "UPWARD" if momentum > 0 else "DOWNWARD" if momentum < 0 else "NEUTRAL",
            "label": label,
            "days_analyzed": 7
        }

    def get_intelligence_insights(self, db: Session, company_id: int) -> Dict[str, Any]:
        """Legacy compatibility for insights."""
        return self.calculate_momentum(db, company_id)

distress_momentum_service = DistressMomentumService()
