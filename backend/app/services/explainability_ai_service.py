import json
import structlog
import google.generativeai as genai
from app.core.config import settings

logger = structlog.get_logger()

class ExplainabilityAIService:

    def __init__(self):
        self.api_key = settings.GEMINI_API_KEY
        self.enabled = bool(self.api_key)
        if self.enabled:
            genai.configure(api_key=self.api_key)
            self.model = genai.GenerativeModel('gemini-flash-latest')

    async def generate_executive_explanation(
        self,
        company_name: str,
        drivers: list,
        momentum: dict,
        score: int
    ) -> str:
        """
        Generates a concise, executive-grade explanation of WHY this company was flagged.
        """
        if not self.enabled:
            return self._fallback_explanation(company_name, drivers, score)

        try:
            driver_titles = [d["title"] for d in drivers[:4]]
            prompt = f"""
            You are a Senior Financial Intelligence Analyst writing for C-suite executives.
            
            Company: {company_name}
            Distress Score: {score}/100
            Momentum: {momentum.get("momentum", "Unknown")} ({momentum.get("pct_change", 0)}% change)
            
            Key distress signals:
            {json.dumps(driver_titles)}
            
            Write a single paragraph (3-4 sentences MAX) explaining why this company has been flagged.
            
            Requirements:
            - Advisory-grade tone (like Bloomberg Intelligence or Palantir briefing)
            - Specific and concrete, NOT generic
            - Mention actual signals — not vague language
            - Convey urgency appropriate to a {score}/100 distress score
            - End with a strategic implication or recommended posture
            
            Output: Plain text only. No markdown, no bullet points, no headers.
            """
            response = self.model.generate_content(prompt)
            return response.text.strip()

        except Exception as e:
            logger.error("Explainability AI failed", error=str(e))
            return self._fallback_explanation(company_name, drivers, score)

    def _fallback_explanation(self, company_name: str, drivers: list, score: int) -> str:
        if not drivers:
            return f"{company_name} has been flagged for elevated corporate risk. Monitoring is recommended."
        
        top = drivers[0]["title"] if drivers else "multiple adverse signals"
        risk = "critical" if score >= 80 else "elevated" if score >= 60 else "moderate"
        
        return (
            f"{company_name} has been classified as {risk} risk (score: {score}/100) "
            f"following detection of: {top}. "
            f"Combined with network exposure and compliance patterns, "
            f"this entity warrants immediate investigative attention."
        )


explainability_ai_service = ExplainabilityAIService()
