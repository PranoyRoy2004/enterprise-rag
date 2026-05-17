from chromadb.utils import embedding_functions

def get_embedding_model():
    """Use ChromaDB's built-in default embedding function."""
    return embedding_functions.DefaultEmbeddingFunction()