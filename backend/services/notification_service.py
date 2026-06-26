from sqlalchemy.orm import Session
from models.db_models import DBNotification, DBUser
from config.socketio import sio

async def send_notification(db: Session, user_id: int, message: str, event_type: str):
    """
    Saves a notification to the database (Offline Storage) 
    and instantly emits it to the user if they are connected (Real-Time Push).
    """
    # 1. Save to Database
    notification = DBNotification(
        user_id=user_id,
        message=message,
        event_type=event_type,
        is_read=False
    )
    db.add(notification)
    db.commit()
    db.refresh(notification)
    
    # 2. Push Real-Time Event via Socket.IO
    payload = {
        "notification_id": notification.notification_id,
        "message": notification.message,
        "event_type": notification.event_type,
        "created_at": str(notification.created_at)
    }
    await sio.emit(event_type, payload, room=str(user_id))
    return notification

async def broadcast_notification_to_admins(db: Session, target_user_id: int, message: str, event_type: str):
    """
    Sends the notification to the target user, and broadcasts a copy to all Admins.
    """
    if target_user_id:
        await send_notification(db, target_user_id, message, event_type)
        
    admins = db.query(DBUser).filter(DBUser.user_role == 'Admin').all()
    for admin in admins:
        if admin.user_id != target_user_id:
            await send_notification(db, admin.user_id, message, event_type)
