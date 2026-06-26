from sqlalchemy import Column, Integer, String, Boolean, Enum, TIMESTAMP, text, ForeignKey, Text
from sqlalchemy.orm import relationship
from config.database import Base

class DBUser(Base):
    __tablename__ = "users"
    user_id = Column(Integer, primary_key=True, index=True)
    user_name = Column(String(100), nullable=False)
    email = Column(String(100), nullable=False, unique=True)
    user_password = Column(String(255), nullable=False)
    user_role = Column(Enum('Admin', 'ProjectManager', 'Collaborator'), nullable=False)
    is_active = Column(Boolean, default=True)
    is_first_login = Column(Boolean, default=True)
    temp_password = Column(String(255), nullable=True)
    created_at = Column(TIMESTAMP, server_default=text('CURRENT_TIMESTAMP'))
    failed_login_attempts = Column(Integer, default=0, nullable=False)
    locked_until = Column(TIMESTAMP, nullable=True)

    comments = relationship("DBComment", back_populates="author")
    attachments = relationship("DBAttachment", back_populates="uploader")

class DBComment(Base):
    __tablename__ = "comments"
    comment_id = Column(Integer, primary_key=True, index=True)
    task_id = Column(Integer, nullable=False, index=True)
    user_id = Column(Integer, ForeignKey("users.user_id"), nullable=False)
    content = Column(Text, nullable=False)
    created_at = Column(TIMESTAMP, server_default=text('CURRENT_TIMESTAMP'))

    author = relationship("DBUser", back_populates="comments")

class DBAttachment(Base):
    __tablename__ = "attachments"
    attachment_id = Column(Integer, primary_key=True, index=True)
    task_id = Column(Integer, nullable=False, index=True)
    user_id = Column(Integer, ForeignKey("users.user_id"), nullable=False)
    file_name = Column(String(255), nullable=False)
    file_path = Column(String(500), nullable=False)
    file_size = Column(Integer, nullable=False)
    uploaded_at = Column(TIMESTAMP, server_default=text('CURRENT_TIMESTAMP'))

    uploader = relationship("DBUser", back_populates="attachments")

class DBNotification(Base):
    __tablename__ = "notifications"
    notification_id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.user_id"), nullable=False)
    message = Column(Text, nullable=False)
    event_type = Column(String(50), nullable=False)
    is_read = Column(Boolean, default=False)
    created_at = Column(TIMESTAMP, server_default=text('CURRENT_TIMESTAMP'))

    user = relationship("DBUser", backref="notifications")