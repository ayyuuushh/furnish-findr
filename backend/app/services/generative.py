# backend/app/services/generative.py

def _s(v):
    """
    Safe stringify: handles None, floats/NaNs, and trims whitespace.
    Never raises on weird types.
    """
    if v is None:
        return ""
    try:
        s = str(v)
    except Exception:
        return ""
    return s.strip()

def blurb_for(md):
    """
    Creates a short human-friendly line from metadata.
    All fields are coerced to strings safely.
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
        parts.append("by " + brand)

    specs = []
    if material:
        specs.append(material)
    if color:
        specs.append(color)
    if category:
        specs.append(category)
    if specs:
        parts.append(" | ".join(specs))

    return " ".join(parts) if parts else "Recommended item"
