"""
MedTech AI Backend - Gemini AI Client

Configurable Google Gemini client for medical AI features.
"""

import json
import logging
from typing import Optional, Dict, Any, List
from datetime import datetime

import google.generativeai as genai
from google.generativeai.types import HarmCategory, HarmBlockThreshold

from app.core.config import settings

logger = logging.getLogger(__name__)


class GeminiClient:
    """
    Google Gemini AI client wrapper.
    
    Provides configured access to Gemini models with retry logic
    and error handling appropriate for medical use cases.
    """
    
    def __init__(self):
        self.api_key = settings.gemini_api_key
        self.model_name = settings.gemini_model
        self.temperature = settings.ai_temperature
        self.max_retries = settings.ai_max_retries
        self.timeout = settings.ai_timeout_seconds
        
        self._initialized = False
        self._model = None
        self._chat_model = None
        
        if self.api_key:
            self._initialize()
    
    def _initialize(self) -> None:
        """Initialize the Gemini client."""
        try:
            genai.configure(api_key=self.api_key)
            
            # Configure safety settings - we handle medical safety ourselves
            safety_settings = {
                HarmCategory.HARM_CATEGORY_HARASSMENT: HarmBlockThreshold.BLOCK_ONLY_HIGH,
                HarmCategory.HARM_CATEGORY_HATE_SPEECH: HarmBlockThreshold.BLOCK_ONLY_HIGH,
                HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT: HarmBlockThreshold.BLOCK_ONLY_HIGH,
                HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT: HarmBlockThreshold.BLOCK_ONLY_HIGH,
            }
            
            # Generation config
            generation_config = genai.GenerationConfig(
                temperature=self.temperature,
                top_p=0.95,
                top_k=40,
                max_output_tokens=2048,
            )
            
            # Initialize model
            self._model = genai.GenerativeModel(
                model_name=self.model_name,
                safety_settings=safety_settings,
                generation_config=generation_config,
            )
            
            self._initialized = True
            logger.info(f"Gemini client initialized with model: {self.model_name}")
            
        except Exception as e:
            logger.error(f"Failed to initialize Gemini client: {e}")
            self._initialized = False
    
    @property
    def is_available(self) -> bool:
        """Check if Gemini client is available."""
        return self._initialized and self._model is not None
    
    async def generate_text(
        self,
        prompt: str,
        system_prompt: Optional[str] = None,
        temperature: Optional[float] = None,
    ) -> Optional[str]:
        """
        Generate text using Gemini.
        
        Args:
            prompt: The user prompt
            system_prompt: Optional system instructions
            temperature: Override default temperature
            
        Returns:
            Generated text or None if failed
        """
        if not self.is_available:
            logger.error("Gemini client not available")
            return None
        
        full_prompt = prompt
        if system_prompt:
            full_prompt = f"{system_prompt}\n\n{prompt}"
        
        for attempt in range(self.max_retries):
            try:
                response = await self._model.generate_content_async(
                    full_prompt,
                    generation_config=genai.GenerationConfig(
                        temperature=temperature or self.temperature
                    ) if temperature else None,
                )
                
                if response.text:
                    return response.text
                
                logger.warning(f"Empty response from Gemini (attempt {attempt + 1})")
                
            except Exception as e:
                logger.error(f"Gemini generation error (attempt {attempt + 1}): {e}")
                if attempt == self.max_retries - 1:
                    raise
        
        return None
    
    async def generate_json(
        self,
        prompt: str,
        system_prompt: Optional[str] = None,
        schema_hint: Optional[str] = None,
    ) -> Optional[Dict[str, Any]]:
        """
        Generate structured JSON output.
        
        Args:
            prompt: The user prompt
            system_prompt: Optional system instructions
            schema_hint: JSON schema description for the model
            
        Returns:
            Parsed JSON dict or None if failed
        """
        json_instruction = """
        IMPORTANT: Respond ONLY with valid JSON. No markdown, no code blocks, no explanations.
        Just the raw JSON object.
        """
        
        if schema_hint:
            json_instruction += f"\n\nExpected JSON schema:\n{schema_hint}"
        
        full_system_prompt = system_prompt or ""
        full_system_prompt += "\n\n" + json_instruction
        
        response_text = await self.generate_text(prompt, full_system_prompt)
        
        if not response_text:
            return None
        
        # Clean up response - remove any markdown formatting
        cleaned = response_text.strip()
        if cleaned.startswith("```json"):
            cleaned = cleaned[7:]
        if cleaned.startswith("```"):
            cleaned = cleaned[3:]
        if cleaned.endswith("```"):
            cleaned = cleaned[:-3]
        cleaned = cleaned.strip()
        
        try:
            return json.loads(cleaned)
        except json.JSONDecodeError as e:
            logger.error(f"Failed to parse Gemini JSON response: {e}")
            logger.debug(f"Raw response: {response_text}")
            return None
    
    async def analyze_for_medical(
        self,
        text: str,
        context: Optional[Dict[str, Any]] = None,
    ) -> Optional[Dict[str, Any]]:
        """
        Analyze text for medical symptom classification.
        
        This is the core method for symptom analysis.
        
        Args:
            text: Symptom description text
            context: Optional patient context (age, conditions, etc.)
            
        Returns:
            Structured analysis result
        """
        system_prompt = """
        You are a medical triage assistant. Your role is to analyze symptom descriptions
        and provide structured risk assessments. You are NOT providing diagnoses.
        
        CRITICAL RULES:
        1. NEVER diagnose specific conditions definitively
        2. ALWAYS recommend professional consultation for concerning symptoms
        3. When in doubt, err on the side of caution (higher risk level)
        4. Be clear this is for informational purposes only
        
        You must respond with a JSON object in this exact format:
        {
            "risk_level": "low" | "medium" | "high" | "emergency",
            "confidence": 0.0 to 1.0,
            "suggested_action": "self-care" | "book-appointment" | "emergency-sos",
            "reasoning": "Plain English explanation for the patient",
            "possible_conditions": ["condition1", "condition2"],
            "recommended_specialists": ["specialist1", "specialist2"],
            "warning_signs": ["sign1", "sign2"],
            "self_care_tips": ["tip1", "tip2"]
        }
        
        Risk Level Guidelines:
        - LOW: Minor symptoms, self-care appropriate
        - MEDIUM: Symptoms warrant professional evaluation soon
        - HIGH: Symptoms require prompt medical attention
        - EMERGENCY: Life-threatening, requires immediate emergency care
        """
        
        # Build context-aware prompt
        context_str = ""
        if context:
            if context.get("age"):
                context_str += f"Patient age: {context['age']} years. "
            if context.get("gender"):
                context_str += f"Gender: {context['gender']}. "
            if context.get("existing_conditions"):
                context_str += f"Existing conditions: {', '.join(context['existing_conditions'])}. "
            if context.get("current_medications"):
                context_str += f"Current medications: {', '.join(context['current_medications'])}. "
            if context.get("duration_hours"):
                context_str += f"Symptoms duration: {context['duration_hours']} hours. "
            if context.get("severity"):
                context_str += f"Self-reported severity: {context['severity']}/10. "
        
        prompt = f"""
        Analyze the following symptom description and provide a risk assessment.
        
        {f"Patient Context: {context_str}" if context_str else "No additional patient context provided."}
        
        Symptom Description:
        {text}
        
        Provide your assessment as a JSON object.
        """
        
        return await self.generate_json(prompt, system_prompt)
    
    def get_model_info(self) -> Dict[str, Any]:
        """Get information about the current model configuration."""
        return {
            "model_name": self.model_name,
            "temperature": self.temperature,
            "max_retries": self.max_retries,
            "timeout_seconds": self.timeout,
            "is_available": self.is_available,
        }


# Module-level client instance
gemini_client = GeminiClient()
