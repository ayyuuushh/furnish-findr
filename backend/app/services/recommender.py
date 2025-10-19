# backend/app/services/recommender.py
from typing import Optional, Dict, Any
from .vectorstore import search
from .generative import blurb_for, fmt_price

def recommend_items(query: str, filters: Optional[Dict[str, Any]], k: int):
    """
    Retrieve top-K items from vector store, then return a stable, UI-friendly payload.
    """
    hits = search(query, top_k=max(10, k * 3), filters=(filters or {}))

    items = []
    for h in hits[:k]:
        md = h.get("metadata", {}) or {}
        price_val = md.get("price")

        items.append({
            "score": float(h.get("score", 0.0)),
            "uniq_id": md.get("uniq_id"),
            "title": md.get("title"),
            "brand": md.get("brand"),
            "category": md.get("category"),
            "price": price_val,                 # keep numeric for logic
            "price_text": fmt_price(price_val), # convenient, always a string
            "image": md.get("image"),
            "color": md.get("color"),
            "blurb": blurb_for(md),             # safe: formats price internally
            "metadata": md,                     # include raw meta if UI needs it
        })

    return items
