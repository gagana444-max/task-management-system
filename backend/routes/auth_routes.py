from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from services import user_service
from services.auth_service import (
    create_access_token,
    authenticate_user,
)
from config.database import get_db
from models.user_model import UserCreate

router = APIRouter(prefix="/api/auth", tags=["Auth"])


@router.post('/register', status_code=201)
def register(user: UserCreate, db: Session = Depends(get_db)):
    # create_user will hash the password internally
    created = user_service.create_user(db, user)
    return created


@router.post('/login')
def login(form_data: dict, db: Session = Depends(get_db)):
    # Expect JSON with `email` and `password`
    email = form_data.get('email')
    password = form_data.get('password')
    if not email or not password:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Email and password required")

    user = authenticate_user(db, email, password)
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")

    token = create_access_token({"sub": str(user['id']), "role": user['role']})
    return {"access_token": token, "token_type": "bearer"}
