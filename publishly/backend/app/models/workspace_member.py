import uuid

from sqlalchemy import ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base


class WorkspaceMember(Base):
    __tablename__ = "workspace_members"

    workspace_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("workspaces.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    user_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    role: Mapped[str] = mapped_column(
        String(50),
        nullable=False,  # e.g., "Owner", "Admin", "Editor"
    )

    workspace: Mapped["Workspace"] = relationship(  # type: ignore # noqa: F821
        "Workspace",
        back_populates="members",
    )

    user: Mapped["User"] = relationship(  # type: ignore # noqa: F821
        "User",
        back_populates="memberships",
    )
