"use client";
import { useState } from "react";
import { Document } from "../lib/api";

interface SidebarProps {
  documents: Document[];
  onDelete: (filename: string) => void;
  onDeleteAll: () => void;
  activeTab: "chat" | "upload";
  onTabChange: (tab: "chat" | "upload") => void;
  loading: boolean;
}

export default function Sidebar({
  documents,
  onDelete,
  onDeleteAll,
  activeTab,
  onTabChange,
  loading,
}: SidebarProps) {
  const [confirmAll, setConfirmAll] = useState(false);

  return (
    <div style={{
      width: "280px",
      minWidth: "280px",
      backgroundColor: "#13161f",
      borderRight: "1px solid #1e2235",
      display: "flex",
      flexDirection: "column",
      height: "100vh",
    }}>
      {/* Logo */}
      <div style={{
        padding: "24px 20px",
        borderBottom: "1px solid #1e2235",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div style={{
            width: "36px", height: "36px",
            background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
            borderRadius: "10px",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: "18px",
          }}>🧠</div>
          <div>
            <div style={{ fontWeight: 700, fontSize: "15px", color: "#f1f5f9" }}>
              Enterprise RAG
            </div>
            <div style={{ fontSize: "11px", color: "#64748b" }}>
              Knowledge Base
            </div>
          </div>
        </div>
      </div>

      {/* Nav Tabs */}
      <div style={{ padding: "16px 12px", borderBottom: "1px solid #1e2235" }}>
        <button
          onClick={() => onTabChange("chat")}
          style={{
            width: "100%", padding: "10px 14px",
            background: activeTab === "chat" ? "linear-gradient(135deg, #6366f1, #8b5cf6)" : "transparent",
            color: activeTab === "chat" ? "#fff" : "#94a3b8",
            border: "none", borderRadius: "8px",
            cursor: "pointer", textAlign: "left",
            fontSize: "14px", fontWeight: 500,
            marginBottom: "4px",
            display: "flex", alignItems: "center", gap: "8px",
            transition: "all 0.2s",
          }}
        >
          💬 Chat
        </button>
        <button
          onClick={() => onTabChange("upload")}
          style={{
            width: "100%", padding: "10px 14px",
            background: activeTab === "upload" ? "linear-gradient(135deg, #6366f1, #8b5cf6)" : "transparent",
            color: activeTab === "upload" ? "#fff" : "#94a3b8",
            border: "none", borderRadius: "8px",
            cursor: "pointer", textAlign: "left",
            fontSize: "14px", fontWeight: 500,
            display: "flex", alignItems: "center", gap: "8px",
            transition: "all 0.2s",
          }}
        >
          📁 Upload Documents
        </button>
      </div>

      {/* Documents List */}
      <div style={{ flex: 1, overflowY: "auto", padding: "16px 12px" }}>
        <div style={{
          display: "flex", justifyContent: "space-between",
          alignItems: "center", marginBottom: "12px",
        }}>
          <span style={{ fontSize: "12px", color: "#64748b", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>
            Documents ({documents.length})
          </span>
          {documents.length > 0 && (
            <button
              onClick={() => setConfirmAll(true)}
              style={{
                fontSize: "11px", color: "#ef4444",
                background: "none", border: "none",
                cursor: "pointer", padding: "2px 6px",
                borderRadius: "4px",
              }}
            >
              Clear all
            </button>
          )}
        </div>

        {confirmAll && (
          <div style={{
            background: "#1e1a2e", border: "1px solid #ef4444",
            borderRadius: "8px", padding: "12px", marginBottom: "12px",
          }}>
            <p style={{ fontSize: "12px", color: "#fca5a5", marginBottom: "8px" }}>
              Delete all documents?
            </p>
            <div style={{ display: "flex", gap: "6px" }}>
              <button
                onClick={() => { onDeleteAll(); setConfirmAll(false); }}
                style={{
                  flex: 1, padding: "6px", background: "#ef4444",
                  color: "#fff", border: "none", borderRadius: "6px",
                  fontSize: "12px", cursor: "pointer",
                }}
              >Yes, delete</button>
              <button
                onClick={() => setConfirmAll(false)}
                style={{
                  flex: 1, padding: "6px", background: "#1e2235",
                  color: "#94a3b8", border: "none", borderRadius: "6px",
                  fontSize: "12px", cursor: "pointer",
                }}
              >Cancel</button>
            </div>
          </div>
        )}

        {loading ? (
          <div style={{ textAlign: "center", color: "#64748b", fontSize: "13px", paddingTop: "20px" }}>
            Loading...
          </div>
        ) : documents.length === 0 ? (
          <div style={{
            textAlign: "center", color: "#64748b",
            fontSize: "13px", paddingTop: "30px", lineHeight: "1.6",
          }}>
            <div style={{ fontSize: "28px", marginBottom: "8px" }}>📭</div>
            No documents yet.<br />Upload PDFs to get started.
          </div>
        ) : (
          documents.map((doc) => (
            <div key={doc.filename} style={{
              background: "#1a1d27", borderRadius: "8px",
              padding: "10px 12px", marginBottom: "8px",
              border: "1px solid #1e2235",
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{
                    fontSize: "13px", fontWeight: 500, color: "#e2e8f0",
                    overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                  }}>
                    📄 {doc.filename}
                  </div>
                  <div style={{ fontSize: "11px", color: "#64748b", marginTop: "3px" }}>
                    {doc.total_pages} pages · {doc.chunk_count} chunks
                  </div>
                </div>
                <button
                  onClick={() => onDelete(doc.filename)}
                  style={{
                    background: "none", border: "none",
                    color: "#64748b", cursor: "pointer",
                    fontSize: "14px", padding: "2px 4px",
                    flexShrink: 0,
                  }}
                  title="Delete document"
                >
                  🗑️
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Footer */}
      <div style={{
        padding: "16px 20px", borderTop: "1px solid #1e2235",
        fontSize: "11px", color: "#475569",
      }}>
        Powered by Groq · ChromaDB · LangChain
      </div>
    </div>
  );
}