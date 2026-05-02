import sys
import os
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
from app.core.db import SessionLocal, engine, Base
print("Connecting...")
try:
    db = SessionLocal()
    print("Success")
    db.close()
except Exception as e:
    print(f"Error: {e}")
