from __future__ import annotations

from bson import ObjectId
from bson.errors import InvalidId
from motor.motor_asyncio import AsyncIOMotorDatabase
from pymongo import UpdateOne

from app.schemas.dsa import DSAQuestion


def dsa_questions_collection(db: AsyncIOMotorDatabase):
    return db["dsa_questions"]


async def seed_questions(db: AsyncIOMotorDatabase, questions: list[DSAQuestion]) -> None:
    if not questions:
        return

    operations = []
    for question in questions:
        payload = question.model_dump(exclude={"id"})
        operations.append(
            UpdateOne(
                {"company": question.company, "title": question.title},
                {"$setOnInsert": payload},
                upsert=True,
            )
        )

    if operations:
        await dsa_questions_collection(db).bulk_write(operations, ordered=False)


async def list_companies(db: AsyncIOMotorDatabase) -> list[str]:
    return await dsa_questions_collection(db).distinct("company")


async def list_questions(
    db: AsyncIOMotorDatabase,
    company: str | None = None,
    topic: str | None = None,
    difficulty: str | None = None,
) -> list[DSAQuestion]:
    query: dict[str, object] = {}
    if company:
        query["company"] = company
    if topic:
        query["topic"] = topic
    if difficulty:
        query["difficulty"] = difficulty

    cursor = dsa_questions_collection(db).find(query).sort([("company", 1), ("difficulty", 1), ("title", 1)])
    items: list[DSAQuestion] = []
    async for record in cursor:
        record["id"] = str(record.pop("_id"))
        items.append(DSAQuestion(**record))
    return items
