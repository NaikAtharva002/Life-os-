"""
Configuration Settings for LIFE OS Python AI Engine.
"""
import os
from pathlib import Path
from pydantic import BaseModel

class Settings(BaseModel):
    APP_NAME: str = "LIFE OS AI & Analytics Engine"
    VERSION: str = "2.4.0"
    ENVIRONMENT: str = os.getenv("ENV", "development")
    DEBUG: bool = os.getenv("DEBUG", "true").lower() == "true"
    
    # Base paths
    BASE_DIR: Path = Path(__file__).resolve().parent
    DATA_DIR: Path = Path(__file__).resolve().parent / "data"
    DATABASE_PATH: Path = Path(__file__).resolve().parent / "data" / "life_os.db"
    MIGRATIONS_DIR: Path = Path(__file__).resolve().parent / "database" / "migrations"
    
    # Server configuration
    HOST: str = os.getenv("HOST", "127.0.0.1")
    PORT: int = int(os.getenv("PORT", "8000"))
    CORS_ORIGINS: list[str] = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:5174",
        "http://127.0.0.1:5174",
        "tauri://localhost",
    ]

settings = Settings()
settings.DATA_DIR.mkdir(parents=True, exist_ok=True)
