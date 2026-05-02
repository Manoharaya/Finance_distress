from datetime import datetime, timezone


class FreshnessService:
    """
    Analyses signal recency and assigns freshness bonuses or penalties.
    """

    FRESHNESS_TIERS = [
        (3,  20, "LIVE",    "Signal detected within 72 hours — maximum freshness"),
        (7,  15, "FRESH",   "Signal detected within 7 days — high freshness"),
        (14, 10, "RECENT",  "Signal detected within 14 days — moderate freshness"),
        (30,  5, "AGING",   "Signal detected within 30 days — reduced weighting"),
        (90, -5, "STALE",   "Signal over 30 days old — confidence penalty applied"),
        (999,-15,"EXPIRED", "Signal older than 90 days — minimal confidence contribution"),
    ]

    def get_freshness_bonus(self, event_date: datetime) -> tuple[int, str, str]:
        """
        Returns (bonus_points, tier_name, tier_label) based on signal age.
        """
        if not event_date:
            return -10, "UNKNOWN", "No date recorded — cannot assess freshness"

        # Normalize to naive UTC for comparison
        now = datetime.now(timezone.utc)
        if event_date.tzinfo is None:
            event_date = event_date.replace(tzinfo=timezone.utc)

        age_days = (now - event_date).days

        for max_days, bonus, tier, label in self.FRESHNESS_TIERS:
            if age_days <= max_days:
                return bonus, tier, label

        return -15, "EXPIRED", "Signal older than 90 days — minimal contribution"

    def get_portfolio_freshness(self, event_dates: list[datetime]) -> dict:
        """Aggregate freshness across all events for a company."""
        if not event_dates:
            return {"score": 0, "label": "No signals", "tier": "UNKNOWN"}

        total_bonus = 0
        tiers = []
        for dt in event_dates:
            bonus, tier, _ = self.get_freshness_bonus(dt)
            total_bonus += bonus
            tiers.append(tier)

        avg = total_bonus / len(event_dates)
        has_live = "LIVE" in tiers or "FRESH" in tiers

        if has_live:
            label = f"Fresh corroborating activity — {sum(1 for t in tiers if t in ['LIVE','FRESH'])} recent signal(s)"
        elif avg > 0:
            label = f"Recent supporting signals detected"
        else:
            label = "No recent supporting activity — signals aging"

        return {
            "score": round(total_bonus),
            "label": label,
            "tier": tiers[0] if tiers else "UNKNOWN",
            "has_fresh_signal": has_live
        }


freshness_service = FreshnessService()
