"""
AI Service for medical chatbot using Ollama
"""

import httpx
import json
import logging
from typing import List, Dict, Any
from datetime import datetime

from models.chat_models import AIResponse, HealthContext, InteractionWarning, OllamaStatus

logger = logging.getLogger(__name__)

class AIService:
    def __init__(self):
        self.ollama_base_url = "http://localhost:11434"
        self.model = "llama2"  # Default model
        self.timeout = 30.0
        
    async def generate_response(self, message: str, health_context: HealthContext = None) -> AIResponse:
        """
        Generate AI response using Ollama
        """
        try:
            # Build medical prompt with health context
            prompt = self._build_medical_prompt(message, health_context)
            
            # Try Ollama first
            try:
                logger.info(f"Attempting to generate response with Ollama (model: {self.model})")
                response = await self._generate_ollama_response(prompt)
                logger.info(f"Ollama response generated successfully - content length: {len(response.content) if response.content else 0}")
                return response
            except Exception as e:
                logger.warning(f"Ollama failed, falling back to mock response: {e}")
                logger.warning(f"Ollama error details: {type(e).__name__}: {str(e)}")
                mock_response = await self._generate_mock_response(message, health_context)
                logger.info(f"Mock response generated - content length: {len(mock_response.content) if mock_response.content else 0}")
                return mock_response
                
        except Exception as e:
            logger.error(f"AI service error: {e}")
            # Return fallback response
            return AIResponse(
                content="I'm sorry, I'm unable to respond at the moment. Please try again later or call 911 in case of emergency.",
                confidence=0.0,
                requires_disclaimer=True,
                emergency_detected=False,
                health_data_used=[],
                suggested_actions=["Try again later", "Call 911 in case of emergency"]
            )
    
    async def _generate_ollama_response(self, prompt: str) -> AIResponse:
        """
        Generate response using Ollama API
        """
        logger.info(f"Connecting to Ollama at {self.ollama_base_url} with model {self.model}")
        async with httpx.AsyncClient(timeout=self.timeout) as client:
            try:
                response = await client.post(
                    f"{self.ollama_base_url}/api/generate",
                    json={
                        "model": self.model,
                        "prompt": f"You are a medical assistant. Provide safe, accurate, and helpful information in English. Do not diagnose, do not prescribe medications, and always recommend consulting a healthcare professional. Respond in English only.\n\n{prompt}",
                        "stream": False,
                        "options": {
                            "temperature": 0.7,
                            "num_predict": 500,
                        }
                    }
                )
                
                logger.info(f"Ollama API response status: {response.status_code}")
                
                if response.status_code != 200:
                    error_text = response.text[:200] if hasattr(response, 'text') else "No error details"
                    logger.error(f"Ollama API error {response.status_code}: {error_text}")
                    raise Exception(f"Ollama API error: {response.status_code}")
                
                data = response.json()
                content = data.get("response", "Unable to generate response.")
                logger.info(f"Ollama generated content length: {len(content) if content else 0}")
            except httpx.TimeoutException:
                logger.error(f"Ollama request timed out after {self.timeout}s")
                raise Exception(f"Ollama request timed out")
            except httpx.ConnectError as e:
                logger.error(f"Cannot connect to Ollama at {self.ollama_base_url}: {e}")
                raise Exception(f"Cannot connect to Ollama: {e}")
            except Exception as e:
                logger.error(f"Unexpected error calling Ollama: {type(e).__name__}: {e}")
                raise
            
            # Remove any Turkish disclaimers and text that might have been generated
            import re
            turkish_disclaimer_patterns = [
                r'İlaç bilgileri sadece bilgilendirme amaçlıdır[^\n]*',
                r'İlaç kullanımı konusunda[^\n]*doktorunuza danışın[^\n]*',
                r'kullanımı konusunda mutlaka[^\n]*doktorunuza danışın[^\n]*',
                r'Bu bilgiler sadece genel[^\n]*',
                r'sağlık profesyoneli[^\n]*görüşün[^\n]*',
                r'ACİL DURUM TESPİT EDİLDİ[^\n]*',
                r'Derhal 112[^\n]*arayın[^\n]*',
                r'Derhal[^\n]*112[^\n]*',
            ]
            
            for pattern in turkish_disclaimer_patterns:
                content = re.sub(pattern, '', content, flags=re.IGNORECASE | re.MULTILINE)
            
            # Clean up extra newlines and whitespace
            content = re.sub(r'\n{3,}', '\n\n', content)
            content = re.sub(r'[ \t]+', ' ', content)
            content = content.strip()
            
            # Don't add disclaimer automatically - let safety filter handle it
            # Only add if response doesn't already have one
            if "⚠️" not in content and "This information is for general" not in content:
                # Safety filter will add appropriate disclaimer if needed
                pass
            
            return AIResponse(
                content=content,
                confidence=0.8,
                requires_disclaimer=True,
                emergency_detected=False,
                health_data_used=self._get_health_data_references(None),
                suggested_actions=[
                    "Consult your doctor",
                    "Monitor your symptoms",
                    "Schedule regular checkups"
                ]
            )
    
    async def _generate_mock_response(self, message: str, health_context: HealthContext = None) -> AIResponse:
        """
        Generate mock response for development/testing
        """
        # Simulate API delay
        import asyncio
        await asyncio.sleep(1)
        
        lower_message = message.lower()
        content = ""
        health_data_used = []
        
        # Generate contextual response based on message content
        if "medication" in lower_message:
            if health_context and health_context.current_medications:
                med_names = [med.name for med in health_context.current_medications[:3]]
                content = f"Your current medications: {', '.join(med_names)}. For questions about your medications, please consult your doctor."
                health_data_used.append("medications")
            else:
                content = "No medication information is recorded in the system. Please consult your doctor regarding medication use."
        
        elif "fever" in lower_message or "temperature" in lower_message:
            if health_context and any(vital.type == "temperature" for vital in health_context.recent_vitals):
                temp_vitals = [v for v in health_context.recent_vitals if v.type == "temperature"]
                if temp_vitals:
                    last_temp = temp_vitals[0]
                    content = f"Your last temperature reading: {last_temp.value}°C ({last_temp.date}). If your temperature is above 38°C, please consult your doctor."
                    health_data_used.append("temperature")
            else:
                content = "I recommend taking your temperature. If it's above 38°C, please consult your doctor."
        
        elif "blood pressure" in lower_message or "pressure" in lower_message:
            if health_context and any(vital.type == "blood_pressure" for vital in health_context.recent_vitals):
                bp_vitals = [v for v in health_context.recent_vitals if v.type == "blood_pressure"]
                if bp_vitals:
                    last_bp = bp_vitals[0]
                    content = f"Your last blood pressure reading: {last_bp.value} mmHg ({last_bp.date}). Normal values are around 120/80 mmHg."
                    health_data_used.append("blood_pressure")
            else:
                content = "I recommend taking your blood pressure. Regular monitoring is important."
        
        elif "symptom" in lower_message:
            if health_context and health_context.recent_symptoms:
                symptom_names = [s.name for s in health_context.recent_symptoms[:3]]
                content = f"Your recent symptoms: {', '.join(symptom_names)}. If your symptoms persist, please consult your doctor."
                health_data_used.append("symptoms")
            else:
                content = "No symptom information is recorded in the system. If you have any concerns, please consult your doctor."
        
        elif "stomach" in lower_message or "belly" in lower_message or ("hurt" in lower_message and ("stomach" in lower_message or "belly" in lower_message)):
            content = "I understand you're experiencing stomach discomfort. Common causes include indigestion, food sensitivity, or stress. If the pain is severe, persistent, or accompanied by other symptoms like fever or vomiting, please consult your doctor. For mild discomfort, try resting, staying hydrated, and avoiding heavy meals."
            health_data_used.append("symptoms")
        
        elif "hello" in lower_message or "hi" in lower_message or "selam" in lower_message or "merhaba" in lower_message:
            content = "Hello! I'm here to help with your health questions. How can I assist you today? You can ask me about symptoms, medications, or general health information. Remember, I provide general information only - always consult a healthcare professional for medical diagnosis and treatment."
        
        elif "hurt" in lower_message or "pain" in lower_message or "ache" in lower_message:
            content = "I understand you're experiencing discomfort. To better help you, could you provide more details about: (1) Where exactly does it hurt? (2) How long have you been experiencing this? (3) Is the pain mild, moderate, or severe? (4) Are there any other symptoms? If the pain is severe or sudden, please seek immediate medical attention."
            health_data_used.append("symptoms")
        
        else:
            # General health advice
            content = "I'm here to help with your health questions. However, for accurate diagnosis and treatment, always consult a healthcare professional. Could you provide more details about what you'd like to know?"
        
        # Don't add disclaimer automatically - safety filter will handle it if needed
        # Only add if it's a critical response
        is_emergency = "emergency" in lower_message or "911" in lower_message or ("call" in lower_message and "immediately" in lower_message)
        
        return AIResponse(
            content=content,
            confidence=0.7,
            requires_disclaimer=is_emergency,  # Only require disclaimer for emergencies
            emergency_detected=is_emergency,
            health_data_used=health_data_used,
            suggested_actions=[
                "Consult your doctor",
                "Monitor your symptoms",
                "Schedule regular checkups"
            ],
            follow_up_questions=[
                "Do you have any other questions?",
                "Can you provide more information about your symptoms?"
            ]
        )
    
    async def check_medication_interactions(self, medications: List[str]) -> List[InteractionWarning]:
        """
        Check for medication interactions
        """
        if len(medications) < 2:
            return []
        
        # Mock interaction database - in real implementation, this would query a drug database
        known_interactions = [
            {
                "drugs": ["aspirin", "warfarin"],
                "severity": "severe",
                "description": "May increase bleeding risk",
                "recommendation": "Consult your doctor, dose adjustment may be needed"
            },
            {
                "drugs": ["metformin", "alcohol"],
                "severity": "moderate",
                "description": "May increase lactic acidosis risk",
                "recommendation": "Limit alcohol consumption"
            },
            {
                "drugs": ["simvastatin", "amlodipine"],
                "severity": "mild",
                "description": "May increase muscle pain risk",
                "recommendation": "Inform your doctor if you experience muscle pain"
            }
        ]
        
        interactions = []
        
        # Check all medication pairs
        for i in range(len(medications)):
            for j in range(i + 1, len(medications)):
                med1 = medications[i].lower()
                med2 = medications[j].lower()
                
                # Check against known interactions
                for interaction in known_interactions:
                    if (any(drug in med1 for drug in interaction["drugs"]) and 
                        any(drug in med2 for drug in interaction["drugs"])):
                        interactions.append(InteractionWarning(
                            medication_a=medications[i],
                            medication_b=medications[j],
                            severity=interaction["severity"],
                            description=interaction["description"],
                            recommendation=interaction["recommendation"]
                        ))
        
        return interactions
    
    async def check_ollama_status(self) -> OllamaStatus:
        """
        Check if Ollama service is available
        """
        try:
            async with httpx.AsyncClient(timeout=5.0) as client:
                response = await client.get(f"{self.ollama_base_url}/api/tags")
                
                if response.status_code == 200:
                    data = response.json()
                    models = data.get("models", [])
                    available_model = None
                    
                    # Check if our preferred model is available
                    for model in models:
                        if model.get("name", "").startswith(self.model):
                            available_model = model.get("name")
                            break
                    
                    return OllamaStatus(
                        status="healthy",
                        available=True,
                        model=available_model or self.model,
                        message="Ollama service is running"
                    )
                else:
                    return OllamaStatus(
                        status="error",
                        available=False,
                        message=f"Ollama API returned status {response.status_code}"
                    )
                    
        except Exception as e:
            return OllamaStatus(
                status="error",
                available=False,
                message=f"Cannot connect to Ollama: {str(e)}"
            )
    
    def _build_medical_prompt(self, message: str, health_context: HealthContext = None) -> str:
        """
        Build medical prompt with health context
        """
        prompt = f"User question: {message}\n\n"
        
        if health_context:
            # Add health context
            if health_context.current_medications:
                meds = [f"{med.name} ({med.dosage})" for med in health_context.current_medications[:5]]
                prompt += f"Current medications: {', '.join(meds)}\n"
            
            if health_context.chronic_conditions:
                prompt += f"Chronic conditions: {', '.join(health_context.chronic_conditions)}\n"
            
            if health_context.allergies:
                prompt += f"Allergies: {', '.join(health_context.allergies)}\n"
            
            if health_context.recent_symptoms:
                symptoms = [s.name for s in health_context.recent_symptoms[:3]]
                prompt += f"Recent symptoms: {', '.join(symptoms)}\n"
        
        prompt += "\nProvide a safe, helpful, and medically appropriate response in English. Do not diagnose, do not prescribe medications, and always recommend consulting a healthcare professional. Respond only in English."
        
        return prompt
    
    def _get_health_data_references(self, health_context: HealthContext = None) -> List[str]:
        """
        Get health data references used in response
        """
        references = []
        
        if health_context:
            if health_context.current_medications:
                references.append("medications")
            if health_context.recent_vitals:
                references.append("vitals")
            if health_context.recent_symptoms:
                references.append("symptoms")
            if health_context.chronic_conditions:
                references.append("chronic_conditions")
            if health_context.allergies:
                references.append("allergies")
        
        return references