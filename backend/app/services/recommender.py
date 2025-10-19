from .vectorstore import search
from .generative import blurb_for
from .data_loader import load_catalog_min

_catalog_index = {}  # uniq_id -> full item dict


def _ensure_catalog_index():
    """Build a fast lookup from uniq_id -> item (with image, price, etc.)."""
    global _catalog_index
    if _catalog_index:
        return
    items = load_catalog_min()
    _catalog_index = {}
    for it in items:
        uid = it.get("uniq_id")
        if uid:
            _catalog_index[uid] = it


def _fmt_price(p):
    if p is None:
        return "₹NA"
    try:
        return f"₹{int(round(float(p)))}"
    except Exception:
        return "₹NA"


def recommend_items(query: str, filters: dict | None, k: int):
    """
    Search vector store, then enrich each hit with full catalog info so that
    'image' and 'price' (etc.) are always present for the frontend.
    """
    _ensure_catalog_index()

    hits = search(query, top_k=max(10, k * 3), filters=filters or {})
    out = []

    for h in hits[:k]:
        md = h.get("metadata", {}) or {}
        uid = md.get("uniq_id") or h.get("uniq_id")

        # Look up the full item from the CSV-backed catalog
        full = _catalog_index.get(uid, {}) if uid else {}

        # Prefer vector metadata, but fill gaps from full catalog record
        title = md.get("title") or full.get("title")
        brand = md.get("brand") or full.get("brand")
        category = md.get("category") or full.get("category")
        image = md.get("image") or full.get("image")
        price = md.get("price")
        if price is None:
            price = full.get("price")

        item = {
            "score": h.get("score"),
            "uniq_id": uid,
            "title": title,
            "brand": brand,
            "category": category,
            "image": image,                  # ✅ ensure image present
            "price": price,
            "price_text": _fmt_price(price), # ✅ safe display string
            "blurb": blurb_for({
                "uniq_id": uid,
                "title": title,
                "brand": brand,
                "category": category,
                "price": price,
            }),
        }
        out.append(item)

    return out
