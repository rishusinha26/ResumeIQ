from __future__ import annotations

import hashlib
import json
import random
from pathlib import Path

from motor.motor_asyncio import AsyncIOMotorDatabase

from app.repositories.aptitude_repository import create_result, get_questions_by_ids, list_questions, list_results_for_user
from app.schemas.aptitude import AptitudeAnswer, AptitudeQuestion, AptitudeQuizRequest, AptitudeQuizResult, AptitudeQuizSession, AptitudeQuizSubmission


def _load_json_questions() -> list[AptitudeQuestion]:
    path = Path(__file__).resolve().parent.parent / "data" / "aptitude_questions.json"
    if not path.exists():
        return []
    try:
        with path.open("r", encoding="utf-8") as file:
            items = json.load(file)
        return [AptitudeQuestion(**item) for item in items]
    except Exception:
        return []


def _build_question_id(question: AptitudeQuestion) -> str:
    normalized = question.question.strip().lower().encode("utf-8")
    digest = hashlib.md5(normalized).hexdigest()
    return f"{question.topic.value}-{question.difficulty.value}-{digest[:10]}"


async def build_quiz(db: AsyncIOMotorDatabase, request_model: AptitudeQuizRequest) -> AptitudeQuizSession:
    questions = await list_questions(db, topic=request_model.topic.value, difficulty=request_model.difficulty.value)
    if not questions:
        questions = await list_questions(db, topic=request_model.topic.value)
    if not questions:
        questions = [q for q in _load_json_questions() if q.topic == request_model.topic and q.difficulty == request_model.difficulty]
    if not questions:
        questions = [q for q in _load_json_questions() if q.topic == request_model.topic]

    if len(questions) > request_model.question_count:
        questions = random.sample(questions, request_model.question_count)
    else:
        questions = questions[: request_model.question_count]

    for question in questions:
        if not question.id:
            question.id = _build_question_id(question)

    quiz_id = f"{request_model.topic.value}-{request_model.difficulty.value}-{len(questions)}"
    return AptitudeQuizSession(quiz_id=quiz_id, questions=questions)


async def grade_quiz(db: AsyncIOMotorDatabase, user_id: str, submission: AptitudeQuizSubmission) -> AptitudeQuizResult:
    questions = await get_questions_by_ids(db, submission.question_ids)
    question_map = {question.id or "": question for question in questions}

    if len(question_map) < len(submission.question_ids):
        fallback_questions = _load_json_questions()
        fallback_map = {(_build_question_id(question) if not question.id else question.id): question for question in fallback_questions}
        for question_id in submission.question_ids:
            if question_id not in question_map and question_id in fallback_map:
                question = fallback_map[question_id]
                if not question.id:
                    question.id = question_id
                question_map[question_id] = question

    correct = 0
    for answer in submission.answers:
        question = question_map.get(answer.question_id)
        if question and question.correct_option == answer.selected_option:
            correct += 1
    total = len(question_map)
    score = round((correct / max(1, total)) * 100, 2)
    result = AptitudeQuizResult(
        user_id=user_id,
        topic=submission.topic,
        difficulty=submission.difficulty,
        total_questions=total,
        correct_answers=correct,
        score=score,
        duration_seconds=submission.duration_seconds,
        answers=submission.answers,
    )
    return await create_result(db, result)


async def user_quiz_history(db: AsyncIOMotorDatabase, user_id: str):
    return await list_results_for_user(db, user_id)