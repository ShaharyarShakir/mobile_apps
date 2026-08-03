import logging
import uuid
from typing import Any

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.rate_limiter import auth_rate_limiter
from app.core.rbac import get_current_user
from app.core.security import verify_password
from app.database import get_db_session
from app.models.user import User
from app.redis_client import redis_client
from app.schemas.auth import (
    ChangePasswordRequest,
    LoginRequest,
    PasswordResetConfirm,
    PasswordResetRequest,
    TokenRefreshRequest,
    TokenResponse,
)
from app.schemas.user import UserCreate, UserResponse
from app.services.auth import jwt_service
from app.services.user import user_service

router = APIRouter()
logger = logging.getLogger(__name__)


@router.post(
    "/register",
    response_model=TokenResponse,
    status_code=status.HTTP_201_CREATED,
    dependencies=[Depends(auth_rate_limiter)],
)
async def register(
    user_in: UserCreate, db: AsyncSession = Depends(get_db_session)
) -> Any:
    """Register a new user, create default workspace, and return tokens."""
    # Create the user and their default workspace
    user = await user_service.create(db, user_in)

    # Generate tokens
    access_token = jwt_service.create_access_token(user.id, user.email)
    refresh_token, jti = jwt_service.create_refresh_token(user.id)
    await jwt_service.store_refresh_token(user.id, jti)

    return TokenResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        user=UserResponse.model_validate(user),
    )


@router.post(
    "/login",
    response_model=TokenResponse,
    dependencies=[Depends(auth_rate_limiter)],
)
async def login(
    login_data: LoginRequest, db: AsyncSession = Depends(get_db_session)
) -> Any:
    """Authenticate user with email and password, returning tokens."""
    user = await user_service.authenticate(db, login_data.email, login_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # Generate tokens
    access_token = jwt_service.create_access_token(user.id, user.email)
    refresh_token, jti = jwt_service.create_refresh_token(user.id)
    await jwt_service.store_refresh_token(user.id, jti)

    return TokenResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        user=UserResponse.model_validate(user),
    )


@router.post("/logout")
async def logout(
    payload: TokenRefreshRequest,
    current_user: User = Depends(get_current_user),
) -> Any:
    """Log out user by revoking the provided refresh token in Redis."""
    try:
        decoded = jwt_service.decode_token(payload.refresh_token)
        jti = decoded.get("jti")
        sub = decoded.get("sub")
        if jti and sub == str(current_user.id):
            await jwt_service.revoke_refresh_token(current_user.id, jti)
    except Exception:
        # Ignore errors to ensure logout is idempotent
        pass

    return {"success": True, "message": "Successfully logged out."}


@router.post("/refresh", response_model=TokenResponse)
async def refresh_token(
    payload: TokenRefreshRequest, db: AsyncSession = Depends(get_db_session)
) -> Any:
    """Verify refresh token, rotate tokens, and return a new active token pair."""
    decoded = jwt_service.decode_token(payload.refresh_token)
    if decoded.get("type") != "refresh":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token type.",
        )

    user_id_str = decoded.get("sub")
    jti = decoded.get("jti")
    if not user_id_str or not jti:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid refresh token format.",
        )

    try:
        user_id = uuid.UUID(user_id_str)
    except ValueError as err:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid user ID in refresh token.",
        ) from err

    # Verify if active in Redis
    is_active = await jwt_service.is_refresh_token_active(user_id, jti)
    if not is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Refresh token is expired or has been revoked.",
        )

    # Fetch user
    user = await user_service.get_by_id(db, user_id)
    if not user or not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User is inactive or no longer exists.",
        )

    # Revoke old JTI (Rotation)
    await jwt_service.revoke_refresh_token(user_id, jti)

    # Generate new pair
    new_access_token = jwt_service.create_access_token(user.id, user.email)
    new_refresh_token, new_jti = jwt_service.create_refresh_token(user.id)
    await jwt_service.store_refresh_token(user.id, new_jti)

    return TokenResponse(
        access_token=new_access_token,
        refresh_token=new_refresh_token,
        user=UserResponse.model_validate(user),
    )


@router.post(
    "/password-reset-request",
    dependencies=[Depends(auth_rate_limiter)],
)
async def password_reset_request(
    payload: PasswordResetRequest, db: AsyncSession = Depends(get_db_session)
) -> Any:
    """Request a password reset.

    Generates a mock email notification containing the reset token.
    """
    user = await user_service.get_by_email(db, payload.email)
    if user:
        reset_token = str(uuid.uuid4())
        key = f"password_reset:{reset_token}"
        # Valid for 15 minutes
        await redis_client.setex(key, 900, str(user.id))

        # Output mock email in console log
        logger.info(
            f"\n--- [MOCK EMAIL SERVICE] ---\n"
            f"To: {user.email}\n"
            f"Subject: Password Reset Request\n"
            f"Reset Token: {reset_token}\n"
            f"Link: http://localhost:8081/reset-password?token={reset_token}\n"
            f"-----------------------------\n"
        )

    # Always return success message to prevent email harvesting
    return {
        "success": True,
        "message": "If the email exists, a password reset link has been generated.",
    }


@router.post(
    "/password-reset-confirm",
    dependencies=[Depends(auth_rate_limiter)],
)
async def password_reset_confirm(
    payload: PasswordResetConfirm, db: AsyncSession = Depends(get_db_session)
) -> Any:
    """Verify reset token and update user's password."""
    key = f"password_reset:{payload.token}"
    user_id_str = await redis_client.get(key)
    if not user_id_str:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired reset token.",
        )

    try:
        user_id = uuid.UUID(user_id_str)
    except ValueError as err:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Malformed token data.",
        ) from err

    user = await user_service.get_by_id(db, user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found.",
        )

    # Hash and save new password
    from app.schemas.user import UserUpdate

    await user_service.update(
        db, db_obj=user, user_in=UserUpdate(password=payload.new_password)
    )

    # Invalidate token
    await redis_client.delete(key)

    return {"success": True, "message": "Password successfully reset."}


@router.post("/change-password")
async def change_password(
    payload: ChangePasswordRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db_session),
) -> Any:
    """Allows an authenticated user to change their password."""
    if not verify_password(payload.old_password, current_user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Incorrect old password.",
        )

    from app.schemas.user import UserUpdate

    await user_service.update(
        db, db_obj=current_user, user_in=UserUpdate(password=payload.new_password)
    )

    return {"success": True, "message": "Password changed successfully."}


@router.get("/me", response_model=UserResponse)
async def get_me(current_user: User = Depends(get_current_user)) -> Any:
    """Returns details of the currently logged-in user."""
    return current_user
