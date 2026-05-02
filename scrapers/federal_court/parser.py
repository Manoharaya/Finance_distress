from bs4 import BeautifulSoup
from datetime import datetime
from scrapers.src.utils.normalization import normalize_company_name
import structlog

logger = structlog.get_logger()

class CourtParser:
    @staticmethod
    def parse_listings(html_content: str):
        """
        Parses court listings. 
        MOCKED for E2E Pipeline Testing to demonstrate intelligence flow.
        """
        logger.info("Parsing court listings (E2E Test Mode)")
        
        # Simulating detected signals
        mock_events = [
            {
                "company_name": "BuildRight Constructions Pty Ltd",
                "normalized_name": normalize_company_name("BuildRight Constructions Pty Ltd"),
                "filing_date": datetime.now(),
                "case_type": "Winding Up Application (ATO)",
                "court": "Federal Court of Australia",
                "status": "Pending",
                "raw_data": {"case_ref": "FED-2026-X1", "priority": "High"}
            },
            {
                "company_name": "Vertex Solutions Pty Ltd", # Existing company
                "normalized_name": normalize_company_name("Vertex Solutions Pty Ltd"),
                "filing_date": datetime.now(),
                "case_type": "Director Disqualification Notice",
                "court": "Federal Court of Australia",
                "status": "Filed",
                "raw_data": {"case_ref": "FED-2026-Y2"}
            }
        ]
        
        return mock_events
