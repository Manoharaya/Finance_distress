import re
from typing import Dict, Any

class AIOutputRefinementService:
    """
    Executive Advisory Language Layer:
    Transforms raw AI outputs into senior-advisor grade intelligence.
    """

    FORBIDDEN_PATTERNS = [
        r"this may indicate",
        r"there could be issues",
        r"it seems likely",
        r"possibly shows signs",
        r"seems to be facing",
        r"problems due to",
        r"I think",
        r"we believe"
    ]

    REPLACEMENT_MAP = {
        "legal activity": "legal escalation",
        "director changes": "director restructuring activity",
        "insolvency problems": "elevated restructuring risk",
        "financial issues": "financial distress",
        "director overlap": "director cross-exposure patterns",
        "network problems": "cross-entity network contagion",
        "getting worse": "progressive deterioration",
        "risk is going up": "elevated distress velocity"
    }

    def refine(self, text: str, context: str = "general") -> str:
        """
        Refines text into an executive advisory tone.
        """
        if not text:
            return ""

        refined = text
        
        # 1. Direct replacements for vocabulary standardization
        for old, new in self.REPLACEMENT_MAP.items():
            refined = refined.replace(old, new)
            refined = refined.replace(old.capitalize(), new.capitalize())

        # 2. Pattern-based structural refinement
        # "This may indicate [X]" -> "[X] indicates"
        refined = re.sub(r"This may indicate (that )?", "", refined, flags=re.IGNORECASE)
        
        # 3. Clean up leading/trailing uncertainty
        refined = re.sub(r"^It seems (that )?", "", refined, flags=re.IGNORECASE)
        refined = re.sub(r"^Possibly shows signs of ", "", refined, flags=re.IGNORECASE)

        # 4. Standardize endings (ensure punchy executive finish)
        if refined.endswith("."):
            refined = refined[:-1]
        
        # 5. Inject advisory authority if text is too simple
        if len(refined.split()) < 8 and context != "badge":
            refined = f"Current intelligence indicates {refined.lower()}"

        # 6. Final Polish
        refined = refined.strip()
        if not refined.endswith("."):
            refined += "."

        # Ensure first letter is capitalized
        refined = refined[0].upper() + refined[1:]
        
        return refined

    def refine_list(self, items: list[str]) -> list[str]:
        return [self.refine(item) for item in items]

ai_output_refinement_service = AIOutputRefinementService()
