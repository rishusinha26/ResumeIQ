from __future__ import annotations

from bson import ObjectId
from bson.errors import InvalidId
from motor.motor_asyncio import AsyncIOMotorDatabase

from app.schemas.career import CareerAnalysisDocument, LearningPathDocument


def analyses_collection(db: AsyncIOMotorDatabase):
    return db["career_analysis"]


def learning_paths_collection(db: AsyncIOMotorDatabase):
    return db["learning_paths"]


async def create_analysis(db: AsyncIOMotorDatabase, analysis: CareerAnalysisDocument) -> CareerAnalysisDocument:
    payload = analysis.model_dump(exclude={"id"})
    result = await analyses_collection(db).insert_one(payload)
    return CareerAnalysisDocument(id=str(result.inserted_id), **payload)


async def create_learning_path(db: AsyncIOMotorDatabase, path: LearningPathDocument) -> LearningPathDocument:
    payload = path.model_dump(exclude={"id"})
    result = await learning_paths_collection(db).insert_one(payload)
    return LearningPathDocument(id=str(result.inserted_id), **payload)


async def get_latest_analysis(db: AsyncIOMotorDatabase, user_id: str) -> CareerAnalysisDocument | None:
    record = await analyses_collection(db).find_one({"user_id": user_id}, sort=[("created_at", -1)])
    if not record:
        return None
    record["id"] = str(record.pop("_id"))
    return CareerAnalysisDocument(**record)


async def get_latest_learning_path(db: AsyncIOMotorDatabase, user_id: str) -> LearningPathDocument | None:
    record = await learning_paths_collection(db).find_one({"user_id": user_id}, sort=[("created_at", -1)])
    if not record:
        return None
    record["id"] = str(record.pop("_id"))
    return LearningPathDocument(**record)


async def list_learning_paths(db: AsyncIOMotorDatabase, user_id: str) -> list[LearningPathDocument]:
    cursor = learning_paths_collection(db).find({"user_id": user_id}).sort("created_at", -1)
    items: list[LearningPathDocument] = []
    async for record in cursor:
        record["id"] = str(record.pop("_id"))
        items.append(LearningPathDocument(**record))
    return items