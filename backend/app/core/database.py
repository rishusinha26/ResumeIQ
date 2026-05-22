from collections.abc import AsyncIterator

from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase

from app.core.config import get_settings


async def get_database() -> AsyncIterator[AsyncIOMotorDatabase]:
    settings = get_settings()
    client = AsyncIOMotorClient(settings.mongo_uri)
    try:
        yield client[settings.mongo_db]
    finally:
        client.close()
