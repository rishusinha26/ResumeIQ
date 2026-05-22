from __future__ import annotations

from motor.motor_asyncio import AsyncIOMotorDatabase


def _skill_extractions_collection(db: AsyncIOMotorDatabase):
    return db["skill_extractions"]


async def create_skill_extraction(
    db: AsyncIOMotorDatabase,
    payload: dict[str, object],
) -> dict[str, object]:
    result = await _skill_extractions_collection(db).insert_one(payload)
    return {"id": str(result.inserted_id), **payload}
