import uuid
from typing import Any

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db_session
from app.schemas.user import UserCreate, UserResponse, UserUpdate
from app.services.user import user_service

router = APIRouter()


@router.post("/", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def create_user(
    user_in: UserCreate, db: AsyncSession = Depends(get_db_session)
) -> Any:
    """Create a new user account."""
    return await user_service.create(db, user_in)


@router.get("/{user_id}", response_model=UserResponse)
async def get_user_by_id(
    user_id: uuid.UUID, db: AsyncSession = Depends(get_db_session)
) -> Any:
    """Retrieve user details by ID."""
    user = await user_service.get_by_id(db, user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )
    return user


@router.get("/email/{email}", response_model=UserResponse)
async def get_user_by_email(
    email: str, db: AsyncSession = Depends(get_db_session)
) -> Any:
    """Retrieve user details by email address."""
    user = await user_service.get_by_email(db, email)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )
    return user


@router.put("/{user_id}", response_model=UserResponse)
async def update_user(
    user_id: uuid.UUID, user_in: UserUpdate, db: AsyncSession = Depends(get_db_session)
) -> Any:
    """Update user information."""
    user = await user_service.get_by_id(db, user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )
    return await user_service.update(db, db_obj=user, user_in=user_in)
