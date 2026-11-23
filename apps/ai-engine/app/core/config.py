from typing import Literal
from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import Field


class Settings(BaseSettings):
    """
    LegalLens AI Engine Configuration Settings.
    Validates required environment variables with Pydantic v2.
    """
    FASTAPI_ENV: Literal["development", "production", "test"] = "development"
    FASTAPI_PORT: int = Field(default=8000, description="Port for the FastAPI service")
    FASTAPI_HOST: str = Field(default="0.0.0.0", description="Host binding")
    AI_ENGINE_SECRET: str = Field(default="internal-service-token-dev-secret")
    
    # Provider & Model Settings
    DEFAULT_LLM_PROVIDER: Literal["google", "mock", "openai", "anthropic"] = Field(
        default="mock",
        description="Active LLM provider. Uses 'mock' by default for deterministic local testing."
    )
    GEMINI_API_KEY: str = Field(default="", description="Google Gemini API Key")
    
    # Configurable Model Identifiers
    LLM_MODEL_EXTRACTION: str = Field(default="gemini-2.5-flash")
    LLM_MODEL_RESEARCH: str = Field(default="gemini-2.5-flash")
    LLM_MODEL_VERIFICATION: str = Field(default="gemini-2.5-pro")
    LLM_MODEL_REASONING: str = Field(default="gemini-2.5-pro")
    
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore"
    )


settings = Settings()
