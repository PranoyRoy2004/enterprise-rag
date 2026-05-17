# Enterprise RAG Knowledge Base 🚀

An enterprise-grade AI-powered Retrieval-Augmented Generation (RAG) platform that allows organizations to upload documents, create intelligent knowledge bases, and interact with them using natural language conversations powered by Large Language Models.

## 🔗 Live Demo

### Live Website

https://enterprise-rag-ashy.vercel.app/

### Live Backend Link 

https://enterprise-rag-backend-h2jn.onrender.com

---

## 📌 Overview

Enterprise RAG Knowledge Base is a production-ready AI application designed to solve one of the biggest challenges in organizations — extracting accurate answers from large volumes of internal documents.

Instead of manually searching PDFs, reports, or company knowledge bases, users can upload documents and ask questions in plain English. The system retrieves the most relevant context using semantic search and generates grounded AI responses with Retrieval-Augmented Generation (RAG).

This project demonstrates practical implementation of:

* Vector databases
* Semantic search
* AI embeddings
* LLM orchestration
* Enterprise document retrieval
* Full-stack AI deployment
* Production-ready API architecture

---

## ✨ Features

### 🤖 AI-Powered Question Answering

Ask natural language questions and receive context-aware answers from uploaded documents.

### 📄 Multi-Document Upload Support

Upload PDFs and build a searchable enterprise knowledge base instantly.

### 🧠 Semantic Search with Vector Embeddings

Uses embeddings and vector similarity search for highly relevant retrieval.

### ⚡ FastAPI Backend

High-performance asynchronous backend with scalable API architecture.

### 🎨 Modern Frontend UI

Responsive React-based frontend deployed on Vercel.

### 🗂️ ChromaDB Vector Store

Persistent vector database for efficient document retrieval.

### 🔍 Context-Aware Retrieval Pipeline

Implements chunking, embeddings, retrieval, and LLM response generation.

### ☁️ Cloud Deployment

Frontend deployed on Vercel and backend deployed on Render.

### 🔐 Enterprise-Ready Architecture

Structured for scalability, modularity, and future enterprise integrations.

---

## 🏗️ Tech Stack

| Category        | Technologies                              |
| --------------- | ----------------------------------------- |
| Frontend        | React, JavaScript, Tailwind CSS           |
| Backend         | FastAPI, Python                           |
| AI/LLM          | OpenAI API                                |
| Vector Database | ChromaDB                                  |
| Embeddings      | Sentence Transformers / OpenAI Embeddings |
| Deployment      | Vercel, Render                            |
| API Testing     | Swagger UI                                |
| Version Control | Git & GitHub                              |

---

## 🧠 RAG Architecture

```text
User Query
     ↓
Document Retrieval
     ↓
Vector Similarity Search
     ↓
Relevant Context Extraction
     ↓
LLM Prompt Augmentation
     ↓
AI Generated Response
```

This architecture improves factual accuracy and reduces hallucinations by grounding AI responses using retrieved enterprise data.

---

## 📷 Project Preview

### Landing Page

<img width="1916" height="912" alt="image" src="https://github.com/user-attachments/assets/5bb1ec05-b790-4553-81eb-a35653a9c432" />


## 🚀 Deployment Architecture

```text
Frontend (Vercel)
        ↓
FastAPI Backend (Render)
        ↓
ChromaDB Vector Store
        ↓
LLM API Integration
```

---

## ⚙️ Installation & Setup

### 1️⃣ Clone the Repository

```bash
git clone https://github.com/PranoyRoy2004/enterprise-rag.git
cd enterprise-rag
```

### 2️⃣ Backend Setup

```bash
cd backend

python -m venv venv

# Activate virtual environment

# Windows
venv\Scripts\activate

# Linux/Mac
source venv/bin/activate

pip install -r requirements.txt
```

### 3️⃣ Configure Environment Variables

Create a `.env` file inside the backend directory:

```env
OPENAI_API_KEY=your_api_key
CHROMA_DB_PATH=./chroma_db
```

### 4️⃣ Run Backend Server

```bash
uvicorn main:app --reload --port 8000
```

### 5️⃣ Frontend Setup

```bash
cd frontend

npm install
npm run dev
```

---

## 📚 API Endpoints

| Endpoint      | Method | Description               |
| ------------- | ------ | ------------------------- |
| `/api/upload` | POST   | Upload documents          |
| `/api/chat`   | POST   | Query knowledge base      |
| `/docs`       | GET    | Swagger API documentation |

---

## 💡 Real-World Use Cases

* Enterprise knowledge assistants
* Internal company documentation search
* HR policy Q&A systems
* AI-powered research assistants
* Customer support knowledge bases
* Legal & compliance document retrieval
* AI document intelligence platforms

---

## 🛠️ Future Improvements

* User authentication & role-based access
* Streaming AI responses
* Multi-user workspaces
* Hybrid search (BM25 + Vector Search)
* Agentic RAG workflows
* Citation tracing
* File management dashboard
* Docker & Kubernetes deployment

---

## 👨‍💻 Author

**Pranoy Roy**

* AI/ML Developer
* Full Stack Developer

## ⭐ Why This Project Stands Out

Modern enterprises are rapidly adopting Retrieval-Augmented Generation systems for domain-specific AI applications. Enterprise RAG combines AI engineering, backend development, vector databases, semantic search, and scalable deployment into one real-world production application. Research and industry discussions continue to highlight enterprise RAG as a major direction for production AI systems.
