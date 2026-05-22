from fastapi import APIRouter, Body, Depends, HTTPException

from motor.motor_asyncio import AsyncIOMotorDatabase

from app.dependencies import get_current_user, get_db
from app.models.user import UserRole
from app.schemas.chatbot import (
    CandidateStrengthsRequest,
    CandidateStrengthsResponse,
    ChatbotRequest,
    ChatbotResponse,
    TopCandidatesRequest,
    TopCandidatesResponse,
)
from app.services.chatbot_service import (
    chatbot_respond_recruiter,
    chatbot_respond_student,
    explain_candidate_strengths,
    recommend_top_candidates,
)

router = APIRouter()


@router.post("/chat", response_model=ChatbotResponse)
async def chat_endpoint(
    payload: ChatbotRequest = Body(...),
    db: AsyncIOMotorDatabase = Depends(get_db),
    current_user=Depends(get_current_user),
) -> ChatbotResponse:
    try:
        if current_user.role == UserRole.candidate:
            response = await chatbot_respond_student(
                db,
                payload.session_id,
                current_user.id or "",
                payload.message,
                job_id=payload.job_id,
                top_k=payload.top_k or 3,
            )
        else:
            response = await chatbot_respond_recruiter(
                db,
                payload.session_id,
                payload.message,
                job_id=payload.job_id,
                top_k=payload.top_k or 5,
            )
        return ChatbotResponse(response=response, session_id=payload.session_id)
    except ValueError as exc:
        raise HTTPException(status_code=503, detail=str(exc)) from exc
    except Exception as exc:
        raise HTTPException(status_code=502, detail=f"Chatbot request failed: {exc}") from exc


@router.post("/candidate-strengths", response_model=CandidateStrengthsResponse)
async def candidate_strengths_endpoint(
    payload: CandidateStrengthsRequest = Body(...),
    db: AsyncIOMotorDatabase = Depends(get_db),
) -> CandidateStrengthsResponse:
    strengths = await explain_candidate_strengths(db, payload.candidate_id)
    return CandidateStrengthsResponse(strengths=strengths.split("\n"), candidate_id=payload.candidate_id)


@router.post("/top-candidates", response_model=TopCandidatesResponse)
async def top_candidates_endpoint(payload: TopCandidatesRequest = Body(...)) -> TopCandidatesResponse:
    candidates = await recommend_top_candidates(payload.query, payload.top_k or 5)
    return TopCandidatesResponse(candidates=candidates, query=payload.query)
