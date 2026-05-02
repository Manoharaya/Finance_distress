"""
Signal Source Registry — canonical source definitions for the platform.
All ingested events should normalize their source field against these keys.
"""

from enum import Enum

class SignalSource(str, Enum):
    FEDERAL_COURT        = "FEDERAL_COURT"
    ASIC                 = "ASIC"
    ABN                  = "ABN"
    PPSR                 = "PPSR"
    NEWS                 = "NEWS"
    AI_ENRICHMENT        = "AI_ENRICHMENT"
    SCORING_ENGINE       = "SCORING_ENGINE"
    ENTITY_RESOLUTION    = "ENTITY_RESOLUTION"
    ANALYST              = "ANALYST"
    UNKNOWN              = "UNKNOWN"


# Source metadata registry — used by APIs and confidence engine
SOURCE_REGISTRY: dict[str, dict] = {
    SignalSource.FEDERAL_COURT: {
        "label":       "Federal Court",
        "icon":        "scale",
        "reliability": 95,
        "trust_level": "VERIFIED",
        "color":       "rose",
    },
    SignalSource.ASIC: {
        "label":       "ASIC Registry",
        "icon":        "building2",
        "reliability": 92,
        "trust_level": "VERIFIED",
        "color":       "blue",
    },
    SignalSource.ABN: {
        "label":       "ABN Lookup",
        "icon":        "badge_check",
        "reliability": 88,
        "trust_level": "HIGH",
        "color":       "emerald",
    },
    SignalSource.PPSR: {
        "label":       "PPSR Register",
        "icon":        "lock",
        "reliability": 88,
        "trust_level": "HIGH",
        "color":       "orange",
    },
    SignalSource.NEWS: {
        "label":       "News Media",
        "icon":        "newspaper",
        "reliability": 65,
        "trust_level": "MODERATE",
        "color":       "yellow",
    },
    SignalSource.AI_ENRICHMENT: {
        "label":       "AI Enrichment",
        "icon":        "sparkles",
        "reliability": 45,
        "trust_level": "INFERRED",
        "color":       "violet",
    },
    SignalSource.SCORING_ENGINE: {
        "label":       "Scoring Engine",
        "icon":        "cpu",
        "reliability": 75,
        "trust_level": "HIGH",
        "color":       "cyan",
    },
    SignalSource.ENTITY_RESOLUTION: {
        "label":       "Entity Resolution",
        "icon":        "network",
        "reliability": 80,
        "trust_level": "HIGH",
        "color":       "indigo",
    },
    SignalSource.ANALYST: {
        "label":       "Analyst Review",
        "icon":        "user_check",
        "reliability": 98,
        "trust_level": "VERIFIED",
        "color":       "slate",
    },
    SignalSource.UNKNOWN: {
        "label":       "Unknown Source",
        "icon":        "help_circle",
        "reliability": 30,
        "trust_level": "UNCERTAIN",
        "color":       "slate",
    },
}

# Normalization map — maps raw free-text sources to canonical keys
NORMALIZATION_MAP: dict[str, SignalSource] = {
    "federal court":            SignalSource.FEDERAL_COURT,
    "federal court registry":   SignalSource.FEDERAL_COURT,
    "court":                    SignalSource.FEDERAL_COURT,
    "asic":                     SignalSource.ASIC,
    "asic registry":            SignalSource.ASIC,
    "asic compliance monitor":  SignalSource.ASIC,
    "abn":                      SignalSource.ABN,
    "abn lookup":               SignalSource.ABN,
    "ppsr":                     SignalSource.PPSR,
    "ppsr register":            SignalSource.PPSR,
    "news":                     SignalSource.NEWS,
    "major news":               SignalSource.NEWS,
    "news media":               SignalSource.NEWS,
    "ai enrichment":            SignalSource.AI_ENRICHMENT,
    "ai inference":             SignalSource.AI_ENRICHMENT,
    "gemini":                   SignalSource.AI_ENRICHMENT,
    "scoring engine":           SignalSource.SCORING_ENGINE,
    "entity resolution":        SignalSource.ENTITY_RESOLUTION,
    "entity resolution engine": SignalSource.ENTITY_RESOLUTION,
    "analyst":                  SignalSource.ANALYST,
    "analyst review":           SignalSource.ANALYST,
}


def normalize_source(raw: str) -> SignalSource:
    """Convert any free-text source string to a canonical SignalSource key."""
    if not raw:
        return SignalSource.UNKNOWN
    key = raw.strip().lower()
    return NORMALIZATION_MAP.get(key, SignalSource.UNKNOWN)


def get_source_meta(raw: str) -> dict:
    """Return full metadata dict for a given raw source string."""
    canonical = normalize_source(raw)
    meta = SOURCE_REGISTRY.get(canonical, SOURCE_REGISTRY[SignalSource.UNKNOWN]).copy()
    meta["type"] = canonical.value
    meta["source"] = canonical.value
    return meta
