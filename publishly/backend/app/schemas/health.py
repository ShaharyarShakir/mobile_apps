from pydantic import BaseModel


class ServiceStatus(BaseModel):
    status: str
    details: str | None = None


class HealthResponse(BaseModel):
    status: str
    database: ServiceStatus
    redis: ServiceStatus
    environment: str
