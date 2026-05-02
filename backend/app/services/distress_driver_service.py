from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from app.models.models import Company, DistressEvent, DistressScore, Director, CompanyDirector
import structlog

logger = structlog.get_logger()

DRIVER_RULES = [
    {
        "keywords": ["Winding Up", "winding-up"],
        "title": "Federal Court winding-up application filed",
        "severity": "CRITICAL",
        "weight": 40,
        "source": "Federal Court Registry",
        "confidence": 95,
        "icon": "gavel"
    },
    {
        "keywords": ["Director Resignation", "Board Resignation"],
        "title": "Sudden director resignation detected",
        "severity": "HIGH",
        "weight": 25,
        "source": "ASIC Registry",
        "confidence": 88,
        "icon": "user_minus"
    },
    {
        "keywords": ["Late Filing", "Missed Filing", "Overdue"],
        "title": "Repeated late statutory filing pattern",
        "severity": "MEDIUM",
        "weight": 15,
        "source": "ASIC Compliance Monitor",
        "confidence": 80,
        "icon": "clock"
    },
    {
        "keywords": ["Security Interest", "PPSR"],
        "title": "Creditor security interest lodged over assets",
        "severity": "HIGH",
        "weight": 30,
        "source": "PPSR Register",
        "confidence": 90,
        "icon": "lock"
    },
    {
        "keywords": ["Address Change", "Registered Office"],
        "title": "Registered office relocation — potential instability",
        "severity": "LOW",
        "weight": 5,
        "source": "ASIC Registry",
        "confidence": 60,
        "icon": "map_pin"
    },
]

class DistressDriverService:

    def get_drivers(self, db: Session, company_id: int) -> dict:
        drivers = []
        
        # 1. Event-based drivers
        events = db.query(DistressEvent).filter(
            DistressEvent.company_id == company_id
        ).order_by(DistressEvent.severity.desc()).all()

        matched_rules = set()
        for event in events:
            for rule in DRIVER_RULES:
                if any(kw.lower() in (event.event_type or "").lower() for kw in rule["keywords"]):
                    if rule["title"] not in matched_rules:
                        matched_rules.add(rule["title"])
                        drivers.append({
                            "title": rule["title"],
                            "severity": rule["severity"],
                            "weight": rule["weight"],
                            "source": rule["source"],
                            "confidence": rule["confidence"],
                            "icon": rule["icon"],
                            "detail": event.summary or f"Signal detected: {event.event_type}"
                        })

        # 2. Network risk: directors linked to failed entities
        network_risk = self._analyze_network_risk(db, company_id)
        drivers.extend(network_risk)

        # Sort by weight descending
        drivers.sort(key=lambda x: x["weight"], reverse=True)

        return {
            "company_id": company_id,
            "total_drivers": len(drivers),
            "top_driver": drivers[0] if drivers else None,
            "drivers": drivers[:6]  # Top 6 signals
        }

    def _analyze_network_risk(self, db: Session, company_id: int) -> list:
        risk_drivers = []

        # Get directors of this company
        director_links = db.query(CompanyDirector).filter(
            CompanyDirector.company_id == company_id
        ).all()

        for link in director_links:
            director = db.query(Director).filter(Director.id == link.director_id).first()
            if not director:
                continue

            # Find other companies with same director
            other_links = db.query(CompanyDirector).filter(
                CompanyDirector.director_id == link.director_id,
                CompanyDirector.company_id != company_id
            ).all()

            for other_link in other_links:
                other_company = db.query(Company).filter(
                    Company.id == other_link.company_id
                ).first()
                if other_company and other_company.entity_status in ["Deregistered", "In Liquidation"]:
                    risk_drivers.append({
                        "title": f"Director '{director.full_name}' linked to previously liquidated entity",
                        "severity": "HIGH",
                        "weight": 22,
                        "source": "Entity Resolution Engine",
                        "confidence": 91,
                        "icon": "network",
                        "detail": f"Director previously associated with {other_company.company_name} — now {other_company.entity_status}."
                    })
                    break  # One driver per director

        return risk_drivers


distress_driver_service = DistressDriverService()
