from typing import List, Optional
from fastapi import APIRouter, Depends, Header, HTTPException
from sqlalchemy.orm import Session
from models.user_model import UserCreate, UserOut, UserUpdate, UserRoleUpdate, UserStatusUpdate
from controllers import user_controller
from config.database import get_db

router = APIRouter(prefix="/api/users", tags=["Users"])

# Dependency
def get_current_admin_user(x_user_role: str = Header(default="User", description="Mock header for auth")):
    if x_user_role != "Admin":
        raise HTTPException(status_code=403, detail="Admin privileges required")
    return {"role": x_user_role}

@router.post("", status_code=201, response_model=UserOut)
async def create_user(user: UserCreate, db: Session = Depends(get_db)):
    return user_controller.create_user(db, user)

@router.get("", response_model=List[UserOut])
async def list_users(role: Optional[str] = None, q: Optional[str] = None, db: Session = Depends(get_db)):
    return user_controller.get_all_users(db, role, q)

@router.get("/{user_id}", response_model=UserOut)
async def get_user(user_id: int, db: Session = Depends(get_db)):
    return user_controller.get_user(db, user_id)

@router.put("/{user_id}", response_model=UserOut)
async def update_user(user_id: int, user_update: UserUpdate, db: Session = Depends(get_db)):
    return user_controller.update_user(db, user_id, user_update)

@router.patch("/{user_id}/status", response_model=UserOut)
async def deactivate_user(user_id: int, status_update: UserStatusUpdate, db: Session = Depends(get_db)):
    return user_controller.deactivate_user(db, user_id, status_update)

@router.patch("/{user_id}/role", response_model=UserOut)
async def update_user_role(
    user_id: int, 
    role_update: UserRoleUpdate, 
    admin: dict = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    return user_controller.update_user_role(db, user_id, role_update)
