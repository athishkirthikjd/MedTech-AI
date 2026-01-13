"""
MedTech AI Backend - AI Schemas

Pydantic schemas for AI-related requests and responses.
"""

from datetime import datetime
from enum import Enum
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field, field_validator


class RiskLevel(str, Enum):
    """Risk level classification."""
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    EMERGENCY = "emergency"


class SuggestedAction(str, Enum):
    """Suggested action based on AI analysis."""
    SELF_CARE = "self-care"
    BOOK_APPOINTMENT = "book-appointment"
    EMERGENCY_SOS = "emergency-sos"


class SymptomCheckRequest(BaseModel):
    """Request for AI symptom analysis."""
    symptom_text: str = Field(
        ...,
        min_length=5,
        max_length=2000,
        description="Description of symptoms"
    )
    age: Optional[int] = Field(None, ge=0, le=150)
    gender: Optional[str] = None
    duration_hours: Optional[int] = Field(None, ge=0, description="How long symptoms have lasted")
    severity: Optional[int] = Field(None, ge=1, le=10, description="Severity from 1-10")
    existing_conditions: Optional[List[str]] = None
    current_medications: Optional[List[str]] = None
    
    @field_validator("symptom_text")
    @classmethod
    def clean_symptom_text(cls, v: str) -> str:
        """Clean and normalize symptom text."""
        return v.strip()


class SymptomCheckResponse(BaseModel):
    """Response from AI symptom analysis."""
    risk_level: RiskLevel
    confidence: float = Field(..., ge=0.0, le=1.0)
    suggested_action: SuggestedAction
    reasoning: str
    
    # Additional context
    possible_conditions: Optional[List[str]] = None
    recommended_specialists: Optional[List[str]] = None
    warning_signs: Optional[List[str]] = None
    self_care_tips: Optional[List[str]] = None
    
    # Safety metadata
    safety_override_applied: bool = False
    safety_override_reason: Optional[str] = None
    
    # Disclaimer
    disclaimer: str = Field(
        default="This is not a medical diagnosis. Please consult a healthcare professional for medical advice."
    )
    
    # Timestamp
    analyzed_at: datetime = Field(default_factory=datetime.utcnow)
    
    model_config = {"use_enum_values": True}


class VoiceChatRequest(BaseModel):
    """Request for voice chat interaction."""
    audio_base64: Optional[str] = Field(
        None,
        description="Base64 encoded audio data"
    )
    audio_url: Optional[str] = Field(
        None,
        description="URL to audio file"
    )
    language: str = Field(
        default="en",
        description="Language code (e.g., 'en', 'es', 'hi')"
    )
    
    @field_validator("audio_base64", "audio_url")
    @classmethod
    def validate_audio_source(cls, v, info):
        """Ensure at least one audio source is provided."""
        return v


class VoiceChatResponse(BaseModel):
    """Response from voice chat interaction."""
    # Transcription
    transcript: str
    transcript_confidence: float = Field(..., ge=0.0, le=1.0)
    
    # AI Response
    response_text: str
    
    # Symptom analysis (if applicable)
    symptom_analysis: Optional[SymptomCheckResponse] = None
    
    # Audio response
    audio_response_url: Optional[str] = None
    audio_response_base64: Optional[str] = None
    
    # Metadata
    processing_time_ms: int
    language: str


class ConversationMessage(BaseModel):
    """A single message in conversation history."""
    role: str  # 'user' or 'assistant'
    content: str
    timestamp: datetime = Field(default_factory=datetime.utcnow)


class ConversationContext(BaseModel):
    """Context for multi-turn conversation."""
    session_id: str
    messages: List[ConversationMessage] = []
    patient_context: Optional[Dict[str, Any]] = None


class AIHealthTip(BaseModel):
    """AI-generated health tip."""
    category: str
    title: str
    content: str
    relevance_score: float = Field(..., ge=0.0, le=1.0)


class AIModelInfo(BaseModel):
    """Information about the AI model being used."""
    model_name: str
    model_version: str
    capabilities: List[str]
    limitations: List[str]
