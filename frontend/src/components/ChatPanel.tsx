"use client";
import { useState, useRef, useEffect } from "react";
import { sendChatMessage } from "../lib/api";

interface Source {
  filename: string;
  page: number;
  chunk_index: number;
  relevance_score: number;
  preview: string;
}

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  sources?: Source[];
  confidence?: number;
  timestamp?: string;
}

export default function ChatPanel() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;
    const question = input.trim();
    setInput("");
    setError("");

    const userMsg: ChatMessage = {
      role: "user",
      content: question,
      timestamp: new Date().toLocaleTimeString(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setLoading(true);

    try {
      const res = await sendChatMessage(question, messages);
      const assistantMsg: ChatMessage = {
        role: "assistant",
        content: res.answer,
        sources: res.sources,
        confidence: res.confidence,
        timestamp: new Date().toLocaleTimeString(),
      };
      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Something went wrong";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const clearChat = () => {
    setMessages([]);
    setError("");
  };

  const confidenceColor = (score: number) => {
    if (score >= 0.75) return "#22c55e";
    if (score >= 0.5) return "#f59e0b";
    return "#ef4444";
  };

  return (
    <div style={{
      flex: 1, display: "flex", flexDirection: "column",
      height: "100vh", backgroundColor: "#0f1117",
    }}>
      {/* Header */}
      <div style={{
        padding: "20px 28px",
        borderBottom: "1px solid #1e2235",
        display: "flex", justifyContent: "space-between", alignItems: "center",
        backgroundColor: "#13161f",
      }}>
        <div>
          <h2 style={{ fontSize: "18px", fontWeight: 700, color: "#f1f5f9" }}>
            💬 Knowledge Base Chat
          </h2>
          <p style={{ fontSize: "12px", color: "#64748b", marginTop: "2px" }}>
            Ask anything about your uploaded documents
          </p>
        </div>
        {messages.length > 0 && (
          <button
            onClick={clearChat}
            style={{
              padding: "8px 16px", background: "#1e2235",
              color: "#94a3b8", border: "1px solid #2d3348",
              borderRadius: "8px", cursor: "pointer", fontSize: "13px",
            }}
          >
            🗑️ Clear Chat
          </button>
        )}
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: "auto", padding: "24px 28px" }}>
        {messages.length === 0 ? (
          <div style={{
            display: "flex", flexDirection: "column",
            alignItems: "center", justifyContent: "center",
            height: "100%", textAlign: "center",
          }}>
            <div style={{ fontSize: "56px", marginBottom: "16px" }}>🧠</div>
            <h3 style={{ fontSize: "20px", fontWeight: 600, color: "#e2e8f0", marginBottom: "8px" }}>
              Ready to answer your questions
            </h3>
            <p style={{ color: "#64748b", fontSize: "14px", maxWidth: "400px", lineHeight: "1.6" }}>
              Upload documents using the sidebar, then ask anything.
              I will find the answer and show you exactly which document and page it came from.
            </p>
            <div style={{
              marginTop: "28px", display: "flex", flexWrap: "wrap",
              gap: "10px", justifyContent: "center", maxWidth: "500px",
            }}>
              {[
                "What are the key skills mentioned?",
                "Summarize the main topics",
                "What is the leave policy?",
                "List all technical requirements",
              ].map((suggestion) => (
                <button
                  key={suggestion}
                  onClick={() => setInput(suggestion)}
                  style={{
                    padding: "8px 14px", background: "#13161f",
                    border: "1px solid #1e2235", borderRadius: "20px",
                    color: "#94a3b8", cursor: "pointer", fontSize: "13px",
                  }}
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        ) : (
          messages.map((msg, i) => (
            <div key={i} style={{
              marginBottom: "24px",
              display: "flex",
              flexDirection: "column",
              alignItems: msg.role === "user" ? "flex-end" : "flex-start",
            }}>
              <div style={{
                fontSize: "11px", color: "#475569",
                marginBottom: "6px",
                paddingLeft: msg.role === "assistant" ? "4px" : "0",
                paddingRight: msg.role === "user" ? "4px" : "0",
              }}>
                {msg.role === "user" ? "You" : "🧠 Assistant"} · {msg.timestamp}
              </div>

              <div style={{
                maxWidth: "75%",
                padding: "14px 18px",
                borderRadius: msg.role === "user"
                  ? "18px 18px 4px 18px"
                  : "18px 18px 18px 4px",
                background: msg.role === "user"
                  ? "linear-gradient(135deg, #6366f1, #8b5cf6)"
                  : "#13161f",
                border: msg.role === "assistant" ? "1px solid #1e2235" : "none",
                color: "#e2e8f0",
                fontSize: "14px",
                lineHeight: "1.7",
                whiteSpace: "pre-wrap",
              }}>
                {msg.content}
              </div>

              {msg.role === "assistant" && msg.confidence !== undefined && (
                <div style={{
                  marginTop: "8px", paddingLeft: "4px",
                  display: "flex", alignItems: "center", gap: "8px",
                }}>
                  <div style={{
                    fontSize: "12px",
                    color: confidenceColor(msg.confidence),
                    fontWeight: 500,
                  }}>
                    Confidence: {Math.round(msg.confidence * 100)}%
                  </div>
                  <div style={{
                    width: "80px", height: "4px",
                    background: "#1e2235", borderRadius: "2px", overflow: "hidden",
                  }}>
                    <div style={{
                      width: `${msg.confidence * 100}%`,
                      height: "100%",
                      background: confidenceColor(msg.confidence),
                      borderRadius: "2px",
                    }} />
                  </div>
                </div>
              )}

              {msg.role === "assistant" && msg.sources && msg.sources.length > 0 && (
                <div style={{ marginTop: "10px", maxWidth: "75%", paddingLeft: "4px" }}>
                  <div style={{
                    fontSize: "11px", color: "#64748b",
                    marginBottom: "6px", fontWeight: 600,
                    textTransform: "uppercase", letterSpacing: "0.05em",
                  }}>
                    Sources
                  </div>
                  {msg.sources.map((src, j) => (
                    <div key={j} style={{
                      background: "#13161f",
                      border: "1px solid #1e2235",
                      borderLeft: "3px solid #6366f1",
                      borderRadius: "6px",
                      padding: "10px 12px",
                      marginBottom: "6px",
                    }}>
                      <div style={{
                        fontSize: "12px", fontWeight: 600,
                        color: "#818cf8", marginBottom: "4px",
                      }}>
                        📄 {src.filename} — Page {src.page}
                        <span style={{
                          marginLeft: "8px", fontSize: "11px",
                          color: confidenceColor(src.relevance_score),
                        }}>
                          {Math.round(src.relevance_score * 100)}% match
                        </span>
                      </div>
                      <div style={{
                        fontSize: "12px", color: "#64748b", lineHeight: "1.5",
                      }}>
                        {src.preview.length > 200 ? src.preview.slice(0, 200) + "..." : src.preview}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))
        )}

        {loading && (
          <div style={{ display: "flex", alignItems: "flex-start", marginBottom: "24px" }}>
            <div style={{
              background: "#13161f", border: "1px solid #1e2235",
              borderRadius: "18px 18px 18px 4px",
              padding: "14px 18px",
            }}>
              <div style={{ display: "flex", gap: "4px", alignItems: "center" }}>
                {[0, 1, 2].map((i) => (
                  <div key={i} style={{
                    width: "6px", height: "6px",
                    borderRadius: "50%", background: "#6366f1",
                  }} />
                ))}
                <style>{`
                  @keyframes pulse {
                    0%, 80%, 100% { opacity: 0.3; }
                    40% { opacity: 1; }
                  }
                `}</style>
              </div>
            </div>
          </div>
        )}

        {error && (
          <div style={{
            background: "rgba(239, 68, 68, 0.1)",
            border: "1px solid rgba(239, 68, 68, 0.3)",
            borderRadius: "8px", padding: "12px 16px",
            color: "#fca5a5", fontSize: "13px", marginBottom: "16px",
          }}>
            Error: {error}
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div style={{
        padding: "20px 28px",
        borderTop: "1px solid #1e2235",
        backgroundColor: "#13161f",
      }}>
        <div style={{ display: "flex", gap: "12px", alignItems: "flex-end" }}>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask a question about your documents... (Enter to send)"
            rows={1}
            style={{
              flex: 1, padding: "14px 18px",
              background: "#0f1117",
              border: "1px solid #1e2235",
              borderRadius: "12px", color: "#e2e8f0",
              fontSize: "14px", resize: "none",
              outline: "none", lineHeight: "1.5",
              fontFamily: "inherit",
            }}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || loading}
            style={{
              padding: "14px 20px",
              background: !input.trim() || loading
                ? "#1e2235"
                : "linear-gradient(135deg, #6366f1, #8b5cf6)",
              color: !input.trim() || loading ? "#475569" : "#fff",
              border: "none", borderRadius: "12px",
              cursor: !input.trim() || loading ? "not-allowed" : "pointer",
              fontSize: "18px", flexShrink: 0,
            }}
          >
            ➤
          </button>
        </div>
        <p style={{ fontSize: "11px", color: "#475569", marginTop: "8px", textAlign: "center" }}>
          Shift+Enter for new line · Enter to send
        </p>
      </div>
    </div>
  );
}