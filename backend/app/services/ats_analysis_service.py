from __future__ import annotations

from motor.motor_asyncio import AsyncIOMotorDatabase

from app.models.document import JobDocument, ResumeDocument
from app.repositories.embedding_repository import get_embeddings_by_source
from app.services.vector_index_manager import vector_index_manager


ROLE_SUGGESTIONS: list[tuple[set[str], str, str]] = [
    ({"python", "fastapi", "django", "flask", "api"}, "Backend Developer", "Strong backend and API skills detected."),
    ({"react", "javascript", "typescript", "tailwind", "frontend"}, "Frontend Developer", "Frontend stack skills match this path."),
    ({"mongodb", "sql", "database", "data"}, "Database / Data Engineer", "Data storage and pipeline skills found."),
    ({"nlp", "spacy", "machine learning", "ai"}, "ML / AI Engineer", "AI and NLP-related skills in your profile."),
    ({"java", "spring"}, "Java Developer", "Enterprise Java skills identified."),
    ({"devops", "docker", "kubernetes", "aws"}, "DevOps Engineer", "Infrastructure and deployment skills present."),
]


def _normalize_skills(skills: list[str]) -> set[str]:
    return {skill.lower().strip() for skill in skills if skill.strip()}


def _suitability_label(score: float) -> str:
    if score >= 75:
        return "Highly suitable"
    if score >= 50:
        return "Moderately suitable"
    return "Needs improvement"


def compute_keyword_match(resume_skills: set[str], job_skills: set[str]) -> tuple[float, list[str], list[str]]:
    if not job_skills:
        return 0.0, [], sorted(resume_skills)
    matched = resume_skills & job_skills
    missing = sorted(job_skills - resume_skills)
    score = round((len(matched) / len(job_skills)) * 100, 1)
    return score, missing, sorted(matched)


async def _vector_similarity(db: AsyncIOMotorDatabase, resume_id: str, job_id: str) -> float:
    resume_embeddings = await get_embeddings_by_source(db, "resume", resume_id)
    job_embeddings = await get_embeddings_by_source(db, "job", job_id)
    if not resume_embeddings or not job_embeddings:
        return 0.0
    resume_vector = resume_embeddings[0].get("vector")
    job_vector = job_embeddings[0].get("vector")
    if not resume_vector or not job_vector:
        return 0.0
    matches = vector_index_manager.search_jobs(resume_vector, top_k=50)
    for match_job_id, score in matches:
        if match_job_id == job_id:
            return round(max(0.0, min(1.0, float(score))) * 100, 1)
    return 0.0


async def analyze_resume_for_job(
    db: AsyncIOMotorDatabase,
    resume: ResumeDocument,
    job: JobDocument,
) -> dict[str, object]:
    resume_skills = _normalize_skills(resume.skills)
    job_skills = _normalize_skills(job.skills)
    keyword_score, missing_keywords, matched_keywords = compute_keyword_match(resume_skills, job_skills)
    similarity_score = await _vector_similarity(db, resume.id or "", job.id or "")

    if similarity_score > 0:
        ats_score = round(keyword_score * 0.55 + similarity_score * 0.45, 1)
    else:
        ats_score = keyword_score

    return {
        "job_id": job.id,
        "job_title": job.filename,
        "ats_score": ats_score,
        "keyword_match_percent": keyword_score,
        "similarity_score": similarity_score,
        "suitability": _suitability_label(ats_score),
        "missing_keywords": missing_keywords,
        "matched_keywords": matched_keywords,
        "job_skills": sorted(job_skills),
    }


def suggest_roles_from_resume(resume: ResumeDocument) -> list[dict[str, object]]:
    resume_skills = _normalize_skills(resume.skills)
    resume_text = resume.text.lower()
    suggestions: list[dict[str, object]] = []

    for keywords, title, reason in ROLE_SUGGESTIONS:
        overlap = keywords & resume_skills
        text_hits = sum(1 for keyword in keywords if keyword in resume_text)
        if not overlap and text_hits == 0:
            continue
        confidence = min(95.0, 40.0 + len(overlap) * 12 + text_hits * 8)
        suggestions.append(
            {
                "role_title": title,
                "confidence": round(confidence, 1),
                "reason": reason,
                "matched_skills": sorted(overlap),
            }
        )

    if not suggestions:
        suggestions.append(
            {
                "role_title": "General Software Engineer",
                "confidence": 55.0,
                "reason": "Upload a detailed resume with technical skills for sharper role suggestions.",
                "matched_skills": sorted(resume_skills)[:5],
            }
        )

    suggestions.sort(key=lambda item: float(item["confidence"]), reverse=True)
    return suggestions[:5]
