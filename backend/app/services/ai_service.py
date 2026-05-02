import os
import json
import structlog
from datetime import datetime
import google.generativeai as genai
from app.core.config import settings

logger = structlog.get_logger()

class AIService:
    def __init__(self):
        self.api_key = settings.GEMINI_API_KEY
        self.enabled = bool(self.api_key)
        if self.enabled:
            genai.configure(api_key=self.api_key)
            self.model = genai.GenerativeModel('gemini-flash-latest')

    async def analyze_company_distress(self, company_name: str, events: list):
        """
        Analyzes company events using the Gemini Intelligence Engine.
        """
        if not self.enabled:
            return self._generate_mock_analysis(company_name, events)

        try:
            prompt = self._build_prompt(company_name, events)
            response = self.model.generate_content(prompt)
            return self._parse_json_response(response.text)
        except Exception as e:
            logger.error("Gemini analysis failed, falling back to mock", error=str(e))
            return self._generate_mock_analysis(company_name, events)

    async def generate_daily_intelligence_report(self, companies_data: list):
        """
        Generates a master intelligence report for the top distressed entities.
        """
        if not self.enabled:
            return {"priority_leads": [], "market_sentiment": "Standby"}

        try:
            prompt = f"""
            ### TASK: Generate Daily Intelligence Report
            Analyze the following distressed entities from the last 24h.
            
            DATA:
            {json.dumps(companies_data)}
            
            ### OUTPUT FORMAT (STRICT JSON):
            {{
              "report_date": "{datetime.now().strftime('%Y-%m-%d')}",
              "priority_leads": [
                {{
                  "company_name": "Name",
                  "urgency": "Critical/High/Monitor",
                  "narrative_summary": "Sophisticated analysis of why flagged",
                  "network_context": "Any director patterns detected",
                  "action_plan": "Recommended strategic playbook"
                }}
              ],
              "market_sentiment": "Overall market observation"
            }}
            """
            response = self.model.generate_content(prompt)
            return self._parse_json_response(response.text)
        except Exception as e:
            logger.error("Daily report generation failed", error=str(e))
            return {"priority_leads": [], "market_sentiment": "Error during generation"}

    def _parse_json_response(self, text: str):
        """Robustly parses JSON from LLM response."""
        if "```json" in text:
            text = text.split("```json")[1].split("```")[0].strip()
        elif "```" in text:
            text = text.split("```")[1].split("```")[0].strip()
        return json.loads(text)

    def _build_prompt(self, company_name: str, events: list):
        return f"""
        Analyze the following corporate distress data for {company_name}.
        
        DATA:
        {json.dumps(events)}
        
        TASK:
        1. Identify the primary director and link to any failed entities.
        2. Calculate a distress score (0-100) based on these rules:
           - Winding-up action: +40
           - Multiple failed entities: +20
           - Late filing: +10
        3. Classify risk level (Low, Medium, High, Critical).
        4. Generate a concise intelligence summary with recommended actions.

        OUTPUT FORMAT (STRICT JSON):
        {{
          "director": "Full Name",
          "companies": ["List of Linked Entities"],
          "relationships": [
            {{ "entity": "Name", "status": "Active/Former", "notes": "Reason" }}
          ],
          "distress_score": 0,
          "risk_level": "Level",
          "flags": ["LIST_OF_FLAGS"],
          "summary": "Full analysis summary and recommendation"
        }}
        """

    def _generate_mock_analysis(self, company_name: str, events: list):
        """Fallback mock analysis."""
        return {
            "director": "Analysis Pending",
            "companies": [company_name],
            "relationships": [],
            "distress_score": 50,
            "risk_level": "Medium Risk",
            "flags": ["PENDING_API_VALIDATION"],
            "summary": "Intelligence engine is in standby mode. Simulated analysis for " + company_name + "."
        }

ai_service = AIService()
