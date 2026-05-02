from sqlalchemy.orm import Session
from sqlalchemy import func
from app.models.models import Company, DistressScore, DistressEvent
from typing import List, Dict, Any
from datetime import datetime, timedelta

class SectorRiskService:
    """
    Analyzes distress levels and velocity across different industrial sectors.
    """

    def get_sector_analysis(self, db: Session) -> List[Dict[str, Any]]:
        # 1. Get all industries
        industries = db.query(Company.industry).distinct().all()
        industries = [i[0] for i in industries if i[0]]

        results = []
        for sector in industries:
            # Get average distress score for sector
            avg_score = db.query(func.avg(DistressScore.score)).join(Company).filter(Company.industry == sector).scalar() or 0
            
            # Get event count in last 7 days
            week_ago = datetime.now() - timedelta(days=7)
            event_count = db.query(DistressEvent).join(Company).filter(
                Company.industry == sector,
                DistressEvent.event_date >= week_ago
            ).count()

            # Calculate risk level
            risk_level = "LOW"
            if avg_score >= 70 or event_count > 5:
                risk_level = "CRITICAL"
            elif avg_score >= 50 or event_count > 2:
                risk_level = "ELEVATED"
            elif avg_score >= 30:
                risk_level = "STABLE"

            results.append({
                "sector": sector,
                "avg_score": round(avg_score, 1),
                "recent_events": event_count,
                "risk_level": risk_level
            })

        return sorted(results, key=lambda x: x["avg_score"], reverse=True)

sector_risk_service = SectorRiskService()
