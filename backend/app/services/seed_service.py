from app.core.config import get_settings
from app.core.security import get_password_hash
from app.models.user import UserCreateDocument, UserRole
from app.repositories.user_repository import create_user, get_user_by_email
from motor.motor_asyncio import AsyncIOMotorDatabase


async def seed_default_users(db: AsyncIOMotorDatabase) -> None:
    settings = get_settings()

    default_users = [
        {
            "email": settings.default_admin_email,
            "password": settings.default_admin_password,
            "full_name": "Admin User",
            "role": UserRole.admin,
        },
        {
            "email": settings.default_candidate_email,
            "password": settings.default_candidate_password,
            "full_name": "Student User",
            "role": UserRole.candidate,
        },
        {
            "email": settings.default_recruiter_email,
            "password": settings.default_recruiter_password,
            "full_name": "Recruiter User",
            "role": UserRole.recruiter,
        },
    ]

    for user in default_users:
        email = user["email"].strip().lower()
        existing_user = await get_user_by_email(db, email)
        if existing_user is not None:
            continue

        user_document = UserCreateDocument(
            email=email,
            hashed_password=get_password_hash(user["password"]),
            full_name=user["full_name"],
            role=user["role"],
        )
        await create_user(db, user_document)
