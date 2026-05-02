from app.core.db import SessionLocal, engine
from app.models.models import Base, Company, DistressEvent, Director, CompanyDirector, DistressScore, Alert
from app.services.scoring_service import scoring_service
from datetime import datetime, timedelta

def seed():
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    
    db = SessionLocal()
    
    try:
        # 1. Create Directors
        d1 = Director(full_name="John Alexander Smith", normalized_name="JOHN ALEXANDER SMITH")
        d2 = Director(full_name="Sarah Jane Jenkins", normalized_name="SARAH JANE JENKINS")
        db.add_all([d1, d2])
        db.commit()

        # 2. Create Companies
        c1 = Company(
            company_name="Vertex Solutions Pty Ltd", 
            normalized_name="VERTEX SOLUTIONS",
            abn="45123456789", 
            acn="123456789", 
            entity_status="Active",
            industry="Construction",
            registration_date=datetime(2018, 1, 15)
        )
        c2 = Company(
            company_name="Oceanic Logistics Group", 
            normalized_name="OCEANIC LOGISTICS GROUP",
            abn="12987654321", 
            acn="987654321", 
            entity_status="Active",
            industry="Transport",
            registration_date=datetime(2020, 5, 20)
        )
        db.add_all([c1, c2])
        db.commit()

        # 3. Relationships
        db.add(CompanyDirector(company_id=c1.id, director_id=d1.id, role="Director", start_date=datetime(2018, 1, 15)))
        db.add(CompanyDirector(company_id=c2.id, director_id=d2.id, role="Director", start_date=datetime(2020, 5, 20)))
        db.commit()

        # 4. Events
        e1 = DistressEvent(
            company_id=c1.id,
            event_type="Winding Up Application",
            source="Federal Court",
            severity=40,
            title="ATO Winding Up Filing",
            summary="Application for winding up filed by Deputy Commissioner of Taxation.",
            event_date=datetime.now() - timedelta(days=2),
            status="Pending",
            raw_data={"case_number": "NSD123/2026", "applicant": "ATO"}
        )
        e2 = DistressEvent(
            company_id=c1.id,
            event_type="Late Filing",
            source="ASIC",
            severity=10,
            title="Overdue Financial Statements",
            summary="Company failed to lodge annual reports for FY2025.",
            event_date=datetime.now() - timedelta(days=30),
            status="Recorded",
            raw_data={"form": "388"}
        )
        db.add_all([e1, e2])
        db.commit()

        # 5. Calculate Scores
        res1 = scoring_service.calculate_score(c1, [e1, e2])
        score1 = DistressScore(
            company_id=c1.id,
            score=res1["score"],
            risk_level=res1["risk_level"],
            recommendation=res1["recommendation"]
        )
        
        res2 = scoring_service.calculate_score(c2, [])
        score2 = DistressScore(
            company_id=c2.id,
            score=res2["score"],
            risk_level=res2["risk_level"],
            recommendation=res2["recommendation"]
        )
        db.add_all([score1, score2])
        db.commit()

        # 6. Alerts
        a1 = Alert(
            company_id=c1.id,
            alert_type="CRITICAL_DISTRESS",
            message="Immediate engagement recommended for Vertex Solutions due to Federal Court winding-up application.",
            priority="High"
        )
        db.add(a1)
        db.commit()

        print("Database seeded with production-style data!")
    except Exception as e:
        print(f"Error seeding database: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    seed()
