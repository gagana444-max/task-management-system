from typing import Optional, Literal
from pydantic import BaseModel, Field


class TaskCreate(BaseModel):
    title: str = Field(..., min_length=3, max_length=100)
    description: Optional[str] = Field(None, max_length=500)
    assigned_user_id: int = Field(..., gt=0)
    due_date: str
    priority: Literal["Low", "Medium", "High"]


class TaskOut(BaseModel):
    id: int
    title: str
    description: Optional[str]
    assigned_user_id: Optional[int]
    due_date: Optional[str]
    priority: Optional[str]
    status: str


class TaskUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=3, max_length=100)
    description: Optional[str] = Field(None, max_length=500)
    assigned_user_id: Optional[int] = Field(None, gt=0)
    due_date: Optional[str] = None
    priority: Optional[Literal["Low", "Medium", "High"]] = None
    status: Optional[Literal["To Do", "In Progress", "Done"]] = None