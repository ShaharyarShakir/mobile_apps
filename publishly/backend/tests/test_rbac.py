import uuid

import pytest
from fastapi import HTTPException, status

from app.core.rbac import (
    WorkspaceRoleChecker,
)
from app.models.user import User
from app.models.workspace_member import WorkspaceMember


@pytest.mark.asyncio
async def test_role_levels() -> None:
    """Validate Role levels and checkers are correctly configured."""
    assert WorkspaceRoleChecker("Owner").min_role == "Owner"
    assert WorkspaceRoleChecker("Admin").min_role == "Admin"
    assert WorkspaceRoleChecker("Editor").min_role == "Editor"

    with pytest.raises(ValueError, match="Invalid role constraint"):
        WorkspaceRoleChecker("Viewer")


@pytest.mark.asyncio
async def test_role_checks_in_workspace(db_session) -> None:
    """Validate that checker allows matching or higher roles and rejects lower ones."""
    # 1. Setup User, Workspace, and Member role
    user = User(
        email="editor@postpilot.ai",
        hashed_password="hashed_password",
        full_name="Editor Pilot",
        is_active=True,
    )
    db_session.add(user)
    await db_session.flush()

    workspace_id = uuid.uuid4()
    member = WorkspaceMember(
        workspace_id=workspace_id,
        user_id=user.id,
        role="Editor",
    )
    db_session.add(member)
    await db_session.commit()

    # 2. Test require_editor (min level Editor) - should PASS for Editor
    editor_checker = WorkspaceRoleChecker(min_role="Editor")
    resolved_member = await editor_checker(
        x_workspace_id=workspace_id, current_user=user, db=db_session
    )
    assert resolved_member.user_id == user.id
    assert resolved_member.role == "Editor"

    # 3. Test require_admin (min level Admin) - should FAIL for Editor (status 403)
    admin_checker = WorkspaceRoleChecker(min_role="Admin")
    with pytest.raises(HTTPException) as exc_info:
        await admin_checker(
            x_workspace_id=workspace_id, current_user=user, db=db_session
        )
    assert exc_info.value.status_code == status.HTTP_403_FORBIDDEN
    assert "Insufficient permissions" in exc_info.value.detail

    # 4. Test require_owner (min level Owner) - should FAIL for Editor (status 403)
    owner_checker = WorkspaceRoleChecker(min_role="Owner")
    with pytest.raises(HTTPException) as exc_info:
        await owner_checker(
            x_workspace_id=workspace_id, current_user=user, db=db_session
        )
    assert exc_info.value.status_code == status.HTTP_403_FORBIDDEN


@pytest.mark.asyncio
async def test_superuser_bypass(db_session) -> None:
    """Validate that superusers bypass workspace role constraints."""
    superuser = User(
        email="superuser@postpilot.ai",
        hashed_password="hashed_password",
        full_name="Super User",
        is_active=True,
        is_superuser=True,
    )
    db_session.add(superuser)
    await db_session.commit()

    # Check require_owner for a workspace the superuser doesn't belong to
    workspace_id = uuid.uuid4()
    owner_checker = WorkspaceRoleChecker(min_role="Owner")

    resolved_member = await owner_checker(
        x_workspace_id=workspace_id, current_user=superuser, db=db_session
    )
    assert resolved_member.user_id == superuser.id
    assert resolved_member.role == "Owner"
