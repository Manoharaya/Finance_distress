from pydantic import BaseModel
from datetime import datetime
from typing import Optional, Dict, Any

class CourtEvent(BaseModel):
    company_name: str
    filing_date: datetime
    case_type: str
    court: str
    status: str
    raw_data: Dict[str, Any]
