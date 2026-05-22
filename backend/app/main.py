import logging

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.v1.api import api_router
from app.core.config import get_settings
from app.core.exceptions import register_exception_handlers
from app.core.logging import configure_logging


settings = get_settings()
configure_logging(settings.log_level)
logger = logging.getLogger("ats_genai")

app = FastAPI(
    title=settings.app_name,
    version="0.1.0",
    description="AI-powered ATS backend for parsing, matching, and recommendations.",
)

register_exception_handlers(app)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.backend_cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router, prefix="/api/v1")


@app.on_event("startup")
async def startup_event() -> None:
    logger.info("Starting %s in %s mode", settings.app_name, settings.app_env)
    
    # Sync FAISS Indices
    try:
        from motor.motor_asyncio import AsyncIOMotorClient
        from app.services.vector_sync_service import sync_vector_indices
        
        client = AsyncIOMotorClient(settings.mongo_uri)
        db = client[settings.mongo_db]
        await sync_vector_indices(db)
    except Exception as e:
        logger.error(f"Error syncing FAISS indices: {e}")


@app.get("/")
def root() -> dict[str, str]:
    return {"message": "ATS GenAI API is running"}
