from fastapi import HTTPException
from models.task_model import TaskCreate, TaskUpdate
from services import task_service
from services.task_service import update_task
from services.task_service import delete_task
from config.database import SessionLocal
from services.notification_service import broadcast_notification_to_admins

def create_task(task_data: TaskCreate):
    return task_service.create_task(task_data)


async def create_task_with_notify(task_data: TaskCreate):
    task = task_service.create_task(task_data)
    try:
        with SessionLocal() as db:
            await broadcast_notification_to_admins(
                db, 
                task_data.assigned_user_id, 
                f"New task created: {task['title']}", 
                'task_updated'
            )
    except Exception as e:
        print(f"[NOTIFY] Socket emit failed: {e}")
    return task


def update_task_api(task_id: int, task_data: TaskUpdate):
    return update_task(task_id, task_data)


async def update_task_with_notify(task_id: int, task_data: TaskUpdate):
    old_task = task_service.get_task_by_id(task_id)
    task = update_task(task_id, task_data)
    
    if not old_task:
        return task

    old_assignee = old_task.get('assigned_user_id')
    new_assignee = task.get('assigned_user_id')

    # 1. Handle assignee changes
    if old_assignee != new_assignee:
        if old_assignee:
            try:
                with SessionLocal() as db:
                    await broadcast_notification_to_admins(
                        db, old_assignee, f"You have been unassigned from task: {task['title']}", 'task_unassigned'
                    )
            except Exception as e:
                print(f"Socket emit failed: {e}")
        if new_assignee:
            try:
                with SessionLocal() as db:
                    await broadcast_notification_to_admins(
                        db, new_assignee, f"You have been assigned to task: {task['title']}", 'task_assigned'
                    )
            except Exception as e:
                print(f"Socket emit failed: {e}")
                
    # 2. Handle other updates (status or general fields) when assignee is the same
    else:
        if task_data.status and old_task.get('status') != task_data.status:
            try:
                with SessionLocal() as db:
                    await broadcast_notification_to_admins(
                        db, new_assignee, f"Task status changed to: {task_data.status} — {task['title']}", 'status_changed'
                    )
            except Exception as e:
                print(f"Socket emit failed: {e}")
        elif task_data.title or task_data.description or task_data.priority or task_data.due_date:
            try:
                with SessionLocal() as db:
                    await broadcast_notification_to_admins(
                        db, new_assignee, f"Task details updated: {task['title']}", 'task_updated'
                    )
            except Exception as e:
                print(f"Socket emit failed: {e}")

    return task


async def update_task_status_with_notify(task_id: int, status: str):
    updated_task = task_service.update_task_status(task_id, status)

    try:
        with SessionLocal() as db:
            await broadcast_notification_to_admins(
                db, updated_task.get('assigned_user_id'), f"Task status changed to: {status} — {updated_task['title']}", 'status_changed'
            )
    except Exception as e:
        print(f"Socket emit failed: {e}")

    return updated_task


def get_all_tasks(priority=None, status=None, assigned_user_id=None, project_id=None):
    return task_service.get_all_tasks(priority, status, assigned_user_id, project_id)


def get_task(task_id: int):
    task = task_service.get_task_by_id(task_id)
    if task is None:
        raise HTTPException(status_code=404, detail="Task not found")
    return task


async def delete_task_api(task_id: int):
    old_task = task_service.get_task_by_id(task_id)
    result = delete_task(task_id)
    if old_task and old_task.get('assigned_user_id'):
        try:
            with SessionLocal() as db:
                await broadcast_notification_to_admins(
                    db, old_task['assigned_user_id'], f"Task was deleted: {old_task['title']}", 'task_deleted'
                )
        except Exception as e:
            print(f"Socket emit failed: {e}")
    return result