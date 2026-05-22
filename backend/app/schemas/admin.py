from pydantic import BaseModel

from app.models.user import UserRole


class AdminDashboardResponse(BaseModel):
    total_users: int
    total_resumes: int
    total_jobs: int
    open_recommendations: int


class AdminUserResponse(BaseModel):
    id: str
    email: str
    full_name: str | None = None
    role: UserRole
    created_at: str
    updated_at: str | None = None
    last_login_at: str | None = None
    login_count: int = 0
    resume_count: int = 0
    job_count: int = 0


class AdminAuditEventResponse(BaseModel):
    id: str
    user_id: str
    email: str
    full_name: str | None = None
    role: UserRole
    event_type: str
    created_at: str


class AdminUserActivityItem(BaseModel):
    id: str
    type: str
    title: str
    detail: str | None = None
    created_at: str


class AdminUserDocumentResponse(BaseModel):
    id: str
    filename: str
    created_at: str
    skills: list[str] = []


class AdminUserDetailResponse(BaseModel):
    user: AdminUserResponse
    resumes: list[AdminUserDocumentResponse]
    jobs: list[AdminUserDocumentResponse]
    audit_events: list[AdminAuditEventResponse]
    activity: list[AdminUserActivityItem]
