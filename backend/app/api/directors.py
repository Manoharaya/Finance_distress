from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.db import get_db
from app.models.models import Director
from app.services.director_risk_service import director_risk_service

router = APIRouter()

@router.get("/{director_id}/risk-profile")
def get_director_risk_profile(director_id: int, db: Session = Depends(get_db)):
    """
    Returns the full intelligence risk profile for a director:
    - Reputation index
    - Linked companies (active + liquidated)
    - Court event exposure
    - Insights bullets
    """
    director = db.query(Director).filter(Director.id == director_id).first()
    if not director:
        raise HTTPException(status_code=404, detail="Director not found")

    profile = director_risk_service.get_director_profile(db, director_id)
    return profile

@router.get("/")
def list_directors(skip: int = 0, limit: int = 50, db: Session = Depends(get_db)):
    """Returns all directors in the system."""
    directors = db.query(Director).offset(skip).limit(limit).all()
    return [{"id": d.id, "full_name": d.full_name} for d in directors]
