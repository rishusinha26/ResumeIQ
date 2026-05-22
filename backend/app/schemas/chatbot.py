from pydantic import BaseModel
from typing import List, Optional


class ChatbotRequest(BaseModel):
    session_id: str
    message: str
    job_id: Optional[str] = None
    top_k: Optional[int] = 5


class ChatbotResponse(BaseModel):
    response: str
    session_id: str


class CandidateMatchInfo(BaseModel):
    resume_id: str
    name: str | None = None
    match_score: float
    missing_keywords: list[str] = []


class CandidateStrengthsRequest(BaseModel):
    candidate_id: str


class CandidateStrengthsResponse(BaseModel):
    strengths: List[str]
    candidate_id: str


class TopCandidatesRequest(BaseModel):
    query: str
    top_k: Optional[int] = 5


class TopCandidatesResponse(BaseModel):
    candidates: List[dict]
    query: str
