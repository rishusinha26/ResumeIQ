from fastapi import UploadFile

from motor.motor_asyncio import AsyncIOMotorDatabase

from app.models.document import EmbeddingDocument, JobDocument
from app.repositories.embedding_repository import create_embedding_record
from app.repositories.document_repository import create_job
from app.services.embedding_service import generate_embedding
from app.utils.file_parsers import extract_job_content
from app.utils.nlp import extract_skills_and_entities


async def parse_job_description_file(
    file: UploadFile,
    db: AsyncIOMotorDatabase | None = None,
    user_id: str | None = None,
) -> dict[str, object]:
    content = await extract_job_content(file)
    skills, _ = extract_skills_and_entities(content)
    parsed = {
        "filename": file.filename or "job-description",
        "text": content,
        "skills": skills,
    }
    if db is not None:
        created_job = await create_job(db, JobDocument(**parsed, user_id=user_id))
        embedding_vector = generate_embedding(content)
        if embedding_vector:
            await create_embedding_record(
                db,
                EmbeddingDocument(
                    source_type="job",
                    source_id=created_job.id,
                    source_filename=parsed["filename"],
                    model_name="sentence-transformers/all-MiniLM-L6-v2",
                    vector=embedding_vector,
                    vector_size=len(embedding_vector),
                ).model_dump(exclude={"id"}),
            )
            from app.services.vector_index_manager import vector_index_manager
            vector_index_manager.add_job(created_job.id, embedding_vector)
    return parsed
