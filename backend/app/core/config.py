from functools import lru_cache
import json
from pathlib import Path

from pydantic import Field, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", case_sensitive=False, extra="ignore")

    app_name: str = Field(default="ATS GenAI API", alias="APP_NAME")
    app_env: str = Field(default="development", alias="APP_ENV")
    log_level: str = Field(default="INFO", alias="LOG_LEVEL")
    storage_root: Path = Field(default=Path("storage"), alias="STORAGE_ROOT")
    resume_storage_dir: str = Field(default="resumes", alias="RESUME_STORAGE_DIR")
    max_resume_size_mb: int = Field(default=10, alias="MAX_RESUME_SIZE_MB")
    mongo_uri: str = Field(default="mongodb://localhost:27017/ats_genai", alias="MONGO_URI")
    mongo_db: str = Field(default="ats_genai", alias="MONGO_DB")
    jwt_secret_key: str = Field(default="change-me", alias="JWT_SECRET_KEY")
    jwt_algorithm: str = Field(default="HS256", alias="JWT_ALGORITHM")
    jwt_access_token_expire_minutes: int = Field(default=60, alias="JWT_ACCESS_TOKEN_EXPIRE_MINUTES")
    backend_cors_origins: list[str] = Field(default_factory=lambda: ["http://localhost:5173"], alias="BACKEND_CORS_ORIGINS")
    openai_api_key: str = Field(default="", alias="OPENAI_API_KEY")
    spacy_model: str = Field(default="en_core_web_sm", alias="SPACY_MODEL")
    sentence_transformer_model: str = Field(
        default="sentence-transformers/all-MiniLM-L6-v2",
        alias="SENTENCE_TRANSFORMER_MODEL",
    )
    embedding_storage_collection: str = Field(default="embeddings", alias="EMBEDDING_STORAGE_COLLECTION")

    @field_validator("backend_cors_origins", mode="before")
    @classmethod
    def parse_backend_cors_origins(cls, value: object) -> list[str]:
        if value is None:
            return ["http://localhost:5173"]
        if isinstance(value, str):
            cleaned = value.strip()
            if not cleaned:
                return ["http://localhost:5173"]
            if cleaned.startswith("["):
                try:
                    parsed = json.loads(cleaned)
                except json.JSONDecodeError:
                    return [origin.strip() for origin in cleaned.split(",") if origin.strip()]
                if isinstance(parsed, list):
                    return [str(origin).strip() for origin in parsed if str(origin).strip()]
                return ["http://localhost:5173"]
            return [origin.strip() for origin in cleaned.split(",") if origin.strip()]
        if isinstance(value, list):
            return [str(origin).strip() for origin in value if str(origin).strip()]
        raise TypeError("BACKEND_CORS_ORIGINS must be a string or list of strings")


@lru_cache
def get_settings() -> Settings:
    return Settings()
