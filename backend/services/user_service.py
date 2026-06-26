from sqlalchemy.orm import Session
from sqlalchemy import or_
from fastapi import HTTPException
from sqlalchemy import or_
from models.user_model import UserCreate, UserUpdate, UserRoleUpdate, UserStatusUpdate
from models.db_models import DBUser
from services.auth_service import get_password_hash

def to_dict(db_user: DBUser):
    return {
        "id": db_user.user_id,
        "name": db_user.user_name,
        "email": db_user.email,
        "role": db_user.user_role,
        "is_active": bool(db_user.is_active),
        "is_first_login": bool(db_user.is_first_login),
        "avatar_url": db_user.avatar_url
    }

def create_user(db: Session, user_data: UserCreate):
    existing_user = db.query(DBUser).filter(DBUser.email == user_data.email).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")

    db_user = DBUser(
        user_name=user_data.name,
        email=user_data.email,
        user_password=get_password_hash(user_data.password),
        user_role=user_data.role,
        is_active=True
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return to_dict(db_user)

def get_all_users(db: Session, role: str = None, q: str = None):
    query = db.query(DBUser)
    if role:
        query = query.filter(DBUser.user_role == role)
    if q:
        search = f"%{q}%"
        query = query.filter(or_(DBUser.user_name.ilike(search), DBUser.email.ilike(search)))
    
    users = query.all()
    return [to_dict(u) for u in users]

def _get_user_by_id(db: Session, user_id: int):
    user = db.query(DBUser).filter(DBUser.user_id == user_id).first()
    if not user:
        raise KeyError(f"User with ID {user_id} not found")
    return user

def get_user(db: Session, user_id: int):
    user = _get_user_by_id(db, user_id)
    return to_dict(user)

def update_user(db: Session, user_id: int, user_update: UserUpdate):
    user = _get_user_by_id(db, user_id)
    if user_update.name is not None:
        user.user_name = user_update.name
    if user_update.email is not None:
        user.email = user_update.email
    db.commit()
    db.refresh(user)
    return to_dict(user)

def update_user_status(db: Session, user_id: int, status_update: UserStatusUpdate):
    user = _get_user_by_id(db, user_id)
    user.is_active = status_update.is_active
    db.commit()
    db.refresh(user)
    return to_dict(user)

def update_user_role(db: Session, user_id: int, role_update: UserRoleUpdate):
    user = _get_user_by_id(db, user_id)
    user.user_role = role_update.role
    db.commit()
    db.refresh(user)
    return to_dict(user)

def change_password(db: Session, user_id: int, current_password: str, new_password: str):
    from services.auth_service import verify_password
    user = _get_user_by_id(db, user_id)
    
    if not verify_password(current_password, user.user_password):
        raise HTTPException(status_code=400, detail="Incorrect current password")
        
    user.user_password = get_password_hash(new_password)
    db.commit()
    db.refresh(user)
    return {"message": "Password changed successfully"}
