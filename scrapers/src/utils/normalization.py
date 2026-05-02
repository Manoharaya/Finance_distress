import re

def normalize_company_name(name: str) -> str:
    """
    Normalizes company names for matching.
    Example: "Vertex Solutions PTY LTD" -> "VERTEX SOLUTIONS"
    """
    if not name:
        return ""
    
    # Uppercase
    name = name.upper().strip()
    
    # Remove common suffixes
    suffixes = [
        r"\bPTY\b", r"\bLTD\b", r"\bPTY\s+LTD\b", r"\bPROPRIETARY\b", 
        r"\bLIMITED\b", r"\b\(?\bIN\s+LIQUIDATION\b\)?", r"\b\(?\bRECEIVER\s+APPOINTED\b\)?"
    ]
    
    for suffix in suffixes:
        name = re.sub(suffix, "", name)
    
    # Remove special characters and extra whitespace
    name = re.sub(r"[^\w\s]", "", name)
    name = " ".join(name.split())
    
    return name
