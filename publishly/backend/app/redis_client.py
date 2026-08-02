from __future__ import annotations

import logging

from redis.asyncio import Redis

from app.config import settings

logger = logging.getLogger(__name__)

# Initialize async Redis client
# We use decode_responses=True so that strings are returned instead of bytes
redis_client: Redis[str] = Redis.from_url(
    settings.REDIS_URL,
    encoding="utf-8",
    decode_responses=True,
)


async def ping_redis() -> bool:
    """Helper to check if Redis is reachable."""
    try:
        return await redis_client.ping()
    except Exception as e:
        logger.error(f"Redis connection health check failed: {e}")
        return False
