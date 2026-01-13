"""
MedTech AI Backend - Core Configuration

Centralized configuration management using Pydantic Settings.
All environment variables are validated and typed.
"""

from functools import lru_cache
from typing import List
from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import Field, field_validator


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""
    
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore"
    )
    
    # =========================================
    # Application Settings
    # =========================================
    app_name: str = Field(default="MedTech AI Backend")
    app_version: str = Field(default="1.0.0")
    environment: str = Field(default="development")
    debug: bool = Field(default=False)
    log_level: str = Field(default="INFO")
    
    # =========================================
    # Server Settings
    # =========================================
    host: str = Field(default="0.0.0.0")
    port: int = Field(default=8000)
    
    # =========================================
    # Supabase Configuration
    # =========================================
    supabase_url: str = Field(..., description="Supabase project URL")
    supabase_key: str = Field(..., description="Supabase anon/public key")
    supabase_service_role_key: str = Field(default="", description="Supabase service role key")
    supabase_jwt_secret: str = Field(default="", description="JWT secret for token validation")
    
    # =========================================
    # Database Configuration
    # =========================================
    database_url: str = Field(..., description="PostgreSQL connection string")
    
    @field_validator("database_url")
    @classmethod
    def validate_database_url(cls, v: str) -> str:
        """Ensure database URL uses asyncpg driver."""
        if v and "postgresql://" in v and "asyncpg" not in v:
            v = v.replace("postgresql://", "postgresql+asyncpg://")
        return v
    
    # =========================================
    # Google Gemini AI Configuration
    # =========================================
    gemini_api_key: str = Field(default="", description="Google Gemini API key")
    gemini_model: str = Field(default="gemini-pro")
    gemini_vision_model: str = Field(default="gemini-pro-vision")
    
    # AI Safety Settings
    ai_max_retries: int = Field(default=3)
    ai_timeout_seconds: int = Field(default=30)
    ai_temperature: float = Field(default=0.3)
    
    # =========================================
    # Security Settings
    # =========================================
    jwt_algorithm: str = Field(default="HS256")
    access_token_expire_minutes: int = Field(default=30)
    
    # CORS Settings
    cors_origins: str = Field(default="http://localhost:5173,http://localhost:3000,http://localhost:8000")
    
    @property
    def cors_origins_list(self) -> List[str]:
        """Parse CORS origins from comma-separated string."""
        origins = [origin.strip() for origin in self.cors_origins.split(",") if origin.strip()]
        # In production, add wildcard for same-origin requests
        if self.is_production:
            origins.append("*")
        return origins
    
    # =========================================
    # Emergency Services
    # =========================================
    emergency_webhook_url: str = Field(default="")
    emergency_notification_enabled: bool = Field(default=True)
    
    # =========================================
    # Computed Properties
    # =========================================
    @property
    def is_production(self) -> bool:
        """Check if running in production environment."""
        return self.environment.lower() == "production"
    
    @property
    def is_development(self) -> bool:
        """Check if running in development environment."""
        return self.environment.lower() == "development"


@lru_cache()
def get_settings() -> Settings:
    """
    Get cached settings instance.
    
    Uses LRU cache to avoid re-reading environment variables on every call.
    """
    return Settings()


# Expose settings as module-level variable for convenience
settings = get_settings()
