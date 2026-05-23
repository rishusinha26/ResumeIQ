from __future__ import annotations

from enum import Enum


class InterviewTrack(str, Enum):
    frontend = "frontend"
    backend = "backend"
    ml = "ml"
    cloud = "cloud"
    devops = "devops"
    fullstack = "fullstack"
    data = "data"


class DifficultyLevel(str, Enum):
    easy = "easy"
    medium = "medium"
    hard = "hard"


class CodingCategory(str, Enum):
    arrays = "arrays"
    strings = "strings"
    dp = "dp"
    graphs = "graphs"
    sql = "sql"


class CodingLanguage(str, Enum):
    python = "python"
    javascript = "javascript"
    typescript = "typescript"
    java = "java"
    cpp = "cpp"
    sql = "sql"


class AptitudeTopic(str, Enum):
    quantitative = "quantitative"
    logical = "logical"
    verbal = "verbal"