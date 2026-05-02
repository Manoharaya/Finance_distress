from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.db import get_db
from app.models.models import Alert

router = APIRouter()

@router.get("/")
def read_alerts(skip: int = 0, limit: int = 50, db: Session = Depends(get_db)):
    alerts = db.query(Alert).order_by(Alert.created_at.desc()).offset(skip).limit(limit).all()
    return alerts
