import os
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from config.database import get_db
from controllers import comment_controller
from models.comment_model import CommentCreate, CommentOut, AttachmentOut
from models.db_models import DBAttachment
from typing import List
from middleware.auth import get_current_user

router = APIRouter(prefix="/api/tasks", tags=["Comments & Attachments"])

# Comments endpoints
@router.post("/{task_id}/comments", status_code=201, response_model=CommentOut)
async def add_comment(
    task_id: int,
    comment: CommentCreate,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    comment_db = comment_controller.create_comment(
        task_id=task_id,
        user_id=current_user["id"],
        content=comment.content,
        db=db
    )
    return {
        "id": comment_db.comment_id,
        "taskId": comment_db.task_id,
        "userId": comment_db.user_id,
        "content": comment_db.content,
        "createdAt": comment_db.created_at,
        "user": {
            "name": comment_db.author.user_name if comment_db.author else "Unknown User"
        }
    }

@router.get("/{task_id}/comments", response_model=List[CommentOut])
async def get_comments(
    task_id: int,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    comments_db = comment_controller.get_comments(task_id=task_id, db=db)
    return [
        {
            "id": c.comment_id,
            "taskId": c.task_id,
            "userId": c.user_id,
            "content": c.content,
            "createdAt": c.created_at,
            "user": {
                "name": c.author.user_name if c.author else "Unknown User"
            }
        }
        for c in comments_db
    ]

@router.delete("/comments/{comment_id}", status_code=200)
async def delete_comment(
    comment_id: int,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return comment_controller.delete_comment(
        comment_id=comment_id,
        user_id=current_user["id"],
        user_role=current_user["role"],
        db=db
    )

# Attachments endpoints
@router.post("/{task_id}/attachments", status_code=201, response_model=AttachmentOut)
async def upload_attachment(
    task_id: int,
    file: UploadFile = File(...),
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    att_db = await comment_controller.upload_attachment(
        task_id=task_id,
        user_id=current_user["id"],
        file=file,
        db=db
    )
    return {
        "id": att_db.attachment_id,
        "taskId": att_db.task_id,
        "userId": att_db.user_id,
        "filename": att_db.file_name,
        "filePath": att_db.file_path,
        "size": att_db.file_size,
        "uploadedAt": att_db.uploaded_at
    }

@router.get("/{task_id}/attachments", response_model=List[AttachmentOut])
async def get_attachments(
    task_id: int,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    attachments_db = comment_controller.get_attachments(task_id=task_id, db=db)
    return [
        {
            "id": a.attachment_id,
            "taskId": a.task_id,
            "userId": a.user_id,
            "filename": a.file_name,
            "filePath": a.file_path,
            "size": a.file_size,
            "uploadedAt": a.uploaded_at
        }
        for a in attachments_db
    ]

@router.delete("/attachments/{attachment_id}", status_code=200)
async def delete_attachment(
    attachment_id: int,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return comment_controller.delete_attachment(
        attachment_id=attachment_id,
        user_id=current_user["id"],
        user_role=current_user["role"],
        db=db
    )

@router.get("/{task_id}/attachments/{attachment_id}/download")
def download_attachment(
    task_id: int,
    attachment_id: int,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    attachment = db.query(DBAttachment).filter(
        DBAttachment.attachment_id == attachment_id,
        DBAttachment.task_id == task_id
    ).first()
    if not attachment:
        raise HTTPException(status_code=404, detail="Attachment not found")
    
    if not os.path.exists(attachment.file_path):
        raise HTTPException(status_code=404, detail="File not found on disk")
    
    return FileResponse(
        path=attachment.file_path,
        filename=attachment.file_name,
        media_type="application/octet-stream"
    )
