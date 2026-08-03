from sqlalchemy import String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base


class Workspace(Base):
    __tablename__ = "workspaces"

    name: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
    )

    members: Mapped[list["WorkspaceMember"]] = relationship(  # type: ignore # noqa: F821
        "WorkspaceMember",
        back_populates="workspace",
        cascade="all, delete-orphan",
    )
