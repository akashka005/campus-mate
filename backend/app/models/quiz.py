from sqlalchemy import Column, Integer, String, Float, ForeignKey, DateTime
from sqlalchemy.sql import func
from app.db.session import Base

class QuizResult(Base):
    __tablename__ = "quiz_results"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    topic = Column(String)
    score = Column(Float)
    total_questions = Column(Integer)
    difficulty = Column(String)
    created_at = Column(DateTime(timezone=True), server_default=func.now())