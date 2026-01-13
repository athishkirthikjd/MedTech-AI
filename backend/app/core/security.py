"""
MedTech AI Backend - Security Module

Handles JWT validation, role-based access control, and Supabase auth integration.
Supports ES256 (asymmetric) JWT verification with JWK.
"""

import json
import logging
from datetime import datetime
from typing import Optional, Dict, Any
from enum import Enum

from fastapi import HTTPException, status
from jose import jwt, JWTError, ExpiredSignatureError
from jose.backends import ECKey
from pydantic import BaseModel

from app.core.config import settings

logger = logging.getLogger(__name__)


class UserRole(str, Enum):
    """User roles for RBAC."""
    PATIENT = "patient"
    DOCTOR = "doctor"
    ADMIN = "admin"


class TokenPayload(BaseModel):
    """Parsed JWT token payload."""
    sub: str  # User ID
    email: Optional[str] = None
    role: UserRole = UserRole.PATIENT
    exp: Optional[datetime] = None
    iat: Optional[datetime] = None
    aud: Optional[str] = None
    
    # Supabase-specific fields
    user_metadata: Dict[str, Any] = {}
    app_metadata: Dict[str, Any] = {}


class SecurityService:
    """
    Security service for authentication and authorization.
    
    Validates Supabase-issued JWTs and enforces role-based access control.
    Supports both HS256 (symmetric) and ES256 (asymmetric) algorithms.
    """
    
    def __init__(self):
        self.jwt_secret = settings.supabase_jwt_secret
        self.algorithm = settings.jwt_algorithm
        self._key = self._load_key()
    
    def _load_key(self):
        """Load the JWT verification key based on algorithm."""
        if self.algorithm == "ES256":
            # Parse JWK from JSON string
            try:
                jwk_data = json.loads(self.jwt_secret)
                return jwk_data
            except json.JSONDecodeError:
                logger.error("Failed to parse JWK from SUPABASE_JWT_SECRET")
                return None
        else:
            # HS256 uses the secret directly
            return self.jwt_secret
    
    def decode_token(self, token: str) -> TokenPayload:
        """
        Decode and validate a Supabase JWT token.
        
        Args:
            token: JWT token string (without 'Bearer ' prefix)
            
        Returns:
            TokenPayload with user information
            
        Raises:
            HTTPException: If token is invalid or expired
        """
        if not self._key:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="JWT verification key not configured",
            )
        
        try:
            # Decode the JWT
            payload = jwt.decode(
                token,
                self._key,
                algorithms=[self.algorithm],
                options={
                    "verify_aud": False,  # Supabase audience handling
                    "verify_exp": True,
                }
            )
            
            # Extract user role from app_metadata or default to patient
            app_metadata = payload.get("app_metadata", {})
            role_str = app_metadata.get("role", "patient")
            
            try:
                role = UserRole(role_str.lower())
            except ValueError:
                role = UserRole.PATIENT
            
            return TokenPayload(
                sub=payload.get("sub", ""),
                email=payload.get("email"),
                role=role,
                exp=datetime.fromtimestamp(payload["exp"]) if "exp" in payload else None,
                iat=datetime.fromtimestamp(payload["iat"]) if "iat" in payload else None,
                aud=payload.get("aud"),
                user_metadata=payload.get("user_metadata", {}),
                app_metadata=app_metadata,
            )
            
        except ExpiredSignatureError:
            logger.warning("Expired JWT token attempted")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Token has expired",
                headers={"WWW-Authenticate": "Bearer"},
            )
        except JWTError as e:
            logger.warning(f"Invalid JWT token: {e}")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Could not validate credentials",
                headers={"WWW-Authenticate": "Bearer"},
            )
    
    def verify_role(
        self,
        token_payload: TokenPayload,
        allowed_roles: list[UserRole]
    ) -> bool:
        """
        Verify user has one of the allowed roles.
        
        Args:
            token_payload: Decoded token payload
            allowed_roles: List of roles that can access the resource
            
        Returns:
            True if user has permission
            
        Raises:
            HTTPException: If user lacks required role
        """
        if token_payload.role not in allowed_roles:
            logger.warning(
                f"Access denied for user {token_payload.sub}. "
                f"Role: {token_payload.role}, Required: {allowed_roles}"
            )
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Insufficient permissions",
            )
        return True


# Module-level security service instance
security_service = SecurityService()


def require_roles(*roles: UserRole):
    """
    Decorator factory for role-based access control.
    
    Usage:
        @require_roles(UserRole.DOCTOR, UserRole.ADMIN)
        async def doctor_only_endpoint(...):
            ...
    """
    def decorator(func):
        func._required_roles = list(roles)
        return func
    return decorator
