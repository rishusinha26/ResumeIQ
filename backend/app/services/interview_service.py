from __future__ import annotations

from datetime import datetime

from motor.motor_asyncio import AsyncIOMotorDatabase

from app.repositories.interview_repository import create_session, get_session, list_sessions_for_user, update_session
from app.schemas.interview import InterviewEvaluation, InterviewMessage, InterviewMessageCreate, InterviewQuestion, InterviewSessionCreate, InterviewSessionDocument
from app.schemas.modules_common import DifficultyLevel, InterviewTrack
from app.services.ai_service import ai_service


TRACK_GUIDANCE: dict[InterviewTrack, str] = {
    InterviewTrack.frontend: "Focus on React, TypeScript, accessibility, and performance.",
    InterviewTrack.backend: "Focus on APIs, system design, databases, and reliability.",
    InterviewTrack.ml: "Focus on data pipelines, modeling, evaluation, and deployment.",
    InterviewTrack.cloud: "Focus on infrastructure, observability, security, and scaling.",
    InterviewTrack.devops: "Focus on CI/CD, containers, automation, monitoring, and incident response.",
    InterviewTrack.fullstack: "Balance frontend, backend, and architecture tradeoffs.",
    InterviewTrack.data: "Focus on analytics, SQL, ETL, and experimentation.",
}


def _fallback_questions(track: InterviewTrack, role_title: str | None) -> list[InterviewQuestion]:
    title = role_title or track.value.replace("_", " ").title()
    prompt_prefix = TRACK_GUIDANCE[track]
    return [
        InterviewQuestion(question=f"Tell me about a project that prepared you for a {title} role.", ideal_points=[prompt_prefix, "ownership", "impact"], difficulty=DifficultyLevel.easy),
        InterviewQuestion(question=f"How would you handle a production issue in a {title} team?", ideal_points=["debugging", "communication", "triage"], difficulty=DifficultyLevel.medium),
        InterviewQuestion(question=f"What tradeoffs matter most when building for {title} requirements?", ideal_points=["tradeoffs", "scalability", "maintainability"], difficulty=DifficultyLevel.medium),
        InterviewQuestion(question=f"Describe a time you had to learn something quickly for a {title} project.", ideal_points=["learning", "adaptability", "initiative"], difficulty=DifficultyLevel.easy),
        InterviewQuestion(question="What is one technical weakness you are actively improving?", ideal_points=["self-awareness", "improvement plan"], difficulty=DifficultyLevel.hard),
    ]


async def create_mock_session(db: AsyncIOMotorDatabase, user_id: str, payload: InterviewSessionCreate) -> InterviewSessionDocument:
    try:
        question_payload = await ai_service.generate_interview_questions(
            resume_text=payload.context_note or f"Candidate preparing for {payload.role_track.value} role.",
            job_description=payload.role_title or payload.context_note,
        )
        questions = [
            InterviewQuestion(question=str(item)) if isinstance(item, str) else InterviewQuestion(**item)
            for item in question_payload.get("questions", [])[:5]
        ]
    except Exception:
        questions = []

    if not questions:
        questions = _fallback_questions(payload.role_track, payload.role_title)

    session = InterviewSessionDocument(
        user_id=user_id,
        role_track=payload.role_track,
        role_title=payload.role_title,
        years_of_experience=payload.years_of_experience,
        use_voice=payload.use_voice,
        context_note=payload.context_note,
        questions=questions,
        messages=[],
        status="active",
    )
    return await create_session(db, session)


async def add_user_turn(db: AsyncIOMotorDatabase, session_id: str, message: InterviewMessageCreate) -> InterviewSessionDocument | None:
    session = await get_session(db, session_id)
    if session is None:
        return None
    turns = [*session.messages, InterviewMessage(speaker="candidate", message=message.voice_transcript or message.message, created_at=datetime.utcnow())]
    return await update_session(db, session_id, {"messages": [turn.model_dump() for turn in turns]})


async def add_assistant_turn(db: AsyncIOMotorDatabase, session_id: str, content: str) -> InterviewSessionDocument | None:
    session = await get_session(db, session_id)
    if session is None:
        return None
    turns = [*session.messages, InterviewMessage(speaker="assistant", message=content, created_at=datetime.utcnow())]
    return await update_session(db, session_id, {"messages": [turn.model_dump() for turn in turns]})


async def evaluate_session(db: AsyncIOMotorDatabase, session_id: str) -> InterviewSessionDocument | None:
    session = await get_session(db, session_id)
    if session is None:
      return None

    transcript = "\n".join(f"{turn.speaker}: {turn.message}" for turn in session.messages)
    prompt = f"""
Evaluate the interview below and return JSON with summary, strengths, improvements, confidence_score, communication_score, technical_score, next_steps.
Role track: {session.role_track.value}
Role title: {session.role_title or session.role_track.value}
Interview questions:
{chr(10).join(f'- {question.question}' for question in session.questions)}
Transcript:
{transcript}
"""
    evaluation = InterviewEvaluation(
        summary="Good communication and consistent technical reasoning.",
        strengths=["Clear structure", "Relevant project examples"],
        improvements=["Use more specific metrics", "Answer behavioral questions with STAR"],
        confidence_score=72,
        communication_score=78,
        technical_score=70,
        next_steps=["Review one system design topic", "Practice 3 mock questions", "Record a short answer summary"],
    )
    try:
        response = await ai_service.candidate_evaluation_summary(transcript or session.context_note or "", session.context_note)
        raw = response.get("raw")
        if raw:
            evaluation.summary = str(raw)[:600]
    except Exception:
        pass
    return await update_session(db, session_id, {"evaluation": evaluation.model_dump(), "status": "completed"})


async def get_user_sessions(db: AsyncIOMotorDatabase, user_id: str):
    return await list_sessions_for_user(db, user_id)