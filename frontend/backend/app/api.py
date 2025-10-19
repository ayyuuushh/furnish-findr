from fastapi import APIRouter
from pydantic import BaseModel
from typing import Optional, Dict, Any

from .services.recommender import recommend_items
from .services.embeddings import ensure_models_ready
from .services.analytics_store import get_analytics

router = APIRouter()

class RecoReq(BaseModel):
    query: str
    filters: Optional[Dict[str, Any]] = None
    k: int = 5


@router.post("/recommend")
def recommend(req: RecoReq):
    """
    Endpoint to get recommendations based on user query.
    Gracefully handles case when no results found.
    """
    try:
        ensure_models_ready()
        items = recommend_items(req.query, req.filters, req.k)

        # If no recommendations are found, return an empty list instead of crashing
        if not items:
            return {
                "items": [],
                "message": "No matching furniture found. Try refining your query."
            }

        return {"items": items}

    except Exception as e:
        print("Error in /recommend:", str(e))
        return {
            "items": [],
            "message": "Server error occurred while generating recommendations."
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
        return {
            "error": "Unable to fetch analytics data."
        }
