"""
MedTech AI Backend - Core Module

Core functionality including configuration, security, and dependency injection.

Note: Import components directly from submodules to avoid circular imports:
    from app.core.config import settings
    from app.core.security import SecurityService
    from app.core.dependencies import get_db_session
"""

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
]
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
