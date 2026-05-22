import logging
import faiss
import numpy as np
from typing import List, Tuple, Dict, Optional

logger = logging.getLogger(__name__)

class VectorIndexManager:
    """Manages FAISS indices for vector search in memory."""
    
    def __init__(self, dimension: int = 384):
        self.dimension = dimension
        
        # We use IndexFlatIP for Cosine Similarity (assuming vectors are normalized)
        self.resume_index = faiss.IndexFlatIP(self.dimension)
        self.job_index = faiss.IndexFlatIP(self.dimension)
        
        # ID mappings: FAISS ID (int) -> MongoDB source_id (str)
        self.resume_id_map: Dict[int, str] = {}
        self.job_id_map: Dict[int, str] = {}
        
        # Reverse mapping: MongoDB source_id -> FAISS ID (for updating/removing if needed later)
        self.resume_source_to_id: Dict[str, int] = {}
        self.job_source_to_id: Dict[str, int] = {}

    def _normalize(self, vector: List[float]) -> np.ndarray:
        v = np.array([vector], dtype=np.float32)
        faiss.normalize_L2(v)
        return v

    def add_resume(self, source_id: str, vector: List[float]) -> None:
        if source_id in self.resume_source_to_id:
            # Simple approach: skip if exists. 
            # In a real system, we'd need to remove the old one (or use IndexIDMap)
            return

        v = self._normalize(vector)
        faiss_id = self.resume_index.ntotal
        self.resume_index.add(v)
        
        self.resume_id_map[faiss_id] = source_id
        self.resume_source_to_id[source_id] = faiss_id

    def add_job(self, source_id: str, vector: List[float]) -> None:
        if source_id in self.job_source_to_id:
            return

        v = self._normalize(vector)
        faiss_id = self.job_index.ntotal
        self.job_index.add(v)
        
        self.job_id_map[faiss_id] = source_id
        self.job_source_to_id[source_id] = faiss_id

    def search_resumes(self, query_vector: List[float], top_k: int = 5) -> List[Tuple[str, float]]:
        """Returns list of (source_id, score)"""
        if self.resume_index.ntotal == 0:
            return []

        v = self._normalize(query_vector)
        k = min(top_k, self.resume_index.ntotal)
        scores, faiss_ids = self.resume_index.search(v, k)
        
        results = []
        for score, f_id in zip(scores[0], faiss_ids[0]):
            if f_id != -1 and f_id in self.resume_id_map:
                # faiss_id can be -1 if not enough results
                results.append((self.resume_id_map[f_id], float(score)))
                
        return results

    def search_jobs(self, query_vector: List[float], top_k: int = 5) -> List[Tuple[str, float]]:
        """Returns list of (source_id, score)"""
        if self.job_index.ntotal == 0:
            return []

        v = self._normalize(query_vector)
        k = min(top_k, self.job_index.ntotal)
        scores, faiss_ids = self.job_index.search(v, k)
        
        results = []
        for score, f_id in zip(scores[0], faiss_ids[0]):
            if f_id != -1 and f_id in self.job_id_map:
                # faiss_id can be -1 if not enough results
                results.append((self.job_id_map[f_id], float(score)))
                
        return results

# Basic Singleton instance to be used across the app
vector_index_manager = VectorIndexManager()
