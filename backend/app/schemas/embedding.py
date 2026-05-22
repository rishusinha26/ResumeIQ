from __future__ import annotations

from datetime import datetime

from pydantic import BaseModel, Field


class EmbeddingCreateResponse(BaseModel):
    id: str | None = None
    source_type: str
    source_id: str | None = None
    source_filename: str
    model_name: str
    vector: list[float] = Field(default_factory=list)
    vector_size: int
    created_at: datetime | None = None


class EmbeddingGenerateRequest(BaseModel):
    text: str = Field(min_length=1)


class EmbeddingGenerateResponse(BaseModel):
    model_name: str
    vector: list[float]
    vector_size: int
