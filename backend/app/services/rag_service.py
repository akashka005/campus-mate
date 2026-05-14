import os
os.environ["HF_HUB_READ_TIMEOUT"] = "60"
os.environ["TF_ENABLE_ONEDNN_OPTS"] = "0"
os.environ["TF_CPP_MIN_LOG_LEVEL"] = "2"
os.environ["TOKENIZERS_PARALLELISM"] = "false"

from langchain_community.vectorstores import Chroma
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_groq import ChatGroq
from langchain.chains import create_retrieval_chain
from langchain.chains.combine_documents import create_stuff_documents_chain
from langchain_core.prompts import ChatPromptTemplate
from dotenv import load_dotenv

load_dotenv()

class RAGService:
    def __init__(self):
        try:
            print("RAG: Initializing Embeddings (this may take a while on first run)...")
            self.embeddings = HuggingFaceEmbeddings(
                model_name="all-MiniLM-L6-v2",
                model_kwargs={'device': 'cpu'},
                encode_kwargs={'normalize_embeddings': True}
            )
            print("RAG: Embeddings initialized successfully.")
        except Exception as e:
            error_msg = str(e)
            print(f"RAG: Failed to initialize embeddings: {error_msg}")
            
            if "ReadTimeoutError" in error_msg or "timeout" in error_msg.lower():
                print("RAG: Connection to Hugging Face timed out. Please check your internet or use a VPN/Hotspot.")
            
            self.embeddings = None

        self.persist_directory = "db/chroma_db"

        self.text_splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=100)
        
        try:
            import httpx
            self.llm = ChatGroq(
                temperature=0, 
                groq_api_key=os.getenv("GROQ_API_KEY"), 
                model_name="llama-3.3-70b-versatile",
                http_client=httpx.Client(verify=False)
            )
            print("RAG: LLM initialized successfully.")
        except Exception as e:
            print(f"RAG: Failed to initialize LLM: {e}")
            self.llm = None

        self.prompt = ChatPromptTemplate.from_template("""
        You are CampusMate AI, an intelligent and highly capable academic assistant.
        Your goal is to provide structured, clear, and insightful answers to the user.
        
        Below are the USER'S UPLOADED DOCUMENTS. You must use these as your primary source of truth.
        [USER DOCUMENTS START]
        {context}
        [USER DOCUMENTS END]
        
        Task: {input}
        
        INSTRUCTIONS FOR YOUR RESPONSE:
        1. STRUCTURE: ALWAYS use rich Markdown formatting. Use bold text for emphasis, bullet points for lists, and headers (###) to organize your thoughts. Break down complex plans into easy-to-read sections.
        2. TONE: Be conversational, encouraging, and professional. Write like a premium AI tutor (e.g., ChatGPT, Claude).
        3. MISSING INFO: If the documents do not contain the answer, DO NOT repeat a robotic fallback phrase. Instead, naturally acknowledge that the document doesn't cover this specific detail, and then immediately provide the best possible answer using your general knowledge.
        """)

    def add_document(self, file_path, collection_name):
        from app.services.pdf_service import PDFService
        pdf_service = PDFService()
        text = pdf_service.extract_text(file_path)
        if text:
            return self.process_document(text, collection_name)
        return False

    def process_document(self, text, collection_name):
        chunks = self.text_splitter.split_text(text)
        vectorstore = Chroma.from_texts(
            texts=chunks,
            embedding=self.embeddings,
            persist_directory=self.persist_directory,
            collection_name=collection_name
        )
        return True

    def query_document(self, query, collection_name):
        if not self.embeddings:
            return "I'm sorry, I couldn't initialize the document analysis system. Please check your internet connection and try again."
        
        if not self.llm:
            return "I'm sorry, I couldn't connect to the AI model. Please check your Groq API key."

        try:
            vectorstore = Chroma(
                persist_directory=self.persist_directory,
                embedding_function=self.embeddings,
                collection_name=collection_name
            )
            
            retriever = vectorstore.as_retriever()
            document_chain = create_stuff_documents_chain(self.llm, self.prompt)
            retrieval_chain = create_retrieval_chain(retriever, document_chain)
            
            response = retrieval_chain.invoke({"input": query})
            return response.get("answer", "I couldn't find specific details in your library, but I can help you based on general knowledge.")
        except Exception as e:
            error_msg = str(e)
            print(f"RAG Error: {error_msg}")
            
            if "Sophos" in error_msg or "Stop! This website is blocked" in error_msg or "<!DOCTYPE html>" in error_msg:
                return "Network Firewall Block: Your network (Sophos) is blocking access to Groq AI. Please use a VPN or mobile hotspot to bypass this block."
                
            return f"I encountered an error while analyzing your documents: {error_msg}"