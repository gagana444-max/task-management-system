import html
from pydantic import BaseModel, Field, field_validator
from typing import Optional
from datetime import datetime

class CommentCreate(BaseModel):
    task_id: int
    content: str = Field(..., min_length=1, max_length=2000)

    @field_validator("content", mode="before")
    @classmethod
    def sanitize_content(cls, v):
        if isinstance(v, str):
            return html.escape(v.strip())
        return v


class UserBrief(BaseModel):
    name: str

class CommentOut(BaseModel):
    id: int
    taskId: int
    userId: int
    content: str
    createdAt: datetime
    user: Optional[UserBrief] = None

    class Config:
        from_attributes = True

class AttachmentOut(BaseModel):
    id: int
    taskId: int
    userId: int
    filename: str
    filePath: str
    size: int
    uploadedAt: datetime

    class Config:
        from_attributes = True

class PasswordResetRequest(BaseModel):
    temp_password: str
    new_password: str = Field(..., min_length=8)
    confirm_password: str

    def validate_passwords_match(self):
        return self.new_password == self.confirm_password

class OnboardingEmailRequest(BaseModel):
    user_id: int
    email: str
    name: str