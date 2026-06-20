from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import Literal

from models.task_model import TaskCreate, TaskOut, TaskUpdate
from controllers import task_controller
from controllers.task_controller import update_task_api, delete_task_api
from middleware.auth import get_current_user, roles_allowed

router = APIRouter(prefix="/api/tasks", tags=["Tasks"])


@router.post("", response_model=TaskOut, status_code=201)
async def create_task(
    task: TaskCreate,
    current_user: dict = Depends(roles_allowed(["Admin", "ProjectManager"]))
):
    print(type(task))
    print(task)
    return task_controller.create_task(task)


@router.get("", response_model=List[TaskOut])
async def get_tasks(
    priority: Optional[str] = None,
    status: Optional[str] = None,
    assigned_user_id: Optional[int] = None,
    current_user: dict = Depends(get_current_user)
):
    return task_controller.get_all_tasks(
        priority,
        status,
        assigned_user_id
    )

@router.get("/{task_id}", response_model=TaskOut)
async def get_task(
    task_id: int,
    current_user: dict = Depends(get_current_user)
):
    return task_controller.get_task(task_id)


@router.put("/{task_id}")
def update_task_route(
    task_id: int,
    task_data: TaskUpdate,
    current_user: dict = Depends(roles_allowed(["Admin", "ProjectManager"]))
):
    return update_task_api(task_id, task_data)


@router.delete("/{task_id}")
def delete_task_route(
    task_id: int,
    current_user: dict = Depends(roles_allowed(["Admin", "ProjectManager"]))
):
    return delete_task_api(task_id)


class TaskStatusUpdate(BaseModel):
    status: Literal["to-do", "in-progress", "done", "To Do", "In Progress", "Completed"]

@router.patch("/{task_id}", response_model=TaskOut)
def patch_task_route(
    task_id: int,
    status_update: TaskStatusUpdate,
    current_user: dict = Depends(get_current_user)
):
    from services.task_service import patch_task
    updated_task = patch_task(task_id, status_update.status)
    if not updated_task:
        raise HTTPException(status_code=404, detail="Task not found")
    return updated_task