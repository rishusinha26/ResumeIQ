from datetime import datetime

from pydantic import BaseModel


class ResumeListItem(BaseModel):
    id: str
    filename: str
    name: str | None = None
    email: str | None = None
    skills: list[str]
    created_at: datetime


class ResumeUploadResponse(BaseModel):
    filename: str
    file_path: str
    extracted_text: str
    upload_status: str


class ResumeMetadataResponse(BaseModel):
    id: str | None = None
    original_filename: str
    stored_path: str
    file_size_bytes: int
    mime_type: str | None = None
    upload_status: str
    text: str
    name: str | None = None
    email: str | None = None
    phone: str | None = None
    skills: list[str]
    synonyms_used: dict[str, str]
    education: list[str]
    experience: list[str]
    certifications: list[str]
    entities: dict[str, list[str]]


class ResumeParseResponse(BaseModel):
    filename: str
    text: str
    name: str | None = None
    email: str | None = None
    phone: str | None = None
    skills: list[str]
    synonyms_used: dict[str, str]
    education: list[str]
    experience: list[str]
    certifications: list[str]
    entities: dict[str, list[str]]
