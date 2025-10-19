# backend/app/services/recommender.py
from .vectorstore import search
from .generative import blurb_for

def fmt_price(p):
    if p is None:
        return "N/A"
    try:
        return "₹" + str(int(round(float(p))))
    except Exception:
        return "N/A"

def recommend_items(query, filters, k):
    hits = search(query, top_k=max(10, k * 3), filters=filters or {})
    items = []
    for h in hits[:k]:
        md = h.get("metadata", {})
        price_val = md.get("price")
        items.append({
            "score": h.get("score"),
            "uniq_id": md.get("uniq_id"),
            "title": md.get("title"),
            "brand": md.get("brand"),
            "price": price_val,
            "price_text": fmt_price(price_val),
            "image": md.get("image"),
            "category": md.get("category"),
            "blurb": blurb_for(md),
        })
    return items
