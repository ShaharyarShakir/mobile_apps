from fastapi import HTTPException, Request, status

from app.redis_client import redis_client


class RedisRateLimiter:
    """Simple rate limiter using Redis incr and expire."""

    def __init__(self, limit: int = 10, window_seconds: int = 60):
        self.limit = limit
        self.window_seconds = window_seconds

    async def __call__(self, request: Request) -> None:
        """Rate limiting dependency check."""
        # Identify by client host IP address
        client_ip = request.client.host if request.client else "unknown_ip"
        endpoint_path = request.url.path

        # Generate a unique key for the rate limit window
        key = f"rate_limit:{endpoint_path}:{client_ip}"

        current_requests = await redis_client.get(key)

        if current_requests and int(current_requests) >= self.limit:
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail="Too many requests. Please slow down and try again later.",
            )

        # Increment count
        pipe = redis_client.pipeline()
        pipe.incr(key)
        # If it's a new window, set expiration
        if not current_requests:
            pipe.expire(key, self.window_seconds)
        await pipe.execute()


# Default auth endpoint rate limiters
# e.g., max 5 login/registration requests per minute per IP
auth_rate_limiter = RedisRateLimiter(limit=5, window_seconds=60)
