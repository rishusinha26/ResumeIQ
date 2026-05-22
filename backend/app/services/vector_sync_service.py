import logging
from motor.motor_asyncio import AsyncIOMotorDatabase
from app.repositories.embedding_repository import get_embeddings_by_source_type
from app.services.vector_index_manager import vector_index_manager

logger = logging.getLogger(__name__)

async def sync_vector_indices(db: AsyncIOMotorDatabase) -> None:
    """
    Fetches all embeddings from MongoDB and adds them to the FAISS indices.
    Typically run on application startup.
    """
    logger.info("Starting FAISS vector index synchronization...")
    
    # Sync Resumes
    resume_embeddings = await get_embeddings_by_source_type(db, "resume")
    resume_count = 0
    for record in resume_embeddings:
        vector = record.get("vector")
        source_id = record.get("source_id")
        if vector and source_id:
            vector_index_manager.add_resume(source_id, vector)
            resume_count += 1
            
    # Sync Jobs
    job_embeddings = await get_embeddings_by_source_type(db, "job")
    job_count = 0
    for record in job_embeddings:
        vector = record.get("vector")
        source_id = record.get("source_id")
        if vector and source_id:
            vector_index_manager.add_job(source_id, vector)
            job_count += 1
            
    logger.info(f"FAISS sync complete. Loaded {resume_count} resumes and {job_count} jobs.")
