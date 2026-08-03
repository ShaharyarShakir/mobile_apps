import uuid
from datetime import UTC, datetime, timedelta
from typing import Any

import jwt
from fastapi import HTTPException, status

from app.config import settings
from app.redis_client import redis_client

# Token Expiration Settings
ACCESS_TOKEN_EXPIRE_MINUTES = 15
REFRESH_TOKEN_EXPIRE_DAYS = 7
JWT_ALGORITHM = "HS256"


class JWTService:
    """Service for generating, verifying, and managing JWT access and refresh tokens."""

    def create_access_token(self, user_id: uuid.UUID, email: str) -> str:
        """Generate a short-lived access token."""
        now = datetime.now(UTC)
        expire = now + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
        payload = {
            "sub": str(user_id),
            "email": email,
            "exp": int(expire.timestamp()),
            "iat": int(now.timestamp()),
            "jti": str(uuid.uuid4()),
            "type": "access",
        }
        return jwt.encode(payload, settings.SECRET_KEY, algorithm=JWT_ALGORITHM)

    def create_refresh_token(self, user_id: uuid.UUID) -> tuple[str, str]:
        """Generate long-lived refresh token and return (token, jti)."""
        jti = str(uuid.uuid4())
        now = datetime.now(UTC)
        expire = now + timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS)
        payload = {
            "sub": str(user_id),
            "exp": int(expire.timestamp()),
            "iat": int(now.timestamp()),
            "jti": jti,
            "type": "refresh",
        }
        token = jwt.encode(payload, settings.SECRET_KEY, algorithm=JWT_ALGORITHM)
        return token, jti

    def decode_token(self, token: str) -> dict[str, Any]:
        """Decode and validate the token signature and expiration."""
        try:
            payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[JWT_ALGORITHM])
            return payload
        except jwt.ExpiredSignatureError as err:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Token has expired.",
                headers={"WWW-Authenticate": "Bearer"},
            ) from err
        except jwt.InvalidTokenError as err:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token.",
                headers={"WWW-Authenticate": "Bearer"},
            ) from err

    async def store_refresh_token(self, user_id: uuid.UUID, jti: str) -> None:
        """Store the active refresh token JTI in Redis."""
        key = f"refresh_token:{user_id}:{jti}"
        expiry_seconds = REFRESH_TOKEN_EXPIRE_DAYS * 24 * 60 * 60
        await redis_client.setex(key, expiry_seconds, "active")

    async def is_refresh_token_active(self, user_id: uuid.UUID, jti: str) -> bool:
        """Check if the refresh token JTI is active in Redis."""
        key = f"refresh_token:{user_id}:{jti}"
        status_val = await redis_client.get(key)
        return status_val == "active"

    async def revoke_refresh_token(self, user_id: uuid.UUID, jti: str) -> None:
        """Revoke a refresh token JTI by deleting it from Redis."""
        key = f"refresh_token:{user_id}:{jti}"
        await redis_client.delete(key)


jwt_service = JWTService()
