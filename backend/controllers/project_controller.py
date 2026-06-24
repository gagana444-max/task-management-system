from fastapi import HTTPException
from config.database import SessionLocal
from models.project_model import Project, ProjectCreate, ProjectUpdate


def get_all_projects():
    db = SessionLocal()
    try:
        return db.query(Project).order_by(Project.created_at.desc()).all()
    finally:
        db.close()


def get_project(project_id: int):
    db = SessionLocal()
    try:
        project = db.query(Project).filter(Project.id == project_id).first()
        if not project:
            raise HTTPException(status_code=404, detail="Project not found")
        return project
    finally:
        db.close()


def create_project(project: ProjectCreate, user_id: int):
    db = SessionLocal()
    try:
        new_project = Project(
            name=project.name,
            description=project.description,
            created_by=user_id,
            manager_id=project.manager_id,
        )
        db.add(new_project)
        db.commit()
        db.refresh(new_project)
        return new_project
    finally:
        db.close()


def update_project(project_id: int, project_data: ProjectUpdate):
    db = SessionLocal()
    try:
        project = db.query(Project).filter(Project.id == project_id).first()
        if not project:
            raise HTTPException(status_code=404, detail="Project not found")
        if project_data.name is not None:
            project.name = project_data.name
        if project_data.description is not None:
            project.description = project_data.description
        if project_data.manager_id is not None:
            project.manager_id = project_data.manager_id
        db.commit()
        db.refresh(project)
        return project
    finally:
        db.close()


def delete_project(project_id: int):
    db = SessionLocal()
    try:
        project = db.query(Project).filter(Project.id == project_id).first()
        if not project:
            raise HTTPException(status_code=404, detail="Project not found")
        db.delete(project)
        db.commit()
        return {"message": "Project deleted successfully"}
    finally:
        db.close()
