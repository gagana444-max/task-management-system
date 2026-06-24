from typing import List
from fastapi import APIRouter, Depends
from models.project_model import ProjectCreate, ProjectOut, ProjectUpdate
from controllers import project_controller
from middleware.auth import get_current_user, roles_allowed

router = APIRouter(prefix="/api/projects", tags=["Projects"])


@router.get("", response_model=List[ProjectOut])
def get_projects(current_user: dict = Depends(get_current_user)):
    return project_controller.get_all_projects()


@router.get("/{project_id}", response_model=ProjectOut)
def get_project(
    project_id: int,
    current_user: dict = Depends(get_current_user)
):
    return project_controller.get_project(project_id)


@router.post("", response_model=ProjectOut, status_code=201)
def create_project(
    project: ProjectCreate,
    current_user: dict = Depends(roles_allowed(["Admin", "ProjectManager"]))
):
    return project_controller.create_project(project, current_user["id"])


@router.put("/{project_id}", response_model=ProjectOut)
def update_project(
    project_id: int,
    project_data: ProjectUpdate,
    current_user: dict = Depends(roles_allowed(["Admin", "ProjectManager"]))
):
    return project_controller.update_project(project_id, project_data)


@router.delete("/{project_id}")
def delete_project(
    project_id: int,
    current_user: dict = Depends(roles_allowed(["Admin", "ProjectManager"]))
):
    return project_controller.delete_project(project_id)
