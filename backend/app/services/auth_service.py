from motor.motor_asyncio import AsyncIOMotorDatabase

from app.core.security import create_access_token, get_password_hash, verify_password
from app.models.user import UserCreateDocument, UserDocument, UserLoginEvent, UserRole
from app.repositories.user_repository import create_login_event, create_user, get_user_by_email, update_login_activity
from app.schemas.auth import LoginRequest, UserCreate


async def register_user(db: AsyncIOMotorDatabase, payload: UserCreate) -> tuple[UserDocument, str]:
    existing_user = await get_user_by_email(db, str(payload.email))
    if existing_user is not None:
        raise ValueError("User already exists")

    if payload.role == UserRole.admin:
        raise ValueError("Admin users cannot self-register")

    user_document = UserCreateDocument(
        email=payload.email,
        hashed_password=get_password_hash(payload.password),
        full_name=payload.full_name,
        role=payload.role,
    )
    created_user = await create_user(db, user_document)
    token = create_access_token(str(created_user.email), created_user.role.value)
    return created_user, token


async def login_user(db: AsyncIOMotorDatabase, payload: LoginRequest) -> tuple[UserDocument, str]:
    user = await get_user_by_email(db, str(payload.email))
    if user is None or not verify_password(payload.password, user.hashed_password):
        raise ValueError("Invalid credentials")
    await update_login_activity(db, str(user.email))
    await create_login_event(
        db,
        UserLoginEvent(
            user_id=user.id or str(user.email),
            email=user.email,
            full_name=user.full_name,
            role=user.role,
        ),
    )
    token = create_access_token(str(user.email), user.role.value)
    return user, token