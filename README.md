# 🎓 CampusMate AI: Your Ultimate Academic Companion

**CampusMate AI** is a state-of-the-art, multi-agent AI platform designed specifically for students and academic professionals. It combines the power of advanced Large Language Models (LLMs) with specialized tools to help you manage your studies, analyze documents, and prepare for your career—all in one premium, beautifully designed interface.

---

## 🌟 Key Features

### 💬 Intelligent AI Chat
*   **Context-Aware Conversations:** Chat with an AI that understands academic contexts.
*   **Markdown Support:** Beautifully rendered tables, lists, and code snippets for clear communication.
*   **Multi-Tenant Isolation:** Your data is strictly yours. Secure isolation ensures no data leaks between users.

### 📄 Document Analysis (RAG)
*   **Knowledge Retrieval:** Upload your lecture notes, research papers, or textbooks.
*   **Instant Answers:** Ask questions directly to your documents and get cited answers.
*   **Vector Search:** Powered by ChromaDB for lightning-fast and accurate document querying.

### 📝 Resume Analyzer & Career Tools
*   **Professional Feedback:** Upload your resume for an AI-powered critique.
*   **Actionable Insights:** Get suggestions on how to improve your skills and formatting to stand out to recruiters.
*   **Fix-to-Chat Flow:** Seamlessly transition from resume analysis to a focused chat for deeper career advice.

### 🛡️ Secure & Reliable
*   **JWT Authentication:** Secure login and session management.
*   **Network Resilience:** Built-in detection for restrictive network firewalls (like Sophos) with helpful troubleshooting tips.
*   **Private Data:** All uploads are sandboxed and accessible only to you.

---

## 🛠️ Technology Stack

### Frontend
*   **React 19:** The latest in modern web development.
*   **Vite:** For ultra-fast development and build times.
*   **Tailwind CSS:** For a sleek, "Midnight Luxe" aesthetic.
*   **Framer Motion:** Smooth, fluid animations for a premium feel.
*   **Lucide React:** Beautiful, consistent iconography.

### Backend
*   **FastAPI:** High-performance Python web framework.
*   **Groq AI:** Utilizing ultra-fast Llama-3 models for near-instant responses.
*   **LangChain:** Orchestrating the complex AI multi-agent workflows.
*   **ChromaDB:** A robust vector database for document storage and retrieval.
*   **SQLAlchemy/SQLite:** Reliable data management.

---

## 🚀 Getting Started (For Developers)

### Prerequisites
*   Python 3.10+
*   Node.js 18+
*   [Groq API Key](https://console.groq.com/)

### 1. Backend Setup
1. Navigate to the `backend` folder.
2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
3. Create a `.env` file with your keys:
   ```env
   GROQ_API_KEY=your_key_here
   SECRET_KEY=your_random_secret
   ```
4. Start the server:
   ```bash
   python main.py
   ```

### 2. Frontend Setup
1. Navigate to the `frontend` folder.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```

---

## 📁 Project Structure

```text
CampusMate/
├── backend/            # FastAPI Server & AI Logic
│   ├── app/            # Main application logic
│   ├── db/             # Database models & migrations
│   ├── uploads/        # User-uploaded documents
│   └── main.py         # Entry point
├── frontend/           # React Web Application
│   ├── src/            # Source code
│   │   ├── components/ # Reusable UI components
│   │   ├── pages/      # Page views (Dashboard, Chat, etc.)
│   │   └── hooks/      # Custom React hooks
│   └── vite.config.ts  # Build configuration
└── README.md           # You are here!
```

---

## 💡 Information for Non-Technical Users

CampusMate is designed to be your digital study buddy. Think of it as a combination of **ChatGPT** and a **smart filing cabinet**. 

1.  **Dashboard:** Your central hub for all academic activities.
2.  **Upload:** Use the "Resume Analyzer" or "Study Plan" sections to feed the AI your documents.
3.  **Chat:** Ask questions about anything—whether it's general knowledge or something specific from a document you just uploaded.
4.  **Privacy:** We take your privacy seriously. Your documents are processed securely and are never shared with other students.

---