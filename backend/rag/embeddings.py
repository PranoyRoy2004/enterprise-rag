from langchain_huggingface import HuggingFaceEmbeddings
import os

# Global instance — loaded once, reused everywhere
_embedding_model = None

def get_embedding_model() -> HuggingFaceEmbeddings:
    """
    Load HuggingFace embedding model (singleton pattern).
    Downloads on first run (~90MB), cached locally after that.
    """
    global _embedding_model

    if _embedding_model is None:
        model_name = os.getenv("EMBEDDING_MODEL", "paraphrase-MiniLM-L3-v2")
        print(f"📦 Loading embedding model: {model_name}")
        _embedding_model = HuggingFaceEmbeddings(
            model_name=model_name,
            model_kwargs={"device": "cpu"},
            encode_kwargs={"normalize_embeddings": True}
        )
        print(f"✅ Embedding model loaded successfully")

    return _embedding_model