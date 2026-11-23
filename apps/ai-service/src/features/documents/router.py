"""
Document Processing Router for AI Service — Future-proof /documents/process endpoint.
"""
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from src.services.document_processor import DocumentProcessor

router = APIRouter()


class ProcessDocumentRequest(BaseModel):
    filePath: str
    mimeType: str
    extension: str


@router.post("/documents/process")
async def process_document(payload: ProcessDocumentRequest):
    """
    Process document text extraction and compute structural & linguistic statistics.
    """
    try:
        result = DocumentProcessor.extract_text(
            file_path=payload.filePath,
            mime_type=payload.mimeType,
            extension=payload.extension,
        )
        return {
            "success": True,
            "data": result,
        }
    except FileNotFoundError as fnf:
        raise HTTPException(status_code=404, detail=str(fnf))
    except ValueError as ve:
        raise HTTPException(status_code=400, detail=str(ve))
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Document extraction failed: {str(exc)}")
