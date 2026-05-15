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
        self._embeddings = None
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
        
        Answer the following question based ONLY on the provided context. 
        If you don't know the answer from the context, say that you don't know, but you can still offer general academic advice if appropriate.
        
        Context:
        {context}
        
        Question: {input}
        
        Answer:
        """)

    @property
    def embeddings(self):
        if self._embeddings is None:
            try:
                print("RAG: Initializing Embeddings (this may take a while on first run)...")
                self._embeddings = HuggingFaceEmbeddings(
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
                return None
        return self._embeddings

    def query(self, question: str, collection_id: str, history: list = None):
        if not self.embeddings:
            return "AI Error: Document processing engine is currently offline. Please try again in a moment."
            
        if not self.llm:
            return "AI Error: LLM engine is offline. Check your API configuration."

        try:
            # Use a namespaced collection for the user/collection
            # collection_id should be something like user_{id}_{coll_id}
            vectorstore = Chroma(
                persist_directory=self.persist_directory,
                embedding_function=self.embeddings,
                collection_name=collection_id
            )
            
            retriever = vectorstore.as_retriever(search_kwargs={"k": 5})
            combine_docs_chain = create_stuff_documents_chain(self.llm, self.prompt)
            retrieval_chain = create_retrieval_chain(retriever, combine_docs_chain)
            
            response = retrieval_chain.invoke({"input": question})
            return response["answer"]
        except Exception as e:
            print(f"RAG Query Error: {e}")
            return f"Error during retrieval: {str(e)}"

    def add_documents(self, file_path: str, collection_id: str):
        if not self.embeddings:
            print("RAG Error: Cannot add documents because embeddings are not initialized.")
            return False

        try:
            from langchain_community.document_loaders import PyPDFLoader
            loader = PyPDFLoader(file_path)
            docs = loader.load()
            
            splits = self.text_splitter.split_documents(docs)
            
            vectorstore = Chroma.from_documents(
                documents=splits,
                embedding=self.embeddings,
                persist_directory=self.persist_directory,
                collection_name=collection_id
            )
            return True
        except Exception as e:
            print(f"RAG Add Error: {e}")
            return False