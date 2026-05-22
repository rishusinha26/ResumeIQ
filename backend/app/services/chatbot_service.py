from __future__ import annotations

from typing import Any

from motor.motor_asyncio import AsyncIOMotorDatabase

from app.repositories.document_repository import (
    get_job_by_id,
    get_latest_resume_for_user,
    get_resume_by_id,
    list_jobs,
)
from app.services.ats_analysis_service import analyze_resume_for_job, suggest_roles_from_resume
from app.services.embedding_service import generate_embedding
from app.services.prompt_engineering import (
    build_recruiter_chat_prompt,
    build_student_chat_prompt,
    llm_provider,
)
from app.services.recommendation_service import get_candidate_recommendations
from app.services.vector_index_manager import vector_index_manager


class ChatbotMemory:
    def __init__(self) -> None:
        self.sessions: dict[str, list[dict[str, str]]] = {}

    def add_message(self, session_id: str, role: str, content: str) -> None:
        self.sessions.setdefault(session_id, []).append({"role": role, "content": content})

    def get_history(self, session_id: str) -> list[dict[str, str]]:
        return self.sessions.get(session_id, [])


chatbot_memory = ChatbotMemory()


def _format_history(session_id: str) -> str:
    history = chatbot_memory.get_history(session_id)
    if not history:
        return ""
    lines = ["Conversation history:"]
    for msg in history[-6:]:
        lines.append(f"{msg['role']}: {msg['content']}")
    return "\n".join(lines)


async def _load_candidate_details(
    db: AsyncIOMotorDatabase,
    job,
    recommendations: list[dict[str, object]],
) -> str:
    if not recommendations:
        return "No matching student resumes found for this job yet."

    blocks: list[str] = ["Top matching students for this job:"]
    for index, rec in enumerate(recommendations, start=1):
        resume_id = str(rec.get("candidate_id", ""))
        resume = await get_resume_by_id(db, resume_id)
        if resume is None:
            continue
        analysis = await analyze_resume_for_job(db, resume, job)
        blocks.append(
            f"\n{index}. {resume.name or resume.filename} (resume id: {resume_id})"
            f"\n   Match score: {analysis['ats_score']}% — {analysis['suitability']}"
            f"\n   Skills on resume: {', '.join(resume.skills[:12]) or 'none detected'}"
            f"\n   Missing for this job: {', '.join(analysis['missing_keywords'][:10]) or 'none'}"
        )
    return "\n".join(blocks)


async def build_recruiter_context(
    db: AsyncIOMotorDatabase,
    message: str,
    session_id: str,
    job_id: str | None,
    top_k: int = 5,
) -> str:
    parts = [_format_history(session_id), f"Recruiter question: {message}"]

    if job_id:
        job = await get_job_by_id(db, job_id)
        if job is None:
            parts.append("Selected job was not found.")
        else:
            parts.append(f"\nSelected job: {job.filename}")
            parts.append(f"Required skills: {', '.join(job.skills) or 'not extracted'}")
            parts.append(f"Job description excerpt:\n{job.text[:1500]}")
            recommendations = await get_candidate_recommendations(db, job_id, top_k)
            parts.append(await _load_candidate_details(db, job, recommendations))
    else:
        jobs = await list_jobs(db)
        if jobs:
            parts.append("\nOpen jobs (ask recruiter to pick one for precise matching):")
            for job in jobs[:8]:
                parts.append(f"- {job.filename} (id: {job.id})")
        query_vec = generate_embedding(message)
        if query_vec:
            matches = vector_index_manager.search_resumes(query_vec, top_k=top_k)
            if matches:
                parts.append("\nSemantically similar resumes (no specific job selected):")
                for resume_id, score in matches:
                    resume = await get_resume_by_id(db, resume_id)
                    label = resume.name or resume.filename if resume else resume_id
                    parts.append(f"- {label} (id: {resume_id}, similarity: {score:.2f})")

    return "\n".join(parts)


