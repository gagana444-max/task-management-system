from typing import List
from fastapi import APIRouter
from models.task_model import TaskCreate, TaskOut
from controllers import task_controller

router = APIRouter(prefix="/api/tasks", tags=["Tasks"])

@router.post("", response_model=TaskOut, status_code=201)
async def create_task(task: TaskCreate):
    return task_controller.create_task(task)

@router.get("", response_model=List[TaskOut])
async def get_tasks():
    return task_controller.get_all_tasks()