"use client";
import { useState, useEffect, useCallback } from "react";
import Sidebar from "@/components/Sidebar";
import ChatPanel from "@/components/ChatPanel";
import UploadPanel from "@/components/UploadPanel";
import { listDocuments, deleteDocument, deleteAllDocuments, Document } from "../lib/api";

export default function Home() {
  const [activeTab, setActiveTab] = useState<"chat" | "upload">("chat");
  const [documents, setDocuments] = useState<Document[]>([]);
  const [docsLoading, setDocsLoading] = useState(true);

  const fetchDocuments = useCallback(async () => {
    try {
      const res = await listDocuments();
      setDocuments(res.documents);
    } catch (err) {
      console.error("Failed to fetch documents:", err);
    } finally {
      setDocsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  // Keep Render backend alive by pinging every 30 seconds
  useEffect(() => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
    const keepAlive = setInterval(() => {
      fetch(`${apiUrl}/health`).catch(() => {});
    }, 30000);
    return () => clearInterval(keepAlive);
  }, []);

  const handleDelete = async (filename: string) => {
    try {
      await deleteDocument(filename);
      await fetchDocuments();
    } catch (err) {
      console.error("Failed to delete:", err);
    }
  };

  const handleDeleteAll = async () => {
    try {
      await deleteAllDocuments();
      await fetchDocuments();
    } catch (err) {
      console.error("Failed to delete all:", err);
    }
  };

  return (
    <div style={{ display: "flex", height: "100vh", overflow: "hidden" }}>
      <Sidebar
        documents={documents}
        onDelete={handleDelete}
        onDeleteAll={handleDeleteAll}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        loading={docsLoading}
      />
      <main style={{ flex: 1, overflow: "hidden", display: "flex" }}>
        {activeTab === "chat" ? (
          <ChatPanel />
        ) : (
          <UploadPanel onUploadSuccess={() => {
            fetchDocuments();
            setTimeout(() => setActiveTab("chat"), 1500);
          }} />
        )}
      </main>
    </div>
  );
}