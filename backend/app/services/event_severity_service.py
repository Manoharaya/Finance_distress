from app.constants.event_types import EventType

class EventSeverityService:
    def __init__(self):
        self.severity_map = {
            EventType.ATO_WINDING_UP: 90,
            EventType.FEDERAL_COURT_ACTION: 80,
            EventType.PPSR_SPIKE: 75,
            EventType.DIRECTOR_FAILED_ENTITY_LINK: 70,
            EventType.NEGATIVE_NEWS: 40,
            EventType.LATE_FILING: 30,
            EventType.DIRECTOR_RESIGNATION: 35,
            EventType.TAX_DEBT_SIGNAL: 60,
            EventType.OPERATIONAL_CHANGE: 15,
            EventType.MEDIA_MENTION: 10
        }

    def get_severity(self, event_type: str) -> int:
        return self.severity_map.get(event_type, 10)

severity_service = EventSeverityService()
