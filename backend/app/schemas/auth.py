"""
MedTech AI Backend - Auth Schemas

Pydantic schemas for authentication and authorization.
"""

from datetime import datetime
from typing import Optional, Dict, Any
from pydantic import BaseModel, Field, EmailStr

from app.core.security import UserRole


class TokenVerifyRequest(BaseModel):
    """Request to verify a Supabase JWT token."""
    token: str = Field(..., description="Supabase access token")


class TokenVerifyResponse(BaseModel):
    """Response from token verification."""
    valid: bool
    user_id: str
    email: Optional[str] = None
    role: UserRole
    expires_at: Optional[datetime] = None
    
    model_config = {"from_attributes": True}


class UserBase(BaseModel):
    """Base user schema."""
    email: EmailStr
    full_name: str = Field(..., min_length=2, max_length=255)
    phone: Optional[str] = Field(None, max_length=20)
    avatar_url: Optional[str] = None


class UserCreate(UserBase):
    """Schema for creating a new user."""
    role: UserRole = UserRole.PATIENT
    supabase_uid: str = Field(..., description="Supabase auth user ID")


class UserUpdate(BaseModel):
    """Schema for updating user information."""
    full_name: Optional[str] = Field(None, min_length=2, max_length=255)
    phone: Optional[str] = Field(None, max_length=20)
    avatar_url: Optional[str] = None


class UserResponse(UserBase):
    """User response schema."""
    id: str
    role: UserRole
    is_active: bool
    is_verified: bool
    created_at: datetime
    
    model_config = {"from_attributes": True}


class AuthStatusResponse(BaseModel):
    """Response for auth status check."""
    authenticated: bool
    user: Optional[UserResponse] = None
    permissions: list[str] = []
