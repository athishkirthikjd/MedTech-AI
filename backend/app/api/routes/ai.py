"""
MedTech AI Backend - AI API Routes

AI-powered symptom checking and voice chat endpoints.
"""

from typing import Annotated, Optional

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.dependencies import get_db_session, get_current_user
from app.models.user import User
from app.schemas.ai import (
    SymptomCheckRequest,
    SymptomCheckResponse,
    VoiceChatRequest,
    VoiceChatResponse,
)
from app.services.ai.symptom_classifier import symptom_classifier
from app.services.ai.voice_pipeline import voice_pipeline
from app.services.ai.gemini_client import gemini_client

router = APIRouter(prefix="/ai", tags=["AI Services"])


@router.post("/symptom-check", response_model=SymptomCheckResponse)
async def check_symptoms(
    request: SymptomCheckRequest,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db_session)],
):
    """
    AI-powered symptom assessment.
    
    Analyzes symptoms and provides:
    - Risk level classification (low/medium/high/emergency)
    - Recommended action (self-care/book-appointment/emergency-sos)
    - Possible conditions to discuss with a doctor
    - Self-care tips for low-risk situations
    
    IMPORTANT: This is for informational purposes only and does not
    constitute medical advice. Always consult a healthcare professional
    for medical decisions.
    
    Safety overrides are applied automatically for emergency keywords.
    """
    # Get patient age if available
    patient_age = None
    if current_user.patient_profile:
        if current_user.patient_profile.date_of_birth:
            from datetime import date
            dob = current_user.patient_profile.date_of_birth
            today = date.today()
            patient_age = today.year - dob.year - ((today.month, today.day) < (dob.month, dob.day))
    
    # If age not provided in request, use patient profile age
    if not request.age and patient_age:
        request.age = patient_age
    
    # Get existing conditions from patient profile
    if current_user.patient_profile and not request.existing_conditions:
        if current_user.patient_profile.chronic_conditions:
            request.existing_conditions = current_user.patient_profile.chronic_conditions
    
    response = await symptom_classifier.classify(request)
    
    return response


@router.post("/voice-chat", response_model=VoiceChatResponse)
async def voice_chat(
    request: VoiceChatRequest,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db_session)],
):
    """
    Voice-based AI chat for symptom description.
    
    Accepts audio input (base64 encoded) and returns:
    - Transcript of the audio
    - AI response text
    - Symptom analysis if applicable
    - Optional audio response (TTS)
    
    Supported formats: WAV, MP3, WebM audio.
    """
    # Get patient context
    patient_age = None
    patient_context = {}
    
    if current_user.patient_profile:
        profile = current_user.patient_profile
        
        if profile.date_of_birth:
            from datetime import date
            dob = profile.date_of_birth
            today = date.today()
            patient_age = today.year - dob.year - ((today.month, today.day) < (dob.month, dob.day))
        
        patient_context = {
            "blood_type": profile.blood_type,
            "allergies": profile.allergies,
            "chronic_conditions": profile.chronic_conditions,
        }
    
    response = await voice_pipeline.process_voice_input(
        request,
        patient_age=patient_age,
        patient_context=patient_context,
    )
    
    return response


@router.get("/health")
async def ai_health_check():
    """
    Check AI service health status.
    
    Returns availability of AI features.
    """
    return {
        "status": "ok",
        "gemini_available": gemini_client.is_available,
        "model_info": gemini_client.get_model_info(),
    }


@router.post("/chat")
async def general_chat(
    current_user: Annotated[User, Depends(get_current_user)],
    message: str,
    conversation_id: Optional[str] = None,
):
    """
    General health chat with AI assistant.
    
    For non-symptom conversations like health tips,
    medication questions, or general wellness advice.
    """
    if not gemini_client.is_available:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="AI service temporarily unavailable",
        )
    
    system_prompt = """
    You are a helpful healthcare assistant named MedBot. You provide general 
    health information, wellness tips, and can answer questions about medical topics.
    
    IMPORTANT RULES:
    1. You are NOT a doctor and cannot diagnose conditions
    2. Always recommend consulting a healthcare professional for medical decisions
    3. Be empathetic and supportive
    4. If symptoms sound serious, recommend seeking professional care
    5. Keep responses concise and helpful
    """
    
    response = await gemini_client.generate_text(message, system_prompt)
    
    if not response:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to generate response",
        )
    
    return {
        "message": response,
        "conversation_id": conversation_id,
    }
