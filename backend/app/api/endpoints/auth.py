from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from datetime import timedelta

from app.db.session import get_db
from app.models.user import User
from app.schemas.user import UserCreate, Token, User as UserSchema
from app.core.security import get_password_hash, verify_password, create_access_token
from app.core.config import settings

from app.api.deps import get_current_user

router = APIRouter()

@router.post("/signup", response_model=UserSchema)
def signup(user_in: UserCreate, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == user_in.email).first()
    if user:
        raise HTTPException(
            status_code=400,
            detail="The user with this email already exists in the system.",
        )
    
    db_obj = User(
        email=user_in.email,
        hashed_password=get_password_hash(user_in.password),
        full_name=user_in.full_name,
    )
    db.add(db_obj)
    db.commit()
    db.refresh(db_obj)
    return db_obj

@router.post("/login", response_model=Token)
def login(db: Session = Depends(get_db), form_data: OAuth2PasswordRequestForm = Depends()):
    user = db.query(User).filter(User.email == form_data.username).first()
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    elif not user.is_active:
        raise HTTPException(status_code=400, detail="Inactive user")
    
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    return {
        "access_token": create_access_token(
            user.id, expires_delta=access_token_expires
        ),
        "token_type": "bearer",
    }

@router.get("/me", response_model=UserSchema)
def read_user_me(current_user: User = Depends(get_current_user)):
    return current_user

from fastapi.responses import RedirectResponse
import urllib.parse

@router.get("/google/login")
def google_login():
    if not settings.GOOGLE_CLIENT_ID:
        client_id = "missing_client_id"
    else:
        client_id = settings.GOOGLE_CLIENT_ID
        
    redirect_uri = "http://localhost:8000/api/v1/auth/google/callback"
    params = {
        "client_id": client_id,
        "redirect_uri": redirect_uri,
        "response_type": "code",
        "scope": "openid email profile",
        "access_type": "offline",
        "prompt": "consent"
    }
    url = f"https://accounts.google.com/o/oauth2/v2/auth?{urllib.parse.urlencode(params)}"
    return RedirectResponse(url)

import httpx
from fastapi.responses import HTMLResponse

@router.get("/google/callback")
async def google_callback(code: str, db: Session = Depends(get_db)):
    token_url = "https://oauth2.googleapis.com/token"
    data = {
        "client_id": settings.GOOGLE_CLIENT_ID,
        "client_secret": settings.GOOGLE_CLIENT_SECRET,
        "code": code,
        "grant_type": "authorization_code",
        "redirect_uri": "http://localhost:8000/api/v1/auth/google/callback"
    }
    
    async with httpx.AsyncClient() as client:
        response = await client.post(token_url, data=data)
        if response.status_code != 200:
            raise HTTPException(status_code=400, detail="Failed to exchange Google code")
        
        token_data = response.json()
        access_token = token_data.get("access_token")
        userinfo_url = "https://www.googleapis.com/oauth2/v2/userinfo"
        user_resp = await client.get(userinfo_url, headers={"Authorization": f"Bearer {access_token}"})
        if user_resp.status_code != 200:
            raise HTTPException(status_code=400, detail="Failed to get Google user info")
            
        user_info = user_resp.json()
        email = user_info.get("email")
        name = user_info.get("name")
    user = db.query(User).filter(User.email == email).first()
    if not user:
        user = User(
            email=email,
            full_name=name,
            hashed_password=get_password_hash("oauth_no_password_needed_random_str"),
            is_active=True
        )
        db.add(user)
        db.commit()
        db.refresh(user)
        
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    our_token = create_access_token(user.id, expires_delta=access_token_expires)
    redirect_url = f"http://localhost:3000/dashboard?token={our_token}"
    return RedirectResponse(redirect_url)

@router.get("/github/login")
def github_login():
    if not settings.GITHUB_CLIENT_ID:
        client_id = "missing_client_id"
    else:
        client_id = settings.GITHUB_CLIENT_ID
        
    redirect_uri = "http://localhost:8000/api/v1/auth/github/callback"
    params = {
        "client_id": client_id,
        "redirect_uri": redirect_uri,
        "scope": "user:email"
    }
    url = f"https://github.com/login/oauth/authorize?{urllib.parse.urlencode(params)}"
    return RedirectResponse(url)