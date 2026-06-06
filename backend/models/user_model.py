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
    def strip_whitespace(cls, v):
        if isinstance(v, str):
            return v.strip()
        return v

    @field_validator('email', mode='before')
    @classmethod
    def lower_email(cls, v):
        if isinstance(v, str):
            return v.lower()
        return v

class UserOut(BaseModel):
    id: int
    name: str
    email: str
    role: RoleEnum
    is_active: bool

class UserUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=2, max_length=100)
    email: Optional[EmailStr] = None

    @field_validator('name', mode='before')
    @classmethod
    def strip_whitespace(cls, v):
        if isinstance(v, str):
            return v.strip()
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
