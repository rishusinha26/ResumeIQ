from fastapi import APIRouter, Depends, HTTPException, status

from motor.motor_asyncio import AsyncIOMotorDatabase

from app.dependencies import get_db, require_roles
from app.models.user import UserRole
from app.repositories.document_repository import (
    count_jobs_for_user,
    count_resumes_for_user,
    list_jobs,
    list_jobs_for_user,
    list_resumes_for_user,
)
from app.repositories.user_repository import list_login_events, list_login_events_for_user, list_users, list_users_by_role
from app.schemas.admin import (
    AdminAuditEventResponse,
    AdminDashboardResponse,
    AdminUserActivityItem,
    AdminUserDetailResponse,
    AdminUserDocumentResponse,
    AdminUserResponse,
)


router = APIRouter()


@router.get("/dashboard", response_model=AdminDashboardResponse)
async def dashboard(
    db: AsyncIOMotorDatabase = Depends(get_db),
    current_user=Depends(require_roles(UserRole.admin)),
) -> AdminDashboardResponse:
    users = await list_users_by_role(db, UserRole.candidate)
    jobs = await list_jobs(db)
    total_resumes = await db["resumes"].count_documents({})
    return AdminDashboardResponse(
        total_users=len(users),
        total_resumes=total_resumes,
        total_jobs=len(jobs),
        open_recommendations=0,
    )


@router.get("/users", response_model=list[AdminUserResponse])
async def users(
    db: AsyncIOMotorDatabase = Depends(get_db),
    current_user=Depends(require_roles(UserRole.admin)),
) -> list[AdminUserResponse]:
    records = await list_users(db)
    summaries: list[AdminUserResponse] = []
    for record in records:
        resume_count = await count_resumes_for_user(db, record.id)
        job_count = await count_jobs_for_user(db, record.id)
        summaries.append(
            AdminUserResponse(
                id=record.id,
                email=record.email,
                full_name=record.full_name,
                role=record.role,
                created_at=record.created_at.isoformat(),
                updated_at=record.updated_at.isoformat() if record.updated_at else None,
                last_login_at=record.last_login_at.isoformat() if record.last_login_at else None,
                login_count=record.login_count,
                resume_count=resume_count,
                job_count=job_count,
            )
        )
    return summaries


@router.get("/audit-log", response_model=list[AdminAuditEventResponse])
async def audit_log(
    db: AsyncIOMotorDatabase = Depends(get_db),
    current_user=Depends(require_roles(UserRole.admin)),
) -> list[AdminAuditEventResponse]:
    events = await list_login_events(db, limit=250)
    return [
        AdminAuditEventResponse(
            id=event.id or "",
            user_id=event.user_id,
            email=event.email,
            full_name=event.full_name,
            role=event.role,
            event_type=event.event_type,
            created_at=event.created_at.isoformat(),
        )
        for event in events
    ]


@router.get("/users/{user_id}", response_model=AdminUserDetailResponse)
async def user_detail(
    user_id: str,
    db: AsyncIOMotorDatabase = Depends(get_db),
    current_user=Depends(require_roles(UserRole.admin)),
) -> AdminUserDetailResponse:
    records = await list_users(db)
    target = next((record for record in records if record.id == user_id), None)
    if target is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    resumes = await list_resumes_for_user(db, user_id)
    jobs = await list_jobs_for_user(db, user_id)
    events = await list_login_events_for_user(db, user_id)

    activity: list[AdminUserActivityItem] = []
    for resume in resumes:
        activity.append(
            AdminUserActivityItem(
                id=f"resume-{resume.id}",
                type="resume",
                title=f"Uploaded resume {resume.filename}",
                detail=f"Skills detected: {len(resume.skills)}",
                created_at=resume.created_at.isoformat(),
            )
        )
    for job in jobs:
        activity.append(
            AdminUserActivityItem(
                id=f"job-{job.id}",
                type="job",
                title=f"Posted job {job.filename}",
                detail=f"Skills requested: {len(job.skills)}",
                created_at=job.created_at.isoformat(),
            )
        )
    for event in events:
        activity.append(
            AdminUserActivityItem(
                id=event.id or f"login-{event.created_at.isoformat()}",
                type="login",
                title="Logged into platform",
                detail=event.email,
                created_at=event.created_at.isoformat(),
            )
        )
    activity.sort(key=lambda item: item.created_at, reverse=True)

    return AdminUserDetailResponse(
        user=AdminUserResponse(
            id=target.id,
            email=target.email,
            full_name=target.full_name,
            role=target.role,
            created_at=target.created_at.isoformat(),
            updated_at=target.updated_at.isoformat() if target.updated_at else None,
            last_login_at=target.last_login_at.isoformat() if target.last_login_at else None,
            login_count=target.login_count,
            resume_count=await count_resumes_for_user(db, target.id),
            job_count=await count_jobs_for_user(db, target.id),
        ),
        resumes=[
            AdminUserDocumentResponse(
                id=resume.id or "",
                filename=resume.filename,
                created_at=resume.created_at.isoformat(),
                skills=resume.skills,
            )
            for resume in resumes
        ],
        jobs=[
            AdminUserDocumentResponse(
                id=job.id or "",
                filename=job.filename,
                created_at=job.created_at.isoformat(),
                skills=job.skills,
            )
            for job in jobs
        ],
        audit_events=[
            AdminAuditEventResponse(
                id=event.id or "",
                user_id=event.user_id,
                email=event.email,
                full_name=event.full_name,
                role=event.role,
                event_type=event.event_type,
                created_at=event.created_at.isoformat(),
            )
            for event in events
        ],
        activity=activity,
    )
