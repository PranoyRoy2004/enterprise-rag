from sentence_transformers import SentenceTransformer
print("Downloading model...")
model = SentenceTransformer("paraphrase-MiniLM-L3-v2")
print("Model downloaded!")