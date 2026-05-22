from pydantic import BaseModel


class CandidateRecommendationResponse(BaseModel):
    candidate_id: str
    match_score: float
    summary: str


class JobRecommendationResponse(BaseModel):
    job_id: str
    match_score: float
    summary: str
