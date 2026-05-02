from celery import Celery
from app.core.config import settings

celery_app = Celery(
    "worker",
    broker=settings.CELERY_BROKER_URL,
    backend=settings.CELERY_RESULT_BACKEND
)

celery_app.conf.task_routes = {
    "app.workers.tasks.*": "main-queue"
}

celery_app.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="Australia/Sydney",
    enable_utc=True,
    beat_schedule={
        "run-scrapers-every-hour": {
            "task": "tasks.run_scrapers",
            "schedule": 3600.0, # Run every hour
        },
    },
)
