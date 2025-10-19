from .vectorstore import search
from .generative import blurb_for

def recommend_items(query: str, filters: dict | None, k: int):
    hits = search(query, top_k=max(10, k*3), filters=filters or {})
    items = []
    for h in hits[:k]:
        md = h['metadata']
        items.append({
            'score': h['score'],
            'uniq_id': md.get('uniq_id'),
            'title': md.get('title'),
            'brand': md.get('brand'),
            'price': md.get('price'),
            'image': md.get('image'),
            'category': md.get('category'),
            'blurb': blurb_for(md),
        })
    return items
