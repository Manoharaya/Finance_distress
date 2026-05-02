import asyncio
from playwright.async_api import async_playwright
import structlog

logger = structlog.get_logger()

class BaseScraper:
    def __init__(self, name: str):
        self.name = name
        self.logger = logger.bind(scraper=name)

    async def run(self):
        self.logger.info("Starting scraper")
        async with async_playwright() as p:
            browser = await p.chromium.launch(headless=True)
            page = await browser.new_page()
            try:
                await self.scrape(page)
            except Exception as e:
                self.logger.error("Scraping failed", error=str(e))
            finally:
                await browser.close()
        self.logger.info("Scraper finished")

    async def scrape(self, page):
        raise NotImplementedError("Subclasses must implement scrape()")

    def normalize_data(self, data):
        # Implementation for data normalization
        return data

    def store_data(self, data):
        # Implementation for storing data to PostgreSQL
        pass
