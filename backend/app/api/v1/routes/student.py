from fastapi import APIRouter, Depends, File, HTTPException, Query, UploadFile, status

from motor.motor_asyncio import AsyncIOMotorDatabase

from app.dependencies import get_current_user, get_db, require_roles
from app.models.user import UserRole
from app.repositories.document_repository import (
    get_job_by_id,
    get_latest_resume_for_user,
    list_jobs,
)
from app.schemas.job_listing import JobListingResponse
from app.schemas.resume import ResumeUploadResponse
from app.schemas.student import (
    JobATSAnalysis,
    StudentATSReportResponse,
    StudentJobMatchesResponse,
    StudentResumeResponse,
    SuggestedRole,
    SuggestedRolesResponse,
)
from app.services.ats_analysis_service import analyze_resume_for_job, suggest_roles_from_resume
from app.services.resume_service import parse_resume_file


router = APIRouter()


async def _require_student_resume(db: AsyncIOMotorDatabase, user_id: str):
    resume = await get_latest_resume_for_user(db, user_id)
    if resume is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Upload your resume first to see ATS scores and job matches.",
        )
    return resume


@router.get("/resume", response_model=StudentResumeResponse | None)
async def get_my_resume(
    db: AsyncIOMotorDatabase = Depends(get_db),
    current_user=Depends(require_roles(UserRole.candidate)),
) -> StudentResumeResponse | None:
    resume = await get_latest_resume_for_user(db, current_user.id or "")
    if resume is None:
        return None
    return StudentResumeResponse(
        id=resume.id or "",
        filename=resume.filename,
        name=resume.name,
        email=resume.email,
        skills=resume.skills,
        created_at=resume.created_at.isoformat(),
    )


@router.post("/resume/upload", response_model=ResumeUploadResponse)
async def upload_my_resume(
    file: UploadFile = File(...),
    db: AsyncIOMotorDatabase = Depends(get_db),
    current_user=Depends(require_roles(UserRole.candidate)),
) -> ResumeUploadResponse:
    parsed = await parse_resume_file(file, db, user_id=current_user.id)
    return ResumeUploadResponse(
        filename=parsed["filename"],
        file_path=str(parsed["stored_path"]),
        extracted_text=str(parsed["text"]),
        upload_status=str(parsed["upload_status"]),
    )


@router.get("/jobs", response_model=list[JobListingResponse])
async def list_open_jobs(
    db: AsyncIOMotorDatabase = Depends(get_db),
    current_user=Depends(require_roles(UserRole.candidate)),
) -> list[JobListingResponse]:
    jobs = await list_jobs(db)
    return [JobListingResponse(**job.model_dump()) for job in jobs]


@router.get("/analyze", response_model=StudentATSReportResponse)
async def analyze_for_job(
    job_id: str = Query(..., description="Job ID to compare your resume against"),
    db: AsyncIOMotorDatabase = Depends(get_db),
    current_user=Depends(require_roles(UserRole.candidate)),
) -> StudentATSReportResponse:
    resume = await _require_student_resume(db, current_user.id or "")
    job = await get_job_by_id(db, job_id)
    if job is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Job not found.")
    analysis = await analyze_resume_for_job(db, resume, job)
    return StudentATSReportResponse(
        resume_id=resume.id or "",
        analysis=JobATSAnalysis(**analysis),
    )


@router.get("/job-matches", response_model=StudentJobMatchesResponse)
async def analyze_all_jobs(
    db: AsyncIOMotorDatabase = Depends(get_db),
    current_user=Depends(require_roles(UserRole.candidate)),
) -> StudentJobMatchesResponse:
    resume = await _require_student_resume(db, current_user.id or "")
    jobs = await list_jobs(db)
    matches: list[JobATSAnalysis] = []
    for job_summary in jobs:
        job = await get_job_by_id(db, job_summary.id)
        if job is None:
            continue
        analysis = await analyze_resume_for_job(db, resume, job)
        matches.append(JobATSAnalysis(**analysis))
    matches.sort(key=lambda item: item.ats_score, reverse=True)
    return StudentJobMatchesResponse(resume_id=resume.id or "", matches=matches)


@router.get("/suggested-roles", response_model=SuggestedRolesResponse)
async def suggested_roles(
    db: AsyncIOMotorDatabase = Depends(get_db),
    current_user=Depends(require_roles(UserRole.candidate)),
) -> SuggestedRolesResponse:
    resume = await _require_student_resume(db, current_user.id or "")
    roles = suggest_roles_from_resume(resume)
    return SuggestedRolesResponse(
        resume_id=resume.id or "",
        roles=[SuggestedRole(**role) for role in roles],
    )
