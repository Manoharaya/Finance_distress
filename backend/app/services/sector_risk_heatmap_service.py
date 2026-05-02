from sqlalchemy.orm import Session
from sqlalchemy import func
from app.models.models import Company, DistressScore, DistressEvent
from app.services.distress_momentum_service import distress_momentum_service
from typing import Dict, Any, List
from datetime import datetime, timedelta

class SectorRiskHeatmapService:
    """
    Computes macro-level distress intensity across industrial sectors.
    """

    def get_heatmap_data(self, db: Session) -> List[Dict[str, Any]]:
        # 1. Get all distinct industries
        industries = db.query(Company.industry).distinct().all()
        industries = [i[0] for i in industries if i[0]]

        results = []
        for sector in industries:
            # Aggregate stats for this sector
            companies = db.query(Company).filter(Company.industry == sector).all()
            if not companies:
                continue

            company_ids = [c.id for c in companies]
            
            # Average Score
            avg_score = db.query(func.avg(DistressScore.score)).filter(DistressScore.company_id.in_(company_ids)).scalar() or 0
            
            # Aggregate Momentum
            total_momentum = 0
            for company in companies:
                m_data = distress_momentum_service.calculate_momentum(db, company.id)
                total_momentum += m_data.get("momentum", 0)
            
            avg_momentum = total_momentum / len(companies)

            # Legal Event Density (Last 30 days)
            month_ago = datetime.now() - timedelta(days=30)
            legal_events = db.query(DistressEvent).filter(
                DistressEvent.company_id.in_(company_ids),
                DistressEvent.event_date >= month_ago
            ).count()

            # Classification Logic
            risk_level = "STABLE"
            if avg_score >= 80 or (avg_momentum >= 15 and avg_score >= 70):
                risk_level = "HIGH"
            elif avg_score >= 65 or avg_momentum >= 10:
                risk_level = "ELEVATED"
            elif avg_momentum >= 15:
                risk_level = "ESCALATING"
            elif avg_score >= 40:
                risk_level = "MODERATE"

            results.append({
                "sector": sector,
                "risk_level": risk_level,
                "avg_score": round(avg_score, 1),
                "momentum": round(avg_momentum, 1),
                "legal_signals": legal_events,
                "company_count": len(companies)
            })

        return sorted(results, key=lambda x: x["avg_score"], reverse=True)

sector_risk_heatmap_service = SectorRiskHeatmapService()
