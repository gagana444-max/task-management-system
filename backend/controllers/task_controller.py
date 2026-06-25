from fastapi import HTTPException
from models.task_model import TaskCreate, TaskUpdate
from services import task_service
from services.task_service import update_task
from services.task_service import delete_task
from config.socketio import sio


def create_task(task_data: TaskCreate):
    return task_service.create_task(task_data)


async def create_task_with_notify(task_data: TaskCreate):
    task = task_service.create_task(task_data)
    if task_data.assigned_user_id:
        print(f"[NOTIFY] Emitting task_assigned to room {task_data.assigned_user_id}")
        try:
            await sio.emit('task_assigned', {
                'task_id': task['id'],
                'title': task['title'],
                'message': f"You have been assigned to task: {task['title']}"
            }, room=str(task_data.assigned_user_id))
            print(f"[NOTIFY] Emit succeeded")
        except Exception as e:
            print(f"[NOTIFY] Socket emit failed: {e}")
    else:
        print(f"[NOTIFY] No assigned_user_id, skipping emit")
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
                await sio.emit('task_unassigned', {
                    'task_id': task_id,
                    'title': task['title'],
                    'message': f"You have been unassigned from task: {task['title']}"
                }, room=str(old_assignee))
            except Exception as e:
                print(f"Socket emit failed: {e}")
        if new_assignee:
            try:
                await sio.emit('task_assigned', {
                    'task_id': task_id,
                    'title': task['title'],
                    'message': f"You have been assigned to task: {task['title']}"
                }, room=str(new_assignee))
            except Exception as e:
                print(f"Socket emit failed: {e}")
                
    # 2. Handle other updates (status or general fields) when assignee is the same
    else:
        if new_assignee:
            if task_data.status and old_task.get('status') != task_data.status:
                try:
                    await sio.emit('status_changed', {
                        'task_id': task_id,
                        'title': task['title'],
                        'status': task_data.status,
                        'message': f"Task status changed to: {task_data.status} — {task['title']}"
                    }, room=str(new_assignee))
                except Exception as e:
                    print(f"Socket emit failed: {e}")
            elif task_data.title or task_data.description or task_data.priority or task_data.due_date:
                try:
                    await sio.emit('task_updated', {
                        'task_id': task_id,
                        'title': task['title'],
                        'message': f"Task details updated: {task['title']}"
                    }, room=str(new_assignee))
                except Exception as e:
                    print(f"Socket emit failed: {e}")

    return task


async def update_task_status_with_notify(task_id: int, status: str):
    updated_task = task_service.update_task_status(task_id, status)

    if updated_task.get('assigned_user_id'):
        try:
            await sio.emit('status_changed', {
                'task_id': task_id,
                'title': updated_task['title'],
                'status': status,
                'message': f"Task status changed to: {status} — {updated_task['title']}"
            }, room=str(updated_task['assigned_user_id']))
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
            await sio.emit('task_deleted', {
                'task_id': task_id,
                'title': old_task['title'],
                'message': f"Task was deleted: {old_task['title']}"
            }, room=str(old_task['assigned_user_id']))
        except Exception as e:
            print(f"Socket emit failed: {e}")
    return result