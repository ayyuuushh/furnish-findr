from pydantic import BaseModel
import os

class Settings(BaseModel):
    PINECONE_API_KEY: str = os.getenv("PINECONE_API_KEY", "")
    PINECONE_ENV: str = os.getenv("PINECONE_ENV", "")
    PINECONE_INDEX: str = os.getenv("PINECONE_INDEX", "ikarus-products")
    EMBEDDING_MODEL: str = os.getenv("EMBEDDING_MODEL", "sentence-transformers/all-MiniLM-L6-v2")
    USE_PINECONE: bool = os.getenv("USE_PINECONE", "false").lower() == "true"
    VEC_DIM: int = int(os.getenv("VEC_DIM", "384"))

settings = Settings()
