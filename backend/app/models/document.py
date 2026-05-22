from datetime import datetime

from pydantic import BaseModel, Field


class ResumeDocument(BaseModel):
    id: str | None = None
    user_id: str | None = None
    original_filename: str
    stored_path: str
    file_size_bytes: int
    mime_type: str | None = None
    upload_status: str = Field(default="uploaded")
    filename: str
    text: str
    name: str | None = None
    email: str | None = None
    phone: str | None = None
    skills: list[str] = Field(default_factory=list)
    synonyms_used: dict[str, str] = Field(default_factory=dict)
    education: list[str] = Field(default_factory=list)
    experience: list[str] = Field(default_factory=list)
    certifications: list[str] = Field(default_factory=list)
    entities: dict[str, list[str]] = Field(default_factory=dict)
    created_at: datetime = Field(default_factory=datetime.utcnow)


class SkillExtractionDocument(BaseModel):
    id: str | None = None
    resume_id: str | None = None
    source_filename: str
    extracted_skills: list[str] = Field(default_factory=list)
    synonyms_used: dict[str, str] = Field(default_factory=dict)
    created_at: datetime = Field(default_factory=datetime.utcnow)


class JobDocument(BaseModel):
    id: str | None = None
    user_id: str | None = None
    filename: str
    text: str
    skills: list[str] = Field(default_factory=list)
    created_at: datetime = Field(default_factory=datetime.utcnow)


class CandidateSummary(BaseModel):
    id: str
    email: str
    full_name: str | None = None
    role: str
    resume_count: int = 0
    created_at: datetime


class JobSummary(BaseModel):
    id: str
    filename: str
    skills: list[str] = Field(default_factory=list)
    created_at: datetime
    user_id: str | None = None


class ResumeSummary(BaseModel):
    id: str
    filename: str
    name: str | None = None
    email: str | None = None
    skills: list[str] = Field(default_factory=list)
    created_at: datetime
    user_id: str | None = None


class EmbeddingDocument(BaseModel):
    id: str | None = None
    source_type: str
    source_id: str | None = None
    source_filename: str
    model_name: str
    vector: list[float] = Field(default_factory=list)
    vector_size: int
    created_at: datetime = Field(default_factory=datetime.utcnow)
