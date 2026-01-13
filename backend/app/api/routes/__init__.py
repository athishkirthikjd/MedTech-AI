"""
MedTech AI Backend - API Routes Module

Router aggregation for all API endpoints.
"""

from fastapi import APIRouter

from app.api.routes import auth, appointments, vitals, emergency, ai, doctors

api_router = APIRouter(prefix="/api/v1")

# Include all route modules
api_router.include_router(auth.router)
api_router.include_router(appointments.router)
api_router.include_router(vitals.router)
api_router.include_router(emergency.router)
api_router.include_router(ai.router)
api_router.include_router(doctors.router)


@api_router.get("/health")
async def health_check():
    """API health check endpoint."""
    return {"status": "healthy", "version": "1.0.0"}
