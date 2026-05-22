from fastapi import APIRouter, Depends, File, UploadFile

from motor.motor_asyncio import AsyncIOMotorDatabase

from app.dependencies import get_current_user, get_db, require_roles
from app.models.user import UserRole
from app.repositories.document_repository import list_resumes
from app.schemas.resume import ResumeListItem, ResumeParseResponse, ResumeUploadResponse
from app.services.resume_service import parse_resume_file


router = APIRouter()


@router.get("", response_model=list[ResumeListItem])
async def get_resumes(
    db: AsyncIOMotorDatabase = Depends(get_db),
    current_user=Depends(require_roles(UserRole.admin, UserRole.recruiter)),
) -> list[ResumeListItem]:
    resumes = await list_resumes(db)
    return [ResumeListItem(**resume.model_dump()) for resume in resumes]


@router.post("/upload", response_model=ResumeUploadResponse)
async def upload_resume(
    file: UploadFile = File(...),
    db: AsyncIOMotorDatabase = Depends(get_db),
    current_user=Depends(get_current_user),
) -> ResumeUploadResponse:
    parsed = await parse_resume_file(file, db, user_id=current_user.id)
    return ResumeUploadResponse(
        filename=parsed["filename"],
        file_path=str(parsed["stored_path"]),
        extracted_text=str(parsed["text"]),
        upload_status=str(parsed["upload_status"]),
    )


@router.post("/parse", response_model=ResumeParseResponse)
async def parse_resume(file: UploadFile = File(...), db: AsyncIOMotorDatabase = Depends(get_db)) -> ResumeParseResponse:
    parsed = await parse_resume_file(file, db)
    return ResumeParseResponse(
        filename=str(parsed["filename"]),
        text=str(parsed["text"]),
        name=parsed.get("name"),
        email=parsed.get("email"),
        phone=parsed.get("phone"),
        skills=list(parsed.get("skills", [])),
        synonyms_used=dict(parsed.get("synonyms_used", {})),
        education=list(parsed.get("education", [])),
        experience=list(parsed.get("experience", [])),
        certifications=list(parsed.get("certifications", [])),
        entities=dict(parsed.get("entities", {})),
    )
