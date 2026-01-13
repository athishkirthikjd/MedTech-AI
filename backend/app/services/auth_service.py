"""
MedTech AI Backend - Auth Service

Authentication and user management service.
"""

import logging
from typing import Optional
from uuid import UUID
from datetime import datetime

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.user import User
from app.models.patient import Patient
from app.models.doctor import Doctor
from app.schemas.auth import UserCreate, UserUpdate, UserResponse
from app.core.security import UserRole

logger = logging.getLogger(__name__)


class AuthService:
    """
    Authentication and user management service.
    
    Handles:
    - User creation and profile management
    - Supabase UID to internal user mapping
    - Role-based user retrieval
    """
    
    def __init__(self, db: AsyncSession):
        self.db = db
        self.logger = logging.getLogger(f"{__name__}.AuthService")
    
    async def get_user_by_supabase_uid(self, supabase_uid: str) -> Optional[User]:
        """Get user by Supabase UID."""
        result = await self.db.execute(
            select(User).where(User.supabase_uid == supabase_uid)
        )
        return result.scalar_one_or_none()
    
    async def get_user_by_id(self, user_id: UUID) -> Optional[User]:
        """Get user by internal ID."""
        result = await self.db.execute(
            select(User).where(User.id == user_id)
        )
        return result.scalar_one_or_none()
    
    async def get_user_by_email(self, email: str) -> Optional[User]:
        """Get user by email."""
        result = await self.db.execute(
            select(User).where(User.email == email.lower())
        )
        return result.scalar_one_or_none()
    
    async def create_user(
        self,
        supabase_uid: str,
        email: str,
        data: UserCreate,
    ) -> User:
        """
        Create a new user with Supabase UID.
        
        Args:
            supabase_uid: UID from Supabase Auth
            email: User email
            data: User creation data
            
        Returns:
            Created User instance
        """
        user = User(
            supabase_uid=supabase_uid,
            email=email.lower(),
            full_name=data.full_name,
            phone=data.phone,
            role=UserRole(data.role) if data.role else UserRole.PATIENT,
            avatar_url=data.avatar_url,
        )
        
        self.db.add(user)
        await self.db.commit()
        await self.db.refresh(user)
        
        self.logger.info(f"Created user: {user.id} with role {user.role}")
        
        return user
    
    async def update_user(
        self,
        user: User,
        data: UserUpdate,
    ) -> User:
        """
        Update user profile.
        
        Args:
            user: User to update
            data: Update data
            
        Returns:
            Updated User instance
        """
        update_data = data.model_dump(exclude_unset=True)
        
        for field, value in update_data.items():
            setattr(user, field, value)
        
        await self.db.commit()
        await self.db.refresh(user)
        
        self.logger.info(f"Updated user: {user.id}")
        
        return user
    
    async def ensure_user_exists(
        self,
        supabase_uid: str,
        email: str,
        role: Optional[str] = None,
    ) -> User:
        """
        Ensure user exists in database, create if not.
        
        This is used during JWT verification to sync Supabase users.
        
        Args:
            supabase_uid: UID from Supabase Auth
            email: User email
            role: Optional role to assign
            
        Returns:
            Existing or newly created User
        """
        user = await self.get_user_by_supabase_uid(supabase_uid)
        
        if user:
            return user
        
        # Create minimal user record
        user = User(
            supabase_uid=supabase_uid,
            email=email.lower(),
            role=UserRole(role) if role else UserRole.PATIENT,
        )
        
        self.db.add(user)
        await self.db.commit()
        await self.db.refresh(user)
        
        self.logger.info(f"Auto-created user from Supabase: {user.id}")
        
        return user
    
    async def deactivate_user(self, user: User) -> User:
        """Deactivate a user account."""
        user.is_active = False
        await self.db.commit()
        await self.db.refresh(user)
        
        self.logger.info(f"Deactivated user: {user.id}")
        
        return user
    
    async def get_user_with_profile(self, user: User) -> UserResponse:
        """Get user with role-specific profile."""
        response = UserResponse(
            id=user.id,
            email=user.email,
            full_name=user.full_name,
            phone=user.phone,
            role=user.role.value,
            avatar_url=user.avatar_url,
            is_active=user.is_active,
            created_at=user.created_at,
        )
        
        # Include profile ID if exists
        if user.role == UserRole.PATIENT and user.patient_profile:
            response.patient_id = user.patient_profile.id
        elif user.role == UserRole.DOCTOR and user.doctor_profile:
            response.doctor_id = user.doctor_profile.id
        
        return response


def get_auth_service(db: AsyncSession) -> AuthService:
    """Factory function for AuthService."""
    return AuthService(db)
