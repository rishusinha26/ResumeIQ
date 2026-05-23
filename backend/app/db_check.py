import asyncio
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))
from motor.motor_asyncio import AsyncIOMotorClient
from app.core.config import get_settings

async def main():
    settings = get_settings()
    client = AsyncIOMotorClient(settings.mongo_uri)
    db = client[settings.mongo_db]
    companies = await db['dsa_questions'].distinct('company')
    print('companies', companies)
    count = await db['dsa_questions'].count_documents({})
    print('count', count)
    sample = await db['dsa_questions'].find_one({})
    print('sample', sample)

asyncio.run(main())
