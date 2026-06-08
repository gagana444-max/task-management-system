from typing import Optional
from pydantic import BaseModel

class TaskCreate(BaseModel):
    title: str
    description: str
    assigned_user_id: int
    due_date: str
    priority: str

class TaskOut(BaseModel):
    id: int
    title: str
    description: str
    assigned_user_id: int
    due_date: str
    priority: str
    status: str

class TaskUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    assigned_user_id: Optional[int] = None
    due_date: Optional[str] = None
    priority: Optional[str] = None
    status: Optional[str] = None