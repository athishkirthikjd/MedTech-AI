"""
MedTech AI Backend - Auth API Routes

Authentication and user management endpoints.
"""

from typing import Annotated
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.dependencies import get_db_session, get_current_user
from app.models.user import User
from app.schemas.auth import (
    TokenVerifyRequest,
    TokenVerifyResponse,
    UserCreate,
    UserUpdate,
    UserResponse,
)
from app.services.auth_service import get_auth_service

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/verify", response_model=TokenVerifyResponse)
async def verify_token(
    request: TokenVerifyRequest,
    db: Annotated[AsyncSession, Depends(get_db_session)],
):
    """
    Verify a Supabase JWT token and return user info.
    
    This endpoint is used by the frontend to verify tokens
    and sync user data with the backend database.
    """
    from app.core.security import SecurityService
    
    security = SecurityService()
    payload = security.verify_token(request.token)
    
    if not payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
        )
    
    # Ensure user exists in our database
    auth_service = get_auth_service(db)
    user = await auth_service.ensure_user_exists(
        supabase_uid=payload.sub,
        email=payload.email or "",
        role=payload.role,
    )
    
    return TokenVerifyResponse(
        valid=True,
        user_id=str(user.id),
        email=user.email,
        role=user.role.value,
        expires_at=payload.exp,
    )


@router.get("/me", response_model=UserResponse)
async def get_current_user_info(
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db_session)],
):
    """Get current authenticated user's information."""
    auth_service = get_auth_service(db)
    return await auth_service.get_user_with_profile(current_user)


@router.put("/me", response_model=UserResponse)
async def update_current_user(
    data: UserUpdate,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db_session)],
):
    """Update current user's profile."""
    auth_service = get_auth_service(db)
    updated_user = await auth_service.update_user(current_user, data)
    return await auth_service.get_user_with_profile(updated_user)


@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def register_user(
    data: UserCreate,
    db: Annotated[AsyncSession, Depends(get_db_session)],
):
    """
    Register a new user after Supabase signup.
    
    This endpoint is called after the user signs up via Supabase Auth
    to create the corresponding user record in our database.
    
    Requires the Supabase UID from the signup response.
    """
    auth_service = get_auth_service(db)
    
    # Check if user already exists
    existing = await auth_service.get_user_by_supabase_uid(data.supabase_uid)
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User already registered",
        )
    
    # Check email uniqueness
    existing_email = await auth_service.get_user_by_email(data.email)
    if existing_email:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already in use",
        )
    
    user = await auth_service.create_user(
        supabase_uid=data.supabase_uid,
        email=data.email,
        data=data,
    )
    
    return await auth_service.get_user_with_profile(user)


@router.delete("/me", status_code=status.HTTP_204_NO_CONTENT)
async def deactivate_account(
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db_session)],
):
    """Deactivate current user's account."""
    auth_service = get_auth_service(db)
    await auth_service.deactivate_user(current_user)
