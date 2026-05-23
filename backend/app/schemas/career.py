from __future__ import annotations

from datetime import datetime

from pydantic import BaseModel, Field


class CareerAnalysisRequest(BaseModel):
    prompt: str = Field(min_length=3, max_length=4000)
    target_role: str | None = None
    include_learning_path: bool = True


class CareerRoadmapStep(BaseModel):
    title: str
    description: str
    timeframe_weeks: int = Field(default=1, ge=1, le=52)
    resources: list[str] = Field(default_factory=list)


class CareerAnalysisDocument(BaseModel):
    id: str | None = None
    user_id: str
    prompt: str
    target_role: str | None = None
    skill_gap_summary: str
    learning_recommendations: list[str] = Field(default_factory=list)
    interview_preparation: list[str] = Field(default_factory=list)
    roadmap: list[CareerRoadmapStep] = Field(default_factory=list)
    created_at: datetime = Field(default_factory=datetime.utcnow)


class LearningPathDocument(BaseModel):
    id: str | None = None
    user_id: str
    target_role: str
    skill_gaps: list[str] = Field(default_factory=list)
    roadmap: list[CareerRoadmapStep] = Field(default_factory=list)
    progress: float = Field(default=0, ge=0, le=100)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)


class CareerAnalysisResponse(BaseModel):
    analysis: CareerAnalysisDocument
    learning_path: LearningPathDocument | None = None


class CareerSummaryResponse(BaseModel):
    latest_analysis: CareerAnalysisDocument | None = None
    latest_learning_path: LearningPathDocument | None = None