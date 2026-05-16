from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import os
from dotenv import load_dotenv

load_dotenv()

from api.upload import router as upload_router
from api.chat import router as chat_router

@asynccontextmanager
async def lifespan(app: FastAPI):
    print("🚀 Enterprise RAG API starting up...")
    print(f"📁 ChromaDB path: {os.getenv('CHROMA_DB_PATH', './chroma_db')}")
    print(f"🤖 Embedding model: {os.getenv('EMBEDDING_MODEL', 'all-MiniLM-L6-v2')}")
    print(f"⚡ Groq model: {os.getenv('GROQ_MODEL', 'llama-3.3-70b-versatile')}")
    yield
    print("🛑 Enterprise RAG API shutting down...")

app = FastAPI(
    title="Enterprise RAG Knowledge Base API",
    description="AI-powered document Q&A system with RAG pipeline",
    version="1.0.0",
    lifespan=lifespan
)

# CORS — allows Next.js frontend to talk to this API
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        os.getenv("FRONTEND_URL", "http://localhost:3000"),
        "http://localhost:3000",
        "https://*.vercel.app",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers
app.include_router(upload_router, prefix="/api", tags=["Documents"])
app.include_router(chat_router, prefix="/api", tags=["Chat"])

@app.get("/")
async def root():
    return {
        "message": "Enterprise RAG Knowledge Base API",
        "version": "1.0.0",
        "status": "running",
        "docs": "/docs"
    }

@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "embedding_model": os.getenv("EMBEDDING_MODEL"),
        "groq_model": os.getenv("GROQ_MODEL"),
        "chroma_path": os.getenv("CHROMA_DB_PATH"),
    }