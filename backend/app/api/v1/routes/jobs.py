from fastapi import APIRouter, Depends, File, UploadFile

from motor.motor_asyncio import AsyncIOMotorDatabase

from app.dependencies import get_db, get_current_user, require_roles
from app.models.user import UserRole
from app.schemas.job import JobParseResponse
from app.services.job_service import parse_job_description_file
from app.schemas.job_listing import JobListingResponse
from app.repositories.document_repository import list_jobs


router = APIRouter()


@router.post("/upload", response_model=JobParseResponse)
async def upload_job_description(
    file: UploadFile = File(...),
    db: AsyncIOMotorDatabase = Depends(get_db),
    current_user=Depends(require_roles(UserRole.admin, UserRole.recruiter)),
) -> JobParseResponse:
    parsed = await parse_job_description_file(file, db, user_id=current_user.id)
    return JobParseResponse(**parsed)


@router.get("", response_model=list[JobListingResponse])
async def get_jobs(
    db: AsyncIOMotorDatabase = Depends(get_db),
    current_user=Depends(require_roles(UserRole.admin, UserRole.recruiter, UserRole.candidate)),
) -> list[JobListingResponse]:
    jobs = await list_jobs(db)
    return [JobListingResponse(**job.model_dump()) for job in jobs]
