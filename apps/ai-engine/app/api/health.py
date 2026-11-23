import time
from datetime import datetime, timezone
from fastapi import APIRouter
from ..core.config import settings
from ..models.schemas import HealthCheckResponse

health_router = APIRouter(tags=["Health"])
start_time = time.time()


def build_health_response() -> HealthCheckResponse:
    uptime = time.time() - start_time
    return HealthCheckResponse(
        status="healthy",
        service="ai-engine",
        version="1.0.0",
        uptime=round(uptime, 2),
        timestamp=datetime.now(timezone.utc).isoformat(),
        environment=settings.FASTAPI_ENV,
        provider=settings.DEFAULT_LLM_PROVIDER,
        configured_models={
            "EXTRACTION": settings.LLM_MODEL_EXTRACTION,
            "RESEARCH": settings.LLM_MODEL_RESEARCH,
            "VERIFICATION": settings.LLM_MODEL_VERIFICATION,
            "REASONING": settings.LLM_MODEL_REASONING,
        },
    )


@health_router.get("/health", response_model=HealthCheckResponse)
async def get_health_root():
    return build_health_response()


@health_router.get("/api/v1/health", response_model=HealthCheckResponse)
async def get_health_v1():
    return build_health_response()
