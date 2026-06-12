from datetime import datetime, timedelta
import os
from typing import Optional, Dict
import bcrypt
import jwt
from sqlalchemy.orm import Session
from models.db_models import DBUser

# Config
SECRET_KEY = os.environ.get('JWT_SECRET', 'dev-secret-key')
ALGORITHM = 'HS256'
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24

def get_password_hash(password: str) -> str:
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return bcrypt.checkpw(plain_password.encode('utf-8'), hashed_password.encode('utf-8'))

def create_access_token(data: Dict[str, str], expires_delta: Optional[timedelta] = None) -> str:
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def decode_access_token(token: str) -> Optional[dict]:
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except Exception:
        return None

def authenticate_user(db: Session, email: str, password: str):
    user = db.query(DBUser).filter(DBUser.email == email).first()
    if not user:
        return None
    if not verify_password(password, user.user_password):
        return None
    return {
        "id": user.user_id,
        "email": user.email,
        "role": user.user_role,
        "is_active": bool(user.is_active)
    }