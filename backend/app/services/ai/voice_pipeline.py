"""
MedTech AI Backend - Voice Pipeline

Speech-to-Text and Text-to-Speech pipeline using Gemini.
"""

import base64
import logging
import time
from typing import Optional, Tuple
from datetime import datetime

from app.schemas.ai import (
    VoiceChatRequest,
    VoiceChatResponse,
    SymptomCheckRequest,
    SymptomCheckResponse,
)
from app.services.ai.gemini_client import gemini_client
from app.services.ai.symptom_classifier import symptom_classifier

logger = logging.getLogger(__name__)


class VoicePipeline:
    """
    Voice interaction pipeline for the AI assistant.
    
    Handles:
    1. Speech-to-Text (STT) conversion
    2. Text analysis via symptom classifier
    3. Response generation
    4. Text-to-Speech (TTS) conversion
    
    Note: Full audio processing requires Gemini Audio API access.
    This implementation provides the framework with mock audio handling.
    """
    
    def __init__(self):
        self.gemini = gemini_client
        self.classifier = symptom_classifier
        self.logger = logging.getLogger(f"{__name__}.VoicePipeline")
    
    async def process_voice_input(
        self,
        request: VoiceChatRequest,
        patient_age: Optional[int] = None,
        patient_context: Optional[dict] = None,
    ) -> VoiceChatResponse:
        """
        Process voice input through the full pipeline.
        
        Args:
            request: Voice chat request with audio data
            patient_age: Optional patient age for context
            patient_context: Additional patient context
            
        Returns:
            VoiceChatResponse with transcript and analysis
        """
        start_time = time.time()
        
        # Step 1: Speech-to-Text
        transcript, confidence = await self._transcribe_audio(request)
        
        if not transcript:
            return VoiceChatResponse(
                transcript="",
                transcript_confidence=0.0,
                response_text="I couldn't understand the audio. Please try speaking again clearly.",
                processing_time_ms=int((time.time() - start_time) * 1000),
                language=request.language,
            )
        
        self.logger.info(f"Transcribed: {transcript[:100]}...")
        
        # Step 2: Analyze transcript for symptoms
        symptom_analysis = None
        if self._is_symptom_related(transcript):
            symptom_request = SymptomCheckRequest(
                symptom_text=transcript,
                age=patient_age,
            )
            symptom_analysis = await self.classifier.classify(symptom_request)
        
        # Step 3: Generate response
        response_text = await self._generate_response(
            transcript,
            symptom_analysis,
            patient_context,
        )
        
        # Step 4: Text-to-Speech (mock for now)
        audio_response = await self._synthesize_speech(response_text, request.language)
        
        processing_time = int((time.time() - start_time) * 1000)
        
        return VoiceChatResponse(
            transcript=transcript,
            transcript_confidence=confidence,
            response_text=response_text,
            symptom_analysis=symptom_analysis,
            audio_response_base64=audio_response,
            processing_time_ms=processing_time,
            language=request.language,
        )
    
    async def _transcribe_audio(
        self,
        request: VoiceChatRequest,
    ) -> Tuple[Optional[str], float]:
        """
        Transcribe audio to text.
        
        Note: This is a placeholder. Full implementation requires
        Gemini Audio API or alternative STT service.
        
        Returns:
            Tuple of (transcript, confidence)
        """
        # Check if we have audio data
        if not request.audio_base64 and not request.audio_url:
            self.logger.warning("No audio data provided")
            return None, 0.0
        
        # In a full implementation, we would:
        # 1. Decode base64 audio or fetch from URL
        # 2. Send to Gemini Audio API or Google Cloud Speech-to-Text
        # 3. Return transcription
        
        # For now, return a mock response indicating audio was received
        # This allows the API to be tested without full audio processing
        
        if request.audio_base64:
            # Validate base64 data
            try:
                audio_bytes = base64.b64decode(request.audio_base64)
                self.logger.info(f"Received {len(audio_bytes)} bytes of audio data")
                
                # Mock transcription - in production, send to STT service
                return self._mock_transcription(len(audio_bytes)), 0.85
                
            except Exception as e:
                self.logger.error(f"Failed to decode audio: {e}")
                return None, 0.0
        
        return None, 0.0
    
    def _mock_transcription(self, audio_size: int) -> str:
        """Generate mock transcription for testing."""
        # This would be replaced with actual STT in production
        return (
            "I've been experiencing headaches and feeling tired for the past few days. "
            "The headache is mostly on my forehead and gets worse in the afternoon."
        )
    
    def _is_symptom_related(self, text: str) -> bool:
        """Check if text appears to be symptom-related."""
        symptom_keywords = [
            "pain", "ache", "hurt", "fever", "cough", "tired",
            "fatigue", "nausea", "dizzy", "headache", "sore",
            "swelling", "rash", "breathing", "chest", "stomach",
            "feeling", "symptoms", "sick", "unwell"
        ]
        
        text_lower = text.lower()
        return any(keyword in text_lower for keyword in symptom_keywords)
    
    async def _generate_response(
        self,
        user_input: str,
        symptom_analysis: Optional[SymptomCheckResponse],
        patient_context: Optional[dict],
    ) -> str:
        """Generate conversational response."""
        
        if symptom_analysis:
            # Build response based on symptom analysis
            response_parts = [
                "Based on what you've described, "
            ]
            
            if symptom_analysis.risk_level.value == "emergency":
                response_parts.append(
                    "this sounds like it could be serious and requires immediate attention. "
                    "Please call emergency services or go to the nearest emergency room right away."
                )
            elif symptom_analysis.risk_level.value == "high":
                response_parts.append(
                    "I recommend you see a doctor as soon as possible. "
                    f"{symptom_analysis.reasoning} "
                    "Would you like me to help you book an appointment?"
                )
            elif symptom_analysis.risk_level.value == "medium":
                response_parts.append(
                    f"{symptom_analysis.reasoning} "
                    "It would be a good idea to consult with a healthcare provider. "
                    "Would you like to schedule an appointment?"
                )
            else:
                response_parts.append(
                    f"{symptom_analysis.reasoning} "
                )
                if symptom_analysis.self_care_tips:
                    response_parts.append(
                        f"Some self-care tips: {', '.join(symptom_analysis.self_care_tips[:2])}. "
                    )
                response_parts.append(
                    "If symptoms persist or worsen, please consult a healthcare provider."
                )
            
            return "".join(response_parts)
        
        # General response if no symptom analysis
        if self.gemini.is_available:
            prompt = f"""
            You are a helpful healthcare assistant. Respond to the following patient message
            in a caring, professional manner. Keep the response concise (2-3 sentences).
            
            Patient: {user_input}
            """
            
            response = await self.gemini.generate_text(prompt)
            if response:
                return response
        
        return (
            "I'm here to help with your health concerns. "
            "Could you tell me more about what symptoms you're experiencing?"
        )
    
    async def _synthesize_speech(
        self,
        text: str,
        language: str,
    ) -> Optional[str]:
        """
        Convert text to speech.
        
        Note: This is a placeholder. Full implementation requires
        Google Cloud Text-to-Speech or similar service.
        
        Returns:
            Base64 encoded audio or None
        """
        # In a full implementation:
        # 1. Send text to TTS service
        # 2. Get audio bytes
        # 3. Encode to base64
        # 4. Return
        
        # For now, return None to indicate TTS is not available
        # The client can use browser-based TTS as fallback
        return None


# Module-level instance
voice_pipeline = VoicePipeline()
