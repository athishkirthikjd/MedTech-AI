"""
MedTech AI Backend - Doctors API Routes

Doctor listing and search endpoints.
"""

from typing import Annotated, List, Optional
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import select, and_, or_, func
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.core.dependencies import get_db_session, get_current_user
from app.models.user import User
from app.models.doctor import Doctor
from app.schemas.doctor import DoctorResponse, DoctorListResponse, DoctorSearchQuery

router = APIRouter(prefix="/doctors", tags=["Doctors"])


@router.get("", response_model=DoctorListResponse)
async def list_doctors(
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db_session)],
    specialty: Optional[str] = None,
    search: Optional[str] = None,
    available_only: bool = True,
    min_rating: Optional[float] = Query(None, ge=0, le=5),
    limit: int = Query(20, ge=1, le=100),
    offset: int = Query(0, ge=0),
):
    """
    List doctors with optional filtering.
    
    Supports filtering by specialty, search term, availability, and rating.
    """
    query = select(Doctor).options(selectinload(Doctor.user))
    
    # Apply filters
    conditions = []
    
    if available_only:
        conditions.append(Doctor.is_available == True)
    
    if specialty:
        conditions.append(func.lower(Doctor.specialty) == specialty.lower())
    
    if min_rating:
        conditions.append(Doctor.average_rating >= min_rating)
    
    if search:
        search_term = f"%{search.lower()}%"
        conditions.append(
            or_(
                func.lower(Doctor.specialty).like(search_term),
                func.lower(Doctor.qualifications).like(search_term),
                func.lower(Doctor.hospital_affiliation).like(search_term),
            )
        )
    
    if conditions:
        query = query.where(and_(*conditions))
    
    # Count total
    count_query = select(func.count()).select_from(query.subquery())
    total_result = await db.execute(count_query)
    total = total_result.scalar()
    
    # Apply pagination
    query = query.order_by(Doctor.average_rating.desc().nullslast())
    query = query.offset(offset).limit(limit)
    
    result = await db.execute(query)
    doctors = list(result.scalars().all())
    
    return DoctorListResponse(
        doctors=[DoctorResponse.model_validate(d) for d in doctors],
        total=total,
        limit=limit,
        offset=offset,
    )


@router.get("/specialties", response_model=List[str])
async def list_specialties(
    db: Annotated[AsyncSession, Depends(get_db_session)],
):
    """Get list of all available specialties."""
    result = await db.execute(
        select(Doctor.specialty)
        .distinct()
        .where(Doctor.is_available == True)
        .order_by(Doctor.specialty)
    )
    specialties = [row[0] for row in result.all() if row[0]]
    return specialties


@router.get("/{doctor_id}", response_model=DoctorResponse)
async def get_doctor(
    doctor_id: UUID,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db_session)],
):
    """Get doctor details by ID."""
    result = await db.execute(
        select(Doctor)
        .options(selectinload(Doctor.user))
        .where(Doctor.id == doctor_id)
    )
    doctor = result.scalar_one_or_none()
    
    if not doctor:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Doctor not found",
        )
    
    return DoctorResponse.model_validate(doctor)


@router.post("/search", response_model=DoctorListResponse)
async def search_doctors(
    query: DoctorSearchQuery,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db_session)],
):
    """
    Advanced doctor search.
    
    Supports complex filtering including multiple specialties,
    fee ranges, and text search.
    """
    stmt = select(Doctor).options(selectinload(Doctor.user))
    conditions = []
    
    if query.available_only:
        conditions.append(Doctor.is_available == True)
    
    if query.specialties:
        conditions.append(
            func.lower(Doctor.specialty).in_([s.lower() for s in query.specialties])
        )
    
    if query.min_fee is not None:
        conditions.append(Doctor.consultation_fee >= query.min_fee)
    
    if query.max_fee is not None:
        conditions.append(Doctor.consultation_fee <= query.max_fee)
    
    if query.min_rating is not None:
        conditions.append(Doctor.average_rating >= query.min_rating)
    
    if query.min_experience_years is not None:
        conditions.append(Doctor.years_of_experience >= query.min_experience_years)
    
    if query.search_term:
        search = f"%{query.search_term.lower()}%"
        conditions.append(
            or_(
                func.lower(Doctor.specialty).like(search),
                func.lower(Doctor.qualifications).like(search),
                func.lower(Doctor.hospital_affiliation).like(search),
                func.lower(Doctor.languages_spoken.cast(db.bind.dialect.type_descriptor(str))).like(search),
            )
        )
    
    if conditions:
        stmt = stmt.where(and_(*conditions))
    
    # Count total
    count_stmt = select(func.count()).select_from(stmt.subquery())
    total_result = await db.execute(count_stmt)
    total = total_result.scalar()
    
    # Sort and paginate
    stmt = stmt.order_by(Doctor.average_rating.desc().nullslast())
    stmt = stmt.offset(query.offset).limit(query.limit)
    
    result = await db.execute(stmt)
    doctors = list(result.scalars().all())
    
    return DoctorListResponse(
        doctors=[DoctorResponse.model_validate(d) for d in doctors],
        total=total,
        limit=query.limit,
        offset=query.offset,
    )
