"""
MedTech AI Backend - Appointment Service

Appointment scheduling and management service.
"""

import logging
from typing import List, Optional
from uuid import UUID
from datetime import datetime, date, time, timedelta

from sqlalchemy import select, and_, or_
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models.appointment import Appointment, AppointmentStatus, AppointmentType
from app.models.doctor import Doctor
from app.models.patient import Patient
from app.schemas.appointment import (
    AppointmentCreate,
    AppointmentUpdate,
    AppointmentResponse,
    AvailableSlotsRequest,
    TimeSlot,
)

logger = logging.getLogger(__name__)


class AppointmentService:
    """
    Appointment scheduling and management service.
    
    Handles:
    - Appointment creation and updates
    - Availability checking
    - Conflict detection
    - Status management
    """
    
    SLOT_DURATION_MINUTES = 30
    
    def __init__(self, db: AsyncSession):
        self.db = db
        self.logger = logging.getLogger(f"{__name__}.AppointmentService")
    
    async def get_appointment_by_id(
        self,
        appointment_id: UUID,
    ) -> Optional[Appointment]:
        """Get appointment by ID with related data."""
        result = await self.db.execute(
            select(Appointment)
            .options(
                selectinload(Appointment.patient),
                selectinload(Appointment.doctor),
            )
            .where(Appointment.id == appointment_id)
        )
        return result.scalar_one_or_none()
    
    async def get_patient_appointments(
        self,
        patient_id: UUID,
        status: Optional[AppointmentStatus] = None,
        from_date: Optional[date] = None,
        to_date: Optional[date] = None,
    ) -> List[Appointment]:
        """Get appointments for a patient."""
        query = select(Appointment).where(
            Appointment.patient_id == patient_id
        ).options(selectinload(Appointment.doctor))
        
        if status:
            query = query.where(Appointment.status == status)
        if from_date:
            query = query.where(Appointment.scheduled_at >= datetime.combine(from_date, time.min))
        if to_date:
            query = query.where(Appointment.scheduled_at <= datetime.combine(to_date, time.max))
        
        query = query.order_by(Appointment.scheduled_at.desc())
        
        result = await self.db.execute(query)
        return list(result.scalars().all())
    
    async def get_doctor_appointments(
        self,
        doctor_id: UUID,
        status: Optional[AppointmentStatus] = None,
        from_date: Optional[date] = None,
        to_date: Optional[date] = None,
    ) -> List[Appointment]:
        """Get appointments for a doctor."""
        query = select(Appointment).where(
            Appointment.doctor_id == doctor_id
        ).options(selectinload(Appointment.patient))
        
        if status:
            query = query.where(Appointment.status == status)
        if from_date:
            query = query.where(Appointment.scheduled_at >= datetime.combine(from_date, time.min))
        if to_date:
            query = query.where(Appointment.scheduled_at <= datetime.combine(to_date, time.max))
        
        query = query.order_by(Appointment.scheduled_at.asc())
        
        result = await self.db.execute(query)
        return list(result.scalars().all())
    
    async def create_appointment(
        self,
        data: AppointmentCreate,
        patient_id: UUID,
    ) -> Appointment:
        """
        Create a new appointment.
        
        Args:
            data: Appointment creation data
            patient_id: Patient ID
            
        Returns:
            Created Appointment
            
        Raises:
            ValueError: If slot is not available
        """
        # Check for conflicts
        is_available = await self._check_slot_availability(
            doctor_id=data.doctor_id,
            scheduled_at=data.scheduled_at,
            duration_minutes=data.duration_minutes or self.SLOT_DURATION_MINUTES,
        )
        
        if not is_available:
            raise ValueError("Selected time slot is not available")
        
        # Get doctor for fee
        doctor = await self.db.get(Doctor, data.doctor_id)
        if not doctor:
            raise ValueError("Doctor not found")
        
        appointment = Appointment(
            patient_id=patient_id,
            doctor_id=data.doctor_id,
            scheduled_at=data.scheduled_at,
            duration_minutes=data.duration_minutes or self.SLOT_DURATION_MINUTES,
            appointment_type=AppointmentType(data.appointment_type) if data.appointment_type else AppointmentType.VIDEO,
            reason=data.reason,
            symptoms=data.symptoms,
            notes=data.notes,
            status=AppointmentStatus.SCHEDULED,
            fee_amount=doctor.consultation_fee,
        )
        
        self.db.add(appointment)
        await self.db.commit()
        await self.db.refresh(appointment)
        
        self.logger.info(f"Created appointment {appointment.id} for patient {patient_id}")
        
        return appointment
    
    async def update_appointment(
        self,
        appointment: Appointment,
        data: AppointmentUpdate,
    ) -> Appointment:
        """Update an appointment."""
        update_data = data.model_dump(exclude_unset=True)
        
        # Check for reschedule conflicts
        if "scheduled_at" in update_data:
            is_available = await self._check_slot_availability(
                doctor_id=appointment.doctor_id,
                scheduled_at=update_data["scheduled_at"],
                duration_minutes=update_data.get("duration_minutes", appointment.duration_minutes),
                exclude_appointment_id=appointment.id,
            )
            if not is_available:
                raise ValueError("Selected time slot is not available")
        
        # Handle status update
        if "status" in update_data:
            update_data["status"] = AppointmentStatus(update_data["status"])
        
        for field, value in update_data.items():
            setattr(appointment, field, value)
        
        await self.db.commit()
        await self.db.refresh(appointment)
        
        self.logger.info(f"Updated appointment {appointment.id}")
        
        return appointment
    
    async def cancel_appointment(
        self,
        appointment: Appointment,
        cancelled_by: str,
        reason: Optional[str] = None,
    ) -> Appointment:
        """Cancel an appointment."""
        appointment.status = AppointmentStatus.CANCELLED
        appointment.cancellation_reason = reason
        
        await self.db.commit()
        await self.db.refresh(appointment)
        
        self.logger.info(f"Cancelled appointment {appointment.id} by {cancelled_by}")
        
        return appointment
    
    async def get_available_slots(
        self,
        request: AvailableSlotsRequest,
    ) -> List[TimeSlot]:
        """
        Get available time slots for a doctor on a given date.
        
        Args:
            request: Availability request with doctor_id and date
            
        Returns:
            List of available TimeSlot objects
        """
        # Get doctor
        doctor = await self.db.get(Doctor, request.doctor_id)
        if not doctor or not doctor.is_available:
            return []
        
        # Get doctor's schedule for this day
        day_name = request.date.strftime("%A").lower()
        schedule = doctor.availability_schedule or {}
        day_schedule = schedule.get(day_name, {})
        
        if not day_schedule.get("available", False):
            return []
        
        # Generate time slots
        start_time = datetime.strptime(day_schedule.get("start", "09:00"), "%H:%M").time()
        end_time = datetime.strptime(day_schedule.get("end", "17:00"), "%H:%M").time()
        slot_duration = timedelta(minutes=request.slot_duration_minutes)
        
        slots = []
        current_time = datetime.combine(request.date, start_time)
        end_datetime = datetime.combine(request.date, end_time)
        
        # Get existing appointments for this day
        existing = await self.db.execute(
            select(Appointment).where(
                and_(
                    Appointment.doctor_id == request.doctor_id,
                    Appointment.scheduled_at >= datetime.combine(request.date, time.min),
                    Appointment.scheduled_at <= datetime.combine(request.date, time.max),
                    Appointment.status.in_([
                        AppointmentStatus.SCHEDULED,
                        AppointmentStatus.CONFIRMED,
                        AppointmentStatus.IN_PROGRESS,
                    ])
                )
            )
        )
        booked_times = {apt.scheduled_at for apt in existing.scalars().all()}
        
        while current_time + slot_duration <= end_datetime:
            is_available = current_time not in booked_times
            
            # Don't show past slots for today
            if request.date == date.today() and current_time <= datetime.now():
                is_available = False
            
            slots.append(TimeSlot(
                start_time=current_time,
                end_time=current_time + slot_duration,
                is_available=is_available,
            ))
            
            current_time += slot_duration
        
        return slots
    
    async def _check_slot_availability(
        self,
        doctor_id: UUID,
        scheduled_at: datetime,
        duration_minutes: int,
        exclude_appointment_id: Optional[UUID] = None,
    ) -> bool:
        """Check if a time slot is available for a doctor."""
        end_time = scheduled_at + timedelta(minutes=duration_minutes)
        
        query = select(Appointment).where(
            and_(
                Appointment.doctor_id == doctor_id,
                Appointment.status.in_([
                    AppointmentStatus.SCHEDULED,
                    AppointmentStatus.CONFIRMED,
                    AppointmentStatus.IN_PROGRESS,
                ]),
                # Check for overlap
                or_(
                    # New appointment starts during existing
                    and_(
                        Appointment.scheduled_at <= scheduled_at,
                        Appointment.scheduled_at + timedelta(minutes=Appointment.duration_minutes) > scheduled_at
                    ),
                    # New appointment ends during existing
                    and_(
                        Appointment.scheduled_at < end_time,
                        Appointment.scheduled_at + timedelta(minutes=Appointment.duration_minutes) >= end_time
                    ),
                    # New appointment completely contains existing
                    and_(
                        Appointment.scheduled_at >= scheduled_at,
                        Appointment.scheduled_at + timedelta(minutes=Appointment.duration_minutes) <= end_time
                    ),
                )
            )
        )
        
        if exclude_appointment_id:
            query = query.where(Appointment.id != exclude_appointment_id)
        
        result = await self.db.execute(query)
        conflicts = result.scalars().all()
        
        return len(conflicts) == 0


def get_appointment_service(db: AsyncSession) -> AppointmentService:
    """Factory function for AppointmentService."""
    return AppointmentService(db)
