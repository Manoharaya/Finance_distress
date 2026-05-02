from sqlalchemy.orm import Session
from app.models.models import Company, DistressScore, DistressEvent, Director
from app.services.confidence_engine import confidence_engine
from app.services.network_risk_service import network_risk_service
from typing import Dict, List, Any
from app.services.ai_output_refinement_service import ai_output_refinement_service

class RecommendationEngine:
    """
    Action Recommendation Engine: 
    Converts raw intelligence into standardized advisory workflows.
    """

    def get_recommendation(self, db: Session, company_id: int) -> Dict[str, Any]:
        company = db.query(Company).filter(Company.id == company_id).first()
        if not company:
            return {}

        score_obj = db.query(DistressScore).filter(DistressScore.company_id == company_id).first()
        score = score_obj.score if score_obj else 0
        
        # Multi-factor enrichment
        confidence_report = confidence_engine.calculate(db, company_id)
        network_report = network_risk_service.analyze(db, company_id)
        
        confidence_score = confidence_report.get("confidence_score", 0)
        network_exposure = network_report.get("exposure_score", 0)
        
        # Legal signals check
        has_legal_escalation = db.query(DistressEvent).filter(
            DistressEvent.company_id == company_id,
            DistressEvent.source.in_(["Federal Court", "Supreme Court"])
        ).count() > 0

        # Classification Logic
        urgency = "LOW"
        action = "Periodic review only"
        badge = "LOW PRIORITY"
        next_steps = ["Schedule periodic review", "Track industry benchmarks"]

        if score >= 80 or (has_legal_escalation and score >= 70):
            urgency = "CRITICAL"
            action = "Immediate restructuring outreach"
            badge = "CRITICAL"
            next_steps = [
                "Initiate insolvency advisory call within 24h",
                "Assess immediate liquidity position",
                "Review Federal Court filing details"
            ]
        elif score >= 65:
            urgency = "HIGH"
            action = "Schedule advisory discussion"
            badge = "HIGH PRIORITY"
            next_steps = [
                "Proactive client consultation",
                "Review director network exposure",
                "Evaluate debt restructuring options"
            ]
        elif score >= 40:
            urgency = "MEDIUM"
            action = "Monitor for escalation"
            badge = "MEDIUM PRIORITY"
            next_steps = [
                "Weekly intelligence tracking",
                "Monitor for new PPSR registrations",
                "Verify director stability"
            ]

        # Reasoning generation
        reasoning = []
        if score >= 70:
            reasoning.append(f"Elevated risk score ({score}) indicates deteriorating conditions")
        if has_legal_escalation:
            reasoning.append("Critical legal escalation detected via Federal Court filings")
        if confidence_score >= 80:
            reasoning.append(f"Intelligence corroboration verified at {confidence_score}% confidence")
        if network_exposure >= 70:
            reasoning.append(f"Heightened cross-entity network contagion detected ({network_exposure}%)")
        
        if not reasoning:
            reasoning.append("System monitoring remains active with no elevated signals")

        return {
            "company_id": company_id,
            "score": score,
            "urgency": urgency,
            "action": ai_output_refinement_service.refine(action, context="badge"),
            "badge": badge,
            "next_steps": ai_output_refinement_service.refine_list(next_steps),
            "reasoning": ai_output_refinement_service.refine_list(reasoning),
            "confidence_score": confidence_score,
            "network_exposure": network_exposure
        }

recommendation_engine = RecommendationEngine()
