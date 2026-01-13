"""
MedTech AI Backend - Dependency Injection

FastAPI dependencies for authentication, database sessions, and services.
"""

import logging
from typing import Annotated, AsyncGenerator

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.core.security import (
    SecurityService,
    TokenPayload,
    UserRole,
    security_service,
)
from app.db.session import async_session_factory

logger = logging.getLogger(__name__)

# HTTP Bearer token scheme
bearer_scheme = HTTPBearer(
    scheme_name="Supabase JWT",
    description="Enter your Supabase access token",
    auto_error=True,
)


async def get_db_session() -> AsyncGenerator[AsyncSession, None]:
    """
    Dependency that provides a database session.
    
    Yields:
        AsyncSession: SQLAlchemy async session
        
    Note:
        Session is automatically closed after the request.
    """
    async with async_session_factory() as session:
        try:
            yield session
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()


async def get_current_user(
    credentials: Annotated[HTTPAuthorizationCredentials, Depends(bearer_scheme)]
) -> TokenPayload:
    """
    Dependency that extracts and validates the current user from JWT.
    
    Args:
        credentials: HTTP Authorization header with Bearer token
        
    Returns:
        TokenPayload: Decoded user information
        
    Raises:
        HTTPException: If token is missing or invalid
    """
    if not credentials or not credentials.credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing authentication token",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    return security_service.decode_token(credentials.credentials)


async def get_current_patient(
    current_user: Annotated[TokenPayload, Depends(get_current_user)]
) -> TokenPayload:
    """
    Dependency that ensures the current user is a patient.
    
    Args:
        current_user: Current authenticated user
        
    Returns:
        TokenPayload if user is a patient
        
    Raises:
        HTTPException: If user is not a patient
    """
    security_service.verify_role(current_user, [UserRole.PATIENT])
    return current_user


async def get_current_doctor(
    current_user: Annotated[TokenPayload, Depends(get_current_user)]
) -> TokenPayload:
    """
    Dependency that ensures the current user is a doctor.
    """
    security_service.verify_role(current_user, [UserRole.DOCTOR])
    return current_user


async def get_current_admin(
    current_user: Annotated[TokenPayload, Depends(get_current_user)]
) -> TokenPayload:
    """
    Dependency that ensures the current user is an admin.
    """
    security_service.verify_role(current_user, [UserRole.ADMIN])
    return current_user


async def get_current_medical_staff(
    current_user: Annotated[TokenPayload, Depends(get_current_user)]
) -> TokenPayload:
    """
    Dependency that ensures the current user is a doctor or admin.
    """
    security_service.verify_role(current_user, [UserRole.DOCTOR, UserRole.ADMIN])
    return current_user


async def get_current_user_optional(
    credentials: Annotated[HTTPAuthorizationCredentials | None, Depends(HTTPBearer(auto_error=False))]
) -> TokenPayload | None:
    """
    Optional authentication dependency.
    
    Returns None if no token provided, or TokenPayload if valid token.
    Useful for endpoints that behave differently for authenticated users.
    """
    if not credentials or not credentials.credentials:
        return None
    
    try:
        return security_service.decode_token(credentials.credentials)
    except HTTPException:
        return None


# Type aliases for cleaner dependency injection
DBSession = Annotated[AsyncSession, Depends(get_db_session)]
CurrentUser = Annotated[TokenPayload, Depends(get_current_user)]
CurrentPatient = Annotated[TokenPayload, Depends(get_current_patient)]
CurrentDoctor = Annotated[TokenPayload, Depends(get_current_doctor)]
CurrentAdmin = Annotated[TokenPayload, Depends(get_current_admin)]
CurrentMedicalStaff = Annotated[TokenPayload, Depends(get_current_medical_staff)]
OptionalUser = Annotated[TokenPayload | None, Depends(get_current_user_optional)]
