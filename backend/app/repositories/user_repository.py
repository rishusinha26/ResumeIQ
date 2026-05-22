from datetime import datetime

from motor.motor_asyncio import AsyncIOMotorDatabase

from app.models.user import PublicUser, UserCreateDocument, UserDocument, UserLoginEvent, UserRole


def _users_collection(db: AsyncIOMotorDatabase):
    return db["users"]


def _audit_collection(db: AsyncIOMotorDatabase):
    return db["user_login_events"]


async def get_user_by_email(db: AsyncIOMotorDatabase, email: str) -> UserDocument | None:
    record = await _users_collection(db).find_one({"email": email})
    if not record:
        return None
    record["id"] = str(record.pop("_id"))
    return UserDocument(**record)


async def list_users_by_role(db: AsyncIOMotorDatabase, role: UserRole) -> list[PublicUser]:
    cursor = _users_collection(db).find({"role": role.value}).sort("created_at", -1)
    users: list[PublicUser] = []
    async for record in cursor:
        record["id"] = str(record.pop("_id"))
        users.append(PublicUser(**record))
    return users


async def list_users(db: AsyncIOMotorDatabase) -> list[PublicUser]:
    cursor = _users_collection(db).find().sort("created_at", -1)
    users: list[PublicUser] = []
    async for record in cursor:
        record["id"] = str(record.pop("_id"))
        users.append(PublicUser(**record))
    return users


async def update_login_activity(db: AsyncIOMotorDatabase, email: str) -> None:
    now = datetime.utcnow()
    await _users_collection(db).update_one(
        {"email": email},
        {"$set": {"last_login_at": now, "updated_at": now}, "$inc": {"login_count": 1}},
    )


async def create_login_event(db: AsyncIOMotorDatabase, event: UserLoginEvent) -> UserLoginEvent:
    payload = event.model_dump(exclude={"id"})
    result = await _audit_collection(db).insert_one(payload)
    return UserLoginEvent(id=str(result.inserted_id), **payload)


async def list_login_events(db: AsyncIOMotorDatabase, limit: int = 100) -> list[UserLoginEvent]:
    cursor = _audit_collection(db).find().sort("created_at", -1).limit(limit)
    events: list[UserLoginEvent] = []
    async for record in cursor:
        record["id"] = str(record.pop("_id"))
        events.append(UserLoginEvent(**record))
    return events


async def list_login_events_for_user(db: AsyncIOMotorDatabase, user_id: str, limit: int = 100) -> list[UserLoginEvent]:
    cursor = _audit_collection(db).find({"user_id": user_id}).sort("created_at", -1).limit(limit)
    events: list[UserLoginEvent] = []
    async for record in cursor:
        record["id"] = str(record.pop("_id"))
        events.append(UserLoginEvent(**record))
    return events


async def create_user(db: AsyncIOMotorDatabase, user: UserCreateDocument) -> UserDocument:
    payload = user.model_dump()
    result = await _users_collection(db).insert_one(payload)
    return UserDocument(id=str(result.inserted_id), **payload)

