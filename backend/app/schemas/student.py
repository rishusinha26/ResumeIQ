from pydantic import BaseModel, Field


class JobATSAnalysis(BaseModel):
    job_id: str
    job_title: str
    ats_score: float = Field(ge=0, le=100)
    keyword_match_percent: float = Field(ge=0, le=100)
    similarity_score: float = Field(ge=0, le=100)
    suitability: str
    missing_keywords: list[str]
    matched_keywords: list[str]
    job_skills: list[str] = Field(default_factory=list)


class SuggestedRole(BaseModel):
    role_title: str
    confidence: float
    reason: str
    matched_skills: list[str] = Field(default_factory=list)


class StudentResumeResponse(BaseModel):
    id: str
    filename: str
    name: str | None = None
    email: str | None = None
    skills: list[str]
    created_at: str


class StudentATSReportResponse(BaseModel):
    resume_id: str
    analysis: JobATSAnalysis


class StudentJobMatchesResponse(BaseModel):
    resume_id: str
    matches: list[JobATSAnalysis]


class SuggestedRolesResponse(BaseModel):
    resume_id: str
    roles: list[SuggestedRole]
