from typing import List
from fastapi import APIRouter

from models.task_model import TaskCreate, TaskOut, TaskUpdate
from controllers import task_controller
from controllers.task_controller import update_task_api, delete_task_api

router = APIRouter(prefix="/api/tasks", tags=["Tasks"])


@router.post("", response_model=TaskOut, status_code=201)
async def create_task(task: TaskCreate):
    print(type(task))
    print(task)
    return task_controller.create_task(task)

from typing import Optional

@router.get("", response_model=List[TaskOut])
async def get_tasks(
    priority: Optional[str] = None,
    status: Optional[str] = None,
    assigned_user_id: Optional[int] = None
):
    return task_controller.get_all_tasks(
        priority,
        status,
        assigned_user_id
    )

@router.get("/{task_id}", response_model=TaskOut)
async def get_task(task_id: int):
    return task_controller.get_task(task_id)


@router.put("/{task_id}")
def update_task_route(task_id: int, task_data: TaskUpdate):
    return update_task_api(task_id, task_data)


@router.delete("/{task_id}")
def delete_task_route(task_id: int):
    return delete_task_api(task_id)