import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_user_registration_and_retrieval(client: AsyncClient) -> None:
    """Validate registering users, querying by id/email, and checking duplicates."""
    user_payload = {
        "email": "testpilot@postpilot.ai",
        "password": "supersecurepassword123",
        "full_name": "Test Pilot",
    }

    # 1. Create a user
    response = await client.post("/api/v1/users/", json=user_payload)
    assert response.status_code == 201
    data = response.json()
    assert data["email"] == "testpilot@postpilot.ai"
    assert data["full_name"] == "Test Pilot"
    assert "id" in data
    user_id = data["id"]

    # 2. Retrieve user by ID
    response = await client.get(f"/api/v1/users/{user_id}")
    assert response.status_code == 200
    assert response.json()["email"] == "testpilot@postpilot.ai"

    # 3. Retrieve user by email
    response = await client.get("/api/v1/users/email/testpilot@postpilot.ai")
    assert response.status_code == 200
    assert response.json()["id"] == user_id

    # 4. Prevent duplicate registration
    response = await client.post("/api/v1/users/", json=user_payload)
    assert response.status_code == 400
    assert "exists" in response.json()["message"]
