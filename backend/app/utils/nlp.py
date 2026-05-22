def extract_skills_and_entities(text: str) -> tuple[list[str], list[str]]:
    keywords = [
        "python", "fastapi", "django", "flask", "mongodb", "sql", "react", "javascript",
        "typescript", "tailwind", "node", "java", "spring", "docker", "kubernetes", "aws",
        "spacy", "nlp", "machine learning", "jwt", "api", "frontend", "backend", "devops",
    ]
    lowered = text.lower()
    skills = [keyword for keyword in keywords if keyword in lowered]
    entities = [word for word in text.split()[:5] if word]
    return skills, entities
