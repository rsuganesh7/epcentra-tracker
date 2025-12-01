import os
from datetime import timedelta
from typing import List


class Config:
    SECRET_KEY = os.environ.get("SECRET_KEY", "dev-secret-key")
    SQLALCHEMY_DATABASE_URI = os.environ.get("DATABASE_URL", "sqlite:///epcentra.db")
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    JWT_SECRET_KEY = os.environ.get("JWT_SECRET_KEY", "dev-jwt-secret")
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(minutes=30)
    JWT_REFRESH_TOKEN_EXPIRES = timedelta(days=14)
    
    # Parse CORS origins from environment
    _cors_origins = os.environ.get("CORS_ORIGINS", "http://localhost:3000,http://localhost:5173")
    
    # Handle wildcard or comma-separated origins
    if _cors_origins == "*":
        # For development, allow common local origins
        CORS_ORIGINS: List[str] = [
            "http://localhost:3000",
            "http://localhost:5173",
            "http://127.0.0.1:3000",
            "http://127.0.0.1:5173"
        ]
    elif "," in _cors_origins:
        CORS_ORIGINS: List[str] = [origin.strip() for origin in _cors_origins.split(",")]
    else:
        CORS_ORIGINS: List[str] = [_cors_origins]
