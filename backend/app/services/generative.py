# backend/app/services/generative.py
from typing import Any, Dict

def fmt_price(p):
    """Return a human-friendly price string, or 'N/A'."""
    if p is None:
        return "N/A"
    try:
        return f"₹{int(round(float(p)))}"
    except Exception:
        return "N/A"

def _join_bits(bits, sep: str = " • ") -> str:
    """Join non-empty strings with a separator."""
    out = []
    for b in bits:
        if isinstance(b, str) and b.strip():
            out.append(b.strip())
    return sep.join(out)

def blurb_for(md: Dict[str, Any]) -> str:
    """
    Build a short, human-friendly summary for a product without
    ever concatenating non-strings (e.g., floats).
    """
    title    = (md.get("title") or "").strip() or "Item"
    brand    = (md.get("brand") or "").strip()
    category = (md.get("category") or "").strip()
    material = (md.get("material") or "").strip()
    color    = (md.get("color") or "").strip()
    price_t  = fmt_price(md.get("price"))

    summary = _join_bits([brand, category, material, color, price_t])
    return f"{title} — {summary}" if summary else title
