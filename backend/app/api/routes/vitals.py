"""
MedTech AI Backend - Vitals API Routes

Health vitals tracking endpoints.
"""

from typing import Annotated, Optional
from uuid import UUID
from datetime import date

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.dependencies import get_db_session, get_current_patient
from app.models.patient import Patient
from app.schemas.vitals import (
    VitalsCreate,
    VitalsUpdate,
    VitalsResponse,
    VitalsHistoryQuery,
    VitalsHistoryResponse,
)
from app.services.vitals_service import get_vitals_service

router = APIRouter(prefix="/vitals", tags=["Health Vitals"])


@router.post("", response_model=VitalsResponse, status_code=status.HTTP_201_CREATED)
async def record_vitals(
    data: VitalsCreate,
    patient: Annotated[Patient, Depends(get_current_patient)],
    db: Annotated[AsyncSession, Depends(get_db_session)],
):
    """
    Record new health vitals.
    
    Patients can log their vital signs (BP, heart rate, etc.)
    either manually or from connected devices.
    """
    service = get_vitals_service(db)
    vitals = await service.create_vitals(patient.id, data)
    return VitalsResponse.model_validate(vitals)


@router.get("/latest", response_model=VitalsResponse)
async def get_latest_vitals(
    patient: Annotated[Patient, Depends(get_current_patient)],
    db: Annotated[AsyncSession, Depends(get_db_session)],
):
    """Get the most recent vitals record for the current patient."""
    service = get_vitals_service(db)
    vitals = await service.get_latest_vitals(patient.id)
    
    if not vitals:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No vitals records found",
        )
    
    return VitalsResponse.model_validate(vitals)


@router.get("/history", response_model=VitalsHistoryResponse)
async def get_vitals_history(
    patient: Annotated[Patient, Depends(get_current_patient)],
    db: Annotated[AsyncSession, Depends(get_db_session)],
    from_date: Optional[date] = None,
    to_date: Optional[date] = None,
    limit: int = Query(50, ge=1, le=500),
    offset: int = Query(0, ge=0),
    include_summary: bool = True,
):
    """
    Get vitals history for the current patient.
    
    Supports date filtering and pagination.
    Optionally includes statistical summary.
    """
    service = get_vitals_service(db)
    
    query = VitalsHistoryQuery(
        from_date=from_date,
        to_date=to_date,
        limit=limit,
        offset=offset,
        include_summary=include_summary,
    )
    
    return await service.get_vitals_history(patient.id, query)


@router.get("/{vitals_id}", response_model=VitalsResponse)
async def get_vitals_record(
    vitals_id: UUID,
    patient: Annotated[Patient, Depends(get_current_patient)],
    db: Annotated[AsyncSession, Depends(get_db_session)],
):
    """Get a specific vitals record by ID."""
    service = get_vitals_service(db)
    vitals = await service.get_vitals_by_id(vitals_id)
    
    if not vitals:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Vitals record not found",
        )
    
    # Verify ownership
    if vitals.patient_id != patient.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to view this record",
        )
    
    return VitalsResponse.model_validate(vitals)


@router.put("/{vitals_id}", response_model=VitalsResponse)
async def update_vitals_record(
    vitals_id: UUID,
    data: VitalsUpdate,
    patient: Annotated[Patient, Depends(get_current_patient)],
    db: Annotated[AsyncSession, Depends(get_db_session)],
):
    """Update a vitals record."""
    service = get_vitals_service(db)
    vitals = await service.get_vitals_by_id(vitals_id)
    
    if not vitals:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Vitals record not found",
        )
    
    # Verify ownership
    if vitals.patient_id != patient.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to update this record",
        )
    
    updated = await service.update_vitals(vitals, data)
    return VitalsResponse.model_validate(updated)


@router.delete("/{vitals_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_vitals_record(
    vitals_id: UUID,
    patient: Annotated[Patient, Depends(get_current_patient)],
    db: Annotated[AsyncSession, Depends(get_db_session)],
):
    """Delete a vitals record."""
    service = get_vitals_service(db)
    vitals = await service.get_vitals_by_id(vitals_id)
    
    if not vitals:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Vitals record not found",
        )
    
    # Verify ownership
    if vitals.patient_id != patient.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to delete this record",
        )
    
    await service.delete_vitals(vitals)
