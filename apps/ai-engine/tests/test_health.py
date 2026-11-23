import pytest
from httpx import AsyncClient, ASGITransport
from main import app
from app.llm.router import router
from app.llm.base import TaskType


@pytest.mark.asyncio
async def test_health_root_endpoint():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        response = await client.get("/health")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "healthy"
        assert data["service"] == "ai-engine"
        assert "EXTRACTION" in data["configured_models"]
        assert "RESEARCH" in data["configured_models"]
        assert "VERIFICATION" in data["configured_models"]
        assert "REASONING" in data["configured_models"]


@pytest.mark.asyncio
async def test_health_v1_endpoint():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        response = await client.get("/api/v1/health")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "healthy"


@pytest.mark.asyncio
async def test_model_router_mock_generation():
    client, model = router.route(TaskType.REASONING)
    assert client is not None
    assert model is not None
    
    response = await client.generate("Evaluate Section 27 Indian Contract Act 1872", model=model)
    assert response is not None
    assert response.content is not None
    assert len(response.content) > 0
