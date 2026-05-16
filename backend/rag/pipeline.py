import os
import uuid
import fitz  # PyMuPDF
from docx import Document as DocxDocument
from typing import List, Dict, Any
import chromadb
from chromadb.config import Settings
from dotenv import load_dotenv

load_dotenv()

from rag.embeddings import get_embedding_model

# ── ChromaDB client (singleton) ────────────────────────────────────

_chroma_client = None
_collection = None

def get_chroma_collection():
    """Get or create ChromaDB collection."""
    global _chroma_client, _collection

    if _collection is None:
        db_path = os.getenv("CHROMA_DB_PATH", "./chroma_db")
        _chroma_client = chromadb.PersistentClient(
            path=db_path,
            settings=Settings(anonymized_telemetry=False)
        )
        _collection = _chroma_client.get_or_create_collection(
            name="enterprise_docs",
            metadata={"hnsw:space": "cosine"}
        )
        print(f"✅ ChromaDB collection ready: {_collection.count()} chunks stored")

    return _collection

# ── Text extraction ────────────────────────────────────────────────

def extract_text_from_pdf(file_bytes: bytes) -> List[Dict[str, Any]]:
    """
    Extract text from PDF page by page.
    Returns list of {page_number, text} dicts.
    """
    pages = []
    doc = fitz.open(stream=file_bytes, filetype="pdf")

    for page_num in range(len(doc)):
        page = doc[page_num]
        text = page.get_text("text").strip()
        if text:  # skip empty pages
            pages.append({
                "page_number": page_num + 1,  # 1-indexed for display
                "text": text
            })

    doc.close()
    return pages

def extract_text_from_docx(file_bytes: bytes) -> List[Dict[str, Any]]:
    """
    Extract text from DOCX file.
    DOCX has no pages — we treat every 500 words as a virtual page.
    """
    import io
    doc = DocxDocument(io.BytesIO(file_bytes))
    full_text = "\n".join([para.text for para in doc.paragraphs if para.text.strip()])

    words = full_text.split()
    pages = []
    words_per_page = 500
    for i in range(0, len(words), words_per_page):
        chunk_words = words[i:i + words_per_page]
        pages.append({
            "page_number": (i // words_per_page) + 1,
            "text": " ".join(chunk_words)
        })

    return pages

# ── Text chunking ──────────────────────────────────────────────────

def chunk_text(text: str, chunk_size: int = None, overlap: int = None) -> List[str]:
    """
    Split text into overlapping chunks by word count.
    Overlap ensures context isn't lost at chunk boundaries.
    """
    chunk_size = chunk_size or int(os.getenv("CHUNK_SIZE", 500))
    overlap = overlap or int(os.getenv("CHUNK_OVERLAP", 50))

    words = text.split()
    chunks = []
    start = 0

    while start < len(words):
        end = start + chunk_size
        chunk = " ".join(words[start:end])
        if chunk.strip():
            chunks.append(chunk)
        start += chunk_size - overlap  # slide window with overlap

    return chunks

# ── Main ingestion function ────────────────────────────────────────

async def ingest_document(
    file_bytes: bytes,
    filename: str
) -> Dict[str, Any]:
    """
    Full ingestion pipeline:
    1. Extract text (PDF or DOCX)
    2. Chunk text
    3. Embed chunks via HuggingFace
    4. Store in ChromaDB with metadata
    """
    print(f"\n📄 Ingesting: {filename}")

    # Step 1 — Extract text
    if filename.lower().endswith(".pdf"):
        pages = extract_text_from_pdf(file_bytes)
    elif filename.lower().endswith((".docx", ".doc")):
        pages = extract_text_from_docx(file_bytes)
    else:
        raise ValueError(f"Unsupported file type: {filename}")

    if not pages:
        raise ValueError(f"No text could be extracted from {filename}")

    print(f"   📃 Extracted {len(pages)} pages")

    # Step 2 — Chunk all pages
    all_chunks = []      # chunk text
    all_metadatas = []   # metadata per chunk
    all_ids = []         # unique ID per chunk

    chunk_index = 0
    for page in pages:
        chunks = chunk_text(page["text"])
        for chunk in chunks:
            all_chunks.append(chunk)
            all_metadatas.append({
                "source": filename,
                "page_number": page["page_number"],
                "chunk_index": chunk_index,
                "total_pages": len(pages)
            })
            all_ids.append(f"{filename}__chunk__{chunk_index}__{uuid.uuid4().hex[:8]}")
            chunk_index += 1

    print(f"   🔪 Created {len(all_chunks)} chunks")

    # Step 3 — Embed chunks
    embedding_model = get_embedding_model()
    print(f"   🧮 Embedding {len(all_chunks)} chunks...")
    embeddings = embedding_model.embed_documents(all_chunks)
    print(f"   ✅ Embeddings created: shape {len(embeddings)}x{len(embeddings[0])}")

    # Step 4 — Store in ChromaDB
    collection = get_chroma_collection()

    # Store in batches of 100 to avoid memory issues
    batch_size = 100
    for i in range(0, len(all_chunks), batch_size):
        collection.add(
            ids=all_ids[i:i + batch_size],
            embeddings=embeddings[i:i + batch_size],
            documents=all_chunks[i:i + batch_size],
            metadatas=all_metadatas[i:i + batch_size]
        )

    print(f"   💾 Stored in ChromaDB. Total chunks in DB: {collection.count()}")

    return {
        "filename": filename,
        "pages_extracted": len(pages),
        "chunks_created": len(all_chunks),
        "embedding_dim": len(embeddings[0]),
        "status": "success"
    }

# ── Document listing & deletion ────────────────────────────────────

def list_documents() -> List[Dict[str, Any]]:
    """List all unique documents stored in ChromaDB."""
    collection = get_chroma_collection()

    if collection.count() == 0:
        return []

    # Get all metadata
    results = collection.get(include=["metadatas"])
    metadatas = results["metadatas"]

    # Group by source filename
    docs = {}
    for meta in metadatas:
        source = meta["source"]
        if source not in docs:
            docs[source] = {
                "filename": source,
                "total_pages": meta.get("total_pages", 0),
                "chunk_count": 0
            }
        docs[source]["chunk_count"] += 1

    return list(docs.values())

def delete_document(filename: str) -> Dict[str, Any]:
    """Delete all chunks for a specific document from ChromaDB."""
    collection = get_chroma_collection()

    # Find all chunk IDs for this document
    results = collection.get(
        where={"source": filename},
        include=["metadatas"]
    )

    if not results["ids"]:
        raise ValueError(f"Document '{filename}' not found in database")

    chunk_count = len(results["ids"])
    collection.delete(ids=results["ids"])

    print(f"🗑️  Deleted '{filename}': {chunk_count} chunks removed")
    return {"filename": filename, "chunks_deleted": chunk_count}

def delete_all_documents() -> Dict[str, Any]:
    """Delete ALL documents from ChromaDB."""
    global _chroma_client, _collection

    collection = get_chroma_collection()
    total = collection.count()

    # Delete the collection and recreate it
    _chroma_client.delete_collection("enterprise_docs")
    _collection = _chroma_client.get_or_create_collection(
        name="enterprise_docs",
        metadata={"hnsw:space": "cosine"}
    )

    print(f"🗑️  Cleared all documents: {total} chunks removed")
    return {"chunks_deleted": total}