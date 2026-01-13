"""
MedTech AI Backend - Emergency API Routes

Emergency/SOS event management endpoints.
"""

from typing import Annotated, List, Optional
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.dependencies import get_db_session, get_current_user, get_current_patient
from app.models.user import User
from app.models.patient import Patient
from app.services.emergency_service import get_emergency_service

router = APIRouter(prefix="/emergency", tags=["Emergency/SOS"])


class EmergencyTriggerRequest(BaseModel):
    """Request to trigger an emergency."""
    emergency_type: str = Field(..., description="Type: medical, cardiac, breathing, fall, accident, other")
    description: Optional[str] = Field(None, max_length=1000)
    latitude: Optional[float] = Field(None, ge=-90, le=90)
    longitude: Optional[float] = Field(None, ge=-180, le=180)
    address: Optional[str] = Field(None, max_length=500)


class EmergencyResponse(BaseModel):
    """Emergency event response."""
    id: UUID
    patient_id: UUID
    emergency_type: str
    description: Optional[str]
    latitude: Optional[float]
    longitude: Optional[float]
    address: Optional[str]
    severity: str
    status: str
    ai_analysis: Optional[dict]
    triggered_at: str
    acknowledged_at: Optional[str]
    resolved_at: Optional[str]
    
    class Config:
        from_attributes = True


class EmergencyStatusUpdate(BaseModel):
    """Request to update emergency status."""
    status: str = Field(..., description="Status: acknowledged, dispatched, resolved, cancelled")
    notes: Optional[str] = Field(None, max_length=1000)


@router.post("/trigger", response_model=EmergencyResponse, status_code=status.HTTP_201_CREATED)
async def trigger_emergency(
    request: EmergencyTriggerRequest,
    patient: Annotated[Patient, Depends(get_current_patient)],
    db: Annotated[AsyncSession, Depends(get_db_session)],
):
    """
    Trigger an emergency SOS event.
    
    This endpoint:
    1. Creates an emergency record
    2. Uses AI to assess severity
    3. Returns the event with severity assessment
    
    Critical emergencies should be handled immediately by the system.
    """
    service = get_emergency_service(db)
    
    event = await service.trigger_emergency(
        patient_id=patient.id,
        emergency_type=request.emergency_type,
        description=request.description,
        latitude=request.latitude,
        longitude=request.longitude,
        address=request.address,
    )
    
    return EmergencyResponse(
        id=event.id,
        patient_id=event.patient_id,
        emergency_type=event.emergency_type.value,
        description=event.description,
        latitude=event.latitude,
        longitude=event.longitude,
        address=event.address,
        severity=event.severity.value,
        status=event.status.value,
        ai_analysis=event.ai_analysis,
        triggered_at=event.triggered_at.isoformat() if event.triggered_at else None,
        acknowledged_at=event.acknowledged_at.isoformat() if event.acknowledged_at else None,
        resolved_at=event.resolved_at.isoformat() if event.resolved_at else None,
    )


@router.get("/active", response_model=List[EmergencyResponse])
async def get_active_emergencies(
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db_session)],
):
    """
    Get all active emergency events.
    
    For admin/dispatch personnel to monitor active emergencies.
    """
    if current_user.role.value not in ["admin", "doctor"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin or doctor access required",
        )
    
    service = get_emergency_service(db)
    events = await service.get_active_events()
    
    return [
        EmergencyResponse(
            id=e.id,
            patient_id=e.patient_id,
            emergency_type=e.emergency_type.value,
            description=e.description,
            latitude=e.latitude,
            longitude=e.longitude,
            address=e.address,
            severity=e.severity.value,
            status=e.status.value,
            ai_analysis=e.ai_analysis,
            triggered_at=e.triggered_at.isoformat() if e.triggered_at else None,
            acknowledged_at=e.acknowledged_at.isoformat() if e.acknowledged_at else None,
            resolved_at=e.resolved_at.isoformat() if e.resolved_at else None,
        )
        for e in events
    ]


@router.get("/my-events", response_model=List[EmergencyResponse])
async def get_my_emergencies(
    patient: Annotated[Patient, Depends(get_current_patient)],
    db: Annotated[AsyncSession, Depends(get_db_session)],
    include_resolved: bool = False,
):
    """Get emergency events for the current patient."""
    service = get_emergency_service(db)
    events = await service.get_patient_events(patient.id, include_resolved)
    
    return [
        EmergencyResponse(
            id=e.id,
            patient_id=e.patient_id,
            emergency_type=e.emergency_type.value,
            description=e.description,
            latitude=e.latitude,
            longitude=e.longitude,
            address=e.address,
            severity=e.severity.value,
            status=e.status.value,
            ai_analysis=e.ai_analysis,
            triggered_at=e.triggered_at.isoformat() if e.triggered_at else None,
            acknowledged_at=e.acknowledged_at.isoformat() if e.acknowledged_at else None,
            resolved_at=e.resolved_at.isoformat() if e.resolved_at else None,
        )
        for e in events
    ]


