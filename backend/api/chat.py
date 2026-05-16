from fastapi import APIRouter, HTTPException
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from typing import List, Optional
from rag.query import query_rag_pipeline

router = APIRouter()

# ── Request / Response models ──────────────────────────────────────

class ChatMessage(BaseModel):
    role: str        # "user" or "assistant"
    content: str

class ChatRequest(BaseModel):
    question: str
    chat_history: Optional[List[ChatMessage]] = []
    top_k: Optional[int] = 5

class SourceCitation(BaseModel):
    filename: str
    page: int
    chunk_index: int
    relevance_score: float
    preview: str

class ChatResponse(BaseModel):
    answer: str
    sources: List[SourceCitation]
    confidence: float
    tokens_used: Optional[int] = None
    chunks_retrieved: Optional[int] = None

# ── Endpoints ──────────────────────────────────────────────────────

@router.post("/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    """Ask a question. Returns AI answer + source citations + confidence."""
    if not request.question.strip():
        raise HTTPException(status_code=400, detail="Question cannot be empty.")

    try:
        # Convert pydantic models to dicts for the pipeline
        history = [
            {"role": msg.role, "content": msg.content}
            for msg in (request.chat_history or [])
        ]

        result = await query_rag_pipeline(
            question=request.question,
            chat_history=history,
            top_k=request.top_k or 5
        )

        return ChatResponse(**result)

    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        print(f"❌ Chat error: {e}")
        raise HTTPException(status_code=500, detail=f"Query failed: {str(e)}")


@router.post("/chat/clear")
async def clear_chat():
    """Clear chat history for the current session."""
    return JSONResponse(content={
        "success": True,
        "message": "Chat history cleared"
    })


@router.get("/chat/history")
async def get_chat_history():
    """Get current session chat history."""
    return JSONResponse(content={
        "success": True,
        "history": [],
        "message": "Session history is managed client-side"
    })