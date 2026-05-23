from __future__ import annotations

from bson import ObjectId
from bson.errors import InvalidId
from motor.motor_asyncio import AsyncIOMotorDatabase
from pymongo import UpdateOne

from app.schemas.aptitude import AptitudeQuestion, AptitudeQuizResult


def questions_collection(db: AsyncIOMotorDatabase):
    return db["aptitude_questions"]


def results_collection(db: AsyncIOMotorDatabase):
    return db["aptitude_results"]


async def seed_questions(db: AsyncIOMotorDatabase, questions: list[AptitudeQuestion]) -> None:
    if not questions:
        return

    operations = []
    for question in questions:
        payload = question.model_dump(exclude={"id"})
        operations.append(
            UpdateOne(
                {"question": question.question},
                {"$setOnInsert": payload},
                upsert=True,
            )
        )

    if operations:
        await questions_collection(db).bulk_write(operations, ordered=False)


async def list_questions(db: AsyncIOMotorDatabase, topic: str | None = None, difficulty: str | None = None) -> list[AptitudeQuestion]:
    query: dict[str, object] = {}
    if topic:
        query["topic"] = topic
    if difficulty:
        query["difficulty"] = difficulty
    cursor = questions_collection(db).find(query).sort([("topic", 1), ("difficulty", 1), ("_id", 1)])
    items: list[AptitudeQuestion] = []
    async for record in cursor:
        record["id"] = str(record.pop("_id"))
        items.append(AptitudeQuestion(**record))
    return items


async def get_questions_by_ids(db: AsyncIOMotorDatabase, question_ids: list[str]) -> list[AptitudeQuestion]:
    object_ids = []
    for question_id in question_ids:
        try:
            object_ids.append(ObjectId(question_id))
        except InvalidId:
            continue
    if not object_ids:
        return []
    cursor = questions_collection(db).find({"_id": {"$in": object_ids}})
    items: list[AptitudeQuestion] = []
    async for record in cursor:
        record["id"] = str(record.pop("_id"))
        items.append(AptitudeQuestion(**record))
    return items


async def create_result(db: AsyncIOMotorDatabase, result: AptitudeQuizResult) -> AptitudeQuizResult:
    payload = result.model_dump(exclude={"id"})
    created = await results_collection(db).insert_one(payload)
    return AptitudeQuizResult(id=str(created.inserted_id), **payload)


async def list_results_for_user(db: AsyncIOMotorDatabase, user_id: str) -> list[AptitudeQuizResult]:
    cursor = results_collection(db).find({"user_id": user_id}).sort("created_at", -1)
    items: list[AptitudeQuizResult] = []
    async for record in cursor:
        record["id"] = str(record.pop("_id"))
        items.append(AptitudeQuizResult(**record))
    return items