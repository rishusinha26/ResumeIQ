from bson import ObjectId
from bson.errors import InvalidId
from motor.motor_asyncio import AsyncIOMotorDatabase

from app.models.document import CandidateSummary, JobDocument, JobSummary, ResumeDocument, ResumeSummary
from app.models.user import UserRole


def _resumes_collection(db: AsyncIOMotorDatabase):
    return db["resumes"]


def _jobs_collection(db: AsyncIOMotorDatabase):
    return db["jobs"]


async def create_resume(db: AsyncIOMotorDatabase, resume: ResumeDocument) -> ResumeDocument:
    payload = resume.model_dump(exclude={"id"})
    result = await _resumes_collection(db).insert_one(payload)
    return ResumeDocument(id=str(result.inserted_id), **payload)


async def get_resume_by_id(db: AsyncIOMotorDatabase, resume_id: str) -> ResumeDocument | None:
    try:
        object_id = ObjectId(resume_id)
    except InvalidId:
        return None
    record = await _resumes_collection(db).find_one({"_id": object_id})
    if record is None:
        return None
    record["id"] = str(record.pop("_id"))
    return ResumeDocument(**record)


async def get_job_by_id(db: AsyncIOMotorDatabase, job_id: str) -> JobDocument | None:
    try:
        object_id = ObjectId(job_id)
    except InvalidId:
        return None
    record = await _jobs_collection(db).find_one({"_id": object_id})
    if record is None:
        return None
    record["id"] = str(record.pop("_id"))
    return JobDocument(**record)


async def get_latest_resume_for_user(db: AsyncIOMotorDatabase, user_id: str) -> ResumeDocument | None:
    record = await _resumes_collection(db).find_one({"user_id": user_id}, sort=[("created_at", -1)])
    if record is None:
        return None
    record["id"] = str(record.pop("_id"))
    return ResumeDocument(**record)


async def list_resumes(db: AsyncIOMotorDatabase, limit: int = 100) -> list[ResumeSummary]:
    cursor = _resumes_collection(db).find().sort("created_at", -1).limit(limit)
    resumes: list[ResumeSummary] = []
    async for record in cursor:
        record["id"] = str(record.pop("_id"))
        resumes.append(ResumeSummary(**record))
    return resumes


async def create_job(db: AsyncIOMotorDatabase, job: JobDocument) -> JobDocument:
    payload = job.model_dump(exclude={"id"})
    result = await _jobs_collection(db).insert_one(payload)
    return JobDocument(id=str(result.inserted_id), **payload)


async def count_resumes_for_user(db: AsyncIOMotorDatabase, user_id: str) -> int:
    return await _resumes_collection(db).count_documents({"user_id": user_id})


async def count_jobs_for_user(db: AsyncIOMotorDatabase, user_id: str) -> int:
    return await _jobs_collection(db).count_documents({"user_id": user_id})


async def list_jobs(db: AsyncIOMotorDatabase) -> list[JobSummary]:
    cursor = _jobs_collection(db).find().sort("created_at", -1)
    jobs: list[JobSummary] = []
    async for record in cursor:
        record["id"] = str(record.pop("_id"))
        jobs.append(JobSummary(**record))
    return jobs


async def list_jobs_for_user(db: AsyncIOMotorDatabase, user_id: str, limit: int = 20) -> list[JobSummary]:
    cursor = _jobs_collection(db).find({"user_id": user_id}).sort("created_at", -1).limit(limit)
    jobs: list[JobSummary] = []
    async for record in cursor:
        record["id"] = str(record.pop("_id"))
        jobs.append(JobSummary(**record))
    return jobs


async def list_resumes_for_user(db: AsyncIOMotorDatabase, user_id: str, limit: int = 20) -> list[ResumeSummary]:
    cursor = _resumes_collection(db).find({"user_id": user_id}).sort("created_at", -1).limit(limit)
    resumes: list[ResumeSummary] = []
    async for record in cursor:
        record["id"] = str(record.pop("_id"))
        resumes.append(ResumeSummary(**record))
    return resumes


async def list_candidates(db: AsyncIOMotorDatabase) -> list[CandidateSummary]:
    cursor = db["users"].find({"role": UserRole.candidate.value}).sort("created_at", -1)
    candidates: list[CandidateSummary] = []
    async for record in cursor:
        record["id"] = str(record.pop("_id"))
        resume_count = await count_resumes_for_user(db, record["id"])
        candidates.append(CandidateSummary(resume_count=resume_count, **record))
    return candidates
