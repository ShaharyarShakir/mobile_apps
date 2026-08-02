import logging
from collections.abc import AsyncGenerator
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.router import api_router
from app.config import settings
from app.redis_client import redis_client

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(_app: FastAPI) -> AsyncGenerator[None]:
    """Startup and shutdown lifecycle context manager."""
    logger.info("Initializing PostPilot AI services...")
    # Initialize redis connection pool
    try:
        await redis_client.ping()
        logger.info("Successfully connected to Redis.")
    except Exception as e:
        logger.error(f"Redis initialization failed: {e}")

    yield

    logger.info("Closing PostPilot AI services...")
    await redis_client.close()
    logger.info("Redis connection closed.")


app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    lifespan=lifespan,
)

# Configure CORS for local development and production
# Mobile apps connect from local networks, Web app runs on client domains
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Restrict this in production to specific frontend domains
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register main API router under prefix (e.g. /api/v1)
app.include_router(api_router, prefix=settings.API_V1_STR)


@app.get("/")
async def root_redirect() -> dict[str, str]:
    """Basic root welcome message and info."""
    return {
        "message": f"Welcome to the {settings.PROJECT_NAME} API.",
        "documentation": "/docs",
        "health_check": f"{settings.API_V1_STR}/health",
    }


if __name__ == "__main__":
    import uvicorn

    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
