import os
from dotenv import load_dotenv

load_dotenv()

class ScraperSettings:
    DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://postgres:postgres@localhost:5432/distress_db")
    HEADLESS = os.getenv("SCRAPER_HEADLESS", "true").lower() == "true"
    USER_AGENT = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36"

scraper_settings = ScraperSettings()
