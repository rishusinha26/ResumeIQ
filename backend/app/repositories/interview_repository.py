from __future__ import annotations

from datetime import datetime

from bson import ObjectId
from bson.errors import InvalidId
from motor.motor_asyncio import AsyncIOMotorDatabase

from app.schemas.interview import InterviewSessionDocument, InterviewSessionSummary


def _collection(db: AsyncIOMotorDatabase):
    return db["interviews"]


async def create_session(db: AsyncIOMotorDatabase, session: InterviewSessionDocument) -> InterviewSessionDocument:
    payload = session.model_dump(exclude={"id"})
    result = await _collection(db).insert_one(payload)
    return InterviewSessionDocument(id=str(result.inserted_id), **payload)


async def update_session(db: AsyncIOMotorDatabase, session_id: str, payload: dict[str, object]) -> InterviewSessionDocument | None:
    try:
        object_id = ObjectId(session_id)
    except InvalidId:
        return None
    payload["updated_at"] = datetime.utcnow()
    await _collection(db).update_one({"_id": object_id}, {"$set": payload})
    return await get_session(db, session_id)


async def get_session(db: AsyncIOMotorDatabase, session_id: str) -> InterviewSessionDocument | None:
    try:
        object_id = ObjectId(session_id)
    except InvalidId:
        return None
    record = await _collection(db).find_one({"_id": object_id})
    if record is None:
        return None
    record["id"] = str(record.pop("_id"))
    return InterviewSessionDocument(**record)


async def list_sessions_for_user(db: AsyncIOMotorDatabase, user_id: str) -> list[InterviewSessionSummary]:
    cursor = _collection(db).find({"user_id": user_id}).sort("created_at", -1)
    sessions: list[InterviewSessionSummary] = []
    async for record in cursor:
        record["id"] = str(record.pop("_id"))
        sessions.append(
            InterviewSessionSummary(
                id=record["id"],
                role_track=record["role_track"],
                role_title=record.get("role_title"),
                status=record.get("status", "active"),
                created_at=record["created_at"],
                updated_at=record["updated_at"],
                confidence_score=record.get("evaluation", {}).get("confidence_score") if isinstance(record.get("evaluation"), dict) else None,
                communication_score=record.get("evaluation", {}).get("communication_score") if isinstance(record.get("evaluation"), dict) else None,
                technical_score=record.get("evaluation", {}).get("technical_score") if isinstance(record.get("evaluation"), dict) else None,
            )
        )
    return sessions