from fastapi import APIRouter, Depends, Header, HTTPException, UploadFile, File
from sqlalchemy.orm import Session
from config.database import get_db
from controllers import comment_controller
from models.comment_model import CommentCreate, CommentOut, AttachmentOut
from typing import List

router = APIRouter(prefix="/api/comments", tags=["Comments & Attachments"])

from middleware.auth import get_current_user

# Comments endpoints
@router.post("/tasks/{task_id}", status_code=201, response_model=CommentOut)
async def add_comment(
    task_id: int,
    comment: CommentCreate,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return comment_controller.create_comment(
        task_id=task_id,
        user_id=current_user["id"],
        content=comment.content,
        db=db
    )

@router.get("/tasks/{task_id}", response_model=List[CommentOut])
async def get_comments(
    task_id: int,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return comment_controller.get_comments(task_id=task_id, db=db)

@router.delete("/{comment_id}", status_code=200)
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
@router.post("/tasks/{task_id}/attachments", status_code=201, response_model=AttachmentOut)
async def upload_attachment(
    task_id: int,
    file: UploadFile = File(...),
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return await comment_controller.upload_attachment(
        task_id=task_id,
        user_id=current_user["id"],
        file=file,
        db=db
    )

@router.get("/tasks/{task_id}/attachments", response_model=List[AttachmentOut])
async def get_attachments(
    task_id: int,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return comment_controller.get_attachments(task_id=task_id, db=db)

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