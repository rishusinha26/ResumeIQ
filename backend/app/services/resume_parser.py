from __future__ import annotations

from fastapi import UploadFile

from app.utils.file_parsers import extract_text_from_bytes


async def extract_resume_text(file: UploadFile, data: bytes) -> str:
    return extract_text_from_bytes(file.filename, data)