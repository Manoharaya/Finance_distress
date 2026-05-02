from sqlalchemy.orm import Session
from app.models.models import DistressEvent
from app.constants.signal_sources import get_source_meta
from typing import List, Dict, Any

class TimelineService:
    @staticmethod
    def get_company_timeline(db: Session, company_id: int) -> List[Dict[str, Any]]:
        events = db.query(DistressEvent).filter(
            DistressEvent.company_id == company_id,
            DistressEvent.is_active == True
        ).order_by(DistressEvent.event_date.desc()).all()
        
        timeline = []
        for event in events:
            # Enrich with canonical source metadata
            source_meta = get_source_meta(event.source or "")
            timeline.append({
                "id": event.id,
                "date": event.event_date.strftime("%Y-%m-%d") if event.event_date else None,
                "title": event.title,
                "summary": event.summary,
                "severity": event.severity,
                "type": event.event_type,
                "source": event.source,
                "source_meta": source_meta,    # ← enriched source object
                "recommendation": event.recommendation,
                "risk_color": "rose" if event.severity >= 70 else "amber" if event.severity >= 40 else "emerald",
                "icon_type": TimelineService._get_icon_for_type(event.event_type)
            })
        return timeline

    @staticmethod
    def _get_icon_for_type(event_type: str) -> str:
        type_lower = (event_type or "").lower()
        if any(k in type_lower for k in ["winding", "court", "legal"]):
            return "gavel"
        if "resignation" in type_lower or "director" in type_lower:
            return "user_minus"
        if "filing" in type_lower or "late" in type_lower:
            return "clock"
        if "security" in type_lower or "ppsr" in type_lower:
            return "lock"
        if "news" in type_lower:
            return "newspaper"
        if "address" in type_lower:
            return "map_pin"
        return "info"

timeline_service = TimelineService()
