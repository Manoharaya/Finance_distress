from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.db import get_db
from app.models.models import DistressEvent

router = APIRouter()

@router.get("/")
def read_events(skip: int = 0, limit: int = 50, db: Session = Depends(get_db)):
    events = db.query(DistressEvent).order_by(DistressEvent.event_date.desc()).offset(skip).limit(limit).all()
    return events
