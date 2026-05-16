import os
from typing import List, Dict, Any
from rag.embeddings import get_embedding_model
from rag.pipeline import get_chroma_collection

def retrieve_relevant_chunks(
    question: str,
    top_k: int = None
) -> List[Dict[str, Any]]:
    """
    Embed the question and find the most relevant chunks in ChromaDB.
    Returns chunks with metadata and confidence scores.
    """
    top_k = top_k or int(os.getenv("MAX_CHUNKS", 5))

    # Embed the question
    embedding_model = get_embedding_model()
    question_embedding = embedding_model.embed_query(question)

    # Search ChromaDB
    collection = get_chroma_collection()

    if collection.count() == 0:
        return []

    results = collection.query(
        query_embeddings=[question_embedding],
        n_results=min(top_k, collection.count()),
        include=["documents", "metadatas", "distances"]
    )

    # Process results
    chunks = []
    documents = results["documents"][0]
    metadatas = results["metadatas"][0]
    distances = results["distances"][0]

    for doc, meta, distance in zip(documents, metadatas, distances):
        # Convert cosine distance to confidence score (0-1)
        # Distance 0 = identical, Distance 2 = opposite
        # For normalized vectors: distance range is 0 to 2
        confidence = max(0.0, 1.0 - (distance / 2.0))

        chunks.append({
            "text": doc,
            "source": meta.get("source", "Unknown"),
            "page_number": meta.get("page_number", 1),
            "chunk_index": meta.get("chunk_index", 0),
            "confidence": round(confidence, 4),
            "distance": round(distance, 4),
            "preview": doc[:200] + "..." if len(doc) > 200 else doc
        })

    # Sort by confidence descending
    chunks.sort(key=lambda x: x["confidence"], reverse=True)
    return chunks