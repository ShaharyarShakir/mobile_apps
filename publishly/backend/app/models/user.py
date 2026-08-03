from sqlalchemy import String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base


class User(Base):
    __tablename__ = "users"

    email: Mapped[str] = mapped_column(
        String(255),
        unique=True,
        index=True,
        nullable=False,
    )

    hashed_password: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
    )

    full_name: Mapped[str | None] = mapped_column(
        String(255),
        nullable=True,
    )

    is_active: Mapped[bool] = mapped_column(
        default=True,
        nullable=False,
    )

    is_superuser: Mapped[bool] = mapped_column(
        default=False,
        nullable=False,
    )

    memberships: Mapped[list["WorkspaceMember"]] = relationship(  # type: ignore # noqa: F821
        "WorkspaceMember",
        back_populates="user",
        cascade="all, delete-orphan",
    )
