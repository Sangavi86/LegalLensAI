"""
Application settings — loaded from environment variables.
Pydantic-settings validates and provides typed config at startup.
"""
from functools import lru_cache
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True,
        extra="ignore",
    )

    # ─── Server ───────────────────────────────
    PYTHON_ENV: str = "development"
    PORT: int = 8001

    # ─── MongoDB ──────────────────────────────
    MONGODB_URI: str = "mongodb://localhost:27017/jurismind_dev"

    # ─── Gemini ───────────────────────────────
    GEMINI_API_KEY: str = ""

    # ─── FAISS ────────────────────────────────
    FAISS_INDEX_PATH: str = "./faiss_index"

    # ─── IndicTrans2 ──────────────────────────
    INDICTRANS2_MODEL_PATH: str = "./models/indictrans2"

    # ─── Security ─────────────────────────────
    API_SERVICE_SECRET: str = "dev-secret"

    @property
    def is_development(self) -> bool:
        return self.PYTHON_ENV == "development"

    @property
    def is_production(self) -> bool:
        return self.PYTHON_ENV == "production"


@lru_cache()
def get_settings() -> Settings:
    """Return cached settings instance."""
    return Settings()
