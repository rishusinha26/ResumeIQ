from __future__ import annotations

from datetime import datetime

from motor.motor_asyncio import AsyncIOMotorDatabase

from app.core.config import get_settings


def _embeddings_collection(db: AsyncIOMotorDatabase):
    settings = get_settings()
    return db[settings.embedding_storage_collection]


async def create_embedding_record(db: AsyncIOMotorDatabase, payload: dict[str, object]) -> dict[str, object]:
    record = {
        **payload,
        "created_at": payload.get("created_at", datetime.utcnow()),
    }
    result = await _embeddings_collection(db).insert_one(record)
    return {"id": str(result.inserted_id), **record}


async def get_embeddings_by_source(db: AsyncIOMotorDatabase, source_type: str, source_id: str) -> list[dict[str, object]]:
    cursor = _embeddings_collection(db).find({"source_type": source_type, "source_id": source_id}).sort("created_at", -1)
    records: list[dict[str, object]] = []
    async for record in cursor:
        record["id"] = str(record.pop("_id"))
        records.append(record)
    return records


async def get_embeddings_by_source_type(db: AsyncIOMotorDatabase, source_type: str) -> list[dict[str, object]]:
    cursor = _embeddings_collection(db).find({"source_type": source_type})
    records: list[dict[str, object]] = []
    async for record in cursor:
        record["id"] = str(record.pop("_id"))
        records.append(record)
    return records
