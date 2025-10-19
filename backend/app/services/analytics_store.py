import json
from .data_loader import load_catalog_min

CACHE = None

def get_analytics():
    global CACHE
    if CACHE is None:
        items = load_catalog_min()
        total = len(items)
        by_brand = {}
        by_cat = {}
        prices = []
        for it in items:
            b = (it.get('brand') or 'Unknown').strip() or 'Unknown'
            by_brand[b] = by_brand.get(b, 0) + 1
            c = (it.get('category') or 'Unknown').strip() or 'Unknown'
            by_cat[c] = by_cat.get(c, 0) + 1
            if it.get('price') is not None:
                prices.append(float(it['price']))
        CACHE = {
            'total_products': total,
            'brand_counts': sorted(by_brand.items(), key=lambda x: -x[1])[:20],
            'category_counts': sorted(by_cat.items(), key=lambda x: -x[1])[:20],
            'price_summary': {
                'min': min(prices) if prices else None,
                'max': max(prices) if prices else None,
                'avg': (sum(prices)/len(prices)) if prices else None,
            },
        }
    return CACHE
