"""
Medical Chatbot Python Backend
FastAPI server that provides AI-powered medical chatbot functionality
"""

from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
import uvicorn
import os
from datetime import datetime
import logging

from services.ai_service import AIService
from services.emergency_detector import EmergencyDetector
from services.safety_filter import SafetyFilter
from models.chat_models import (
    ChatMessage, 
    HealthContext, 
    AIResponse, 
    EmergencyAssessment,
    InteractionWarning,
    ChatRequest,
    ChatResponse
)

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize FastAPI app
app = FastAPI(
    title="Medical Chatbot API",
    description="AI-powered medical chatbot backend service",
    version="1.0.0"
)

# Configure CORS for React Native
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify your React Native app's origin
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Security
security = HTTPBearer(auto_error=False)  # Don't auto-error on missing auth for testing

# Initialize services
ai_service = AIService()
emergency_detector = EmergencyDetector()
safety_filter = SafetyFilter()

# Health check endpoint
@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "timestamp": datetime.utcnow().isoformat(),
        "service": "medical-chatbot-backend"
    }

# Chat endpoint
@app.post("/api/chat", response_model=ChatResponse)
async def chat(
    request: ChatRequest,
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    """
    Process chat message and return AI response
    """
    try:
        logger.info(f"Processing chat request for user: {request.user_id}")
        logger.info(f"Message length: {len(request.message)}")
        logger.info(f"Health context provided: {request.health_context is not None}")
        
        # Temporary: Skip auth validation for testing
        if credentials:
            logger.info(f"Received auth token: {credentials.credentials[:20]}...")
        else:
            logger.warning("No auth token provided, continuing anyway for testing")
        
        # Validate request
        if not request.message.strip():
            raise HTTPException(status_code=400, detail="Message cannot be empty")
        
        # Check for emergency first
        emergency_assessment = await emergency_detector.detect_emergency(request.message)
        
        if emergency_assessment.is_emergency:
            logger.warning(f"Emergency detected for user {request.user_id}: {emergency_assessment.severity}")
            
            # Return emergency response immediately
            emergency_action = emergency_assessment.recommended_actions[0] if emergency_assessment.recommended_actions else "Call 911 immediately!"
            emergency_response = AIResponse(
                content=f"🚨 EMERGENCY DETECTED!\n\n{emergency_action}\n\n⚠️ This information is for general purposes only. Always consult a healthcare professional for medical diagnosis and treatment.",
                confidence=0.9,
                requires_disclaimer=True,
                emergency_detected=True,
                health_data_used=[],
                suggested_actions=emergency_assessment.recommended_actions,
                follow_up_questions=[]
            )
            
            return ChatResponse(
                response=emergency_response,
                emergency_assessment=emergency_assessment,
                processing_time_ms=100
            )
        
        # Generate AI response
        start_time = datetime.utcnow()
        ai_response = await ai_service.generate_response(request.message, request.health_context)
        end_time = datetime.utcnow()
        
        processing_time = int((end_time - start_time).total_seconds() * 1000)
        
        logger.info(f"AI response generated - content length: {len(ai_response.content) if ai_response.content else 0}")
        logger.info(f"AI response preview: {ai_response.content[:100] if ai_response.content else 'NO CONTENT'}...")
        
        # Apply safety filter
        filtered_response = safety_filter.filter_response(ai_response, request.message)
        
        logger.info(f"Filtered response - content length: {len(filtered_response.content) if filtered_response.content else 0}")
        logger.info(f"Filtered response preview: {filtered_response.content[:100] if filtered_response.content else 'NO CONTENT'}...")
        logger.info(f"Generated response for user {request.user_id} in {processing_time}ms")
        
        return ChatResponse(
            response=filtered_response,
            emergency_assessment=emergency_assessment,
            processing_time_ms=processing_time
        )
        
    except Exception as e:
        logger.error(f"Error processing chat request: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

# Emergency detection endpoint
class EmergencyRequest(BaseModel):
    message: str

@app.post("/api/emergency/detect", response_model=EmergencyAssessment)
async def detect_emergency(
    request: EmergencyRequest,
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    """
    Detect emergency situations in a message
    """
    try:
        # Temporary: Skip auth validation for testing
        if credentials:
            logger.info(f"Emergency detection with auth token: {credentials.credentials[:20]}...")
        else:
            logger.warning("No auth token provided for emergency detection, continuing anyway")
            
        assessment = await emergency_detector.detect_emergency(request.message)
        return assessment
    except Exception as e:
        logger.error(f"Error detecting emergency: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Emergency detection failed: {str(e)}")

# Medication interaction check endpoint
class MedicationRequest(BaseModel):
    medications: List[str]

@app.post("/api/medications/interactions", response_model=List[InteractionWarning])
async def check_medication_interactions(
    request: MedicationRequest,
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    """
    Check for medication interactions
    """
    try:
        # Temporary: Skip auth validation for testing
        if credentials:
            logger.info(f"Medication check with auth token: {credentials.credentials[:20]}...")
        else:
            logger.warning("No auth token provided for medication check, continuing anyway")
            
        interactions = await ai_service.check_medication_interactions(request.medications)
        return interactions
    except Exception as e:
        logger.error(f"Error checking medication interactions: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Medication interaction check failed: {str(e)}")

# Ollama status endpoint
@app.get("/api/ollama/status")
async def ollama_status():
    """
    Check Ollama service status
    """
    try:
        status = await ai_service.check_ollama_status()
        return status
    except Exception as e:
        logger.error(f"Error checking Ollama status: {str(e)}")
        return {
            "status": "error",
            "message": str(e),
            "available": False
        }

if __name__ == "__main__":
    port = int(os.getenv("PORT", 8000))
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=port,
        reload=True,
        log_level="info"
    )