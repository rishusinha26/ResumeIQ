from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, status

from motor.motor_asyncio import AsyncIOMotorDatabase

from app.dependencies import get_current_user, get_db
from app.schemas.interview import InterviewMessageCreate, InterviewSessionCreate, InterviewSessionDetail, InterviewSessionSummary
from app.services.interview_service import add_assistant_turn, add_user_turn, create_mock_session, evaluate_session, get_user_sessions


router = APIRouter()


@router.get("/tracks")
async def interview_tracks() -> list[dict[str, str]]:
    return [
        {"value": "frontend", "label": "Frontend"},
        {"value": "backend", "label": "Backend"},
        {"value": "ml", "label": "Machine Learning"},
        {"value": "cloud", "label": "Cloud"},
        {"value": "devops", "label": "DevOps"},
        {"value": "fullstack", "label": "Full Stack"},
        {"value": "data", "label": "Data"},
    ]


@router.get("/sessions", response_model=list[InterviewSessionSummary])
async def list_sessions(current_user=Depends(get_current_user), db: AsyncIOMotorDatabase = Depends(get_db)) -> list[InterviewSessionSummary]:
    return await get_user_sessions(db, current_user.id)


@router.post("/sessions", response_model=InterviewSessionDetail)
async def create_session(payload: InterviewSessionCreate, current_user=Depends(get_current_user), db: AsyncIOMotorDatabase = Depends(get_db)) -> InterviewSessionDetail:
    if current_user.role == "admin":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Admin users do not create interview sessions.")
    return await create_mock_session(db, current_user.id, payload)


@router.get("/sessions/{session_id}", response_model=InterviewSessionDetail)
async def session_detail(session_id: str, current_user=Depends(get_current_user), db: AsyncIOMotorDatabase = Depends(get_db)) -> InterviewSessionDetail:
    from app.repositories.interview_repository import get_session

    session = await get_session(db, session_id)
    if session is None or session.user_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Interview session not found.")
    return session


@router.post("/sessions/{session_id}/messages", response_model=InterviewSessionDetail)
async def send_message(session_id: str, payload: InterviewMessageCreate, current_user=Depends(get_current_user), db: AsyncIOMotorDatabase = Depends(get_db)) -> InterviewSessionDetail:
    from app.repositories.interview_repository import get_session

    session = await get_session(db, session_id)
    if session is None or session.user_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Interview session not found.")
    await add_user_turn(db, session_id, payload)
    assistant_text = f"Thanks. We will evaluate: {payload.voice_transcript or payload.message[:140]}"
    updated = await add_assistant_turn(db, session_id, assistant_text)
    return updated or session


@router.post("/sessions/{session_id}/evaluate", response_model=InterviewSessionDetail)
async def evaluate(session_id: str, current_user=Depends(get_current_user), db: AsyncIOMotorDatabase = Depends(get_db)) -> InterviewSessionDetail:
    from app.repositories.interview_repository import get_session

    session = await get_session(db, session_id)
    if session is None or session.user_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Interview session not found.")
    evaluated = await evaluate_session(db, session_id)
    return evaluated or session