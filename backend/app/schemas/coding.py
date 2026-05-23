from __future__ import annotations

from datetime import datetime

from pydantic import BaseModel, Field

from app.schemas.modules_common import CodingCategory, CodingLanguage, DifficultyLevel


class CodingTestCase(BaseModel):
    stdin: str
    expected_stdout: str


class CodingChallengeDocument(BaseModel):
    id: str | None = None
    slug: str
    title: str
    category: CodingCategory
    difficulty: DifficultyLevel
    description: str
    starter_code: str
    languages: list[CodingLanguage] = Field(default_factory=list)
    test_cases: list[CodingTestCase] = Field(default_factory=list)
    time_limit_seconds: int = 2
    memory_limit_kb: int = 262144
    points: int = 100
    created_at: datetime = Field(default_factory=datetime.utcnow)


class CodingSubmissionCreate(BaseModel):
    challenge_id: str
    language: CodingLanguage
    source_code: str = Field(min_length=1)


class CodingSubmissionDocument(BaseModel):
    id: str | None = None
    user_id: str
    challenge_id: str
    challenge_slug: str
    challenge_title: str
    language: CodingLanguage
    source_code: str
    stdout: str | None = None
    stderr: str | None = None
    verdict: str
    passed_tests: int = 0
    total_tests: int = 0
    score: float = 0
    execution_time_ms: int | None = None
    created_at: datetime = Field(default_factory=datetime.utcnow)


class CodingSubmissionResponse(BaseModel):
    submission: CodingSubmissionDocument


class CodingLeaderboardEntry(BaseModel):
    user_id: str
    email: str
    full_name: str | None = None
    score: float
    submissions: int