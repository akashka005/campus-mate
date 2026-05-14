from fastapi import APIRouter, Depends, UploadFile, File, Form, HTTPException
from typing import List, Optional
import json
import os
import shutil

from app.services.groq_service import GroqService
from app.services.pdf_service import PDFService
from app.services.rag_service import RAGService
from app.services.quiz_service import QuizService
from app.services.study_service import StudyService
from app.services.resume_service import ResumeService
from app.core.config import settings
from app.db.session import get_db
from app.models.document import Document as DBDocument
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.models.user import User
from app.models.quiz import QuizResult

router = APIRouter()

groq_service = GroqService()
pdf_service = PDFService()
rag_service = RAGService()
quiz_service = QuizService(groq_service)
study_service = StudyService(groq_service)
resume_service = ResumeService(groq_service)

@router.post("/chat")
async def chat(
    message: str = Form(...), 
    history: str = Form("[]"),
    use_rag: bool = Form(False),
    collection_id: str = Form("default"),
    current_user: User = Depends(get_current_user)
):
    try:
        history_list = json.loads(history)
        
        secure_collection_id = f"user_{current_user.id}_{collection_id}"
        
        if use_rag:
            print(f"Chat: Querying RAG for collection {secure_collection_id}")
            response_text = rag_service.query_document(message, secure_collection_id)
        else:
            system_prompt = {
                "role": "system",
                "content": (
                    "You are CampusMate AI, a brilliant and friendly academic assistant built for college students. "
                    "You respond like a world-class AI assistant (think ChatGPT or Claude) — with clarity, warmth, and depth.\n\n"
                    "**Your style rules:**\n"
                    "- Use clean **Markdown formatting**: headers, bold, bullet points, numbered lists, and code blocks.\n"
                    "- Be concise but thorough. Avoid unnecessary filler.\n"
                    "- Use relevant emojis sparingly to add personality (📚, 💡, ✅, 🎯, etc.).\n"
                    "- When explaining concepts, use analogies and examples students can relate to.\n"
                    "- For code questions, always provide well-commented, clean code with explanations.\n"
                    "- For study plans, use structured tables or day-by-day breakdowns.\n"
                    "- Be encouraging and supportive — you're a mentor, not just a bot.\n"
                    "- If the user asks you to role-play (e.g. interviewer), fully commit to the role with realistic dialogue.\n\n"
                    "You specialize in: DSA, programming, exam prep, study planning, resume tips, and academic guidance."
                )
            }
            messages = [system_prompt]
            messages += [{"role": msg["role"], "content": msg["content"]} for msg in history_list]
            messages.append({"role": "user", "content": message})
            response_text = await groq_service.get_chat_response(messages)
        
        return {
            "id": f"msg_{os.urandom(4).hex()}",
            "role": "assistant",
            "content": response_text,
            "timestamp": "now"
        }
    except Exception as e:
        error_msg = str(e)
        print(f"Error in chat endpoint: {error_msg}")
        import traceback
        traceback.print_exc()
        if "Sophos" in error_msg or "Firewall" in error_msg or "blocked" in error_msg:
            return {
                "id": f"msg_{os.urandom(4).hex()}",
                "role": "assistant",
                "content": "⚠️ **Network Firewall Block Detected**\n\nYour network's Sophos firewall is blocking access to the Groq AI API (`api.groq.com`). This is a network-level restriction that cannot be bypassed through code.\n\n**To fix this, you need to:**\n1. Connect to a **Personal VPN**\n2. Or switch to a **Mobile Data Hotspot**\n3. Or ask your network admin to whitelist `api.groq.com`",
                "timestamp": "now"
            }
        
        raise HTTPException(status_code=500, detail=error_msg)

