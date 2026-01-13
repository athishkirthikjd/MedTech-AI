"""
MedTech AI Backend - Appointments API Routes

Appointment scheduling and management endpoints.
"""

from typing import Annotated, List, Optional
from uuid import UUID
from datetime import date

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.dependencies import (
    get_db_session,
    get_current_user,
    get_current_patient,
    get_current_doctor,
)
from app.models.user import User
from app.models.patient import Patient
from app.models.doctor import Doctor
from app.models.appointment import AppointmentStatus
from app.schemas.appointment import (
    AppointmentCreate,
    AppointmentUpdate,
    AppointmentResponse,
    AvailableSlotsRequest,
    AvailableSlotsResponse,
)
from app.services.appointment_service import get_appointment_service

router = APIRouter(prefix="/appointments", tags=["Appointments"])


@router.post("", response_model=AppointmentResponse, status_code=status.HTTP_201_CREATED)
async def create_appointment(
    data: AppointmentCreate,
    patient: Annotated[Patient, Depends(get_current_patient)],
    db: Annotated[AsyncSession, Depends(get_db_session)],
):
    """
    Create a new appointment.
    
    Patients can book appointments with doctors.
    """
    service = get_appointment_service(db)
    
    try:
        appointment = await service.create_appointment(data, patient.id)
        return AppointmentResponse.model_validate(appointment)
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )


@router.get("", response_model=List[AppointmentResponse])
async def list_appointments(
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db_session)],
    status_filter: Optional[str] = Query(None, alias="status"),
    from_date: Optional[date] = None,
    to_date: Optional[date] = None,
):
    """
    List appointments for the current user.
    
    Returns patient's appointments if user is a patient,
    or doctor's appointments if user is a doctor.
    """
    service = get_appointment_service(db)
    
    status_enum = None
    if status_filter and status_filter in [s.value for s in AppointmentStatus]:
        status_enum = AppointmentStatus(status_filter)
    
    if current_user.patient_profile:
        appointments = await service.get_patient_appointments(
            current_user.patient_profile.id,
            status=status_enum,
            from_date=from_date,
            to_date=to_date,
        )
    elif current_user.doctor_profile:
        appointments = await service.get_doctor_appointments(
            current_user.doctor_profile.id,
            status=status_enum,
            from_date=from_date,
            to_date=to_date,
        )
    else:
        appointments = []
    
    return [AppointmentResponse.model_validate(apt) for apt in appointments]


@router.get("/upcoming", response_model=List[AppointmentResponse])
async def list_upcoming_appointments(
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db_session)],
    limit: int = Query(5, ge=1, le=20),
):
    """Get upcoming appointments for the current user."""
    from datetime import date as date_type
    
    service = get_appointment_service(db)
    
    if current_user.patient_profile:
        appointments = await service.get_patient_appointments(
            current_user.patient_profile.id,
            from_date=date_type.today(),
        )
    elif current_user.doctor_profile:
        appointments = await service.get_doctor_appointments(
            current_user.doctor_profile.id,
            from_date=date_type.today(),
        )
    else:
        appointments = []
    
    # Filter to only scheduled/confirmed and limit
    upcoming = [
        apt for apt in appointments
        if apt.status in [AppointmentStatus.SCHEDULED, AppointmentStatus.CONFIRMED]
    ][:limit]
    
    return [AppointmentResponse.model_validate(apt) for apt in upcoming]


@router.get("/{appointment_id}", response_model=AppointmentResponse)
async def get_appointment(
    appointment_id: UUID,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db_session)],
):
    """Get a specific appointment by ID."""
    service = get_appointment_service(db)
    appointment = await service.get_appointment_by_id(appointment_id)
    
    if not appointment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Appointment not found",
        )
    
    # Check authorization
    is_patient = current_user.patient_profile and appointment.patient_id == current_user.patient_profile.id
    is_doctor = current_user.doctor_profile and appointment.doctor_id == current_user.doctor_profile.id
    is_admin = current_user.role.value == "admin"
    
    if not (is_patient or is_doctor or is_admin):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to view this appointment",
        )
    
    return AppointmentResponse.model_validate(appointment)


@router.put("/{appointment_id}", response_model=AppointmentResponse)
async def update_appointment(
    appointment_id: UUID,
    data: AppointmentUpdate,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db_session)],
):
    """Update an appointment."""
    service = get_appointment_service(db)
    appointment = await service.get_appointment_by_id(appointment_id)
    
    if not appointment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Appointment not found",
        )
    
    # Check authorization
    is_patient = current_user.patient_profile and appointment.patient_id == current_user.patient_profile.id
    is_doctor = current_user.doctor_profile and appointment.doctor_id == current_user.doctor_profile.id
    is_admin = current_user.role.value == "admin"
    
    if not (is_patient or is_doctor or is_admin):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to update this appointment",
        )
    
    try:
        updated = await service.update_appointment(appointment, data)
        return AppointmentResponse.model_validate(updated)
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )


@router.post("/{appointment_id}/cancel", response_model=AppointmentResponse)
async def cancel_appointment(
    appointment_id: UUID,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db_session)],
    reason: Optional[str] = None,
):
    """Cancel an appointment."""
    service = get_appointment_service(db)
    appointment = await service.get_appointment_by_id(appointment_id)
    
    if not appointment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Appointment not found",
        )
    
    # Check authorization
    is_patient = current_user.patient_profile and appointment.patient_id == current_user.patient_profile.id
    is_doctor = current_user.doctor_profile and appointment.doctor_id == current_user.doctor_profile.id
    is_admin = current_user.role.value == "admin"
    
    if not (is_patient or is_doctor or is_admin):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to cancel this appointment",
        )
    
    cancelled = await service.cancel_appointment(
        appointment,
        cancelled_by=str(current_user.id),
        reason=reason,
    )
    
    return AppointmentResponse.model_validate(cancelled)


@router.post("/available-slots", response_model=AvailableSlotsResponse)
async def get_available_slots(
    request: AvailableSlotsRequest,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db_session)],
):
    """
    Get available appointment slots for a doctor on a specific date.
    
    Returns list of time slots with availability status.
    """
    service = get_appointment_service(db)
    slots = await service.get_available_slots(request)
    
    return AvailableSlotsResponse(
        doctor_id=request.doctor_id,
        date=request.date,
        slots=slots,
    )
