"""
MedTech AI Backend - Pydantic Schemas

All request/response schemas for the API.
"""

from app.schemas.auth import (
    TokenVerifyRequest,
    TokenVerifyResponse,
    UserBase,
    UserCreate,
    UserUpdate,
    UserResponse,
    AuthStatusResponse,
)
from app.schemas.patient import (
    PatientBase,
    PatientCreate,
    PatientUpdate,
    PatientResponse,
    PatientSummaryResponse,
    EmergencyContactSchema,
    InsuranceInfoSchema,
)
from app.schemas.doctor import (
    DoctorBase,
    DoctorCreate,
    DoctorUpdate,
    DoctorResponse,
    DoctorListResponse,
    DoctorSearchQuery,
    WeeklyScheduleSchema,
)
from app.schemas.appointment import (
    AppointmentBase,
    AppointmentCreate,
    AppointmentUpdate,
    AppointmentDoctorUpdate,
    AppointmentCancelRequest,
    AppointmentResponse,
    AppointmentListResponse,
    AppointmentQueryParams,
    AvailableSlotsRequest,
    AvailableSlotsResponse,
)
from app.schemas.vitals import (
    VitalsBase,
    VitalsCreate,
    VitalsBatchCreate,
    VitalsUpdate,
    VitalsResponse,
    VitalsHistoryQuery,
    VitalsHistoryResponse,
    VitalsSummary,
    VitalsAlert,
)
from app.schemas.ai import (
    RiskLevel,
    SuggestedAction,
    SymptomCheckRequest,
    SymptomCheckResponse,
    VoiceChatRequest,
    VoiceChatResponse,
    ConversationMessage,
    ConversationContext,
    AIHealthTip,
)

__all__ = [
    # Auth
    "TokenVerifyRequest",
    "TokenVerifyResponse",
    "UserBase",
    "UserCreate",
    "UserUpdate",
    "UserResponse",
    "AuthStatusResponse",
    # Patient
    "PatientBase",
    "PatientCreate",
    "PatientUpdate",
    "PatientResponse",
    "PatientSummaryResponse",
    "EmergencyContactSchema",
    "InsuranceInfoSchema",
    # Doctor
    "DoctorBase",
    "DoctorCreate",
    "DoctorUpdate",
    "DoctorResponse",
    "DoctorListResponse",
    "DoctorSearchQuery",
    "WeeklyScheduleSchema",
    # Appointment
    "AppointmentBase",
    "AppointmentCreate",
    "AppointmentUpdate",
    "AppointmentDoctorUpdate",
    "AppointmentCancelRequest",
    "AppointmentResponse",
    "AppointmentListResponse",
    "AppointmentQueryParams",
    "AvailableSlotsRequest",
    "AvailableSlotsResponse",
    # Vitals
    "VitalsBase",
    "VitalsCreate",
    "VitalsBatchCreate",
    "VitalsUpdate",
    "VitalsResponse",
    "VitalsHistoryQuery",
    "VitalsHistoryResponse",
    "VitalsSummary",
    "VitalsAlert",
    # AI
    "RiskLevel",
    "SuggestedAction",
    "SymptomCheckRequest",
    "SymptomCheckResponse",
    "VoiceChatRequest",
    "VoiceChatResponse",
    "ConversationMessage",
    "ConversationContext",
    "AIHealthTip",
]
