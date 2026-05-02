from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.db import get_db
from app.services.global_search_service import global_search_service

router = APIRouter()

@router.get("/")
def global_search(q: str, db: Session = Depends(get_db)):
    """Unified 'Search Everywhere' intelligence endpoint."""
    return global_search_service.search(db, q)
