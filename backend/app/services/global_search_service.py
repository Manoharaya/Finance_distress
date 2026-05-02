from sqlalchemy.orm import Session
from sqlalchemy import or_, func
from app.models.models import Company, Director, DistressEvent, DistressScore, Alert
from typing import Dict, List, Any

class GlobalSearchService:
    """
    Global 'Search Everywhere' Intelligence Service.
    Handles cross-entity search, normalization, and ranking.
    """

    def search(self, db: Session, query: str) -> Dict[str, Any]:
        if not query or len(query) < 2:
            return {"results": {}, "highlights": []}

        q = f"%{query}%"
        
        # 1. Search Directors
        directors = db.query(Director).filter(
            or_(
                Director.full_name.ilike(q),
                Director.normalized_name.ilike(q)
            )
        ).limit(5).all()

        # 2. Search Companies
        companies = db.query(Company).filter(
            or_(
                Company.company_name.ilike(q),
                Company.abn.ilike(q),
                Company.industry.ilike(q)
            )
        ).limit(5).all()

        # 3. Search Events
        events = db.query(DistressEvent).filter(
            or_(
                DistressEvent.title.ilike(q),
                DistressEvent.event_type.ilike(q),
                DistressEvent.summary.ilike(q)
            )
        ).limit(5).all()

        # Structured Results
        results = {
            "directors": [
                {
                    "id": d.id,
                    "name": d.full_name,
                    "type": "DIRECTOR",
                    "reputation_index": d.reputation_index,
                    "associations": len(d.companies)
                } for d in directors
            ],
            "companies": [
                {
                    "id": c.id,
                    "name": c.company_name,
                    "type": "COMPANY",
                    "abn": c.abn,
                    "industry": c.industry,
                    "status": c.entity_status,
                    "score": self._get_latest_score(db, c.id)
                } for c in companies
            ],
            "events": [
                {
                    "id": e.id,
                    "company_id": e.company_id,
                    "name": e.title,
                    "type": "EVENT",
                    "source": e.source,
                    "severity": e.severity,
                    "date": e.event_date.isoformat()
                } for e in events
            ]
        }

        # 4. Generate Highlights (Intelligence Insights)
        highlights = self._generate_highlights(results)

        return {
            "query": query,
            "results": results,
            "highlights": highlights
        }

    def _get_latest_score(self, db: Session, company_id: int) -> int:
        score_obj = db.query(DistressScore).filter(DistressScore.company_id == company_id).first()
        return score_obj.score if score_obj else 0

    def _generate_highlights(self, results: Dict) -> List[str]:
        highlights = []
        num_distressed = sum(1 for c in results["companies"] if c["score"] >= 70)
        num_liquidated = sum(1 for c in results["companies"] if c["status"] == "Deregistered")
        num_directors = len(results["directors"])

        if num_directors > 0:
            highlights.append(f"Found {num_directors} director profile(s)")
        if num_distressed > 0:
            highlights.append(f"{num_distressed} distressed entity found")
        if num_liquidated > 0:
            highlights.append(f"Liquidated company detected in results")
        
        return highlights

global_search_service = GlobalSearchService()
