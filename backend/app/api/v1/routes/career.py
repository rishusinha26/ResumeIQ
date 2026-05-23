from __future__ import annotations

from fastapi import APIRouter, Depends

from motor.motor_asyncio import AsyncIOMotorDatabase

from app.dependencies import get_current_user, get_db
from app.schemas.career import CareerAnalysisDocument, CareerAnalysisRequest, CareerAnalysisResponse, CareerSummaryResponse, LearningPathDocument
from app.services.career_service import career_summary, generate_career_analysis, list_user_paths


router = APIRouter()


@router.post("/analyze", response_model=CareerAnalysisResponse)
async def analyze(payload: CareerAnalysisRequest, current_user=Depends(get_current_user), db: AsyncIOMotorDatabase = Depends(get_db)) -> CareerAnalysisResponse:
    return await generate_career_analysis(db, current_user.id, payload)


@router.get("/summary", response_model=CareerSummaryResponse)
async def summary(current_user=Depends(get_current_user), db: AsyncIOMotorDatabase = Depends(get_db)) -> CareerSummaryResponse:
    return await career_summary(db, current_user.id)


@router.get("/learning-paths", response_model=list[LearningPathDocument])
async def learning_paths(current_user=Depends(get_current_user), db: AsyncIOMotorDatabase = Depends(get_db)) -> list[LearningPathDocument]:
    return await list_user_paths(db, current_user.id)