async def build_student_context(
    db: AsyncIOMotorDatabase,
    user_id: str,
    message: str,
    session_id: str,
    job_id: str | None,
    top_k: int = 3,
) -> str:
    parts = [_format_history(session_id), f"Student question: {message}"]
    resume = await get_latest_resume_for_user(db, user_id)

    if resume is None:
        parts.append(
            "\nThe student has not uploaded a resume yet. "
            "Tell them to upload a resume first, then ask again for improvement tips."
        )
        return "\n".join(parts)

    parts.append(f"\nStudent resume: {resume.filename}")
    parts.append(f"Detected skills: {', '.join(resume.skills) or 'none'}")
    parts.append(f"Resume excerpt:\n{resume.text[:2000]}")

    roles = suggest_roles_from_resume(resume)
    if roles:
        parts.append("\nSuggested career roles from profile:")
        for role in roles[:3]:
            parts.append(f"- {role['role_title']} ({role['confidence']}%): {role['reason']}")

    job_summaries = await list_jobs(db)
    if not job_summaries:
        parts.append("\nNo jobs posted by recruiters yet — give general resume improvement advice.")
        return "\n".join(parts)

    job_documents = []
    if job_id:
        job = await get_job_by_id(db, job_id)
        if job:
            job_documents = [job]
    else:
        for job_summary in job_summaries[:top_k]:
            job = await get_job_by_id(db, job_summary.id)
            if job:
                job_documents.append(job)

    parts.append("\nATS fit vs open jobs:")
    for job in job_documents:
        analysis = await analyze_resume_for_job(db, resume, job)
        parts.append(
            f"\n- Job: {job.filename} | ATS score: {analysis['ats_score']}% | {analysis['suitability']}"
            f"\n  Missing keywords to add: {', '.join(analysis['missing_keywords']) or 'none — strong match!'}"
            f"\n  Already matched: {', '.join(analysis['matched_keywords'][:8]) or 'none'}"
        )

    return "\n".join(parts)


async def chatbot_respond_recruiter(
    db: AsyncIOMotorDatabase,
    session_id: str,
    user_message: str,
    job_id: str | None = None,
    top_k: int = 5,
) -> str:
    chatbot_memory.add_message(session_id, "user", user_message)
    context = await build_recruiter_context(db, user_message, session_id, job_id, top_k)
    prompt = build_recruiter_chat_prompt(context, user_message)
    response = await llm_provider.complete(prompt, max_tokens=700)
    chatbot_memory.add_message(session_id, "assistant", response)
    return response


async def chatbot_respond_student(
    db: AsyncIOMotorDatabase,
    session_id: str,
    user_id: str,
    user_message: str,
    job_id: str | None = None,
    top_k: int = 3,
) -> str:
    chatbot_memory.add_message(session_id, "user", user_message)
    context = await build_student_context(db, user_id, user_message, session_id, job_id, top_k)
    prompt = build_student_chat_prompt(context, user_message)
    response = await llm_provider.complete(prompt, max_tokens=700)
    chatbot_memory.add_message(session_id, "assistant", response)
    return response


async def explain_candidate_strengths(db: AsyncIOMotorDatabase, candidate_id: str) -> str:
    resume = await get_resume_by_id(db, candidate_id)
    if not resume:
        return "No resume found."
    from app.services.ai_service import ai_service

    summary = await ai_service.summarize_resume(resume.text)
    items = summary.get("summary", [])
    if isinstance(items, list):
        return "\n".join(str(item) for item in items)
    return str(summary.get("raw", "No summary available."))


async def recommend_top_candidates(query: str, top_k: int = 5) -> list[dict[str, Any]]:
    query_vec = generate_embedding(query)
    if not query_vec:
        return []
    matches = vector_index_manager.search_resumes(query_vec, top_k=top_k)
    return [{"candidate_id": cid, "score": score} for cid, score in matches]
