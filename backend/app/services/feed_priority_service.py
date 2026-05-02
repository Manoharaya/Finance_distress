class FeedPriorityService:
    """
    Ranks intelligence feed items based on operational urgency.
    """

    SEVERITY_WEIGHTS = {
        "CRITICAL": 100,
        "HIGH":     70,
        "MEDIUM":   40,
        "LOW":      10,
    }

    TYPE_BOOSTS = {
        "LEGAL_ESCALATION":   20,
        "RISK_SPIKE":         15,
        "NETWORK_CONTAGION":  25,
        "DIRECTOR_DEPARTURE": 10,
        "NEWS_ALERT":         5,
    }

    def get_priority_score(self, severity: str, feed_type: str) -> int:
        base = self.SEVERITY_WEIGHTS.get(severity, 0)
        boost = self.TYPE_BOOSTS.get(feed_type, 0)
        return base + boost

    def sort_by_urgency(self, feed_items: list) -> list:
        """Sorts a list of feed items by calculated priority score."""
        return sorted(
            feed_items,
            key=lambda x: self.get_priority_score(x["severity"], x["feed_type"]),
            reverse=True
        )

feed_priority_service = FeedPriorityService()
