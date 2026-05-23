from fastapi import APIRouter

from app.api.v1.routes.admin import router as admin_router
from app.api.v1.routes.aptitude import router as aptitude_router
from app.api.v1.routes.candidates import router as candidates_router
from app.api.v1.routes.auth import router as auth_router
from app.api.v1.routes.chatbot import router as chatbot_router
from app.api.v1.routes.career import router as career_router
from app.api.v1.routes.coding import router as coding_router
from app.api.v1.routes.dsa import router as dsa_router
from app.api.v1.routes.health import router as health_router
from app.api.v1.routes.interviews import router as interviews_router
from app.api.v1.routes.jobs import router as jobs_router
from app.api.v1.routes.recommendations import router as recommendations_router
from app.api.v1.routes.resumes import router as resumes_router
from app.api.v1.routes.student import router as student_router
from app.api.v1.routes.ai import router as ai_router


api_router = APIRouter()

api_router.include_router(health_router, tags=["health"])
api_router.include_router(auth_router, prefix="/auth", tags=["auth"])
api_router.include_router(resumes_router, prefix="/resumes", tags=["resumes"])
api_router.include_router(student_router, prefix="/student", tags=["student"])
api_router.include_router(candidates_router, prefix="/candidates", tags=["candidates"])
api_router.include_router(jobs_router, prefix="/jobs", tags=["jobs"])
api_router.include_router(recommendations_router, prefix="/recommendations", tags=["recommendations"])
api_router.include_router(chatbot_router, prefix="/chatbot", tags=["chatbot"])
api_router.include_router(admin_router, prefix="/admin", tags=["admin"])
api_router.include_router(ai_router, prefix="/ai", tags=["ai"])
api_router.include_router(interviews_router, prefix="/interviews", tags=["interviews"])
api_router.include_router(coding_router, prefix="/coding", tags=["coding"])
api_router.include_router(aptitude_router, prefix="/aptitude", tags=["aptitude"])
api_router.include_router(dsa_router, prefix="/dsa", tags=["dsa"])
api_router.include_router(career_router, prefix="/career", tags=["career"])
