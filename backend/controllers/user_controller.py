from sqlalchemy.orm import Session
from fastapi import HTTPException
from models.user_model import UserCreate, UserUpdate, UserRoleUpdate, UserStatusUpdate
from services import user_service

def create_user(db: Session, user_data: UserCreate):
    return user_service.create_user(db, user_data)

def get_all_users(db: Session, role: str = None, q: str = None):
    return user_service.get_all_users(db, role, q)

def get_user(db: Session, user_id: int):
    try:
        return user_service.get_user(db, user_id)
    except KeyError as e:
        raise HTTPException(status_code=404, detail=str(e))

def update_user(db: Session, user_id: int, user_update: UserUpdate):
    try:
        return user_service.update_user(db, user_id, user_update)
    except KeyError as e:
        raise HTTPException(status_code=404, detail=str(e))

def deactivate_user(db: Session, user_id: int, status_update: UserStatusUpdate):
    try:
        return user_service.update_user_status(db, user_id, status_update)
    except KeyError as e:
        raise HTTPException(status_code=404, detail=str(e))

def update_user_role(db: Session, user_id: int, role_update: UserRoleUpdate):
    try:
        return user_service.update_user_role(db, user_id, role_update)
    except KeyError as e:
        raise HTTPException(status_code=404, detail=str(e))