@router.post("/documents/upload")
async def upload_document(
    file: UploadFile = File(...), 
    collection_id: str = Form(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    try:
        secure_collection_id = f"user_{current_user.id}_{collection_id}"
        
        file_path = os.path.join(settings.UPLOAD_DIR, file.filename)
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        rag_service.add_document(file_path, secure_collection_id)
        
        file_size = os.path.getsize(file_path)
        size_str = f"{file_size / 1024 / 1024:.1f}MB"
        
        db_doc = DBDocument(
            name=file.filename,
            filename=file.filename,
            file_path=file_path,
            size=size_str,
            type=file.filename.split('.')[-1].upper(),
            collection_id=collection_id,
            user_id=current_user.id
        )
        db.add(db_doc)
        db.commit()
        db.refresh(db_doc)
        
        return {"message": "Document uploaded and indexed successfully", "document_id": db_doc.id}
    except Exception as e:
        print(f"Upload Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/documents")
async def list_documents(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    docs = db.query(DBDocument).filter(DBDocument.user_id == current_user.id).all()
    return docs

@router.post("/quiz/generate")
async def generate_quiz(
    topic: Optional[str] = Form(None), 
    num_questions: int = Form(5),
    collection_id: Optional[str] = Form(None),
    difficulty: str = Form("Intermediate"),
    current_user: User = Depends(get_current_user)
):
    context = ""
    if collection_id:
        secure_collection_id = f"user_{current_user.id}_{collection_id}"
        context = rag_service.query_document(
            "Extract all major facts, definitions, and key concepts to generate a quiz.", 
            secure_collection_id
        )
    
    if not context and topic:
        context = f"Topic: {topic}"
    elif not context:
        context = "General Knowledge"
        
    questions = await quiz_service.generate_quiz(context, num_questions, difficulty)
    return {"questions": questions}

@router.post("/study/plan")
async def generate_study_plan(
    goal: str = Form(...),
    timeframe: str = Form("1 week"),
    background: str = Form("")
):
    plan = await study_service.generate_plan(goal, timeframe, background)
    return {"plan": plan}

@router.post("/quiz/submit")
async def submit_quiz(
    topic: str = Form(...),
    score: float = Form(...),
    total: int = Form(...),
    difficulty: str = Form("Intermediate"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    result = QuizResult(
        user_id=current_user.id,
        topic=topic,
        score=score,
        total_questions=total,
        difficulty=difficulty
    )
    db.add(result)
    db.commit()
    db.refresh(result)
    return {"message": "Quiz result saved successfully", "result_id": result.id}

@router.get("/stats")
async def get_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    from datetime import datetime, timezone
    doc_count = db.query(DBDocument).filter(
        DBDocument.user_id == current_user.id
    ).count()
    quizzes_passed_count = db.query(QuizResult).filter(
        QuizResult.user_id == current_user.id,
        QuizResult.score >= (QuizResult.total_questions * 0.7)
    ).count()
    time_since_joined = datetime.now(timezone.utc) - current_user.created_at.replace(tzinfo=timezone.utc)
    hours_since_joined = time_since_joined.total_seconds() / 3600
    total_quizzes = db.query(QuizResult).filter(QuizResult.user_id == current_user.id).count()
    simulated_hours = min(hours_since_joined * 0.25 + total_quizzes * 0.5, 100.0)
    study_time_str = f"{simulated_hours:.1f}h"
    interactions = int(doc_count * 12 + simulated_hours * 5 + total_quizzes * 20)
    major = current_user.major.lower() if current_user.major else "general"
    
    subjects = [
        {"name": "Computer Science", "accuracy": 88 if "computer" in major or "tech" in major else 72},
        {"name": "Mathematics", "accuracy": 92 if "math" in major or "engineering" in major else 65},
        {"name": "Physics", "accuracy": 85 if "physics" in major or "science" in major else 60},
        {"name": "Economics", "accuracy": 90 if "econ" in major or "business" in major else 55}
    ]

    return {
        "study_time": study_time_str,
        "quizzes_passed": quizzes_passed_count, 
        "ai_interactions": interactions,
        "docs_analyzed": doc_count,
        "subject_accuracy": subjects,
        "activity": [
            {"name": "Mon", "study": min(simulated_hours * 0.1, 2.5)},
            {"name": "Tue", "study": min(simulated_hours * 0.2, 4.1)},
            {"name": "Wed", "study": min(simulated_hours * 0.15, 1.8)},
            {"name": "Thu", "study": min(simulated_hours * 0.3, 6.2)},
            {"name": "Fri", "study": min(simulated_hours * 0.18, 3.4)},
            {"name": "Sat", "study": min(simulated_hours * 0.05, 0.5)},
            {"name": "Sun", "study": min(simulated_hours * 0.12, 2.1)},
        ]
    }

@router.post("/resume/analyze")
async def analyze_resume(file: UploadFile = File(...)):
    os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
    file_path = os.path.join(settings.UPLOAD_DIR, file.filename)
    
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
        
    text = pdf_service.extract_text(file_path)
    if not text:
        raise HTTPException(status_code=400, detail="Failed to extract text from resume")
        
    analysis = await resume_service.analyze_resume(text)
    return analysis