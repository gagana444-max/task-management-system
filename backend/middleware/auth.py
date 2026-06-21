from fastapi import Header, HTTPException, Depends
from typing import Optional, Callable, List
from sqlalchemy.orm import Session
from services.auth_service import decode_access_token
from config.database import get_db
from models.db_models import DBUser
from starlette import status


def _get_token_from_header(authorization: Optional[str]):
    if not authorization:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Missing Authorization header")
    parts = authorization.split()
    if parts[0].lower() != 'bearer' or len(parts) != 2:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid Authorization header format")
    return parts[1]


def get_current_user(authorization: Optional[str] = Header(None), db: Session = Depends(get_db)):
    token = _get_token_from_header(authorization)
    payload = decode_access_token(token)
    if not payload:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid or expired token")
    user_id = payload.get('sub')
    if not user_id:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token payload")
    try:
        user_id_int = int(user_id)
    except ValueError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token payload")
    user = db.query(DBUser).filter(DBUser.user_id == user_id_int).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found")
    return {
        "id": user.user_id,
        "email": user.email,
        "role": user.user_role,
        "is_active": bool(user.is_active)
    }


def role_required(role: str) -> Callable:
    def _dependency(current_user: dict = Depends(get_current_user)):
        if current_user.get('role') != role:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Insufficient privileges")
        return current_user
    return _dependency


def roles_allowed(allowed_roles: List[str]) -> Callable:
    def _dependency(current_user: dict = Depends(get_current_user)):
        if current_user.get('role') not in allowed_roles:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Insufficient privileges")
        return current_user
    return _dependency

