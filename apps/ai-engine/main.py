import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.core.logging import logger
from app.api.health import health_router

app = FastAPI(
    title="LegalLens AI Intelligence Engine",
    description="Cognitive Reasoning, Multi-Agent Orchestration & Legal RAG Microservice",
    version="1.0.0",
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount Health router (/health and /api/v1/health)
app.include_router(health_router)


@app.on_event("startup")
async def on_startup():
    logger.info(
        f"LegalLens AI Engine started successfully on {settings.FASTAPI_HOST}:{settings.FASTAPI_PORT} "
        f"[env={settings.FASTAPI_ENV}, provider={settings.DEFAULT_LLM_PROVIDER}]"
    )


if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host=settings.FASTAPI_HOST,
        port=settings.FASTAPI_PORT,
        reload=(settings.FASTAPI_ENV == "development"),
    )
