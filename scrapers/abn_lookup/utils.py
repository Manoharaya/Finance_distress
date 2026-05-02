import re

def clean_abn(abn: str) -> str:
    """Removes spaces and non-numeric characters from ABN."""
    return re.sub(r"\D", "", abn)

def validate_abn(abn: str) -> bool:
    """Basic ABN length validation."""
    return len(clean_abn(abn)) == 11
