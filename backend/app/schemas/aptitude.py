from __future__ import annotations

from datetime import datetime

from pydantic import BaseModel, Field

from app.schemas.modules_common import AptitudeTopic, DifficultyLevel


class AptitudeQuestion(BaseModel):
    id: str | None = None
    topic: AptitudeTopic
    difficulty: DifficultyLevel
    question: str
    options: list[str] = Field(default_factory=list)
    correct_option: int = Field(ge=0)
    explanation: str
    time_limit_seconds: int = 60


class AptitudeQuizRequest(BaseModel):
    topic: AptitudeTopic
    difficulty: DifficultyLevel = DifficultyLevel.medium
    question_count: int = Field(default=10, ge=3, le=25)


class AptitudeAnswer(BaseModel):
    question_id: str
    selected_option: int = Field(ge=-1)


class AptitudeQuizSubmission(BaseModel):
    topic: AptitudeTopic
    difficulty: DifficultyLevel
    question_ids: list[str]
    answers: list[AptitudeAnswer]
    duration_seconds: int = Field(default=0, ge=0)


class AptitudeQuizResult(BaseModel):
    id: str | None = None
    user_id: str
    topic: AptitudeTopic
    difficulty: DifficultyLevel
    total_questions: int
    correct_answers: int
    score: float
    duration_seconds: int
    answers: list[AptitudeAnswer] = Field(default_factory=list)
    created_at: datetime = Field(default_factory=datetime.utcnow)


class AptitudeQuizSession(BaseModel):
    quiz_id: str
    questions: list[AptitudeQuestion]
    result: AptitudeQuizResult | None = None