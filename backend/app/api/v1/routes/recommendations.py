from fastapi import APIRouter, Depends, Query
from motor.motor_asyncio import AsyncIOMotorDatabase

from app.dependencies import get_db
from app.schemas.recommendation import CandidateRecommendationResponse, JobRecommendationResponse
from app.services.recommendation_service import get_candidate_recommendations, get_job_recommendations


router = APIRouter()


@router.get("/candidates", response_model=list[CandidateRecommendationResponse])
async def recommend_candidates(
    job_id: str = Query(..., description="The ID of the job to find candidates for"),
    top_k: int = Query(5, ge=1, le=50, description="Number of recommendations to return"),
    db: AsyncIOMotorDatabase = Depends(get_db)
) -> list[CandidateRecommendationResponse]:
    recommendations = await get_candidate_recommendations(db, job_id, top_k)
    return [CandidateRecommendationResponse(**item) for item in recommendations]


@router.get("/jobs", response_model=list[JobRecommendationResponse])
async def recommend_jobs(
    resume_id: str = Query(..., description="The ID of the resume to find jobs for"),
    top_k: int = Query(5, ge=1, le=50, description="Number of recommendations to return"),
    db: AsyncIOMotorDatabase = Depends(get_db)
) -> list[JobRecommendationResponse]:
    recommendations = await get_job_recommendations(db, resume_id, top_k)
    return [JobRecommendationResponse(**item) for item in recommendations]
