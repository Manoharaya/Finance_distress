from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from app.core.db import get_db
from app.models.models import Company, DistressScore
from app.services.timeline_service import timeline_service
from app.services.distress_driver_service import distress_driver_service
from app.services.risk_momentum_service import risk_momentum_service
from app.services.explainability_ai_service import explainability_ai_service
from app.services.score_history_service import score_history_service
from app.services.distress_momentum_service import distress_momentum_service
from app.services.confidence_engine import confidence_engine
from app.services.network_risk_service import network_risk_service
from pydantic import BaseModel
from datetime import datetime

router = APIRouter()

class ScoreSchema(BaseModel):
    score: int
    risk_level: str
    recommended_action: Optional[str] = None
    calculated_at: datetime

    class Config:
        from_attributes = True

class CompanyListSchema(BaseModel):
    id: int
    company_name: str
    abn: str
    entity_status: Optional[str]
    industry: Optional[str]
    latest_score: Optional[ScoreSchema] = None

    class Config:
        from_attributes = True

@router.get("/", response_model=List[CompanyListSchema])
def read_companies(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    companies = db.query(Company).offset(skip).limit(limit).all()
    
    results = []
    for company in companies:
        score = db.query(DistressScore).filter(DistressScore.company_id == company.id).order_by(DistressScore.calculated_at.desc()).first()
        results.append({
            "id": company.id,
            "company_name": company.company_name,
            "abn": company.abn,
            "entity_status": company.entity_status,
            "industry": company.industry,
            "latest_score": score
        })
    return results

@router.get("/{company_id}")
def read_company(company_id: int, db: Session = Depends(get_db)):
    company = db.query(Company).filter(Company.id == company_id).first()
    if company is None:
        raise HTTPException(status_code=404, detail="Company not found")
    
    latest_score = db.query(DistressScore).filter(DistressScore.company_id == company_id).order_by(DistressScore.calculated_at.desc()).first()
    
    return {
        "company": company,
        "latest_score": latest_score
    }

@router.get("/{company_id}/timeline")
def get_company_timeline(company_id: int, db: Session = Depends(get_db)):
    return timeline_service.get_company_timeline(db, company_id)

@router.get("/{company_id}/distress-drivers")
async def get_distress_drivers(company_id: int, db: Session = Depends(get_db)):
    """
    Returns the full explainability report:
    - Ranked distress drivers
    - Risk momentum
    - AI-generated executive explanation
    """
    company = db.query(Company).filter(Company.id == company_id).first()
    if not company:
        raise HTTPException(status_code=404, detail="Company not found")

    latest_score = db.query(DistressScore).filter(
        DistressScore.company_id == company_id
    ).order_by(DistressScore.calculated_at.desc()).first()

    # Get ranked drivers
    drivers_data = distress_driver_service.get_drivers(db, company_id)

    # Get momentum analysis
    momentum = risk_momentum_service.get_momentum(db, company_id)

    # Generate AI executive explanation
    explanation = await explainability_ai_service.generate_executive_explanation(
        company_name=company.company_name,
        drivers=drivers_data.get("drivers", []),
        momentum=momentum,
        score=latest_score.score if latest_score else 0
    )

    return {
        "company_id": company_id,
        "company_name": company.company_name,
        "distress_score": latest_score.score if latest_score else 0,
        "risk_level": latest_score.risk_level if latest_score else "Unknown",
        "recommended_action": latest_score.recommended_action if latest_score else "Monitor",
        "executive_explanation": explanation,
        "momentum": momentum,
        "drivers": drivers_data.get("drivers", []),
        "total_drivers": drivers_data.get("total_drivers", 0),
        "top_driver": drivers_data.get("top_driver")
    }

@router.get("/{company_id}/score-history")
def get_score_history(company_id: int, db: Session = Depends(get_db)):
    """Returns chronological score history for trend visualization."""
    company = db.query(Company).filter(Company.id == company_id).first()
    if not company:
        raise HTTPException(status_code=404, detail="Company not found")

    history = score_history_service.get_history(db, company_id)
    momentum = score_history_service.get_momentum_summary(db, company_id)

    return {
        "company_id": company_id,
        "company_name": company.company_name,
        "history": history,
        "momentum": momentum
    }

@router.get("/{company_id}/momentum")
def get_momentum_intelligence(company_id: int, db: Session = Depends(get_db)):
    """Returns intelligence-grade momentum insights for the company."""
    company = db.query(Company).filter(Company.id == company_id).first()
    if not company:
        raise HTTPException(status_code=404, detail="Company not found")

    insights = distress_momentum_service.get_intelligence_insights(db, company_id)
    return insights

@router.get("/{company_id}/confidence")
def get_confidence_report(company_id: int, db: Session = Depends(get_db)):
    """
    Returns the full confidence intelligence report:
    - Confidence score (0–100)
    - Confidence level classification
    - Source reliability breakdown
    - Corroboration analysis
    - Freshness indicators
    - Reasoning bullets
    """
    company = db.query(Company).filter(Company.id == company_id).first()
    if not company:
        raise HTTPException(status_code=404, detail="Company not found")

    report = confidence_engine.calculate(db, company_id)
    return report

@router.get("/{company_id}/network-risk")
def get_network_risk(company_id: int, db: Session = Depends(get_db)):
    """
    Full network risk exposure report:
    - Exposure score
    - Linked distressed / liquidated entities
    - Director risk profiles
    - Cascading risk status
    """
    company = db.query(Company).filter(Company.id == company_id).first()
    if not company:
        raise HTTPException(status_code=404, detail="Company not found")
    return network_risk_service.analyze(db, company_id)

@router.get("/{company_id}/linked-entities")
def get_linked_entities(company_id: int, db: Session = Depends(get_db)):
    """Returns the list of linked entities for the network graph."""
    company = db.query(Company).filter(Company.id == company_id).first()
    if not company:
        raise HTTPException(status_code=404, detail="Company not found")
    report = network_risk_service.analyze(db, company_id)
    return {
        "linked_entities":   report.get("linked_entities", []),
        "director_profiles": report.get("director_profiles", []),
    }

from app.services.recommendation_engine import recommendation_engine
from app.services.distress_momentum_service import distress_momentum_service

@router.get("/{company_id}/recommendation")
def get_company_recommendation(company_id: int, db: Session = Depends(get_db)):
    """Returns actionable advisory recommendations for a company."""
    return recommendation_engine.get_recommendation(db, company_id)

@router.get("/{company_id}/momentum")
def get_company_momentum(company_id: int, db: Session = Depends(get_db)):
    """Returns risk velocity and trend momentum for a company."""
    return distress_momentum_service.calculate_momentum(db, company_id)
