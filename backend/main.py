from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
import os
from dotenv import load_dotenv
import ssl
import os
import requests
from urllib3.exceptions import InsecureRequestWarning

requests.packages.urllib3.disable_warnings(InsecureRequestWarning)
orig_request = requests.Session.request
def patched_request(self, method, url, *args, **kwargs):
    kwargs['verify'] = False
    return orig_request(self, method, url, *args, **kwargs)
requests.Session.request = patched_request

os.environ['HF_HUB_READ_TIMEOUT'] = '60'
os.environ['TF_ENABLE_ONEDNN_OPTS'] = '0'
os.environ['TF_CPP_MIN_LOG_LEVEL'] = '2'
os.environ['HF_HUB_DISABLE_SSL_VERIFY'] = '1'
os.environ['CURL_CA_BUNDLE'] = ''
os.environ['PYTHONHTTPSVERIFY'] = '0'
ssl._create_default_https_context = ssl._create_unverified_context

import urllib3
urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

from app.api.endpoints import auth, ai
from app.core.config import settings
from app.db.session import engine, Base
from app.models import user, document, quiz
load_dotenv()
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="Multi-Agent Academic Assistant Backend",
    version=settings.VERSION
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix=f"{settings.API_V1_STR}/auth", tags=["Authentication"])
app.include_router(ai.router, prefix=f"{settings.API_V1_STR}/ai", tags=["AI Features"])

@app.get("/")
async def root():
    return {
        "message": "CampusMate AI API is running",
        "version": settings.VERSION,
        "status": "online"
    }

if __name__ == "__main__":
    os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
    os.makedirs(os.path.dirname(settings.CHROMA_DB_DIR), exist_ok=True)
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)