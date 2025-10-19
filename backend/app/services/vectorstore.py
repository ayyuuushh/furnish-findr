from .embeddings import embed_texts, embed_query
from .data_loader import load_catalog_min
from .faiss_store import FaissStore

_store = None

def _ensure_index():
    global _store
    if _store is not None:
        return
    items = load_catalog_min()
    texts = [it.get("text_blob") or "" for it in items]
    vecs = embed_texts(texts)
    dim = len(vecs[0]) if vecs and len(vecs[0]) else 512  # fallback
    _store = FaissStore(dim=dim)
    # attach each item's own metadata dict
    packed = []
    for it in items:
        md = {
            "uniq_id": it.get("uniq_id"),
            "title": it.get("title"),
            "brand": it.get("brand"),
            "material": it.get("material"),
            "price": it.get("price"),
            "category": it.get("category"),
            "image": it.get("image"),
            "color": it.get("color"),
        }
        packed.append({**it, "metadata": md})
    _store.build(vecs, packed)

def search(query: str, top_k: int = 10, filters=None):
    _ensure_index()
    qv = embed_query(query or "")
    hits = _store.search(qv, top_k=top_k)
    if filters:
        def ok(md):
            for k, v in filters.items():
                if str(md.get(k)).lower() != str(v).lower():
                    return False
            return True
        hits = [h for h in hits if ok(h["metadata"])]
    return hits
