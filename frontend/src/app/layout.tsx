import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Enterprise RAG Knowledge Base",
  description: "AI-powered document Q&A system",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body style={{
        margin: 0, padding: 0,
        backgroundColor: "#0f1117",
        color: "#e2e8f0",
        fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
        height: "100vh",
        overflow: "hidden",
      }}>
        {children}
      </body>
    </html>
  );
}