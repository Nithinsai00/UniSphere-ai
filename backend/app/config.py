import os
from pydantic import BaseModel

class Settings(BaseModel):
    APP_NAME: str = "UniSphere AI"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = os.getenv("DEBUG", "False").lower() in ("true", "1", "yes")
    
    # Database
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./unisphere.db")
    
    # JWT Auth
    SECRET_KEY: str = os.getenv("SECRET_KEY", "unisphere-hacxlerate-2026-super-secret-kpmg-key-change-in-prod")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "1440")) # 24 hours
    
    # Bootstrap credentials (development defaults)
    BOOTSTRAP_ADMIN_USERNAME: str = os.getenv("ADMIN_USERNAME", "admin")
    BOOTSTRAP_ADMIN_EMAIL: str = os.getenv("ADMIN_EMAIL", "admin@unisphere.edu")
    BOOTSTRAP_ADMIN_PASSWORD: str = os.getenv("ADMIN_PASSWORD", "Hope@50")
    
    # Default Scoring Weights (Must sum to 1.0)
    DEFAULT_WEIGHT_ACADEMIC: float = 0.30
    DEFAULT_WEIGHT_ATTENDANCE: float = 0.20
    DEFAULT_WEIGHT_LMS: float = 0.15
    DEFAULT_WEIGHT_PLACEMENT: float = 0.20
    DEFAULT_WEIGHT_SKILLS: float = 0.15
    
    # Default Risk Thresholds
    ATTENDANCE_THRESHOLD: float = 75.0
    ACADEMIC_CGPA_THRESHOLD: float = 6.5
    ACADEMIC_INTERNAL_THRESHOLD: float = 60.0
    PLACEMENT_THRESHOLD: float = 60.0
    
    # External AI
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")

settings = Settings()
