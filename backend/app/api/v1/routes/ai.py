from fastapi import APIRouter, Body, Query, HTTPException
from app.services.ai_service import ai_service
from app.schemas.ai import (
    ResumeSummaryResponse,
    InterviewQuestionsResponse,
    SkillGapAnalysisResponse,
    CandidateEvaluationResponse,
)

router = APIRouter()

@router.post("/resume-summary", response_model=ResumeSummaryResponse)
async def resume_summary(resume_text: str = Body(..., embed=True)):
    result = await ai_service.summarize_resume(resume_text)
    return ResumeSummaryResponse(**result)

@router.post("/interview-questions", response_model=InterviewQuestionsResponse)
async def interview_questions(
    resume_text: str = Body(..., embed=True),
    job_description: str = Body(None, embed=True),
):
    result = await ai_service.generate_interview_questions(resume_text, job_description)
    return InterviewQuestionsResponse(**result)

@router.post("/skill-gap-analysis", response_model=SkillGapAnalysisResponse)
async def skill_gap_analysis(
    resume_text: str = Body(..., embed=True),
    job_description: str = Body(..., embed=True),
):
    result = await ai_service.skill_gap_analysis(resume_text, job_description)
    return SkillGapAnalysisResponse(**result)

@router.post("/candidate-evaluation", response_model=CandidateEvaluationResponse)
async def candidate_evaluation(
    resume_text: str = Body(..., embed=True),
    job_description: str = Body(None, embed=True),
):
    result = await ai_service.candidate_evaluation_summary(resume_text, job_description)
    return CandidateEvaluationResponse(**result)
