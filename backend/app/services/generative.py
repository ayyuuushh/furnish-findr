# backend/app/services/generative.py

def _s(v):
    """Safe string: handles None, floats/NaNs, and trims whitespace."""
    if v is None:
        return ""
    try:
        # Some NaNs are float('nan') and stringify fine; that's okay—strip later.
        s = str(v)
    except Exception:
        return ""
    return s.strip()

def blurb_for(md: dict) -> str:
    """
    Creates a short human-friendly line from metadata. All fields are coerced
    to strings safely to avoid '.strip() on float' errors.
    """
    title    = _s(md.get("title"))
    brand    = _s(md.get("brand"))
    material = _s(md.get("material"))
    category = _s(md.get("category"))
    color    = _s(md.get("color"))

    parts = []
    if title:
        parts.append(title)
    if brand:
        parts.append(f"by {brand}")

    specs = []
    if material:
        specs.append(material)
    if color:
        specs.append(color)
    if category:
        specs.append(category)
    if specs:
        parts.append(" · ".join(specs))

    return " ".join(parts) if parts else "Recommended item"
