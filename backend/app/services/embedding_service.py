from __future__ import annotations

import logging
from functools import lru_cache

from sentence_transformers import SentenceTransformer

from app.core.config import get_settings


logger = logging.getLogger(__name__)


@lru_cache(maxsize=1)
def get_embedding_model() -> SentenceTransformer:
    settings = get_settings()
    logger.info("Loading embedding model: %s", settings.sentence_transformer_model)
    return SentenceTransformer(settings.sentence_transformer_model)


def generate_embedding(text: str) -> list[float]:
    cleaned_text = text.strip()
    if not cleaned_text:
        return []
    model = get_embedding_model()
    vector = model.encode(cleaned_text, normalize_embeddings=True)
    return vector.tolist()


def generate_embeddings(texts: list[str]) -> list[list[float]]:
    non_empty_texts = [text.strip() for text in texts if text and text.strip()]
    if not non_empty_texts:
        return []
    model = get_embedding_model()
    vectors = model.encode(non_empty_texts, normalize_embeddings=True)
    return [vector.tolist() for vector in vectors]
