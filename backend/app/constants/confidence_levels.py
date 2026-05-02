from enum import Enum

class ConfidenceLevel(str, Enum):
    VERY_HIGH = "VERY HIGH"
    HIGH      = "HIGH"
    MODERATE  = "MODERATE"
    LOW       = "LOW"

CONFIDENCE_THRESHOLDS = [
    (85, ConfidenceLevel.VERY_HIGH),
    (70, ConfidenceLevel.HIGH),
    (40, ConfidenceLevel.MODERATE),
    (0,  ConfidenceLevel.LOW),
]

def classify_confidence(score: int) -> ConfidenceLevel:
    for threshold, level in CONFIDENCE_THRESHOLDS:
        if score >= threshold:
            return level
    return ConfidenceLevel.LOW

CONFIDENCE_COLORS = {
    ConfidenceLevel.VERY_HIGH: "#10b981",  # emerald
    ConfidenceLevel.HIGH:      "#3b82f6",  # blue
    ConfidenceLevel.MODERATE:  "#f59e0b",  # amber
    ConfidenceLevel.LOW:       "#6b7280",  # slate
}
