from __future__ import annotations

from datetime import datetime

from motor.motor_asyncio import AsyncIOMotorDatabase

from app.models.document import JobDocument
from app.repositories.career_repository import create_analysis, create_learning_path, get_latest_analysis, get_latest_learning_path, list_learning_paths
from app.repositories.document_repository import get_latest_resume_for_user, list_jobs
from app.schemas.career import CareerAnalysisDocument, CareerAnalysisRequest, CareerAnalysisResponse, CareerRoadmapStep, LearningPathDocument
from app.services.ai_service import ai_service
from app.services.embedding_service import generate_embedding
from app.services.vector_index_manager import vector_index_manager


async def generate_career_analysis(db: AsyncIOMotorDatabase, user_id: str, payload: CareerAnalysisRequest) -> CareerAnalysisResponse:
    resume = await get_latest_resume_for_user(db, user_id)
    jobs = await list_jobs(db)
    if resume is None:
        analysis = CareerAnalysisDocument(
            user_id=user_id,
            prompt=payload.prompt,
            target_role=payload.target_role,
            skill_gap_summary="Upload a resume to generate a personalized career analysis.",
            learning_recommendations=["Upload a resume", "Add at least one project", "List your current skills"],
            interview_preparation=["Prepare a concise introduction", "Practice one behavioral story"],
            roadmap=[CareerRoadmapStep(title="Upload resume", description="Add your latest resume to unlock targeted recommendations.", timeframe_weeks=1, resources=["Resume builder"])]
        )
        created = await create_analysis(db, analysis)
        learning_path = None
        if payload.include_learning_path and payload.target_role:
            learning_path = await create_learning_path(
                db,
                LearningPathDocument(
                    user_id=user_id,
                    target_role=payload.target_role,
                    skill_gaps=["Resume missing"],
                    roadmap=analysis.roadmap,
                    progress=0,
                ),
            )
        return CareerAnalysisResponse(analysis=created, learning_path=learning_path)

    resume_text = resume.text[:6000]
    query_text = payload.prompt if payload.prompt else payload.target_role or "career roadmap"
    matched_jobs: list[JobDocument] = []
    embedding = generate_embedding(query_text)
    if embedding:
        job_matches = vector_index_manager.search_jobs(embedding, top_k=5)
        for job_id, _score in job_matches:
            from app.repositories.document_repository import get_job_by_id

            job = await get_job_by_id(db, job_id)
            if job:
                matched_jobs.append(job)
    if not matched_jobs:
        matched_jobs = [job for job in jobs[:5]]

    job_context = "\n".join(f"- {job.filename}: {', '.join(job.skills[:8])}" for job in matched_jobs)
    prompt = f"""
You are a career advisor. Create a career roadmap and skill gap analysis.
Resume:
{resume_text}

User request:
{payload.prompt}

Target role:
{payload.target_role or 'Not specified'}

Relevant open jobs:
{job_context}

Return a short JSON object with summary, learning_recommendations, interview_preparation, roadmap.
"""
    try:
        response = await ai_service.candidate_evaluation_summary(resume_text, payload.target_role or payload.prompt)
        raw = response.get("raw") or ""
        summary = str(raw)[:700] if raw else "Career roadmap generated from your profile and current openings."
    except Exception:
        summary = "Career roadmap generated from your profile and current openings."

    roadmap = [
        CareerRoadmapStep(title="Strengthen target skills", description="Focus on the skills most common in matching roles.", timeframe_weeks=4, resources=["Projects", "Interview prep"]),
        CareerRoadmapStep(title="Build proof of work", description="Add one project that demonstrates the target role competencies.", timeframe_weeks=4, resources=["GitHub", "Portfolio"]),
        CareerRoadmapStep(title="Practice interviews", description="Use the mock interview module to improve your delivery.", timeframe_weeks=2, resources=["Mock interview"]),
    ]
    analysis = CareerAnalysisDocument(
        user_id=user_id,
        prompt=payload.prompt,
        target_role=payload.target_role,
        skill_gap_summary=summary,
        learning_recommendations=["Review matching job descriptions", "Close the top 3 missing skills", "Add one strong portfolio project"],
        interview_preparation=["Prepare STAR answers", "Revise project impact metrics", "Practice explaining tradeoffs"],
        roadmap=roadmap,
    )
    created = await create_analysis(db, analysis)
    learning_path = None
    if payload.include_learning_path and payload.target_role:
        learning_path = await create_learning_path(
            db,
            LearningPathDocument(
                user_id=user_id,
                target_role=payload.target_role,
                skill_gaps=["Consistency", "Depth", "Practice"],
                roadmap=roadmap,
                progress=25 if resume.skills else 10,
            ),
        )
    return CareerAnalysisResponse(analysis=created, learning_path=learning_path)


async def career_summary(db: AsyncIOMotorDatabase, user_id: str):
    latest_analysis = await get_latest_analysis(db, user_id)
    latest_learning_path = await get_latest_learning_path(db, user_id)
    return {"latest_analysis": latest_analysis, "latest_learning_path": latest_learning_path}


async def list_user_paths(db: AsyncIOMotorDatabase, user_id: str):
    return await list_learning_paths(db, user_id)