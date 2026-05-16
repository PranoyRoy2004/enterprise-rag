from fastapi import APIRouter, UploadFile, File, HTTPException
from fastapi.responses import JSONResponse
from typing import List
from rag.pipeline import ingest_document, list_documents, delete_document, delete_all_documents

router = APIRouter()

@router.post("/upload")
async def upload_documents(files: List[UploadFile] = File(...)):
    """Upload and index documents into ChromaDB."""
    if not files:
        raise HTTPException(status_code=400, detail="No files provided.")

    results = []
    errors = []

    for file in files:
        if not file.filename.endswith((".pdf", ".docx", ".doc")):
            errors.append({
                "filename": file.filename,
                "error": "Unsupported file type. Only PDF and DOCX allowed."
            })
            continue

        try:
            file_bytes = await file.read()
            result = await ingest_document(file_bytes, file.filename)
            results.append(result)
        except Exception as e:
            errors.append({
                "filename": file.filename,
                "error": str(e)
            })

    return JSONResponse(content={
        "success": len(results) > 0,
        "uploaded": results,
        "errors": errors,
        "total_uploaded": len(results),
        "total_failed": len(errors)
    })

@router.get("/documents")
async def list_documents_endpoint():
    """List all indexed documents."""
    try:
        docs = list_documents()
        return JSONResponse(content={
            "success": True,
            "documents": docs,
            "total": len(docs)
        })
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/documents/{document_name}")
async def delete_document_endpoint(document_name: str):
    """Delete a specific document from ChromaDB."""
    try:
        result = delete_document(document_name)
        return JSONResponse(content={"success": True, **result})
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/documents")
async def delete_all_documents_endpoint():
    """Delete all documents from ChromaDB."""
    try:
        result = delete_all_documents()
        return JSONResponse(content={"success": True, **result})
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))