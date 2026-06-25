import html
from datetime import date
from pydantic import BaseModel, Field, field_validator
from typing import Optional, Literal

class TaskCreate(BaseModel):
    title: str = Field(..., min_length=3, max_length=100)
    description: Optional[str] = Field(None, max_length=500)
    assigned_user_id: int = Field(..., gt=0)
    project_id: int = Field(..., gt=0)
    due_date: date
    priority: Literal["Low", "Medium", "High"]

    @field_validator("title", "description", mode="before")
    @classmethod
    def sanitize_strings(cls, value):
        if isinstance(value, str):
            return html.escape(value.strip())
        return value

    @field_validator("due_date")
    @classmethod
    def validate_due_date(cls, value):
        if value < date.today():
            raise ValueError("Due date cannot be in the past")
        return value


class TaskOut(BaseModel):
    id: int
    title: str
    description: Optional[str]
    assigned_user_id: Optional[int]
    project_id: Optional[int] = None
    due_date: Optional[str]
    priority: Optional[str]
    status: str


class TaskUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=3, max_length=100)
    description: Optional[str] = Field(None, max_length=500)
    assigned_user_id: Optional[int] = Field(None, gt=0)
    project_id: Optional[int] = None
    due_date: Optional[date] = None
    priority: Optional[Literal["Low", "Medium", "High"]] = None
    status: Optional[Literal["To Do", "In Progress", "Completed"]] = None

    @field_validator("title", "description", mode="before")
    @classmethod
    def sanitize_strings(cls, value):
        if isinstance(value, str):
            return html.escape(value.strip())
        return value

    @field_validator("due_date")
    @classmethod
    def validate_due_date(cls, value):
        if value is not None and value < date.today():
            raise ValueError("Due date cannot be in the past")
        return value
