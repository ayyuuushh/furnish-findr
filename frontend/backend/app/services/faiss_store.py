# Pure NumPy cosine-similarity store (drop-in for FAISS)
import numpy as np

class FaissStore:
    def __init__(self, dim: int):
        self.dim = dim
        self.vectors = None
        self.meta = []

    def build(self, vectors, items):
        X = np.array(vectors, dtype="float32")
        if X.size == 0:
            self.vectors = np.zeros((0, self.dim), dtype="float32")
            self.meta = []
            return
        norms = np.linalg.norm(X, axis=1, keepdims=True)
        norms[norms == 0] = 1.0
        self.vectors = X / norms
        self.meta = items

    def search(self, qvec, top_k=10):
        if self.vectors is None or len(self.meta) == 0:
            return []
        q = np.array(qvec, dtype="float32")
        qn = np.linalg.norm(q);  q = q / (qn if qn != 0 else 1.0)
        scores = self.vectors @ q
        k = min(top_k, scores.shape[0])
        idx = np.argpartition(-scores, k-1)[:k]
        idx = idx[np.argsort(-scores[idx])]
        return [{"score": float(scores[i]), "metadata": self.meta[i]} for i in idx]
