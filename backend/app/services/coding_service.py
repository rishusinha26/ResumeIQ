from __future__ import annotations

import asyncio
import json
from dataclasses import dataclass
from urllib import error, request

from motor.motor_asyncio import AsyncIOMotorDatabase

from app.core.config import get_settings
from app.repositories.coding_repository import create_submission, get_challenge, list_challenges, list_leaderboard, list_submissions_for_user
from app.schemas.coding import CodingChallengeDocument, CodingSubmissionCreate, CodingSubmissionDocument, CodingTestCase


LANGUAGE_ALIASES = {
    "python": ["python"],
    "javascript": ["javascript", "js"],
    "typescript": ["typescript", "ts"],
    "java": ["java"],
    "cpp": ["c++", "cpp"],
}


@dataclass
class PistonResult:
    stdout: str = ""
    stderr: str = ""
    status: str = "Error"
    execution_time_ms: int | None = None


def _runtime_extension(language: str) -> str:
    return {
        "python": "py",
        "javascript": "js",
        "typescript": "ts",
        "java": "java",
        "cpp": "cpp",
    }.get(language, "txt")


def _runtime_file_name(language: str) -> str:
    return f"main.{_runtime_extension(language)}"


def _normalize_output(value: str) -> str:
    return "\n".join(line.strip() for line in value.strip().splitlines() if line.strip())


def _extract_expected(stdin: str) -> list[str]:
    return [part.strip() for part in stdin.splitlines() if part.strip()]


_runtime_cache: list[dict[str, object]] | None = None


def _fetch_runtimes_sync() -> list[dict[str, object]]:
    settings = get_settings()
    req = request.Request(f"{settings.piston_api_url.rstrip('/')}/runtimes", method="GET")
    try:
        with request.urlopen(req, timeout=30) as resp:
            data = json.loads(resp.read().decode("utf-8"))
    except error.HTTPError as exc:
        body = exc.read().decode("utf-8", errors="ignore")
        raise ValueError(f"Piston runtime lookup failed: {body or exc.reason}") from exc
    if not isinstance(data, list):
        raise ValueError("Piston runtimes response was invalid.")
    return [runtime for runtime in data if isinstance(runtime, dict)]


def _select_runtime(language: str, runtimes: list[dict[str, object]]) -> dict[str, str]:
    allowed_aliases = LANGUAGE_ALIASES.get(language, [language])
    for runtime in runtimes:
        runtime_language = str(runtime.get("language", "")).lower()
        aliases = [str(alias).lower() for alias in runtime.get("aliases", []) if alias]
        if runtime_language in allowed_aliases or any(alias in allowed_aliases for alias in aliases):
            version = str(runtime.get("version", "")).strip()
            if version:
                return {"language": runtime_language, "version": version}
    raise ValueError(f"No supported Piston runtime found for {language}.")


async def _run_piston(code: str, language: str, stdin: str) -> PistonResult:
    settings = get_settings()

    def _request() -> PistonResult:
        global _runtime_cache
        runtimes = _runtime_cache
        if runtimes is None:
            runtimes = _fetch_runtimes_sync()
            _runtime_cache = runtimes
        runtime = _select_runtime(language, runtimes)
        payload = {
            "language": runtime["language"],
            "version": runtime["version"],
            "files": [{"name": _runtime_file_name(language), "content": code}],
            "stdin": stdin,
            "run_timeout": 5000,
            "compile_timeout": 10000,
        }
        req = request.Request(
            f"{settings.piston_api_url.rstrip('/')}/execute",
            data=json.dumps(payload).encode("utf-8"),
            headers={"Content-Type": "application/json"},
            method="POST",
        )
        try:
            with request.urlopen(req, timeout=90) as resp:
                data = json.loads(resp.read().decode("utf-8"))
        except error.HTTPError as exc:
            body = exc.read().decode("utf-8", errors="ignore")
            raise ValueError(f"Piston request failed: {body or exc.reason}") from exc

        compile_stage = data.get("compile") or {}
        run_stage = data.get("run") or {}
        stdout = str(run_stage.get("stdout") or compile_stage.get("stdout") or "")
        stderr = str(run_stage.get("stderr") or compile_stage.get("stderr") or "")
        status = str(run_stage.get("status") or compile_stage.get("status") or data.get("message") or "ok")
        execution_time_ms = None
        if isinstance(run_stage.get("wall_time"), (int, float)):
            execution_time_ms = int(float(run_stage["wall_time"]))
        elif isinstance(run_stage.get("cpu_time"), (int, float)):
            execution_time_ms = int(float(run_stage["cpu_time"]))
        return PistonResult(stdout=stdout, stderr=stderr, status=status, execution_time_ms=execution_time_ms)

    return await asyncio.to_thread(_request)


DEFAULT_OUTPUT_LIMIT = 6


async def run_submission(db: AsyncIOMotorDatabase, user_id: str, payload: CodingSubmissionCreate) -> CodingSubmissionDocument:
    challenge = await get_challenge(db, payload.challenge_id)
    if challenge is None:
        raise ValueError("Challenge not found.")
    if challenge.languages and payload.language not in challenge.languages:
        raise ValueError("Language is not supported for this challenge.")

    if payload.language == "sql":
        submission = CodingSubmissionDocument(
            user_id=user_id,
            challenge_id=challenge.id or payload.challenge_id,
            challenge_slug=challenge.slug,
            challenge_title=challenge.title,
            language=payload.language,
            source_code=payload.source_code,
            stdout="SQL challenge saved for review.",
            stderr=None,
            verdict="saved",
            passed_tests=0,
            total_tests=len(challenge.test_cases),
            score=0,
        )
        return await create_submission(db, submission)

    passed = 0
    stdout_chunks: list[str] = []
    stderr_chunks: list[str] = []
    for test_case in challenge.test_cases:
        result = await _run_piston(payload.source_code, payload.language.value, test_case.stdin)
        stdout_chunks.append(result.stdout)
        if _normalize_output(result.stdout) == _normalize_output(test_case.expected_stdout):
            passed += 1
        if result.stderr:
            stderr_chunks.append(result.stderr)

    score = round((passed / max(1, len(challenge.test_cases))) * challenge.points, 2)
    verdict = "passed" if passed == len(challenge.test_cases) else "partial"
    submission = CodingSubmissionDocument(
        user_id=user_id,
        challenge_id=challenge.id or payload.challenge_id,
        challenge_slug=challenge.slug,
        challenge_title=challenge.title,
        language=payload.language,
        source_code=payload.source_code,
        stdout="\n".join(stdout_chunks).strip() or None,
        stderr="\n".join(stderr_chunks).strip() or None,
        verdict=verdict,
        passed_tests=passed,
        total_tests=len(challenge.test_cases),
        score=score,
    )
    return await create_submission(db, submission)


async def list_available_challenges(db: AsyncIOMotorDatabase) -> list[CodingChallengeDocument]:
    return await list_challenges(db)


async def user_submissions(db: AsyncIOMotorDatabase, user_id: str) -> list[CodingSubmissionDocument]:
    return await list_submissions_for_user(db, user_id)


async def coding_leaderboard(db: AsyncIOMotorDatabase, limit: int = 20):
    entries = await list_leaderboard(db, limit=limit)
    return entries