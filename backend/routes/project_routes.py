from typing import List
from fastapi import APIRouter, Depends
from models.project_model import ProjectCreate, ProjectOut, ProjectUpdate
from controllers import project_controller
from middleware.auth import get_current_user, roles_allowed
from sqlalchemy.orm import Session
from config.database import get_db
router = APIRouter(prefix="/api/projects", tags=["Projects"])


@router.get("", response_model=List[ProjectOut])
def get_projects(current_user: dict = Depends(get_current_user), db: Session = Depends(get_db)):
    return project_controller.get_all_projects(db)


@router.get("/{project_id}", response_model=ProjectOut)
def get_project(
    project_id: int,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return project_controller.get_project(db, project_id)


@router.post("", response_model=ProjectOut, status_code=201)
async def create_project(
    project: ProjectCreate,
    current_user: dict = Depends(roles_allowed(["Admin", "ProjectManager"])),
    db: Session = Depends(get_db)
):
    return await project_controller.create_project(db, project, current_user["id"])


@router.put("/{project_id}", response_model=ProjectOut)
async def update_project(
    project_id: int,
    project_data: ProjectUpdate,
    current_user: dict = Depends(roles_allowed(["Admin", "ProjectManager"])),
    db: Session = Depends(get_db)
):
    return await project_controller.update_project(db, project_id, project_data)


@router.delete("/{project_id}")
def delete_project(
    project_id: int,
    current_user: dict = Depends(roles_allowed(["Admin", "ProjectManager"])),
    db: Session = Depends(get_db)
):
    return project_controller.delete_project(db, project_id)
