from fastapi import APIRouter, HTTPException, Response
from pydantic import BaseModel
from typing import Optional, Dict, Any
from urllib.parse import urlparse
import httpx

from .services.recommender import recommend_items
from .services.embeddings import ensure_models_ready
from .services.analytics_store import get_analytics

router = APIRouter()


# ---------- Models ----------
class RecoReq(BaseModel):
    query: str
    filters: Optional[Dict[str, Any]] = None
    k: int = 5


# ---------- Helpers ----------
def _normalize_img_url(u: str) -> str:
    """
    Accepts messy image strings and returns a proper https URL.
    Handles:
      - //m.media-amazon.com/...
      - m.media-amazon.com/... (no scheme)
      - full http/https URLs
    """
    if not u:
        raise HTTPException(status_code=400, detail="Missing 'u' param")

    s = str(u).strip().strip('"').strip("'")

    if s.startswith("//"):
        return "https:" + s

    if s.startswith("http://") or s.startswith("https://"):
        return s

    # no scheme but looks like host/path
    p = urlparse("http://" + s)
    if p.netloc and p.path:
        return "https://" + s  # force https

    raise HTTPException(status_code=400, detail="Invalid image URL")


# ---------- Routes ----------
@router.post("/recommend")
def recommend(req: RecoReq):
    """
    Get recommendations based on user query.
    Returns an empty list (with a message) when nothing is found,
    instead of raising errors.
    """
    try:
        ensure_models_ready()
        items = recommend_items(req.query, req.filters, req.k)

        if not items:
            return {
                "items": [],
                "message": "No matching furniture found. Try refining your query.",
            }

        return {"items": items}

    except Exception as e:
        print("Error in /recommend:", str(e))
        return {
            "items": [],
            "message": "Server error occurred while generating recommendations.",
        }


@router.get("/analytics")
def analytics():
    """
    Returns analytics data like total products, brand counts, etc.
    """
    try:
        data = get_analytics()
        return data
    except Exception as e:
        print("Error in /analytics:", str(e))
        return {"error": "Unable to fetch analytics data."}


@router.get("/img")
async def proxy_image(u: str):
    """
    Image proxy to avoid hotlink/CORS/mixed-content issues.
    Usage: GET /api/img?u=<absolute_or_protocol-relative_url>
    """
    url = _normalize_img_url(u)
    try:
        async with httpx.AsyncClient(
            timeout=15.0, follow_redirects=True, headers={"User-Agent": "Mozilla/5.0"}
        ) as client:
            r = await client.get(url)

        if r.status_code != 200 or not r.content:
            raise HTTPException(status_code=404, detail="Failed to fetch image")

        content_type = r.headers.get("content-type", "image/jpeg")
        return Response(content=r.content, media_type=content_type)

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"Proxy error: {e}")
