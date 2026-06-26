from fastapi import HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import text
from models.project_model import Project, ProjectCreate, ProjectUpdate
from models.db_models import DBUser
from services.notification_service import broadcast_notification_to_admins

def get_all_projects(db: Session, current_user: dict):
    role = current_user.get("role")
    user_id = current_user.get("id")
    query = db.query(Project)

    if role == "Admin":
        return query.order_by(Project.created_at.desc()).all()
    elif role == "ProjectManager":
        return query.filter((Project.manager_id == user_id) | (Project.created_by == user_id)).order_by(Project.created_at.desc()).all()
    else:
        # Collaborator: only see projects they have tasks in
        res = db.execute(text("SELECT DISTINCT project_id FROM tasks WHERE assigned_user_id = :uid"), {"uid": user_id})
        project_ids = [r[0] for r in res.fetchall() if r[0] is not None]
        if not project_ids:
            return []
        return query.filter(Project.id.in_(project_ids)).order_by(Project.created_at.desc()).all()


def get_project(db: Session, project_id: int):
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    return project


async def create_project(db: Session, project: ProjectCreate, user_id: int):
    # Check whether manager exists
    manager = db.query(DBUser).filter(DBUser.user_id == project.manager_id).first()
    if not manager:
        raise HTTPException(
            status_code=400,
            detail="Assigned project manager does not exist"
        )
    if manager.user_role not in ("ProjectManager", "Admin"):
        raise HTTPException(
            status_code=400,
            detail="Assigned user must be a Project Manager or Admin"
        )

    new_project = Project(
        name=project.name,
        description=project.description,
        created_by=user_id,
        manager_id=project.manager_id,
    )
    db.add(new_project)
    db.commit()
    db.refresh(new_project)

    if new_project.manager_id:
        try:
            await broadcast_notification_to_admins(
                db, new_project.manager_id, f"You have been assigned as the manager for project: {new_project.name}", 'project_assigned'
            )
        except Exception as e:
            print(f"Socket emit failed: {e}")

    return new_project


async def update_project(db: Session, project_id: int, project_data: ProjectUpdate):
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    old_manager_id = project.manager_id

    if project_data.name is not None:
        project.name = project_data.name
    if project_data.description is not None:
        project.description = project_data.description
    if project_data.manager_id is not None:
        # Check whether manager exists
        manager = db.query(DBUser).filter(DBUser.user_id == project_data.manager_id).first()
        if not manager:
            raise HTTPException(
                status_code=400,
                detail="Assigned project manager does not exist"
            )
        if manager.user_role not in ("ProjectManager", "Admin"):
            raise HTTPException(
                status_code=400,
                detail="Assigned user must be a Project Manager or Admin"
            )
        project.manager_id = project_data.manager_id
    db.commit()
    db.refresh(project)

    new_manager_id = project.manager_id

    if old_manager_id != new_manager_id:
        if old_manager_id:
            try:
                await broadcast_notification_to_admins(
                    db, old_manager_id, f"You have been removed as the manager for project: {project.name}", 'project_removed'
                )
            except Exception as e:
                print(f"Socket emit failed: {e}")
        if new_manager_id:
            try:
                await broadcast_notification_to_admins(
                    db, new_manager_id, f"You have been assigned as the manager for project: {project.name}", 'project_assigned'
                )
            except Exception as e:
                print(f"Socket emit failed: {e}")
    else:
        if new_manager_id:
            if project_data.name or project_data.description:
                try:
                    await broadcast_notification_to_admins(
                        db, new_manager_id, f"Project details updated: {project.name}", 'project_updated'
                    )
                except Exception as e:
                    print(f"Socket emit failed: {e}")

    return project


async def delete_project(db: Session, project_id: int):
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    manager_id = project.manager_id
    project_name = project.name
    
    # Cascade delete all tasks associated with this project
    db.execute(text("DELETE FROM tasks WHERE project_id = :project_id"), {"project_id": project_id})
    
    db.delete(project)
    db.commit()
    
    if manager_id:
        try:
            await broadcast_notification_to_admins(
                db, manager_id, f"Project was deleted: {project_name}", 'project_deleted'
            )
        except Exception as e:
            print(f"Socket emit failed: {e}")
            
    return {"message": "Project and all associated tasks deleted successfully"}
