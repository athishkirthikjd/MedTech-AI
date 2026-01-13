"""
MedTech AI Backend - Core Module

Core functionality including configuration, security, and dependency injection.
"""

from app.core.config import settings, get_settings
from app.core.security import (
    UserRole,
    TokenPayload,
    SecurityService,
    security_service,
    require_roles,
)
from app.core.dependencies import (
    get_db_session,
    get_current_user,
    get_current_patient,
    get_current_doctor,
    get_current_admin,
    DBSession,
    CurrentUser,
    CurrentPatient,
    CurrentDoctor,
    CurrentAdmin,
)

__all__ = [
    # Config
    "settings",
    "get_settings",
    # Security
    "UserRole",
    "TokenPayload",
    "SecurityService",
    "security_service",
    "require_roles",
    # Dependencies
    "get_db_session",
    "get_current_user",
    "get_current_patient",
    "get_current_doctor",
    "get_current_admin",
    "DBSession",
    "CurrentUser",
    "CurrentPatient",
    "CurrentDoctor",
    "CurrentAdmin",
]
