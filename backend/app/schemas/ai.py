from pydantic import BaseModel
from typing import List, Optional, Any

class ResumeSummaryResponse(BaseModel):
    summary: List[str]
    raw: Optional[str] = None

class InterviewQuestionsResponse(BaseModel):
    questions: List[str]
    raw: Optional[str] = None

class SkillGapAnalysisResponse(BaseModel):
    missing_skills: List[str]
    fit_score: Optional[float] = None
    raw: Optional[str] = None

class CandidateEvaluationResponse(BaseModel):
    strengths: List[str]
    weaknesses: List[str]
    fit: Optional[str] = None
    raw: Optional[str] = None
