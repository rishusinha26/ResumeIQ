from __future__ import annotations

from fastapi import APIRouter, Depends

from motor.motor_asyncio import AsyncIOMotorDatabase

from app.dependencies import get_current_user, get_db
from app.schemas.aptitude import AptitudeQuestion, AptitudeQuizRequest, AptitudeQuizResult, AptitudeQuizSession, AptitudeQuizSubmission
from app.services.aptitude_service import build_quiz, grade_quiz, user_quiz_history


router = APIRouter()


@router.get("/questions", response_model=list[AptitudeQuestion])
async def questions(topic: str | None = None, difficulty: str | None = None, db: AsyncIOMotorDatabase = Depends(get_db)) -> list[AptitudeQuestion]:
    from app.repositories.aptitude_repository import list_questions

    return await list_questions(db, topic=topic, difficulty=difficulty)


@router.post("/quiz", response_model=AptitudeQuizSession)
async def quiz(payload: AptitudeQuizRequest, db: AsyncIOMotorDatabase = Depends(get_db)) -> AptitudeQuizSession:
    return await build_quiz(db, payload)


@router.post("/quiz/submit", response_model=AptitudeQuizResult)
async def submit_quiz(payload: AptitudeQuizSubmission, current_user=Depends(get_current_user), db: AsyncIOMotorDatabase = Depends(get_db)) -> AptitudeQuizResult:
    return await grade_quiz(db, current_user.id, payload)


@router.get("/results", response_model=list[AptitudeQuizResult])
async def results(current_user=Depends(get_current_user), db: AsyncIOMotorDatabase = Depends(get_db)) -> list[AptitudeQuizResult]:
    return await user_quiz_history(db, current_user.id)