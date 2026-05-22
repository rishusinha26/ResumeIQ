from fastapi import APIRouter, Depends, HTTPException, status

from motor.motor_asyncio import AsyncIOMotorDatabase

from app.dependencies import get_current_user, get_db
from app.models.user import PublicUser
from app.schemas.auth import AuthUserResponse, LoginRequest, TokenResponse, UserCreate
from app.services.auth_service import login_user as authenticate_user
from app.services.auth_service import register_user as create_new_user


router = APIRouter()


@router.post("/register", response_model=TokenResponse)
async def register_user(payload: UserCreate, db: AsyncIOMotorDatabase = Depends(get_db)) -> TokenResponse:
    try:
        _, token = await create_new_user(db, payload)
        return TokenResponse(access_token=token, token_type="bearer")
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc


@router.post("/login", response_model=TokenResponse)
async def login_user(payload: LoginRequest, db: AsyncIOMotorDatabase = Depends(get_db)) -> TokenResponse:
    try:
        _, token = await authenticate_user(db, payload)
        return TokenResponse(access_token=token, token_type="bearer")
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=str(exc)) from exc


@router.get("/me")
async def read_current_user(current_user=Depends(get_current_user)) -> AuthUserResponse:
    return AuthUserResponse(
        id=current_user.id or "",
        email=current_user.email,
        full_name=current_user.full_name,
        role=current_user.role,
    )
