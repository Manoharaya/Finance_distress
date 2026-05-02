import os

class DemoConfig:
    """
    Global configuration for the Client-Facing Demo Mode.
    """
    # Set to True to force the entire platform into the isolated demo environment
    DEMO_MODE: bool = os.getenv("DEMO_MODE", "False").lower() == "true"
    
    # Prefix for demo-only assets if needed
    DEMO_DATASET_VERSION: str = "v1.0"
    
    # Deterministic timestamp for demo history (locks history relative to this date)
    DEMO_REFERENCE_DATE: str = "2026-04-30T10:00:00"

demo_config = DemoConfig()
