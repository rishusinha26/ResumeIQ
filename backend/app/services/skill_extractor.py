from __future__ import annotations

import re


DEFAULT_SKILLS = [
    "python",
    "fastapi",
    "django",
    "flask",
    "mongodb",
    "postgresql",
    "mysql",
    "react",
    "tailwind",
    "docker",
    "aws",
    "nlp",
    "spacy",
    "sentence transformers",
    "machine learning",
    "deep learning",
    "sql",
    "git",
    "jwt",
]


def extract_skills(text: str, skill_catalog: list[str] | None = None) -> list[str]:
    catalog = skill_catalog or DEFAULT_SKILLS
    normalized_text = re.sub(r"\s+", " ", text.lower())
    found_skills: list[str] = []

    for skill in catalog:
        pattern = re.escape(skill.lower()).replace(r"\ ", r"\s+")
        if re.search(rf"\b{pattern}\b", normalized_text):
            found_skills.append(skill)

    return sorted(set(found_skills))
