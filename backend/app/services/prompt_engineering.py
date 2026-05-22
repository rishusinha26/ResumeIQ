from typing import Optional

from openai import AsyncOpenAI

from app.core.config import get_settings


class LLMProvider:
    """OpenAI chat completions via the v2 SDK."""

    def __init__(self, provider: str = "openai") -> None:
        self.provider = provider

    async def complete(
        self,
        prompt: str,
        model: str = "gpt-4o-mini",
        max_tokens: int = 512,
        temperature: float = 0.7,
    ) -> str:
        if self.provider != "openai":
            raise NotImplementedError("Only OpenAI is implemented.")

        settings = get_settings()
        api_key = settings.openai_api_key.strip()
        if not api_key:
            raise ValueError(
                "OPENAI_API_KEY is not set. Add it to backend/.env and restart the server."
            )

        client = AsyncOpenAI(api_key=api_key)
        response = await client.chat.completions.create(
            model=model,
            messages=[{"role": "user", "content": prompt}],
            max_tokens=max_tokens,
            temperature=temperature,
        )
        content = response.choices[0].message.content
        return content.strip() if content else ""


llm_provider = LLMProvider()


def build_resume_summary_prompt(resume_text: str) -> str:
    return f"""
You are an expert ATS assistant. Summarize the following resume in 5-7 sentences, focusing on key skills, experience, and unique strengths. Use bullet points if possible.
Resume:
{resume_text}
Summary (JSON): {{
  "summary": [ ... ]
}}"""


def build_interview_questions_prompt(resume_text: str, job_description: Optional[str] = None) -> str:
    job_part = f" for the following job description:\n{job_description}" if job_description else ""
    return f"""
You are an expert technical interviewer. Generate 5-7 targeted interview questions based on the candidate's resume{job_part}.
Resume:
{resume_text}
Questions (JSON): {{
  "questions": [ ... ]
}}"""


def build_skill_gap_prompt(resume_text: str, job_description: str) -> str:
    return f"""
You are an ATS skill gap analyst. Compare the candidate's resume to the job description. List missing or weak skills, and rate the overall fit (1-10).
Resume:
{resume_text}
Job Description:
{job_description}
Skill Gap Analysis (JSON): {{
  "missing_skills": [ ... ],
  "fit_score": ...
}}"""


def build_recruiter_chat_prompt(context: str, user_message: str) -> str:
    return f"""You are an AI hiring assistant for recruiters.

Your goals:
- Help find students/candidates who best match a specific job
- Explain why each candidate is a strong or weak fit
- Compare match scores and missing skills
- Recommend who to interview first

Use ONLY the context below. If a job is selected, prioritize ranked matches for that job.
If no job is selected, tell the recruiter to select a job for accurate matching.

{context}

Recruiter message: {user_message}

Give a clear, actionable answer with numbered candidate recommendations when matches exist."""


def build_student_chat_prompt(context: str, user_message: str) -> str:
    return f"""You are an AI career coach helping students improve their resumes for ATS systems.

Your goals:
- Suggest concrete resume improvements (keywords, skills, projects, wording)
- Point out missing keywords for specific jobs when data is available
- Explain ATS scores and how to raise them
- Suggest which roles fit their profile

Be encouraging, specific, and use bullet points. Reference actual missing keywords from the context.

{context}

Student message: {user_message}

Give practical resume improvement advice."""


def build_candidate_evaluation_prompt(resume_text: str, job_description: Optional[str] = None) -> str:
    job_part = f" for the following job description:\n{job_description}" if job_description else ""
    return f"""
You are an ATS candidate evaluator. Write a concise evaluation summary{job_part}, highlighting strengths, weaknesses, and fit.
Resume:
{resume_text}
Evaluation (JSON): {{
  "strengths": [ ... ],
  "weaknesses": [ ... ],
  "fit": "..."
}}"""
