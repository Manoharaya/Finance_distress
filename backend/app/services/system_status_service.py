from sqlalchemy.orm import Session
from app.models.models import ScraperRun
from app.constants.freshness_levels import SystemStatus
from app.services.data_freshness_service import data_freshness_service
from datetime import datetime, timedelta, timezone

class SystemStatusService:
    """
    Orchestrates platform health and operational status.
    """

    def get_overall_status(self, db: Session) -> dict:
        freshness = data_freshness_service.get_system_freshness(db)
        
        # Determine operational status
        # If no update in 24h -> DEGRADED
        # If any recent failures -> DELAYED
        
        status = SystemStatus.ACTIVE
        if freshness["last_updated_mins"] > 1440: # 24h
            status = SystemStatus.DEGRADED
            
        recent_failures = db.query(ScraperRun).filter(
            ScraperRun.status == "FAILED",
            ScraperRun.created_at >= datetime.now(timezone.utc) - timedelta(hours=12)
        ).count()
        
        if recent_failures > 3:
            status = SystemStatus.DELAYED

        return {
            "monitoring_status": status,
            "system_health": "HEALTHY" if status == SystemStatus.ACTIVE else "ISSUES DETECTED",
            "intelligence_freshness": freshness,
            "operational_metrics": {
                "scrapers_online": freshness["active_scrapers"],
                "recent_failures": recent_failures
            }
        }

system_status_service = SystemStatusService()
