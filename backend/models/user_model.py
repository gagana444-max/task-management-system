from typing import Optional
from pydantic import BaseModel

class UserCreate(BaseModel):
    name: str
    email: str
    role: str
    password: str

class UserOut(BaseModel):
    id: int
    name: str
    email: str
    role: str
    is_active: bool

class UserUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[str] = None

class UserRoleUpdate(BaseModel):
    role: str

class UserStatusUpdate(BaseModel):
    is_active: bool
