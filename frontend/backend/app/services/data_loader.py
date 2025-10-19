import os
import ast
import re
import pandas as pd

# ---------- locate CSV robustly (works locally & in deploy) ----------
def _candidate_paths():
    here = os.path.abspath(os.path.dirname(__file__))          # .../backend/app/services
    app_dir = os.path.abspath(os.path.join(here, ".."))        # .../backend/app
    backend_dir = os.path.abspath(os.path.join(app_dir, "..")) # .../backend
    root = os.path.abspath(os.path.join(backend_dir, ".."))    # .../ikarus-furniture-reco
    yield os.path.join(root, "data", "raw", "intern_data_ikarus.csv")
    yield os.path.join(backend_dir, "data", "raw", "intern_data_ikarus.csv")
    yield os.path.abspath(os.path.join(os.getcwd(), "data", "raw", "intern_data_ikarus.csv"))

def _resolve_csv_path():
    tried = []
    for p in _candidate_paths():
        tried.append(p)
        if os.path.exists(p):
            return p
    raise FileNotFoundError("CSV not found. Tried:\n  - " + "\n  - ".join(tried))

DATA_PATH = _resolve_csv_path()

# ---------- helpers to pretty up fields ----------
_url_re = re.compile(r'https?://[^\s,"\]]+')

def _first_category(v):
    if pd.isna(v): return None
    s = str(v).strip()
    if s.startswith('[') and s.endswith(']'):
        try:
            lst = ast.literal_eval(s)
            if isinstance(lst, (list, tuple)) and lst:
                return (str(lst[0]) or '').strip() or None
        except Exception:
            pass
    return (s.split(',')[0].strip() or None)

def _first_image(v):
    """Extract first real URL from images blob; fix //… and comma-separated values."""
    if pd.isna(v): return None
    s = str(v)
    m = _url_re.search(s)
    url = (m.group(0) if m else s.split(',')[0].strip()) or None
    if not url: return None
    if url.startswith('//'): url = 'https:' + url
    return url

# ---------- main loader used by API ----------
def load_catalog_min():
    df = pd.read_csv(DATA_PATH, encoding="utf-8", on_bad_lines="skip")

    for col in ['title','brand','material','description','price','categories','images','uniq_id','color']:
        if col not in df.columns: df[col] = None

    # ✅ FIX: proper price parsing (keep only digits and dot)
    df['price_num'] = pd.to_numeric(
        df['price'].astype(str).str.replace(r'[^\d.]', '', regex=True),
        errors='coerce'
    )

    df['text_blob'] = (
        df['title'].fillna('') + '. ' +
        df['brand'].fillna('') + '. ' +
        df['material'].fillna('') + '. ' +
        df['description'].fillna('')
    ).str.strip()

    items = []
    for _, r in df.iterrows():
        meta = {
            'uniq_id' : r.get('uniq_id'),
            'title'   : r.get('title'),
            'brand'   : r.get('brand'),
            'material': r.get('material'),
            'price'   : float(r['price_num']) if pd.notna(r['price_num']) else None,
            'category': _first_category(r.get('categories')),
            'image'   : _first_image(r.get('images')),
            'color'   : r.get('color'),
        }
        items.append({**meta, 'text_blob': r.get('text_blob'), 'metadata': meta})
    return items
