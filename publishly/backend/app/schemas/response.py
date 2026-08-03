from typing import Generic, TypeVar

from pydantic import BaseModel

T = TypeVar("T")


class StandardResponse(BaseModel, Generic[T]):
    """Unified API response envelope schema."""

    success: bool
    message: str | None = None
    data: T | None = None
