const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export interface Source {
  filename: string;
  page: number;
  chunk_index: number;
  relevance_score: number;
  preview: string;
}

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  sources?: Source[];
  confidence?: number;
  timestamp?: string;
}

export interface Document {
  filename: string;
  total_pages: number;
  chunk_count: number;
}

export interface UploadResult {
  filename: string;
  pages_extracted: number;
  chunks_created: number;
  status: string;
}

export async function uploadDocuments(files: File[]) {
  const formData = new FormData();
  files.forEach((file) => formData.append("files", file));
  const res = await fetch(`${API_URL}/api/upload`, {
    method: "POST",
    body: formData,
  });
  if (!res.ok) throw new Error(`Upload failed: ${res.statusText}`);
  return res.json();
}

export async function listDocuments() {
  const res = await fetch(`${API_URL}/api/documents`);
  if (!res.ok) throw new Error("Failed to fetch documents");
  return res.json();
}

export async function deleteDocument(filename: string) {
  const res = await fetch(
    `${API_URL}/api/documents/${encodeURIComponent(filename)}`,
    { method: "DELETE" }
  );
  if (!res.ok) throw new Error("Failed to delete document");
}

export async function deleteAllDocuments() {
  const res = await fetch(`${API_URL}/api/documents`, { method: "DELETE" });
  if (!res.ok) throw new Error("Failed to delete all documents");
}

export async function sendChatMessage(
  question: string,
  chatHistory: ChatMessage[],
  topK: number = 5
) {
  const res = await fetch(`${API_URL}/api/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      question,
      chat_history: chatHistory.map((m) => ({
        role: m.role,
        content: m.content,
      })),
      top_k: topK,
    }),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.detail || "Chat request failed");
  }
  return res.json();
}