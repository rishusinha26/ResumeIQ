from fastapi import UploadFile

from motor.motor_asyncio import AsyncIOMotorDatabase

from app.models.document import EmbeddingDocument, ResumeDocument, SkillExtractionDocument
from app.repositories.embedding_repository import create_embedding_record
from app.repositories.document_repository import create_resume
from app.repositories.skill_repository import create_skill_extraction
from app.services.embedding_service import generate_embedding
from app.services.parser import parse_resume_text
from app.services.resume_parser import extract_resume_text
from app.services.resume_storage import store_resume_file


async def parse_resume_file(
    file: UploadFile,
    db: AsyncIOMotorDatabase | None = None,
    user_id: str | None = None,
) -> dict[str, object]:
    stored_path, data = await store_resume_file(file)
    content = await extract_resume_text(file, data)
    structured = parse_resume_text(content)
    parsed = {
        "filename": file.filename or "resume",
        "original_filename": file.filename or "resume",
        "stored_path": str(stored_path),
        "file_size_bytes": len(data),
        "mime_type": file.content_type,
        "upload_status": "uploaded",
        "text": content,
        "name": structured["name"],
        "email": structured["email"],
        "phone": structured["phone"],
        "skills": structured["skills"],
        "synonyms_used": structured["synonyms_used"],
        "education": structured["education"],
        "experience": structured["experience"],
        "certifications": structured["certifications"],
        "entities": structured["entities"],
    }
    if db is not None:
        created_resume = await create_resume(db, ResumeDocument(**parsed, user_id=user_id))
        embedding_vector = generate_embedding(content)
        if embedding_vector:
            await create_embedding_record(
                db,
                EmbeddingDocument(
                    source_type="resume",
                    source_id=created_resume.id,
                    source_filename=parsed["filename"],
                    model_name="sentence-transformers/all-MiniLM-L6-v2",
                    vector=embedding_vector,
                    vector_size=len(embedding_vector),
                ).model_dump(exclude={"id"}),
            )
            # Sync directly to FAISS for real-time recommendation
            from app.services.vector_index_manager import vector_index_manager
            vector_index_manager.add_resume(created_resume.id, embedding_vector)
        await create_skill_extraction(
            db,
            SkillExtractionDocument(
                resume_id=created_resume.id,
                source_filename=parsed["filename"],
                extracted_skills=list(parsed["skills"]),
                synonyms_used=dict(parsed["synonyms_used"]),
            ).model_dump(exclude={"id"}),
        )
    return parsed
