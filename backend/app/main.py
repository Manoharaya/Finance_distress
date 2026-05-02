from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List
import structlog

from app.core.config import settings
from app.core.db import get_db, engine, Base
from app.api import companies, events, alerts, dashboard, directors, system, search, demo
from app.core.middleware import LoggingMiddleware

# Initialize structured logging
logger = structlog.get_logger()

# Create tables (for development, normally use Alembic)
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url="/api/v1/openapi.json"
)

# Set CORS
app.add_middleware(LoggingMiddleware)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # In production, set this to frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
def health_check():
    return {"status": "healthy", "version": "1.0.0"}

# Include routers
app.include_router(companies.router, prefix="/api/v1/companies", tags=["companies"])
app.include_router(events.router, prefix="/api/v1/events", tags=["events"])
app.include_router(alerts.router, prefix="/api/v1/alerts", tags=["alerts"])
app.include_router(dashboard.router, prefix="/api/v1/dashboard", tags=["dashboard"])
app.include_router(directors.router, prefix="/api/v1/directors", tags=["directors"])
app.include_router(system.router,    prefix="/api/v1/system",    tags=["system"])
app.include_router(search.router,    prefix="/api/v1/search",    tags=["search"])
app.include_router(demo.router,      prefix="/api/v1/demo",      tags=["demo"])

@app.get("/")
def root():
    return {"message": "Welcome to Financial Distress Intelligence API"}

# Example seed data endpoint
@app.post("/seed")
def seed_data(db: Session = Depends(get_db)):
    # This would normally be a script, but helpful for initial setup
    from app.models.models import Company, DistressEvent
    from datetime import datetime
    
    if db.query(Company).count() > 0:
        return {"message": "Database already seeded"}
        
    company = Company(
        company_name="Example Corp Pty Ltd",
        abn="12345678901",
        acn="123456789",
        industry="Construction"
    )
    db.add(company)
    db.commit()
    db.refresh(company)
    
    event = DistressEvent(
        company_id=company.id,
        event_type="ATO winding-up",
        event_date=datetime.now(),
        source="Federal Court",
        summary="Application for winding up filed by Deputy Commissioner of Taxation."
    )
    db.add(event)
    db.commit()
    
    return {"message": "Database seeded with example data"}
