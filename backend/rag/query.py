import os
from typing import List, Dict, Any, Optional
from groq import Groq
from dotenv import load_dotenv

load_dotenv()

from rag.retriever import retrieve_relevant_chunks

# Groq client singleton
_groq_client = None

def get_groq_client() -> Groq:
    global _groq_client
    if _groq_client is None:
        api_key = os.getenv("GROQ_API_KEY")
        if not api_key:
            raise ValueError("GROQ_API_KEY not found in .env file")
        _groq_client = Groq(api_key=api_key)
        print("✅ Groq client initialized")
    return _groq_client


def build_system_prompt() -> str:
    return """You are an intelligent enterprise knowledge base assistant.

Your job is to answer questions ONLY based on the provided document context.

Rules:
- Answer strictly from the context provided. Do not use outside knowledge.
- If the answer is not in the context, say: "I could not find relevant information in the uploaded documents."
- Always be precise, professional, and concise.
- When referencing information, mention which document it came from naturally in your answer.
- If multiple documents contain relevant info, synthesize them clearly.
- Never make up facts, page numbers, or document names."""


def build_context_block(chunks: List[Dict[str, Any]]) -> str:
    """Format retrieved chunks into a readable context block for the LLM."""
    if not chunks:
        return "No relevant context found."

    context_parts = []
    for i, chunk in enumerate(chunks, 1):
        context_parts.append(
            f"[Source {i}] From '{chunk['source']}', Page {chunk['page_number']} "
            f"(Confidence: {round(chunk['confidence'] * 100, 1)}%):\n{chunk['text']}"
        )

    return "\n\n---\n\n".join(context_parts)


def format_chat_history(chat_history: List[Dict[str, str]]) -> List[Dict[str, str]]:
    """Convert chat history to Groq message format."""
    messages = []
    for msg in chat_history:
        if msg["role"] in ("user", "assistant"):
            messages.append({
                "role": msg["role"],
                "content": msg["content"]
            })
    return messages


async def query_rag_pipeline(
    question: str,
    chat_history: Optional[List[Dict[str, str]]] = None,
    top_k: int = 5
) -> Dict[str, Any]:
    """
    Full RAG query pipeline:
    1. Retrieve relevant chunks from ChromaDB
    2. Build prompt with context
    3. Call Groq LLM
    4. Return answer + citations + confidence
    """
    chat_history = chat_history or []

    print(f"\n🔍 Query: {question[:80]}...")

    # Step 1 — Retrieve relevant chunks
    chunks = retrieve_relevant_chunks(question, top_k=top_k)
    print(f"   📚 Retrieved {len(chunks)} chunks")

    if chunks:
        avg_confidence = sum(c["confidence"] for c in chunks) / len(chunks)
        top_confidence = chunks[0]["confidence"]
        print(f"   🎯 Top confidence: {round(top_confidence * 100, 1)}%")
    else:
        avg_confidence = 0.0
        top_confidence = 0.0

    # Step 2 — Build context block
    context = build_context_block(chunks)

    # Step 3 — Build messages for Groq
    groq_client = get_groq_client()
    model = os.getenv("GROQ_MODEL", "llama-3.3-70b-versatile")

    # System prompt
    system_prompt = build_system_prompt()

    # Build message list: system + history + current question with context
    messages = [{"role": "system", "content": system_prompt}]

    # Add chat history (without context — context is only for current question)
    if chat_history:
        messages.extend(format_chat_history(chat_history))

    # Add current question with retrieved context
    user_message = f"""Context from uploaded documents:

{context}

---

Question: {question}

Please answer based on the context above."""

    messages.append({"role": "user", "content": user_message})

    # Step 4 — Call Groq
    print(f"   ⚡ Calling Groq ({model})...")
    response = groq_client.chat.completions.create(
        model=model,
        messages=messages,
        max_tokens=1024,
        temperature=0.1,  # low temp = more factual, less creative
    )

    answer = response.choices[0].message.content
    tokens_used = response.usage.total_tokens
    print(f"   ✅ Answer generated ({tokens_used} tokens used)")

    # Step 5 — Build source citations
    sources = []
    seen = set()
    for chunk in chunks:
        key = f"{chunk['source']}_p{chunk['page_number']}"
        if key not in seen:
            seen.add(key)
            sources.append({
                "filename": chunk["source"],
                "page": chunk["page_number"],
                "chunk_index": chunk["chunk_index"],
                "relevance_score": round(chunk["confidence"], 4),
                "preview": chunk["preview"]
            })

    # Overall confidence = weighted average of top chunks
    overall_confidence = round(top_confidence, 4) if chunks else 0.0

    return {
        "answer": answer,
        "sources": sources,
        "confidence": overall_confidence,
        "tokens_used": tokens_used,
        "chunks_retrieved": len(chunks)
    }