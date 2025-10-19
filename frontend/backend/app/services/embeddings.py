# Offline, dependency-free embeddings via feature hashing (512-dim).
# Works without internet/GPU and avoids torch/fastembed installs.

import numpy as np
import re

_EMB_DIM = 512
_ready = False
_word_re = re.compile(r"[A-Za-z0-9]+")

def ensure_models_ready():
    global _ready
    if not _ready:
        _ready = True  # nothing to load

def _tokenize(text: str):
    return _word_re.findall(text.lower())

def _hash_embed(text: str):
    vec = np.zeros(_EMB_DIM, dtype="float32")
    for tok in _tokenize(text):
        idx = hash(tok) % _EMB_DIM
        vec[idx] += 1.0
    n = np.linalg.norm(vec)
    if n != 0:
        vec /= n  # L2-normalize so dot = cosine
    return vec

def embed_query(text: str):
    ensure_models_ready()
    return _hash_embed(text).tolist()

def embed_texts(texts):
    ensure_models_ready()
    return [_hash_embed(t).tolist() for t in texts]
