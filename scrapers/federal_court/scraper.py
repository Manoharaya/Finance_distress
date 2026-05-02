import asyncio
from playwright.async_api import async_playwright
from scrapers.federal_court.parser import CourtParser
from scrapers.federal_court.service import CourtService
import structlog

logger = structlog.get_logger()

class FederalCourtScraper:
    def __init__(self):
        self.url = "https://www.fedcourt.gov.au/services/notices" # Example URL

    async def run(self):
        logger.info("Starting Federal Court Scraper")
        async with async_playwright() as p:
            browser = await p.chromium.launch(headless=True)
            page = await browser.new_page()
            
            try:
                await page.goto(self.url, wait_until="networkidle")
                content = await page.content()
                
                events = CourtParser.parse_listings(content)
                logger.info(f"Parsed {len(events)} events")
                
                for event in events:
                    CourtService.process_event(event)
                    
            except Exception as e:
                logger.error("Scraping failed", error=str(e))
            finally:
                await browser.close()

if __name__ == "__main__":
    scraper = FederalCourtScraper()
    asyncio.run(scraper.run())
