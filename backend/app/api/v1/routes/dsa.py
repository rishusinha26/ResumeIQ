from __future__ import annotations

from fastapi import APIRouter, Depends
from motor.motor_asyncio import AsyncIOMotorDatabase

from app.dependencies import get_db
from app.schemas.dsa import DSAQuestion
from app.services.dsa_service import list_dsa_companies, list_dsa_questions

router = APIRouter()


@router.get("/companies", response_model=list[str])
async def companies(db: AsyncIOMotorDatabase = Depends(get_db)) -> list[str]:
    return await list_dsa_companies(db)


@router.get("/questions", response_model=list[DSAQuestion])
async def questions(
    company: str | None = None,
    topic: str | None = None,
    difficulty: str | None = None,
    db: AsyncIOMotorDatabase = Depends(get_db),
) -> list[DSAQuestion]:
    return await list_dsa_questions(db, company=company, topic=topic, difficulty=difficulty)
