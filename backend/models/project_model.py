from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from config.database import Base


# SQLAlchemy DB model
class Project(Base):
    __tablename__ = "projects"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    created_by = Column(Integer, ForeignKey("users.user_id"), nullable=True)
    manager_id = Column(Integer, ForeignKey("users.user_id"), nullable=True)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())

    # Relationships
    creator = relationship("DBUser", foreign_keys=[created_by])
    manager = relationship("DBUser", foreign_keys=[manager_id])

    @property
    def manager_name(self) -> Optional[str]:
        return self.manager.user_name if self.manager else None


# Pydantic schemas
class ProjectCreate(BaseModel):
    name: str
    description: Optional[str] = None
    manager_id: int


class ProjectUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    manager_id: Optional[int] = None


class ProjectOut(BaseModel):
    id: int
    name: str
    description: Optional[str] = None
    created_by: Optional[int] = None
    manager_id: Optional[int] = None
    manager_name: Optional[str] = None
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True
