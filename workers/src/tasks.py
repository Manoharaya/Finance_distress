from app.core.celery_app import celery_app
from app.services.scoring import scoring_engine
from app.core.db import SessionLocal
from app.models.models import Company, DistressEvent, DistressScore
import structlog

logger = structlog.get_logger()

@celery_app.task(name="tasks.calculate_company_score")
def calculate_company_score(company_id: int):
    db = SessionLocal()
    try:
        company = db.query(Company).filter(Company.id == company_id).first()
        if not company:
            logger.error("Company not found", company_id=company_id)
            return

        events = db.query(DistressEvent).filter(DistressEvent.company_id == company_id).all()
        result = scoring_engine.calculate_score(company, events)

        score = DistressScore(
            company_id=company_id,
            score=result["score"],
            risk_level=result["risk_level"],
            recommendation=result["recommendation"],
            breakdown=result["breakdown"]
        )
        db.add(score)
        db.commit()
        logger.info("Calculated score", company_id=company_id, score=result["score"])
    finally:
        db.close()

@celery_app.task(name="tasks.run_scrapers")
def run_scrapers():
    # Trigger all scrapers
    logger.info("Running all scrapers")
    # Logic to trigger scrapers via subprocess or direct call
