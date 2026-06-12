from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime

class CommentCreate(BaseModel):
    task_id: int
    content: str = Field(..., min_length=1, max_length=2000)

class CommentOut(BaseModel):
    comment_id: int
    task_id: int
    user_id: int
    content: str
    created_at: datetime

    class Config:
        from_attributes = True

class AttachmentOut(BaseModel):
    attachment_id: int
    task_id: int
    user_id: int
    file_name: str
    file_path: str
    file_size: int
    uploaded_at: datetime

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