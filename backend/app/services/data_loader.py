import os
import ast
import re
import pandas as pd

# ---------- locate CSV robustly ----------
def _candidate_paths():
    here = os.path.abspath(os.path.dirname(__file__))          # .../backend/app/services
    app_dir = os.path.abspath(os.path.join(here, ".."))        # .../backend/app
    backend_dir = os.path.abspath(os.path.join(app_dir, "..")) # .../backend
    root = os.path.abspath(os.path.join(backend_dir, ".."))    # .../project root
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

# ---------- helpers ----------
_URL_RE = re.compile(r'(https?://[^\s,"\'\]]+)', re.IGNORECASE)

def _first_category(v):
    if pd.isna(v): return None
    s = str(v).strip()
    # handle python-list-as-string
    if s.startswith('[') and s.endswith(']'):
        try:
            lst = ast.literal_eval(s)
            if isinstance(lst, (list, tuple)) and lst:
                val = str(lst[0]).strip()
                return val or None
        except Exception:
            pass
    # fallback: comma separated
    return (s.split(',')[0].strip() or None)

def _first_image(v):
    """
    Extract first usable image URL from messy 'images' column:
    - Handles python-list-as-string
    - Comma-joined strings
    - Finds first http(s) URL via regex
    - Handles //protocol-relative URLs by forcing https
    - Handles host/path without scheme by adding https://
    """
    if v is None or (isinstance(v, float) and pd.isna(v)):
        return None
    s = str(v).strip()
    if not s:
        return None

    # try list as string first
    if (s.startswith('[') and s.endswith(']')) or (s.startswith('(') and s.endswith(')')):
        try:
            parsed = ast.literal_eval(s)
            if isinstance(parsed, (list, tuple)) and parsed:
                # look for first http(s) in the list
                for cand in parsed:
                    url = _coerce_url(cand)
                    if url:
                        return url
                # fallback to first element coerced
                return _coerce_url(parsed[0])
        except Exception:
            pass

    # try regex for http(s)
    m = _URL_RE.search(s)
    if m:
        return _coerce_url(m.group(1))

    # maybe comma-separated without clear http(s)
    head = s.split(',')[0].strip()
    return _coerce_url(head)

def _coerce_url(raw):
    if not raw:
        return None
    u = str(raw).strip().strip('"').strip("'")
    if not u:
        return None
    if u.startswith("//"):
        return "https:" + u
    if u.lower().startswith("http://") or u.lower().startswith("https://"):
        return u
    # looks like host/path?
    if re.match(r'^[a-z0-9.-]+/.+', u, re.IGNORECASE):
        return "https://" + u
    return None

# ---------- main ----------
def load_catalog_min():
    df = pd.read_csv(DATA_PATH, encoding="utf-8", on_bad_lines="skip")

    for col in ['title','brand','material','description','price','categories','images','uniq_id','color']:
        if col not in df.columns:
            df[col] = None

    # price → numeric
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
        image_url = _first_image(r.get('images'))
        meta = {
            'uniq_id' : r.get('uniq_id'),
            'title'   : r.get('title'),
            'brand'   : r.get('brand'),
            'material': r.get('material'),
            'price'   : float(r['price_num']) if pd.notna(r['price_num']) else None,
            'category': _first_category(r.get('categories')),
            'image'   : image_url,
            'color'   : r.get('color'),
        }
        items.append({**meta, 'text_blob': r.get('text_blob'), 'metadata': meta})
    return items
