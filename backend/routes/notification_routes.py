from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List, Optional

from middleware.auth import get_current_user
from config.database import get_db
from models.db_models import DBNotification

router = APIRouter(prefix="/api/notifications", tags=["Notifications"])

class NotificationOut(BaseModel):
    id: int
    message: str
    event_type: str
    is_read: bool
    created_at: str

@router.get("", response_model=List[NotificationOut])
def get_notifications(
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    user_id = int(current_user["id"])
    notifications = db.query(DBNotification).filter(
        DBNotification.user_id == user_id
    ).order_by(DBNotification.created_at.desc()).all()
    
    result = []
    for n in notifications:
        result.append({
            "id": n.notification_id,
            "message": n.message,
            "event_type": n.event_type,
            "is_read": bool(n.is_read),
            "created_at": n.created_at.isoformat() + "Z" if n.created_at else ""
        })
    return result

@router.put("/read")
def mark_read(
    notification_id: Optional[int] = None,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    user_id = int(current_user["id"])
    query = db.query(DBNotification).filter(DBNotification.user_id == user_id, DBNotification.is_read == False)
    if notification_id:
        query = query.filter(DBNotification.notification_id == notification_id)
    
    query.update({"is_read": True})
    db.commit()
    return {"message": "Notifications marked as read"}
