"""
JurisMind AI Service — FastAPI entry point.

Responsibilities:
  - Configure FastAPI application
  - Register all feature routers
  - Manage MongoDB lifecycle (connect / disconnect)
  - Graceful startup and shutdown
"""
import logging
import sys
from contextlib import asynccontextmanager
from typing import AsyncGenerator

import uvicorn
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from motor.motor_asyncio import AsyncIOMotorClient

from src.config.settings import get_settings
from src.features.health.router import router as health_router, set_mongo_client

# ─── Logging setup ────────────────────────────────────────────────────────────
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)-8s | %(name)s | %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
    stream=sys.stdout,
)
logger = logging.getLogger("jurismind.ai")

settings = get_settings()

# ─── Database state ───────────────────────────────────────────────────────────
mongo_client: AsyncIOMotorClient | None = None


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator[None, None]:
    """
    Manage application lifecycle:
      - Startup:  Connect to MongoDB
      - Shutdown: Disconnect from MongoDB
    """
    global mongo_client

    # ── Startup ──────────────────────────────────────────────────────────────
    logger.info("Starting JurisMind AI Service...")

    try:
        mongo_client = AsyncIOMotorClient(
            settings.MONGODB_URI,
            serverSelectionTimeoutMS=5000,
        )
        # Verify connection
        await mongo_client.admin.command("ping")
        set_mongo_client(mongo_client)
        logger.info("✅ MongoDB connected")
    except Exception as e:
        logger.error(f"❌ MongoDB connection failed: {e}")
        # Don't exit — AI service can function without DB for some endpoints

    logger.info(f"🚀 AI Service ready on port {settings.PORT}")
    yield

    # ── Shutdown ─────────────────────────────────────────────────────────────
    logger.info("Shutting down AI Service...")
    if mongo_client is not None:
        mongo_client.close()
        logger.info("MongoDB disconnected")


# ─── FastAPI app ──────────────────────────────────────────────────────────────
app = FastAPI(
    title="JurisMind AI Service",
    description="Internal AI microservice for legal document intelligence",
    version="1.0.0",
    docs_url="/docs" if settings.is_development else None,
    redoc_url="/redoc" if settings.is_development else None,
    lifespan=lifespan,
)

# ─── CORS ─────────────────────────────────────────────────────────────────────
# AI service is internal-only; only the API backend should call it.
# In production, restrict origins to the API service's internal URL.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"] if settings.is_development else [],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─── Global exception handler ─────────────────────────────────────────────────
@app.exception_handler(Exception)
async def global_exception_handler(_request: Request, exc: Exception) -> JSONResponse:
    logger.error(f"Unhandled exception: {exc}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={
            "success": False,
            "error": {
                "code": "INTERNAL_ERROR",
                "message": "An unexpected error occurred"
                if settings.is_production
                else str(exc),
            },
        },
    )

# ─── Routers ──────────────────────────────────────────────────────────────────
# All routes are versioned under /ai/v1/
app.include_router(health_router, prefix="/ai/v1", tags=["Health"])

# Future routers will be added here:
# app.include_router(analysis_router, prefix="/ai/v1", tags=["Analysis"])
# app.include_router(conversation_router, prefix="/ai/v1", tags=["Conversation"])


# ─── Entry point ──────────────────────────────────────────────────────────────
if __name__ == "__main__":
    uvicorn.run(
        "src.main:app",
        host="0.0.0.0",
        port=settings.PORT,
        reload=settings.is_development,
        log_level="info",
    )
