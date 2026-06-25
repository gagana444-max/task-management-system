from typing import List, Optional, Literal
from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel

from models.task_model import TaskCreate, TaskOut, TaskUpdate
from controllers import task_controller
from controllers.task_controller import delete_task_api
from middleware.auth import get_current_user, roles_allowed

router = APIRouter(prefix="/api/tasks", tags=["Tasks"])


class TaskStatusUpdate(BaseModel):
    status: str


@router.post("", response_model=TaskOut, status_code=201)
async def create_task(
    task: TaskCreate,
    current_user: dict = Depends(roles_allowed(["Admin", "ProjectManager"]))
):
    return await task_controller.create_task_with_notify(task)


@router.get("", response_model=List[TaskOut])
async def get_tasks(
    priority: Optional[str] = Query(None, description="Filter by priority"),
    status: Optional[str] = Query(None, description="Filter by status (e.g., 'to-do', 'in-progress', 'done')"),
    assigned_user_id: Optional[int] = Query(None, description="Filter by assigned user ID"),
    project_id: Optional[int] = Query(None, description="Filter by project ID"),
    current_user: dict = Depends(get_current_user)
):
    return task_controller.get_all_tasks(priority, status, assigned_user_id, project_id)


@router.get("/{task_id}", response_model=TaskOut)
async def get_task(
    task_id: int,
    current_user: dict = Depends(get_current_user)
):
    return task_controller.get_task(task_id)


@router.put("/{task_id}")
async def update_task_route(
    task_id: int,
    task_data: TaskUpdate,
    current_user: dict = Depends(roles_allowed(["Admin", "ProjectManager"]))
):
    return await task_controller.update_task_with_notify(task_id, task_data)


@router.patch("/{task_id}/status")
async def update_task_status_route(
    task_id: int,
    status_data: TaskStatusUpdate,
    current_user: dict = Depends(get_current_user)
):
    return await task_controller.update_task_status_with_notify(task_id, status_data.status)


@router.delete("/{task_id}")
def delete_task_route(
    task_id: int,
    current_user: dict = Depends(roles_allowed(["Admin", "ProjectManager"]))
):
    return delete_task_api(task_id)