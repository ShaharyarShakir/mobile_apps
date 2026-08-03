import uuid
from typing import Annotated

from fastapi import Depends, Header, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db_session
from app.models.user import User
from app.models.workspace_member import WorkspaceMember
from app.services.auth import jwt_service
from app.services.user import user_service

# OAuth2 Scheme definition
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login", auto_error=False)

# Role level mappings
ROLE_LEVELS = {
    "Owner": 30,
    "Admin": 20,
    "Editor": 10,
}


async def get_current_user(
    token: Annotated[str | None, Depends(oauth2_scheme)] = None,
    db: AsyncSession = Depends(get_db_session),
) -> User:
    """Dependency to retrieve and validate the current user from JWT."""
    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    payload = jwt_service.decode_token(token)
    user_id_str = payload.get("sub")
    if not user_id_str or payload.get("type") != "access":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    try:
        user_id = uuid.UUID(user_id_str)
    except ValueError as err:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid user ID format.",
            headers={"WWW-Authenticate": "Bearer"},
        ) from err

    user = await user_service.get_by_id(db, user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User account is deactivated.",
        )

    return user


class WorkspaceRoleChecker:
    """Enforces role-based permissions within a specific workspace context."""

    def __init__(self, min_role: str):
        if min_role not in ROLE_LEVELS:
            raise ValueError(f"Invalid role constraint: {min_role}")
        self.min_role = min_role

    async def __call__(
        self,
        x_workspace_id: Annotated[uuid.UUID, Header(alias="X-Workspace-ID")],
        current_user: User = Depends(get_current_user),
        db: AsyncSession = Depends(get_db_session),
    ) -> WorkspaceMember:
        """Verifies role permissions within a specific workspace context.

        Bypasses checks if the user is a superuser.
        """
        # Superuser bypass
        if current_user.is_superuser:
            # Return a mock member record if superuser
            return WorkspaceMember(
                workspace_id=x_workspace_id,
                user_id=current_user.id,
                role="Owner",
            )

        # Query membership
        query = select(WorkspaceMember).where(
            WorkspaceMember.workspace_id == x_workspace_id,
            WorkspaceMember.user_id == current_user.id,
        )
        result = await db.execute(query)
        member = result.scalars().first()

        if not member:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You are not a member of this workspace.",
            )

        user_role_level = ROLE_LEVELS.get(member.role, 0)
        required_role_level = ROLE_LEVELS[self.min_role]

        if user_role_level < required_role_level:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=(
                    f"Insufficient permissions. Requires minimum role: {self.min_role}."
                ),
            )

        return member


# Helper role constraints
require_owner = WorkspaceRoleChecker(min_role="Owner")
require_admin = WorkspaceRoleChecker(min_role="Admin")
require_editor = WorkspaceRoleChecker(min_role="Editor")
