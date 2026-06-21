import os
import shutil
from fastapi import HTTPException, UploadFile
from sqlalchemy.orm import Session
from models.db_models import DBComment, DBAttachment
from models.comment_model import CommentCreate

UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

def create_comment(task_id: int, user_id: int, content: str, db: Session):
    if not content or len(content.strip()) == 0:
        raise HTTPException(status_code=400, detail={
            "error_code": "VALIDATION_ERROR",
            "message": "Comment content is required",
            "description": "Content field cannot be empty"
        })

    comment = DBComment(
        task_id=task_id,
        user_id=user_id,
        content=content.strip()
    )
    db.add(comment)
    db.commit()
    db.refresh(comment)
    return comment

def get_comments(task_id: int, db: Session):
    comments = db.query(DBComment).filter(DBComment.task_id == task_id).all()
    return comments

def delete_comment(comment_id: int, user_id: int, user_role: str, db: Session):
    comment = db.query(DBComment).filter(DBComment.comment_id == comment_id).first()
    if not comment:
        raise HTTPException(status_code=404, detail={
            "error_code": "NOT_FOUND",
            "message": "Comment not found",
            "description": f"No comment found with id {comment_id}"
        })

    # Only author or Admin can delete
    if comment.user_id != user_id and user_role != "Admin":
        raise HTTPException(status_code=403, detail={
            "error_code": "FORBIDDEN",
            "message": "Permission denied",
            "description": "You can only delete your own comments"
        })

    db.delete(comment)
    db.commit()
    return {"message": "Comment deleted successfully"}

async def upload_attachment(task_id: int, user_id: int, file: UploadFile, db: Session):
    # Validate file size (max 10MB)
    MAX_SIZE = 10 * 1024 * 1024
    contents = await file.read()
    if len(contents) > MAX_SIZE:
        raise HTTPException(status_code=400, detail={
            "error_code": "FILE_TOO_LARGE",
            "message": "File size exceeds limit",
            "description": "Maximum file size is 10MB"
        })

    # Allowed file types
    ALLOWED_TYPES = ["image/jpeg", "image/png", "application/pdf",
                     "application/msword", "text/plain",
                     "application/vnd.openxmlformats-officedocument.wordprocessingml.document"]
    if file.content_type not in ALLOWED_TYPES:
        raise HTTPException(status_code=400, detail={
            "error_code": "INVALID_FILE_TYPE",
            "message": "File type not allowed",
            "description": "Allowed types: JPEG, PNG, PDF, DOC, DOCX, TXT"
        })

    # Save file
    import re
    safe_filename = re.sub(r'[^a-zA-Z0-9_.-]', '_', os.path.basename(file.filename))
    if not safe_filename or safe_filename in ('.', '..'):
        safe_filename = 'uploaded_file'

    task_dir = os.path.join(UPLOAD_DIR, str(task_id))
    os.makedirs(task_dir, exist_ok=True)
    file_path = os.path.join(task_dir, safe_filename)

    with open(file_path, "wb") as f:
        f.write(contents)

    attachment = DBAttachment(
        task_id=task_id,
        user_id=user_id,
        file_name=safe_filename,
        file_path=file_path,
        file_size=len(contents)
    )
    db.add(attachment)
    db.commit()
    db.refresh(attachment)
    return attachment

def get_attachments(task_id: int, db: Session):
    return db.query(DBAttachment).filter(DBAttachment.task_id == task_id).all()

def delete_attachment(attachment_id: int, user_id: int, user_role: str, db: Session):
    attachment = db.query(DBAttachment).filter(DBAttachment.attachment_id == attachment_id).first()
    if not attachment:
        raise HTTPException(status_code=404, detail={
            "error_code": "NOT_FOUND",
            "message": "Attachment not found",
            "description": f"No attachment found with id {attachment_id}"
        })

    if attachment.user_id != user_id and user_role != "Admin":
        raise HTTPException(status_code=403, detail={
            "error_code": "FORBIDDEN",
            "message": "Permission denied",
            "description": "You can only delete your own attachments"
        })

    # Delete file from disk
    if os.path.exists(attachment.file_path):
        os.remove(attachment.file_path)

    db.delete(attachment)
    db.commit()
    return {"message": "Attachment deleted successfully"}