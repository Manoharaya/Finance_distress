import sys
import os
import httpx
import asyncio
from sqlalchemy import create_engine, text
from redis import Redis
from celery.result import AsyncResult

# Add backend to path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from app.core.config import settings

async def verify_backend():
    print("--- Testing Backend Health...")
    url = "http://localhost:8000/health"
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(url)
            if response.status_code == 200:
                print("OK - Backend: Online")
                print(f"   Response: {response.json()}")
            else:
                print(f"ERROR - Backend: Status {response.status_code}")
    except Exception as e:
        print(f"ERROR - Backend: Connection Failed ({e})")

def verify_db():
    print("\n--- Testing PostgreSQL Connection...")
    try:
        engine = create_engine(settings.DATABASE_URL)
        with engine.connect() as conn:
            result = conn.execute(text("SELECT 1"))
            print("OK - Database: Connected")
            
            # Check tables
            result = conn.execute(text("SELECT table_name FROM information_schema.tables WHERE table_schema='public'"))
            tables = [row[0] for row in result]
            print(f"   Tables found: {', '.join(tables) if tables else 'None'}")
    except Exception as e:
        print(f"ERROR - Database: Connection Failed ({e})")

def verify_redis():
    print("\n--- Testing Redis Connection...")
    try:
        # Use the full URL to support SSL and Password (required by Upstash)
        r = Redis.from_url(settings.CELERY_BROKER_URL, socket_timeout=5)
        if r.ping():
            print("OK - Redis: Connected")
    except Exception as e:
        print(f"ERROR - Redis: Connection Failed ({e})")

async def main():
    print("Starting Infrastructure Verification...\n")
    verify_db()
    verify_redis()
    await verify_backend()
    print("\nVerification Complete.")

if __name__ == "__main__":
    asyncio.run(main())
