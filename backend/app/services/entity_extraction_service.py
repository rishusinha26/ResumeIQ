from __future__ import annotations

import re

import spacy


_NLP = None
KNOWN_SECTION_HEADINGS = {
    "education",
    "experience",
    "work history",
    "employment",
    "certifications",
    "certification",
    "certificate",
    "skills",
    "projects",
    "summary",
    "objective",
}


def get_nlp():
    global _NLP
    if _NLP is None:
        try:
            _NLP = spacy.load("en_core_web_sm")
        except OSError:
            _NLP = spacy.blank("en")
    return _NLP


def extract_email(text: str) -> str | None:
    match = re.search(r"[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}", text)
    return match.group(0) if match else None


def extract_phone(text: str) -> str | None:
    patterns = [
        r"(?:\+?\d{1,3}[\s.-]?)?(?:\(?\d{3}\)?[\s.-]?)\d{3}[\s.-]?\d{4}",
        r"(?:\+?\d{1,3}[\s.-]?)?\d{10,15}",
    ]
    for pattern in patterns:
        match = re.search(pattern, text)
        if match:
            return match.group(0).strip()
    return None


def extract_name(text: str) -> str | None:
    nlp = get_nlp()
    doc = nlp(text[:5000])
    for entity in doc.ents:
        if entity.label_ == "PERSON":
            return entity.text.strip()

    lines = [line.strip() for line in text.splitlines() if line.strip()]
    if lines:
        first_line = lines[0]
        if 2 <= len(first_line.split()) <= 4:
            return first_line
    return None


def extract_education(text: str) -> list[str]:
    return _capture_section(text, ["education"])


def extract_experience(text: str) -> list[str]:
    return _capture_section(text, ["experience", "work history", "employment"])


def extract_certifications(text: str) -> list[str]:
    return _capture_section(text, ["certifications", "certification", "certificate", "certified"])


def extract_named_entities(text: str) -> dict[str, list[str]]:
    nlp = get_nlp()
    doc = nlp(text[:10000])
    entities: dict[str, list[str]] = {}
    for entity in doc.ents:
        entities.setdefault(entity.label_, []).append(entity.text.strip())
    return {label: sorted(set(values)) for label, values in entities.items()}


def _capture_section(text: str, keywords: list[str]) -> list[str]:
    lines = [line.strip() for line in text.splitlines() if line.strip()]
    collected: list[str] = []
    capturing = False

    for line in lines:
        lowered = line.lower()
        is_heading = any(keyword in lowered for keyword in keywords) and len(line.split()) <= 6
        if is_heading:
            capturing = True
            continue
        if capturing:
            if _is_resume_section_heading(line) and not any(keyword in lowered for keyword in keywords):
                break
            collected.append(line)

    return collected[:20]


def _is_resume_section_heading(line: str) -> bool:
    normalized = line.lower().rstrip(":")
    return normalized in KNOWN_SECTION_HEADINGS
