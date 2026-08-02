import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_health_check_endpoint(client: AsyncClient) -> None:
    """Test that the health endpoint returns a valid schema and connects to DB."""
    response = await client.get("/api/v1/health")
    assert response.status_code == 200

    data = response.json()
    assert "status" in data
    assert "database" in data
    assert "redis" in data
    assert "environment" in data

    # Since sqlite is in-memory and initialized, database check must pass
    assert data["database"]["status"] == "healthy"
    assert data["database"]["details"] is None
