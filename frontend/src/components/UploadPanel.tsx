"use client";
import { useState, useRef } from "react";
import { uploadDocuments } from "../lib/api";

interface UploadResult {
  filename: string;
  pages_extracted: number;
  chunks_created: number;
  status: string;
}

interface UploadError {
  filename: string;
  error: string;
}

interface UploadPanelProps {
  onUploadSuccess: () => void;
}

export default function UploadPanel({ onUploadSuccess }: UploadPanelProps) {
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [results, setResults] = useState<UploadResult[]>([]);
  const [errors, setErrors] = useState<UploadError[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const files = Array.from(e.dataTransfer.files).filter(
      (f) => f.name.endsWith(".pdf") || f.name.endsWith(".docx")
    );
    setSelectedFiles((prev) => [...prev, ...files]);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setSelectedFiles((prev) => [...prev, ...Array.from(e.target.files as FileList)]);
    }
  };

  const removeFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) return;
    setUploading(true);
    setResults([]);
    setErrors([]);

    try {
      const response = await uploadDocuments(selectedFiles);
      setResults(response.uploaded);
      setErrors(response.errors);
      setSelectedFiles([]);
      if (response.total_uploaded > 0) onUploadSuccess();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Upload failed";
      setErrors([{ filename: "Upload", error: message }]);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div style={{
      flex: 1, padding: "40px",
      overflowY: "auto", backgroundColor: "#0f1117",
    }}>
      <div style={{ maxWidth: "700px", margin: "0 auto" }}>
        <h1 style={{ fontSize: "28px", fontWeight: 700, color: "#f1f5f9", marginBottom: "8px" }}>
          Upload Documents
        </h1>
        <p style={{ color: "#64748b", marginBottom: "32px", fontSize: "15px" }}>
          Upload PDFs or DOCX files to index them into the knowledge base.
        </p>

        {/* Drop Zone */}
        <div
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          style={{
            border: `2px dashed ${dragging ? "#6366f1" : "#1e2235"}`,
            borderRadius: "16px",
            padding: "60px 40px",
            textAlign: "center",
            cursor: "pointer",
            background: dragging ? "rgba(99, 102, 241, 0.05)" : "#13161f",
            transition: "all 0.2s",
            marginBottom: "24px",
          }}
        >
          <div style={{ fontSize: "48px", marginBottom: "16px" }}>📂</div>
          <p style={{ color: "#e2e8f0", fontSize: "16px", fontWeight: 500, marginBottom: "8px" }}>
            Drag and drop files here
          </p>
          <p style={{ color: "#64748b", fontSize: "14px", marginBottom: "16px" }}>
            or click to browse
          </p>
          <div style={{
            display: "inline-block", padding: "8px 20px",
            background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
            borderRadius: "8px", fontSize: "14px", fontWeight: 500, color: "#fff",
          }}>
            Choose Files
          </div>
          <p style={{ color: "#475569", fontSize: "12px", marginTop: "16px" }}>
            Supports PDF, DOCX · Multiple files allowed
          </p>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept=".pdf,.docx,.doc"
            onChange={handleFileSelect}
            style={{ display: "none" }}
          />
        </div>

        {/* Selected Files */}
        {selectedFiles.length > 0 && (
          <div style={{ marginBottom: "24px" }}>
            <h3 style={{ fontSize: "14px", color: "#94a3b8", marginBottom: "12px", fontWeight: 600 }}>
              SELECTED FILES ({selectedFiles.length})
            </h3>
            {selectedFiles.map((file, i) => (
              <div key={i} style={{
                display: "flex", justifyContent: "space-between", alignItems: "center",
                background: "#13161f", borderRadius: "8px", padding: "12px 16px",
                marginBottom: "8px", border: "1px solid #1e2235",
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <span style={{ fontSize: "20px" }}>
                    {file.name.endsWith(".pdf") ? "📄" : "📝"}
                  </span>
                  <div>
                    <div style={{ fontSize: "14px", color: "#e2e8f0" }}>{file.name}</div>
                    <div style={{ fontSize: "12px", color: "#64748b" }}>
                      {(file.size / 1024).toFixed(1)} KB
                    </div>
                  </div>
                </div>
                <button
                  onClick={(e) => { e.stopPropagation(); removeFile(i); }}
                  style={{
                    background: "none", border: "none", color: "#64748b",
                    cursor: "pointer", fontSize: "18px", padding: "4px 8px",
                  }}
                >x</button>
              </div>
            ))}

            <button
              onClick={handleUpload}
              disabled={uploading}
              style={{
                width: "100%", padding: "14px",
                background: uploading ? "#1e2235" : "linear-gradient(135deg, #6366f1, #8b5cf6)",
                color: uploading ? "#64748b" : "#fff",
                border: "none", borderRadius: "10px",
                fontSize: "15px", fontWeight: 600,
                cursor: uploading ? "not-allowed" : "pointer",
                marginTop: "8px",
              }}
            >
              {uploading ? "Indexing documents..." : `Upload and Index ${selectedFiles.length} file(s)`}
            </button>
          </div>
        )}

        {/* Results */}
        {results.length > 0 && (
          <div style={{ marginBottom: "20px" }}>
            <h3 style={{ fontSize: "14px", color: "#22c55e", marginBottom: "12px", fontWeight: 600 }}>
              SUCCESSFULLY INDEXED
            </h3>
            {results.map((r, i) => (
              <div key={i} style={{
                background: "rgba(34, 197, 94, 0.05)",
                border: "1px solid rgba(34, 197, 94, 0.2)",
                borderRadius: "8px", padding: "12px 16px", marginBottom: "8px",
              }}>
                <div style={{ fontSize: "14px", color: "#e2e8f0", fontWeight: 500 }}>
                  📄 {r.filename}
                </div>
                <div style={{ fontSize: "12px", color: "#64748b", marginTop: "4px" }}>
                  {r.pages_extracted} pages · {r.chunks_created} chunks · 384-dim embeddings
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Errors */}
        {errors.length > 0 && (
          <div>
            <h3 style={{ fontSize: "14px", color: "#ef4444", marginBottom: "12px", fontWeight: 600 }}>
              FAILED
            </h3>
            {errors.map((e, i) => (
              <div key={i} style={{
                background: "rgba(239, 68, 68, 0.05)",
                border: "1px solid rgba(239, 68, 68, 0.2)",
                borderRadius: "8px", padding: "12px 16px", marginBottom: "8px",
              }}>
                <div style={{ fontSize: "14px", color: "#fca5a5" }}>{e.filename}</div>
                <div style={{ fontSize: "12px", color: "#64748b", marginTop: "4px" }}>{e.error}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}