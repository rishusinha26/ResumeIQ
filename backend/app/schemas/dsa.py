from __future__ import annotations

from pydantic import BaseModel, HttpUrl

from app.schemas.modules_common import DifficultyLevel


class DSAQuestion(BaseModel):
    id: str | None = None
    company: str
    title: str
    difficulty: DifficultyLevel
    topic: str
    tags: list[str] = []
    description: str
    leetcode_slug: str
    leetcode_url: HttpUrl
