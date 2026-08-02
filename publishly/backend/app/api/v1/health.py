from fastapi import APIRouter, Depends
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import settings
from app.database import get_db_session
from app.redis_client import ping_redis
from app.schemas.health import HealthResponse, ServiceStatus

router = APIRouter()


@router.get(
    "/health",
    response_model=HealthResponse,
    summary="Perform system health checks",
)
async def check_health(
    db: AsyncSession = Depends(get_db_session),
) -> HealthResponse:
    """Async endpoint querying active database connections and Redis status."""
    # Check Database Connection
    db_status = "healthy"
    db_details = None
    try:
        await db.execute(text("SELECT 1"))
    except Exception as e:
        db_status = "unhealthy"
        db_details = str(e)

    # Check Redis Connection
    redis_healthy = await ping_redis()
    redis_status = "healthy" if redis_healthy else "unhealthy"
    redis_details = None if redis_healthy else "Redis connection unavailable"

    # Aggregated system status
    overall_status = (
        "healthy"
        if db_status == "healthy" and redis_status == "healthy"
        else "unhealthy"
    )

    return HealthResponse(
        status=overall_status,
        database=ServiceStatus(status=db_status, details=db_details),
        redis=ServiceStatus(status=redis_status, details=redis_details),
        environment=settings.ENVIRONMENT,
    )
