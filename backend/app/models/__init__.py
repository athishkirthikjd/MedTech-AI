"""
MedTech AI Backend - Database Models

All SQLAlchemy models for the application.
"""

from app.models.user import User
from app.models.patient import Patient
from app.models.doctor import Doctor
from app.models.appointment import Appointment, AppointmentStatus, AppointmentType
from app.models.prescription import Prescription, PrescriptionStatus
from app.models.vitals import VitalsRecord, VitalsSource
from app.models.emergency import (
    EmergencyEvent,
    EmergencyType,
    EmergencyStatus,
    EmergencySeverity,
)

__all__ = [
    # Models
    "User",
    "Patient",
    "Doctor",
    "Appointment",
    "Prescription",
    "VitalsRecord",
    "EmergencyEvent",
    # Enums
    "AppointmentStatus",
    "AppointmentType",
    "PrescriptionStatus",
    "VitalsSource",
    "EmergencyType",
    "EmergencyStatus",
    "EmergencySeverity",
]
