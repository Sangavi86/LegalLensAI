"""
Health check routes — no authentication required.
"""
from fastapi import APIRouter
from motor.motor_asyncio import AsyncIOMotorClient

router = APIRouter()

# Will be set by main.py after DB connection
_mongo_client: AsyncIOMotorClient | None = None


def set_mongo_client(client: AsyncIOMotorClient) -> None:
    global _mongo_client
    _mongo_client = client


@router.get("/health")
async def health_check():
    """
    Comprehensive health check.
    Returns 200 if all services are healthy, 503 if degraded.
    """
    db_status = "disconnected"

    if _mongo_client is not None:
        try:
            await _mongo_client.admin.command("ping")
            db_status = "connected"
        except Exception:
            db_status = "disconnected"

    is_healthy = db_status == "connected"

    payload = {
        "success": True,
        "data": {
            "status": "ok" if is_healthy else "degraded",
            "service": "jurismind-ai-service",
            "version": "1.0.0",
            "timestamp": __import__("datetime").datetime.utcnow().isoformat() + "Z",
            "services": {
                "database": db_status,
            },
        },
    }

    from fastapi.responses import JSONResponse
    return JSONResponse(content=payload, status_code=200 if is_healthy else 503)


@router.get("/ping")
async def ping():
    """Lightweight liveness probe."""
    return {"pong": True, "ts": __import__("time").time()}
