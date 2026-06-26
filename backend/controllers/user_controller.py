from sqlalchemy.orm import Session
from fastapi import HTTPException, UploadFile
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

def change_password(db: Session, user_id: int, current_password: str, new_password: str):
    try:
        return user_service.change_password(db, user_id, current_password, new_password)
    except KeyError as e:
        raise HTTPException(status_code=404, detail=str(e))

async def upload_avatar(db: Session, user_id: int, file: UploadFile):
    import os
    import re
    
    # Validate file size (max 5MB for avatar)
    MAX_SIZE = 5 * 1024 * 1024
    contents = await file.read()
    if len(contents) > MAX_SIZE:
        raise HTTPException(status_code=400, detail="File size exceeds 5MB limit")

    ALLOWED_TYPES = ["image/jpeg", "image/png", "image/gif", "image/webp"]
    if file.content_type not in ALLOWED_TYPES:
        raise HTTPException(status_code=400, detail="Only image files are allowed")

    # Safe filename
    safe_filename = re.sub(r'[^a-zA-Z0-9_.-]', '_', os.path.basename(file.filename))
    if not safe_filename or safe_filename in ('.', '..'):
        safe_filename = 'avatar.png'
        
    ext = os.path.splitext(safe_filename)[1]
    final_filename = f"avatar_{user_id}{ext}"

    UPLOAD_DIR = "uploads/avatars"
    os.makedirs(UPLOAD_DIR, exist_ok=True)
    file_path = os.path.join(UPLOAD_DIR, final_filename)

    with open(file_path, "wb") as f:
        f.write(contents)

    # Save to db
    from models.db_models import DBUser
    user = db.query(DBUser).filter(DBUser.user_id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    user.avatar_url = f"/api/users/{user_id}/avatar/view"
    db.commit()
    db.refresh(user)
    
    return {"message": "Avatar uploaded successfully", "avatar_url": user.avatar_url}
