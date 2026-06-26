from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from models.user_model import UserCreate, UserOut, UserUpdate, UserRoleUpdate, UserStatusUpdate, UserPasswordChange
from controllers import user_controller
from config.database import get_db
from middleware.auth import get_current_user, role_required

router = APIRouter(prefix="/api/users", tags=["Users"])

@router.post("", status_code=201, response_model=UserOut)
async def create_user(
    user: UserCreate,
    admin: dict = Depends(role_required("Admin")),
    db: Session = Depends(get_db)
):
    return user_controller.create_user(db, user)


@router.get("", response_model=List[UserOut])
async def list_users(
    role: Optional[str] = None,
    q: Optional[str] = None,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return user_controller.get_all_users(db, role, q)


@router.get("/{user_id}", response_model=UserOut)
async def get_user(
    user_id: int,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return user_controller.get_user(db, user_id)


@router.put("/{user_id}", response_model=UserOut)
async def update_user(
    user_id: int,
    user_update: UserUpdate,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # IDOR/BOLA Protection: A user can only update their own profile, unless they are an Admin
    if current_user["id"] != user_id and current_user["role"] != "Admin":
        raise HTTPException(status_code=403, detail="Cannot update another user's profile")
    return user_controller.update_user(db, user_id, user_update)


@router.patch("/{user_id}/status", response_model=UserOut)
async def deactivate_user(
    user_id: int,
    status_update: UserStatusUpdate,
    admin: dict = Depends(role_required("Admin")),
    db: Session = Depends(get_db)
):
    return user_controller.deactivate_user(db, user_id, status_update)


@router.patch("/{user_id}/role", response_model=UserOut)
async def update_user_role(
    user_id: int, 
    role_update: UserRoleUpdate, 
    admin: dict = Depends(role_required("Admin")),
    db: Session = Depends(get_db)
):
    return user_controller.update_user_role(db, user_id, role_update)

@router.put("/{user_id}/password")
async def change_password(
    user_id: int,
    password_data: UserPasswordChange,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if current_user["id"] != user_id:
        raise HTTPException(status_code=403, detail="Cannot change another user's password")
    return user_controller.change_password(db, user_id, password_data.current_password, password_data.new_password)

@router.post("/{user_id}/avatar")
async def upload_avatar(
    user_id: int,
    file: UploadFile = File(...),
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if current_user["id"] != user_id and current_user["role"] != "Admin":
        raise HTTPException(status_code=403, detail="Cannot update another user's avatar")
    return await user_controller.upload_avatar(db, user_id, file)

@router.get("/{user_id}/avatar/view")
def view_avatar(user_id: int, db: Session = Depends(get_db)):
    import os
    from models.db_models import DBUser
    
    user = db.query(DBUser).filter(DBUser.user_id == user_id).first()
    if not user or not user.avatar_url:
        raise HTTPException(status_code=404, detail="Avatar not found")
        
    # extract filename from /api/users/{user_id}/avatar/view
    # We know the path is uploads/avatars/avatar_{user_id}.{ext}
    # But wait, we can just glob or search the directory, or better, since we saved it:
    UPLOAD_DIR = "uploads/avatars"
    if not os.path.exists(UPLOAD_DIR):
        raise HTTPException(status_code=404, detail="Avatar not found")
        
    for filename in os.listdir(UPLOAD_DIR):
        if filename.startswith(f"avatar_{user_id}."):
            return FileResponse(os.path.join(UPLOAD_DIR, filename))
            
    raise HTTPException(status_code=404, detail="Avatar file not found on disk")

