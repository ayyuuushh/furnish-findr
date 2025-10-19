def blurb_for(md: dict) -> str:
    title = md.get('title') or 'This piece'
    material = md.get('material') or ''
    cat = (md.get('category') or 'furniture').lower()
    brand = md.get('brand') or ''
    vibe = 'modern' if any(k in title.lower() for k in ['modern','minimal','sleek']) else 'cozy'
    use = 'perfect for small spaces' if 'table' in cat or 'table' in title.lower() else 'a stylish pick for everyday comfort'
    line1 = f"{title}{' by ' + brand if brand else ''}{' in ' + material if material else ''}."
    line2 = f"A {vibe} {cat} that’s {use}."
    return f"{line1} {line2}"
