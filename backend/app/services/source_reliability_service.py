"""
Source Reliability Service
Trust scores for each intelligence source (0–100).
Higher = more reliable for confidence calculation.
"""

SOURCE_TRUST_SCORES: dict[str, int] = {
    "Federal Court":          95,
    "Federal Court Registry": 95,
    "ASIC":                   92,
    "ASIC Registry":          92,
    "ASIC Compliance Monitor":90,
    "PPSR":                   88,
    "PPSR Register":          88,
    "ABN Lookup":             85,
    "Entity Resolution Engine": 80,
    "Scoring Engine":         75,
    "News":                   65,
    "Major News":             65,
    "Social Media":           40,
    "AI Inference":           45,
    "Unknown":                30,
}

DEFAULT_TRUST = 50  # fallback if source not mapped


class SourceReliabilityService:

    def get_trust_score(self, source: str) -> int:
        """Returns trust score for a given source string (case-insensitive)."""
        if not source:
            return DEFAULT_TRUST
        # Exact match first
        if source in SOURCE_TRUST_SCORES:
            return SOURCE_TRUST_SCORES[source]
        # Partial match
        source_lower = source.lower()
        for key, val in SOURCE_TRUST_SCORES.items():
            if key.lower() in source_lower or source_lower in key.lower():
                return val
        return DEFAULT_TRUST

    def get_all_scores(self) -> dict:
        return SOURCE_TRUST_SCORES

    def to_reliability_tier(self, trust: int) -> str:
        if trust >= 90: return "VERIFIED"
        if trust >= 75: return "HIGH"
        if trust >= 55: return "MODERATE"
        return "UNCERTAIN"


source_reliability_service = SourceReliabilityService()
