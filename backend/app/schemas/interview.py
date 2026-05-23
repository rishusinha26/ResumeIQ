from __future__ import annotations

from datetime import datetime

from pydantic import BaseModel, Field

from app.schemas.modules_common import DifficultyLevel, InterviewTrack


class InterviewQuestion(BaseModel):
    question: str
    ideal_points: list[str] = Field(default_factory=list)
    difficulty: DifficultyLevel = DifficultyLevel.medium


class InterviewSessionCreate(BaseModel):
    role_track: InterviewTrack
    role_title: str | None = None
    years_of_experience: int = Field(default=0, ge=0, le=30)
    use_voice: bool = False
    context_note: str | None = None


class InterviewMessageCreate(BaseModel):
    message: str = Field(min_length=1, max_length=4000)
    voice_transcript: str | None = None


class InterviewMessage(BaseModel):
    speaker: str
    message: str
    created_at: datetime = Field(default_factory=datetime.utcnow)


class InterviewEvaluation(BaseModel):
    summary: str
    strengths: list[str] = Field(default_factory=list)
    improvements: list[str] = Field(default_factory=list)
    confidence_score: float = Field(default=0, ge=0, le=100)
    communication_score: float = Field(default=0, ge=0, le=100)
    technical_score: float = Field(default=0, ge=0, le=100)
    next_steps: list[str] = Field(default_factory=list)


class InterviewSessionDocument(BaseModel):
    id: str | None = None
    user_id: str
    role_track: InterviewTrack
    role_title: str | None = None
    years_of_experience: int = 0
    use_voice: bool = False
    context_note: str | None = None
    questions: list[InterviewQuestion] = Field(default_factory=list)
    messages: list[InterviewMessage] = Field(default_factory=list)
    evaluation: InterviewEvaluation | None = None
    status: str = "active"
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)


class InterviewSessionSummary(BaseModel):
    id: str
    role_track: InterviewTrack
    role_title: str | None = None
    status: str
    created_at: datetime
    updated_at: datetime
    confidence_score: float | None = None
    communication_score: float | None = None
    technical_score: float | None = None


class InterviewSessionDetail(InterviewSessionDocument):
    pass