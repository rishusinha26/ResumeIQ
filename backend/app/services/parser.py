from __future__ import annotations

from app.services.entity_extraction_service import (
    extract_certifications,
    extract_education,
    extract_email,
    extract_experience,
    extract_name,
    extract_named_entities,
    extract_phone,
)
from app.services.skill_extraction_service import SYNONYM_MAP, extract_skills


def parse_resume_text(text: str) -> dict[str, object]:
    return {
        "name": extract_name(text),
        "email": extract_email(text),
        "phone": extract_phone(text),
        "skills": extract_skills(text),
        "education": extract_education(text),
        "experience": extract_experience(text),
        "certifications": extract_certifications(text),
        "entities": extract_named_entities(text),
        "synonyms_used": SYNONYM_MAP,
    }

