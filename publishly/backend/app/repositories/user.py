from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.user import User
from app.repositories.base import BaseRepository


class UserRepository(BaseRepository[User]):
    """Repository helper for user operations."""

    async def get_by_email(self, db: AsyncSession, email: str) -> User | None:
        """Fetch a single user by email address."""
        result = await db.execute(select(self.model).where(self.model.email == email))
        return result.scalars().first()


user_repository = UserRepository(User)
