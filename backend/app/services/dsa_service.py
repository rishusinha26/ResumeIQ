from __future__ import annotations

import json
from pathlib import Path

from motor.motor_asyncio import AsyncIOMotorDatabase

from app.repositories.dsa_repository import list_companies, list_questions
from app.schemas.dsa import DSAQuestion


def _load_json_dsa_questions() -> list[DSAQuestion]:
    path = Path(__file__).resolve().parent.parent / "data" / "dsa_questions.json"
    if not path.exists():
        return []
    try:
        with path.open("r", encoding="utf-8") as file:
            items = json.load(file)
        return [DSAQuestion(**item) for item in items]
    except Exception:
        return []


async def list_dsa_companies(db: AsyncIOMotorDatabase) -> list[str]:
    companies = await list_companies(db)
    if companies:
        return companies
    return sorted({question.company for question in _load_json_dsa_questions()})


async def list_dsa_questions(
    db: AsyncIOMotorDatabase,
    company: str | None = None,
    topic: str | None = None,
    difficulty: str | None = None,
) -> list[DSAQuestion]:
    questions = await list_questions(db, company=company, topic=topic, difficulty=difficulty)
    if questions:
        return questions
    questions = _load_json_dsa_questions()
    if company:
        questions = [question for question in questions if question.company == company]
    if topic:
        questions = [question for question in questions if question.topic == topic]
    if difficulty:
        questions = [question for question in questions if question.difficulty == difficulty]
    return questions
