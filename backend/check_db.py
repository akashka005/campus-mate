from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.models.document import Document
from app.core.config import settings

engine = create_engine(settings.DATABASE_URL)
SessionLocal = sessionmaker(bind=engine)
db = SessionLocal()

docs = db.query(Document).all()
print(f"Total documents: {len(docs)}")
for doc in docs:
    print(f"ID: {doc.id}, Name: {doc.name}, Created: {doc.created_at}")
db.close()