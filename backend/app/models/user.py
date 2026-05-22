from datetime import datetime
from enum import Enum

from pydantic import BaseModel, EmailStr, Field


class UserRole(str, Enum):
    admin = "admin"
    recruiter = "recruiter"
    candidate = "candidate"


class UserCreateDocument(BaseModel):
    email: EmailStr
    hashed_password: str
    full_name: str | None = None
    role: UserRole = Field(default=UserRole.candidate)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    last_login_at: datetime | None = None
    login_count: int = 0


class UserDocument(UserCreateDocument):
    id: str | None = None


class PublicUser(BaseModel):
    id: str
    email: EmailStr
    full_name: str | None = None
    role: UserRole
    created_at: datetime
    updated_at: datetime | None = None
    last_login_at: datetime | None = None
    login_count: int = 0


class UserLoginEvent(BaseModel):
    id: str | None = None
    user_id: str
    email: EmailStr
    full_name: str | None = None
    role: UserRole
    event_type: str = "login"
    created_at: datetime = Field(default_factory=datetime.utcnow)
