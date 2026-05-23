from __future__ import annotations

from datetime import datetime

from bson import ObjectId
from bson.errors import InvalidId
from motor.motor_asyncio import AsyncIOMotorDatabase

from app.schemas.coding import CodingChallengeDocument, CodingSubmissionDocument


def challenges_collection(db: AsyncIOMotorDatabase):
    return db["coding_challenges"]


def submissions_collection(db: AsyncIOMotorDatabase):
    return db["coding_submissions"]


async def seed_challenges(db: AsyncIOMotorDatabase, challenges: list[CodingChallengeDocument]) -> None:
    if await challenges_collection(db).count_documents({}) > 0:
        return
    payload = [challenge.model_dump(exclude={"id"}) for challenge in challenges]
    if payload:
        await challenges_collection(db).insert_many(payload)


async def list_challenges(db: AsyncIOMotorDatabase) -> list[CodingChallengeDocument]:
    cursor = challenges_collection(db).find().sort("created_at", -1)
    items: list[CodingChallengeDocument] = []
    async for record in cursor:
        record["id"] = str(record.pop("_id"))
        items.append(CodingChallengeDocument(**record))
    return items


async def get_challenge(db: AsyncIOMotorDatabase, challenge_id: str) -> CodingChallengeDocument | None:
    try:
        object_id = ObjectId(challenge_id)
    except InvalidId:
        return None
    record = await challenges_collection(db).find_one({"_id": object_id})
    if record is None:
        return None
    record["id"] = str(record.pop("_id"))
    return CodingChallengeDocument(**record)


async def create_submission(db: AsyncIOMotorDatabase, submission: CodingSubmissionDocument) -> CodingSubmissionDocument:
    payload = submission.model_dump(exclude={"id"})
    result = await submissions_collection(db).insert_one(payload)
    return CodingSubmissionDocument(id=str(result.inserted_id), **payload)


async def list_submissions_for_user(db: AsyncIOMotorDatabase, user_id: str) -> list[CodingSubmissionDocument]:
    cursor = submissions_collection(db).find({"user_id": user_id}).sort("created_at", -1)
    items: list[CodingSubmissionDocument] = []
    async for record in cursor:
        record["id"] = str(record.pop("_id"))
        items.append(CodingSubmissionDocument(**record))
    return items


async def list_leaderboard(db: AsyncIOMotorDatabase, limit: int = 20) -> list[dict[str, object]]:
    pipeline = [
        {"$group": {"_id": "$user_id", "score": {"$max": "$score"}, "submissions": {"$sum": 1}}},
        {"$sort": {"score": -1, "submissions": -1}},
        {"$limit": limit},
    ]
    entries: list[dict[str, object]] = []
    async for record in submissions_collection(db).aggregate(pipeline):
        entries.append({"user_id": str(record["_id"]), "score": float(record.get("score", 0)), "submissions": int(record.get("submissions", 0))})
    return entries