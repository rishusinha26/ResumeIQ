from datetime import datetime

from pydantic import BaseModel


class JobListingResponse(BaseModel):
    id: str
    filename: str
    skills: list[str]
    created_at: datetime
    user_id: str | None = None
