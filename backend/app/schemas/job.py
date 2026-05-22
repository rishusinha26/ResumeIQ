from pydantic import BaseModel


class JobParseResponse(BaseModel):
    filename: str
    text: str
    skills: list[str]
