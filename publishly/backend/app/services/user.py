import uuid

from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.security import get_password_hash, verify_password
from app.models.user import User
from app.repositories.user import user_repository
from app.schemas.user import UserCreate, UserUpdate


class UserService:
    """Service layer coordinating business logic for Users."""

    async def get_by_id(self, db: AsyncSession, user_id: uuid.UUID) -> User | None:
        """Retrieve a user by their unique ID."""
        return await user_repository.get(db, user_id)

    async def get_by_email(self, db: AsyncSession, email: str) -> User | None:
        """Retrieve a user by their email address."""
        return await user_repository.get_by_email(db, email)

    async def create(self, db: AsyncSession, user_in: UserCreate) -> User:
        """Register a new user in the database, hashing their password."""
        existing_user = await user_repository.get_by_email(db, user_in.email)
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="A user with this email address already exists.",
            )

        hashed_password = get_password_hash(user_in.password)
        # Convert schema to dict, overwrite password with hashed_password
        obj_data = user_in.model_dump(exclude={"password"})
        obj_data["hashed_password"] = hashed_password

        return await user_repository.create(db, obj_in=obj_data)

    async def update(self, db: AsyncSession, db_obj: User, user_in: UserUpdate) -> User:
        """Update user settings, hashing the password if it is changed."""
        update_data = user_in.model_dump(exclude_unset=True)

        if "password" in update_data and update_data["password"]:
            update_data["hashed_password"] = get_password_hash(update_data["password"])
            del update_data["password"]

        return await user_repository.update(db, db_obj=db_obj, obj_in=update_data)

    async def authenticate(
        self, db: AsyncSession, email: str, password: str
    ) -> User | None:
        """Authenticate a user by verifying their email and password."""
        user = await user_repository.get_by_email(db, email)
        if not user:
            return None
        if not verify_password(password, user.hashed_password):
            return None
        return user


user_service = UserService()
