from fastapi import APIRouter

from app.api.v1.health import router as health_router
from app.api.v1.users import router as users_router

api_router = APIRouter()

# Register routes
# Under /api/v1 prefix, health will resolve to /api/v1/health
api_router.include_router(health_router, tags=["health"])
api_router.include_router(users_router, prefix="/users", tags=["users"])