@router.get("/{event_id}", response_model=EmergencyResponse)
async def get_emergency_event(
    event_id: UUID,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db_session)],
):
    """Get a specific emergency event by ID."""
    service = get_emergency_service(db)
    event = await service.get_event_by_id(event_id)
    
    if not event:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Emergency event not found",
        )
    
    # Check authorization
    is_patient_owner = current_user.patient_profile and event.patient_id == current_user.patient_profile.id
    is_admin_or_doctor = current_user.role.value in ["admin", "doctor"]
    
    if not (is_patient_owner or is_admin_or_doctor):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to view this event",
        )
    
    return EmergencyResponse(
        id=event.id,
        patient_id=event.patient_id,
        emergency_type=event.emergency_type.value,
        description=event.description,
        latitude=event.latitude,
        longitude=event.longitude,
        address=event.address,
        severity=event.severity.value,
        status=event.status.value,
        ai_analysis=event.ai_analysis,
        triggered_at=event.triggered_at.isoformat() if event.triggered_at else None,
        acknowledged_at=event.acknowledged_at.isoformat() if event.acknowledged_at else None,
        resolved_at=event.resolved_at.isoformat() if event.resolved_at else None,
    )


@router.put("/{event_id}/status", response_model=EmergencyResponse)
async def update_emergency_status(
    event_id: UUID,
    update: EmergencyStatusUpdate,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db_session)],
):
    """
    Update emergency event status.
    
    For admin/doctor to acknowledge, dispatch, resolve, or cancel events.
    Patients can only cancel their own events.
    """
    service = get_emergency_service(db)
    event = await service.get_event_by_id(event_id)
    
    if not event:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Emergency event not found",
        )
    
    # Check authorization
    is_patient_owner = current_user.patient_profile and event.patient_id == current_user.patient_profile.id
    is_admin_or_doctor = current_user.role.value in ["admin", "doctor"]
    
    # Patients can only cancel their own events
    if is_patient_owner and update.status != "cancelled":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Patients can only cancel their own events",
        )
    
    if not (is_patient_owner or is_admin_or_doctor):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to update this event",
        )
    
    # Apply status update
    if update.status == "acknowledged":
        event = await service.acknowledge_event(
            event,
            responder_id=current_user.id,
            responder_notes=update.notes,
        )
    elif update.status == "dispatched":
        event = await service.dispatch_responders(event, update.notes)
    elif update.status == "resolved":
        event = await service.resolve_event(event, update.notes)
    elif update.status == "cancelled":
        event = await service.cancel_event(event, update.notes)
    else:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid status: {update.status}",
        )
    
    return EmergencyResponse(
        id=event.id,
        patient_id=event.patient_id,
        emergency_type=event.emergency_type.value,
        description=event.description,
        latitude=event.latitude,
        longitude=event.longitude,
        address=event.address,
        severity=event.severity.value,
        status=event.status.value,
        ai_analysis=event.ai_analysis,
        triggered_at=event.triggered_at.isoformat() if event.triggered_at else None,
        acknowledged_at=event.acknowledged_at.isoformat() if event.acknowledged_at else None,
        resolved_at=event.resolved_at.isoformat() if event.resolved_at else None,
    )


class LocationUpdate(BaseModel):
    """Location update request."""
    latitude: float = Field(..., ge=-90, le=90)
    longitude: float = Field(..., ge=-180, le=180)
    address: Optional[str] = None


@router.put("/{event_id}/location", response_model=EmergencyResponse)
async def update_emergency_location(
    event_id: UUID,
    location: LocationUpdate,
    patient: Annotated[Patient, Depends(get_current_patient)],
    db: Annotated[AsyncSession, Depends(get_db_session)],
):
    """
    Update location for an active emergency.
    
    Allows patients to update their location during an ongoing emergency.
    """
    service = get_emergency_service(db)
    event = await service.get_event_by_id(event_id)
    
    if not event:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Emergency event not found",
        )
    
    if event.patient_id != patient.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to update this event",
        )
    
    event = await service.update_location(
        event,
        latitude=location.latitude,
        longitude=location.longitude,
        address=location.address,
    )
    
    return EmergencyResponse(
        id=event.id,
        patient_id=event.patient_id,
        emergency_type=event.emergency_type.value,
        description=event.description,
        latitude=event.latitude,
        longitude=event.longitude,
        address=event.address,
        severity=event.severity.value,
        status=event.status.value,
        ai_analysis=event.ai_analysis,
        triggered_at=event.triggered_at.isoformat() if event.triggered_at else None,
        acknowledged_at=event.acknowledged_at.isoformat() if event.acknowledged_at else None,
        resolved_at=event.resolved_at.isoformat() if event.resolved_at else None,
    )
