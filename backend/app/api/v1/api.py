from fastapi import APIRouter

from app.api.v1.routes.admin import router as admin_router
from app.api.v1.routes.candidates import router as candidates_router
from app.api.v1.routes.auth import router as auth_router
from app.api.v1.routes.chatbot import router as chatbot_router
from app.api.v1.routes.health import router as health_router
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
