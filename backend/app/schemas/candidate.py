from datetime import datetime

from pydantic import BaseModel, EmailStr


class CandidateResponse(BaseModel):
    id: str
    email: EmailStr
    full_name: str | None = None
    role: str
    resume_count: int
    created_at: datetime
