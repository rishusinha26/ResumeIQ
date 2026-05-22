from fastapi import APIRouter, Depends

from motor.motor_asyncio import AsyncIOMotorDatabase

from app.dependencies import get_db, require_roles
from app.models.user import UserRole
from app.repositories.document_repository import list_candidates
from app.schemas.candidate import CandidateResponse


router = APIRouter()


@router.get("", response_model=list[CandidateResponse])
async def get_candidates(
    db: AsyncIOMotorDatabase = Depends(get_db),
    current_user=Depends(require_roles(UserRole.admin, UserRole.recruiter)),
) -> list[CandidateResponse]:
    candidates = await list_candidates(db)
    return [CandidateResponse(**candidate.model_dump()) for candidate in candidates]