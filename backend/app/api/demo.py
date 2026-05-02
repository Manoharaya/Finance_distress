from fastapi import APIRouter, Depends
from app.services.demo_deterministic_service import demo_deterministic_service

router = APIRouter()

@router.get("/summary")
def get_demo_summary():
    return demo_deterministic_service.get_dashboard_summary()

@router.get("/intelligence-feed")
def get_demo_feed():
    return demo_deterministic_service.get_intelligence_feed()

@router.get("/companies")
def get_demo_companies():
    return demo_deterministic_service.get_companies()

@router.get("/executive-briefing")
def get_demo_briefing():
    return demo_deterministic_service.get_executive_briefing()

@router.get("/status")
def get_demo_status():
    return {
        "status": "DEMO_MODE_ACTIVE",
        "reference_date": "2026-04-30T10:00:00",
        "dataset_integrity": "VERIFIED"
    }
