import uuid
from typing import Dict, List, Any
from fastapi import APIRouter, Depends, Query, UploadFile, File, Form, status
from backend.schemas.schemas import APIResponse
from backend.copilot.services.copilot_service import CopilotService
from backend.auth.dependencies import verify_read_access
from backend.models.user import User

router = APIRouter(prefix="/copilot", tags=["AI Conversational Copilot & Vision"])

# Instantiate Copilot Service
copilot_service = CopilotService()

@router.post("/chat", response_model=APIResponse[dict])
def chat_with_assistant(
    query: str = Query(...),
    language: str = Query("en"),
    current_user: User = Depends(verify_read_access)
):
    """
    Handles natural language queries in English, Hindi, Tamil, Telugu, Malayalam, and Kannada.
    """
    res = copilot_service.process_chat_query(query, language)
    return APIResponse(success=True, message="Chat response generated.", data=res)

@router.post("/voice", response_model=APIResponse[dict])
def spoken_voice_commands(
    query: str = Query(...),
    language: str = Query("en"),
    current_user: User = Depends(verify_read_access)
):
    """
    Receives transcribed voice queries and triggers matching GIS dashboard filters.
    """
    res = copilot_service.process_chat_query(query, language)
    return APIResponse(success=True, message="Voice command processed.", data=res)

@router.post("/ocr", response_model=APIResponse[dict])
def upload_medicine_label(
    file: UploadFile = File(...),
    hospital_id: uuid.UUID = Query(...),
    current_user: User = Depends(verify_read_access)
):
    """
    Uploads label images, extracts parameters, and matches against the master database.
    """
    # Simple validation rules
    if not file.filename.lower().endswith(('.png', '.jpg', '.jpeg')):
        return APIResponse(success=False, message="Invalid file format. Only JPEG or PNG supported.", data={})

    res = copilot_service.process_ocr_scan(file.filename, str(hospital_id))
    return APIResponse(success=True, message="OCR medicine label scanned.", data=res)

@router.post("/inventory-scan", response_model=APIResponse[dict])
def upload_shelf_scan(
    file: UploadFile = File(...),
    hospital_id: uuid.UUID = Query(...),
    current_user: User = Depends(verify_read_access)
):
    """
    Scans shelf stock images to count boxes and generate discrepancy suggestion lists.
    """
    if not file.filename.lower().endswith(('.png', '.jpg', '.jpeg')):
        return APIResponse(success=False, message="Invalid file format.", data={})

    res = copilot_service.process_ocr_scan(file.filename, str(hospital_id))
    return APIResponse(success=True, message="Shelf scanning audit complete.", data=res)

@router.get("/history", response_model=APIResponse[list])
def get_conversational_logs(
    current_user: User = Depends(verify_read_access)
):
    """
    Retrieves searchable conversation records.
    """
    return APIResponse(
        success=True,
        message="Conversation history retrieved.",
        data=copilot_service.chat_history
    )

@router.get("/languages", response_model=APIResponse[list])
def get_supported_languages(
    current_user: User = Depends(verify_read_access)
):
    """
    Returns mappings of supported dialects.
    """
    langs = [
        {"code": "en", "label": "English"},
        {"code": "hi", "label": "Hindi (हिन्दी)"},
        {"code": "ta", "label": "Tamil (தமிழ்)"},
        {"code": "te", "label": "Telugu (తెలుగు)"},
        {"code": "ml", "label": "Malayalam (മലയാളം)"},
        {"code": "kn", "label": "Kannada (ಕನ್ನಡ)"}
    ]
    return APIResponse(success=True, message="Languages retrieved.", data=langs)

@router.post("/translate", response_model=APIResponse[dict])
def translate_context(
    text: str = Query(...),
    target_lang: str = Query("hi"),
    current_user: User = Depends(verify_read_access)
):
    """
    Translates text dynamically.
    """
    translated = copilot_service.translator.translate(text, target_lang)
    return APIResponse(
        success=True,
        message="Translation complete.",
        data={"original": text, "translated": translated}
    )
