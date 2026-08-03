from pydantic import BaseModel, EmailStr, Field

from app.schemas.user import UserResponse


class LoginRequest(BaseModel):
    """Schema for user login credentials."""

    email: EmailStr
    password: str = Field(min_length=8, max_length=128)


class TokenResponse(BaseModel):
    """Schema for successful authentication responses containing JWT tokens."""

    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    user: UserResponse


class TokenRefreshRequest(BaseModel):
    """Schema for token refresh request."""

    refresh_token: str


class PasswordResetRequest(BaseModel):
    """Schema to request a password reset email."""

    email: EmailStr


class PasswordResetConfirm(BaseModel):
    """Schema to confirm password reset using the token."""

    token: str
    new_password: str = Field(min_length=8, max_length=128)


class ChangePasswordRequest(BaseModel):
    """Schema for authenticated user changing password."""

    old_password: str
    new_password: str = Field(min_length=8, max_length=128)
