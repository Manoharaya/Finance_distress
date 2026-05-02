from datetime import datetime, timedelta
from typing import Dict, List, Any

class DemoDeterministicService:
    """
    Provides a fixed, production-polished dataset for client demos.
    Ensures zero randomness and 100% stability.
    """

    def __init__(self):
        self.reference_date = datetime(2026, 4, 30, 10, 0, 0)

    def get_dashboard_summary(self) -> Dict[str, Any]:
        return {
            "total_companies": 1284,
            "high_risk_companies": 48,
            "recent_events_count": 312,
            "unread_alerts": 19,
            "system_status": "ACTIVE",
            "monitoring_integrity": "100%"
        }

    def get_intelligence_feed(self) -> List[Dict[str, Any]]:
        return [
            {
                "id": 9001,
                "company_id": 1,
                "company_name": "Horizon Transport Logistics",
                "feed_type": "LEGAL_ESCALATION",
                "severity": "CRITICAL",
                "source": "Federal Court",
                "title": "ATO Winding-Up Application Filed",
                "summary": "The Deputy Commissioner of Taxation has filed an application to wind up Horizon Transport Logistics in insolvency.",
                "event_time": (self.reference_date - timedelta(minutes=42)).isoformat()
            },
            {
                "id": 9002,
                "company_id": 2,
                "company_name": "Vance Civil Group Pty Ltd",
                "feed_type": "NETWORK_CONTAGION",
                "severity": "HIGH",
                "source": "Relationship Intelligence",
                "title": "Director Linked to Liquidated Entity",
                "summary": "Director Gregory Vance identified as having multiple associations with liquidated entities in the construction sector.",
                "event_time": (self.reference_date - timedelta(hours=2)).isoformat()
            },
            {
                "id": 9003,
                "company_id": 3,
                "company_name": "Miller Infrastructure",
                "feed_type": "RISK_SPIKE",
                "severity": "HIGH",
                "source": "Scoring Engine",
                "title": "Distress Score Escalated to 82",
                "summary": "Intelligence velocity spike detected following PPSR all-assets security registration.",
                "event_time": (self.reference_date - timedelta(hours=4)).isoformat()
            }
        ]

    def get_companies(self) -> List[Dict[str, Any]]:
        return [
            {
                "id": 1,
                "company_name": "Horizon Transport Logistics",
                "abn": "11222333444",
                "entity_status": "Active",
                "industry": "Transport",
                "latest_score": {"score": 81, "risk_level": "Critical"}
            },
            {
                "id": 2,
                "company_name": "Vance Civil Group Pty Ltd",
                "abn": "55666777888",
                "entity_status": "Active",
                "industry": "Construction",
                "latest_score": {"score": 75, "risk_level": "High"}
            }
        ]

    def get_executive_briefing(self) -> Dict[str, Any]:
        return {
            "title": "Today's Risk Overview",
            "summary": "Construction and transport sectors show elevated distress velocity due to increased court activity and director overlap patterns.",
            "key_insights": [
                "Court activity increased by 18% in construction sector",
                "Director overlap patterns detected across transport entities",
                "Early-stage distress emerging in hospitality sector"
            ],
            "risk_level": "ELEVATED",
            "sectors": [
                {"sector": "Construction", "avg_score": 72.4, "risk_level": "CRITICAL"},
                {"sector": "Transport", "avg_score": 68.1, "risk_level": "ELEVATED"},
                {"sector": "Hospitality", "avg_score": 42.5, "risk_level": "STABLE"}
            ]
        }

demo_deterministic_service = DemoDeterministicService()
