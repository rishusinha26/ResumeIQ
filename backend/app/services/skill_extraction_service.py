from __future__ import annotations

import logging
import re
from functools import lru_cache

import spacy
from spacy.matcher import PhraseMatcher


logger = logging.getLogger(__name__)

SYNONYM_MAP: dict[str, str] = {
    "js": "JavaScript",
    "py": "Python",
}

SKILL_CATALOG: list[str] = [
    "Python",
    "JavaScript",
    "TypeScript",
    "React",
    "FastAPI",
    "Django",
    "Flask",
    "MongoDB",
    "PostgreSQL",
    "MySQL",
    "Docker",
    "Kubernetes",
    "AWS",
    "Azure",
    "GCP",
    "spaCy",
    "NLP",
    "SQL",
    "Git",
    "JWT",
    "Tailwind CSS",
    "Sentence Transformers",
    "Machine Learning",
    "Deep Learning",
]


def normalize_text(text: str) -> str:
    normalized = text.lower()
    normalized = re.sub(r"[^\w\s+.#-]", " ", normalized)
    normalized = re.sub(r"\s+", " ", normalized).strip()
    for synonym, canonical in SYNONYM_MAP.items():
        normalized = re.sub(rf"\b{re.escape(synonym)}\b", canonical.lower(), normalized)
    return normalized


@lru_cache(maxsize=1)
def get_nlp():
    try:
        nlp = spacy.load("en_core_web_sm")
    except OSError:
        nlp = spacy.blank("en")
    if "sentencizer" not in nlp.pipe_names:
        nlp.add_pipe("sentencizer")
    return nlp


@lru_cache(maxsize=1)
def get_phrase_matcher() -> PhraseMatcher:
    nlp = get_nlp()
    matcher = PhraseMatcher(nlp.vocab, attr="LOWER")
    patterns = [nlp.make_doc(skill) for skill in SKILL_CATALOG]
    matcher.add("TECH_SKILL", patterns)
    return matcher


def extract_skills(text: str) -> list[str]:
    normalized_text = normalize_text(text)
    nlp = get_nlp()
    matcher = get_phrase_matcher()
    doc = nlp(normalized_text)
    matches = matcher(doc)

    extracted: list[str] = []
    for _, start, end in matches:
        span = doc[start:end].text.strip()
        canonical = _canonical_skill(span)
        if canonical:
            extracted.append(canonical)

    return sorted(set(extracted), key=str.lower)


def _canonical_skill(value: str) -> str | None:
    cleaned = value.strip().lower()
    for synonym, canonical in SYNONYM_MAP.items():
        if cleaned == canonical.lower() or cleaned == synonym:
            return canonical
    for skill in SKILL_CATALOG:
        if cleaned == skill.lower():
            return skill
    return value.title()
