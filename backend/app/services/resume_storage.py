from __future__ import annotations

import logging
import uuid
from pathlib import Path

from fastapi import HTTPException, UploadFile, status

from app.core.config import get_settings


logger = logging.getLogger(__name__)
ALLOWED_EXTENSIONS = {".pdf", ".docx"}


def _safe_filename(name: str) -> str:
    return "".join(character if character.isalnum() or character in {"-", "_", "."} else "_" for character in name)


def validate_resume_file(filename: str | None, file_size_bytes: int) -> None:
    if not filename:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Filename is required")
    extension = Path(filename).suffix.lower()
    if extension not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE,
            detail="Only PDF and DOCX resumes are supported",
        )

    settings = get_settings()
    max_bytes = settings.max_resume_size_mb * 1024 * 1024
    if file_size_bytes > max_bytes:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail=f"Resume exceeds maximum size of {settings.max_resume_size_mb} MB",
        )


def build_resume_path(filename: str) -> Path:
    settings = get_settings()
    storage_dir = settings.storage_root / settings.resume_storage_dir
    storage_dir.mkdir(parents=True, exist_ok=True)
    unique_name = f"{uuid.uuid4().hex}_{_safe_filename(filename)}"
    return storage_dir / unique_name


async def store_resume_file(file: UploadFile) -> tuple[Path, bytes]:
    data = await file.read()
    validate_resume_file(file.filename, len(data))
    destination = build_resume_path(file.filename or "resume")
    destination.write_bytes(data)
    logger.info("Stored resume file at %s", destination)
    return destination, data