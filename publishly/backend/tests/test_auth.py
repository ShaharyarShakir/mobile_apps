import uuid

import pytest
from httpx import AsyncClient
from sqlalchemy import select

from app.models.workspace import Workspace
from app.models.workspace_member import WorkspaceMember
from app.services.auth import jwt_service


@pytest.mark.asyncio
async def test_auth_registration_workspace_creation(
    client: AsyncClient, db_session
) -> None:
    """Validate registration creates user, default workspace, and Owner membership."""
    reg_payload = {
        "email": "pilot@postpilot.ai",
        "password": "supersecurepassword123",
        "full_name": "Instructor Pilot",
    }

    response = await client.post("/api/v1/auth/register", json=reg_payload)
    assert response.status_code == 201

    data = response.json()
    assert "access_token" in data
    assert "refresh_token" in data
    assert data["user"]["email"] == "pilot@postpilot.ai"
    assert data["user"]["full_name"] == "Instructor Pilot"

    user_id = uuid.UUID(data["user"]["id"])

    # Verify Workspace creation
    workspaces_result = await db_session.execute(select(Workspace))
    workspaces = workspaces_result.scalars().all()
    assert len(workspaces) == 1
    assert workspaces[0].name == "Instructor Pilot's Workspace"

    # Verify WorkspaceMember role is Owner
    members_result = await db_session.execute(select(WorkspaceMember))
    members = members_result.scalars().all()
    assert len(members) == 1
    assert members[0].user_id == user_id
    assert members[0].workspace_id == workspaces[0].id
    assert members[0].role == "Owner"


@pytest.mark.asyncio
async def test_auth_login_logout_rotation(client: AsyncClient, mock_redis) -> None:
    """Validate login, logout, and token refresh/rotation mechanisms."""
    reg_payload = {
        "email": "pilot2@postpilot.ai",
        "password": "supersecurepassword123",
        "full_name": "Second Pilot",
    }

    # 1. Register
    await client.post("/api/v1/auth/register", json=reg_payload)

    # 2. Login
    login_payload = {
        "email": reg_payload["email"],
        "password": reg_payload["password"],
    }
    login_resp = await client.post("/api/v1/auth/login", json=login_payload)
    assert login_resp.status_code == 200
    login_data = login_resp.json()

    access_token = login_data["access_token"]
    refresh_token = login_data["refresh_token"]

    # Decode refresh token to verify JTI is saved in Redis
    decoded = jwt_service.decode_token(refresh_token)
    jti = decoded["jti"]
    user_id = decoded["sub"]
    assert await mock_redis.get(f"refresh_token:{user_id}:{jti}") == "active"

    # 3. Refresh Token Rotation
    refresh_payload = {"refresh_token": refresh_token}
    refresh_resp = await client.post("/api/v1/auth/refresh", json=refresh_payload)
    assert refresh_resp.status_code == 200
    refresh_data = refresh_resp.json()

    new_access_token = refresh_data["access_token"]
    new_refresh_token = refresh_data["refresh_token"]

    assert new_access_token != access_token
    assert new_refresh_token != refresh_token

    # Old JTI must be revoked in Redis
    assert await mock_redis.get(f"refresh_token:{user_id}:{jti}") is None

    # New JTI must be active in Redis
    new_decoded = jwt_service.decode_token(new_refresh_token)
    new_jti = new_decoded["jti"]
    assert await mock_redis.get(f"refresh_token:{user_id}:{new_jti}") == "active"

    # 4. Logout
    logout_payload = {"refresh_token": new_refresh_token}
    logout_resp = await client.post(
        "/api/v1/auth/logout",
        json=logout_payload,
        headers={"Authorization": f"Bearer {new_access_token}"},
    )
    assert logout_resp.status_code == 200

    # New JTI must be revoked in Redis
    assert await mock_redis.get(f"refresh_token:{user_id}:{new_jti}") is None


@pytest.mark.asyncio
async def test_password_reset_flow(client: AsyncClient, mock_redis) -> None:
    """Validate password reset requesting and confirmation."""
    reg_payload = {
        "email": "reset@postpilot.ai",
        "password": "originalpassword123",
        "full_name": "Reset Pilot",
    }
    await client.post("/api/v1/auth/register", json=reg_payload)

    # 1. Request Reset
    req_resp = await client.post(
        "/api/v1/auth/password-reset-request",
        json={"email": reg_payload["email"]},
    )
    assert req_resp.status_code == 200

    # Retrieve reset token from mock redis keys
    reset_keys = [k for k in mock_redis.store.keys() if k.startswith("password_reset:")]
    assert len(reset_keys) == 1
    token = reset_keys[0].split(":")[1]

    # 2. Confirm Reset
    confirm_payload = {"token": token, "new_password": "brandnewpassword999"}
    confirm_resp = await client.post(
        "/api/v1/auth/password-reset-confirm", json=confirm_payload
    )
    assert confirm_resp.status_code == 200

    # 3. Verify Login with New Password
    login_resp = await client.post(
        "/api/v1/auth/login",
        json={"email": reg_payload["email"], "password": "brandnewpassword999"},
    )
    assert login_resp.status_code == 200


@pytest.mark.asyncio
async def test_auth_rate_limiting(client: AsyncClient, mock_redis) -> None:
    """Validate client rate limiting on auth routes."""
    # Reset mock redis rate limit counts
    mock_redis.store.clear()

    login_payload = {
        "email": "limiter@postpilot.ai",
        "password": "somepassword123",
    }

    # Call endpoint 5 times (limit is 5)
    for _ in range(5):
        await client.post("/api/v1/auth/login", json=login_payload)

    # 6th call must exceed limit and return 429
    limiter_resp = await client.post("/api/v1/auth/login", json=login_payload)
    assert limiter_resp.status_code == 429
    assert "Too many requests" in limiter_resp.json()["message"]
