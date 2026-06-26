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

async def broadcast_notification_to_admins(db: Session, target_user_id: int, message: str, event_type: str, project_id: int = None):
    """
    Sends the notification to:
      1. The target user (assignee)
      2. All Admins
      3. The Project Manager of the task's project (if project_id is provided)
    Avoids duplicate notifications if the target user is also a PM or Admin.
    """
    notified_ids = set()

    # 1. Notify the assigned user
    if target_user_id:
        await send_notification(db, target_user_id, message, event_type)
        notified_ids.add(target_user_id)

    # 2. Notify all Admins
    admins = db.query(DBUser).filter(DBUser.user_role == 'Admin', DBUser.is_active == True).all()
    for admin in admins:
        if admin.user_id not in notified_ids:
            await send_notification(db, admin.user_id, message, event_type)
            notified_ids.add(admin.user_id)

    # 3. Notify the Project Manager of the task's project
    if project_id:
        from sqlalchemy import text
        result = db.execute(
            text("SELECT manager_id FROM projects WHERE id = :pid"),
            {"pid": project_id}
        ).fetchone()
        if result and result[0]:
            pm_id = result[0]
            if pm_id not in notified_ids:
                await send_notification(db, pm_id, message, event_type)
                notified_ids.add(pm_id)
