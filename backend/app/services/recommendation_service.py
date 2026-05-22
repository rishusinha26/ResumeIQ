from motor.motor_asyncio import AsyncIOMotorDatabase
from app.repositories.embedding_repository import get_embeddings_by_source
from app.services.vector_index_manager import vector_index_manager

async def get_candidate_recommendations(db: AsyncIOMotorDatabase, job_id: str, top_k: int = 5) -> list[dict[str, object]]:
    # Get the embedding for the job
    job_embeddings = await get_embeddings_by_source(db, "job", job_id)
    if not job_embeddings:
        return []
    
    # We take the most recent job embedding
    job_vector = job_embeddings[0].get("vector")
    if not job_vector:
        return []
        
    # Search for matching resumes
    matches = vector_index_manager.search_resumes(job_vector, top_k=top_k)
    
    recommendations = []
    for candidate_id, score in matches:
        recommendations.append({
            "candidate_id": candidate_id,
            "match_score": round(score, 4),
            "summary": "Matched via vectorized skills and description"
        })
    return recommendations


async def get_job_recommendations(db: AsyncIOMotorDatabase, resume_id: str, top_k: int = 5) -> list[dict[str, object]]:
    # Get the embedding for the resume
    resume_embeddings = await get_embeddings_by_source(db, "resume", resume_id)
    if not resume_embeddings:
        return []
    
    resume_vector = resume_embeddings[0].get("vector")
    if not resume_vector:
        return []
        
    # Search for matching jobs
    matches = vector_index_manager.search_jobs(resume_vector, top_k=top_k)
    
    recommendations = []
    for match_job_id, score in matches:
        recommendations.append({
            "job_id": match_job_id,
            "match_score": round(score, 4),
            "summary": "Matched via vectorized profile and roles"
        })
    return recommendations
