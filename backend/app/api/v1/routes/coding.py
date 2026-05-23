from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException

from motor.motor_asyncio import AsyncIOMotorDatabase

from app.dependencies import get_current_user, get_db
from app.repositories.user_repository import get_user_by_id
from app.schemas.coding import CodingChallengeDocument, CodingLeaderboardEntry, CodingSubmissionCreate, CodingSubmissionDocument
from app.services.coding_service import coding_leaderboard, list_available_challenges, run_submission, user_submissions


router = APIRouter()


@router.get("/challenges", response_model=list[CodingChallengeDocument])
async def challenges(db: AsyncIOMotorDatabase = Depends(get_db)) -> list[CodingChallengeDocument]:
    return await list_available_challenges(db)


@router.get("/submissions", response_model=list[CodingSubmissionDocument])
async def submissions(current_user=Depends(get_current_user), db: AsyncIOMotorDatabase = Depends(get_db)) -> list[CodingSubmissionDocument]:
    return await user_submissions(db, current_user.id)


@router.post("/run", response_model=CodingSubmissionDocument)
async def run_code(payload: CodingSubmissionCreate, current_user=Depends(get_current_user), db: AsyncIOMotorDatabase = Depends(get_db)) -> CodingSubmissionDocument:
    try:
        return await run_submission(db, current_user.id, payload)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc


@router.get("/leaderboard", response_model=list[CodingLeaderboardEntry])
async def leaderboard(db: AsyncIOMotorDatabase = Depends(get_db)) -> list[CodingLeaderboardEntry]:
    rows = await coding_leaderboard(db)
    entries: list[CodingLeaderboardEntry] = []
    for row in rows:
        user = await get_user_by_id(db, str(row["user_id"]))
        entries.append(
            CodingLeaderboardEntry(
                user_id=str(row["user_id"]),
                email=user.email if user else "",
                full_name=user.full_name if user else None,
                score=float(row["score"]),
                submissions=int(row["submissions"]),
            )
        )
    return entries