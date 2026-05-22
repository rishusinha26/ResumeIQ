from typing import Optional
from app.services.prompt_engineering import (
    llm_provider,
    build_resume_summary_prompt,
    build_interview_questions_prompt,
    build_skill_gap_prompt,
    build_candidate_evaluation_prompt,
)

class AIService:
    """
    Service layer for generative AI features in ATS.
    """
    @staticmethod
    async def summarize_resume(resume_text: str) -> dict:
        prompt = build_resume_summary_prompt(resume_text)
        response = await llm_provider.complete(prompt)
        return AIService._parse_json_response(response, "summary")

    @staticmethod
    async def generate_interview_questions(resume_text: str, job_description: Optional[str] = None) -> dict:
        prompt = build_interview_questions_prompt(resume_text, job_description)
        response = await llm_provider.complete(prompt)
        return AIService._parse_json_response(response, "questions")

    @staticmethod
    async def skill_gap_analysis(resume_text: str, job_description: str) -> dict:
        prompt = build_skill_gap_prompt(resume_text, job_description)
        response = await llm_provider.complete(prompt)
        return AIService._parse_json_response(response, "missing_skills", extra_keys=["fit_score"])

    @staticmethod
    async def candidate_evaluation_summary(resume_text: str, job_description: Optional[str] = None) -> dict:
        prompt = build_candidate_evaluation_prompt(resume_text, job_description)
        response = await llm_provider.complete(prompt)
        return AIService._parse_json_response(response, "strengths", extra_keys=["weaknesses", "fit"])

    @staticmethod
    def _parse_json_response(response: str, main_key: str, extra_keys=None) -> dict:
        import json
        extra_keys = extra_keys or []
        try:
            data = json.loads(response)
            result = {main_key: data.get(main_key, [])}
            for k in extra_keys:
                result[k] = data.get(k)
            return result
        except Exception:
            # Fallback: return raw text
            return {main_key: [], "raw": response}

ai_service = AIService()
