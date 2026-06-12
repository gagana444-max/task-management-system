from fastapi import HTTPException
from models.task_model import TaskCreate, TaskUpdate
from services import task_service
from services.task_service import update_task
from services.task_service import delete_task

def create_task(task_data: TaskCreate):
    return task_service.create_task(task_data)

def update_task_api(task_id: int, task_data: TaskUpdate):
    return update_task(task_id, task_data)

def get_all_tasks(
    priority=None,
    status=None,
    assigned_user_id=None
):
    return task_service.get_all_tasks(
        priority,
        status,
        assigned_user_id
    )

def get_task(task_id: int):
    task = task_service.get_task_by_id(task_id)

    if task is None:
        raise HTTPException(
            status_code=404,
            detail="Task not found"
        )

    return task

def delete_task_api(task_id: int):
    return delete_task(task_id)

