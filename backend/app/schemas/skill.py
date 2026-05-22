from __future__ import annotations

from pydantic import BaseModel, Field


class SkillExtractionRequest(BaseModel):
    text: str = Field(min_length=1)


class SkillExtractionResponse(BaseModel):
    extracted_skills: list[str]
    synonyms_used: dict[str, str]
    total_skills: int
