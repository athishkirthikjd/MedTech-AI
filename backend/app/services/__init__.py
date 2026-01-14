"""
MedTech AI Backend - Services Module

Business logic services.
"""

# Note: Services are imported at runtime to avoid circular imports
# Import individually as needed:
# from app.services.auth_service import AuthService, get_auth_service
# from app.services.appointment_service import AppointmentService, get_appointment_service
# from app.services.vitals_service import VitalsService, get_vitals_service
# from app.services.emergency_service import EmergencyService, get_emergency_service

__all__ = [
    # Auth
    "AuthService",
    "get_auth_service",
    # Appointments
    "AppointmentService",
    "get_appointment_service",
    # Vitals
    "VitalsService",
    "get_vitals_service",
    # Emergency
    "EmergencyService",
    "get_emergency_service",
]
