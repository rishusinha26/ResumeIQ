from io import BytesIO

import pdfplumber
from docx import Document
from fastapi import HTTPException, UploadFile, status


def _normalize_text(text: str) -> str:
    return " ".join(text.split())


async def _read_upload(file: UploadFile) -> bytes:
    data = await file.read()
    if not data:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Uploaded file is empty")
    return data


def _extract_pdf_text(data: bytes) -> str:
    parts: list[str] = []
    with pdfplumber.open(BytesIO(data)) as pdf:
        for page in pdf.pages:
            text = page.extract_text() or ""
            if text:
                parts.append(text)
    return _normalize_text("\n".join(parts))


def _extract_docx_text(data: bytes) -> str:
    document = Document(BytesIO(data))
    text = "\n".join(paragraph.text for paragraph in document.paragraphs if paragraph.text.strip())
    return _normalize_text(text)


def extract_text_from_bytes(filename: str | None, data: bytes) -> str:
    lower_name = (filename or "").lower()
    if lower_name.endswith(".pdf"):
        return _extract_pdf_text(data)
    if lower_name.endswith(".docx"):
        return _extract_docx_text(data)
    if lower_name.endswith(".txt"):
        return _normalize_text(data.decode("utf-8", errors="ignore"))
    raise HTTPException(
        status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE,
        detail="Only PDF, DOCX, and TXT files are supported",
    )


async def extract_resume_content(file: UploadFile) -> str:
    data = await _read_upload(file)
    return extract_text_from_bytes(file.filename, data)


async def extract_job_content(file: UploadFile) -> str:
    data = await _read_upload(file)
    return extract_text_from_bytes(file.filename, data)
