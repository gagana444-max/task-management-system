import html
from typing import Optional, Literal
from pydantic import BaseModel, Field, EmailStr, field_validator

RoleEnum = Literal['Admin', 'ProjectManager', 'Collaborator']

class UserCreate(BaseModel):
    name: str = Field(..., min_length=2, max_length=100)
    email: EmailStr
    role: RoleEnum
    password: str

    @field_validator('name', mode='before')
    @classmethod
    def sanitize_name(cls, v):
        if isinstance(v, str):
            return html.escape(v.strip())
        return v

    @field_validator('email', mode='before')
    @classmethod
    def lower_email(cls, v):
        if isinstance(v, str):
            return v.lower()
        return v

    @field_validator('password')
    @classmethod
    def validate_password(cls, v):
        from services.email_service import validate_password_policy
        errors = validate_password_policy(v)
        if errors:
            raise ValueError(" | ".join(errors))
        return v

class UserOut(BaseModel):
    id: int
    name: str
    email: str
    role: RoleEnum
    is_active: bool
    is_first_login: bool
    avatar_url: Optional[str] = None

class UserUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=2, max_length=100)
    email: Optional[EmailStr] = None

    @field_validator('name', mode='before')
    @classmethod
    def sanitize_name(cls, v):
        if isinstance(v, str):
            return html.escape(v.strip())
        return v

    @field_validator('email', mode='before')
    @classmethod
    def lower_email(cls, v):
        if isinstance(v, str):
            return v.lower()
        return v

class UserRoleUpdate(BaseModel):
    role: RoleEnum

class UserStatusUpdate(BaseModel):
    is_active: bool

class UserPasswordChange(BaseModel):
    current_password: str
    new_password: str
    confirm_password: str

    @field_validator('new_password')
    @classmethod
    def validate_password(cls, v):
        from services.email_service import validate_password_policy
        errors = validate_password_policy(v)
        if errors:
            raise ValueError(" | ".join(errors))
        return v
