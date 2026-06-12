from sqlalchemy.orm import Session
from models.db_models import DBNotification
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
    await sio.emit("new_notification", payload, room=str(user_id))
    
    return notification
