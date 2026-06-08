from fastapi import HTTPException
from models.task_model import TaskCreate, TaskUpdate
from services import task_service

def create_task(task_data: TaskCreate):
    return task_service.create_task(task_data)

def get_all_tasks():
    return task_service.get_all_tasks()