from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.db import get_db
from app.models.models import Company, DistressEvent, Alert, DistressScore
from sqlalchemy import func

router = APIRouter()

from app.services.executive_briefing_service import executive_briefing_service
from app.services.operational_metrics_service import operational_metrics_service
from app.services.intelligence_feed_service import intelligence_feed_service
from app.services.sector_risk_heatmap_service import sector_risk_heatmap_service

@router.get("/summary")
def get_dashboard_summary(db: Session = Depends(get_db)):
    total_companies = db.query(Company).count()
    high_risk_companies = db.query(DistressScore).filter(DistressScore.risk_level == "Immediate Engagement").count()
    recent_events = db.query(DistressEvent).order_by(DistressEvent.created_at.desc()).limit(5).all()
    unread_alerts = db.query(Alert).filter(Alert.is_read == None).count()
    
    return {
        "total_companies": total_companies,
        "high_risk_companies": high_risk_companies,
        "recent_events": recent_events,
        "unread_alerts": unread_alerts
    }

@router.get("/executive-briefing")
def get_executive_briefing(db: Session = Depends(get_db)):
    """Returns AI-generated executive risk summary."""
    return executive_briefing_service.generate_daily_briefing(db)

@router.get("/operational-metrics")
def get_operational_metrics(db: Session = Depends(get_db)):
    """Returns high-level system activity and intelligence metrics."""
    return operational_metrics_service.get_metrics(db)

@router.get("/intelligence-feed")
def get_intelligence_feed(db: Session = Depends(get_db)):
    """Returns prioritized real-time intelligence feed."""
    return intelligence_feed_service.get_latest_feed(db)

@router.get("/sector-risk-heatmap")
def get_sector_risk_heatmap(db: Session = Depends(get_db)):
    """Returns macro-level distress intensity across industrial sectors."""
    return sector_risk_heatmap_service.get_heatmap_data(db)
