from enum import Enum

class FreshnessLevel(str, Enum):
    LIVE     = "LIVE"      # < 15 mins
    FRESH    = "FRESH"     # < 1 hour
    RECENT   = "RECENT"    # < 6 hours
    AGING    = "AGING"     # < 24 hours
    STALE    = "STALE"     # > 24 hours

class SystemStatus(str, Enum):
    ACTIVE   = "ACTIVE"
    DEGRADED = "DEGRADED"
    DELAYED  = "DELAYED"
    OFFLINE  = "OFFLINE"

# Thresholds in minutes
FRESHNESS_THRESHOLDS = {
    FreshnessLevel.LIVE:   15,
    FreshnessLevel.FRESH:  60,
    FreshnessLevel.RECENT: 360,
    FreshnessLevel.AGING:  1440,
}

def get_freshness_label(minutes: int) -> FreshnessLevel:
    if minutes < FRESHNESS_THRESHOLDS[FreshnessLevel.LIVE]:
        return FreshnessLevel.LIVE
    if minutes < FRESHNESS_THRESHOLDS[FreshnessLevel.FRESH]:
        return FreshnessLevel.FRESH
    if minutes < FRESHNESS_THRESHOLDS[FreshnessLevel.RECENT]:
        return FreshnessLevel.RECENT
    if minutes < FRESHNESS_THRESHOLDS[FreshnessLevel.AGING]:
        return FreshnessLevel.AGING
    return FreshnessLevel.STALE
