from sentence_transformers import SentenceTransformer
import os

model_name = os.getenv("EMBEDDING_MODEL", "paraphrase-MiniLM-L3-v2")
print(f"Downloading model: {model_name}")
model = SentenceTransformer(model_name)
print("Model downloaded and cached successfully!")