from fastapi import HTTPException
from sqlalchemy.orm import Session
from models.project_model import Project, ProjectCreate, ProjectUpdate
from models.db_models import DBUser
from config.socketio import sio


def get_all_projects(db: Session):
    return db.query(Project).order_by(Project.created_at.desc()).all()


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
            await sio.emit('project_assigned', {
                'project_id': new_project.id,
                'name': new_project.name,
                'message': f"You have been assigned as the manager for project: {new_project.name}"
            }, room=str(new_project.manager_id))
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
                await sio.emit('project_removed', {
                    'project_id': project.id,
                    'name': project.name,
                    'message': f"You have been removed as the manager for project: {project.name}"
                }, room=str(old_manager_id))
            except Exception as e:
                print(f"Socket emit failed: {e}")
        if new_manager_id:
            try:
                await sio.emit('project_assigned', {
                    'project_id': project.id,
                    'name': project.name,
                    'message': f"You have been assigned as the manager for project: {project.name}"
                }, room=str(new_manager_id))
            except Exception as e:
                print(f"Socket emit failed: {e}")
    else:
        if new_manager_id:
            if project_data.name or project_data.description:
                try:
                    await sio.emit('project_updated', {
                        'project_id': project.id,
                        'name': project.name,
                        'message': f"Project details updated: {project.name}"
                    }, room=str(new_manager_id))
                except Exception as e:
                    print(f"Socket emit failed: {e}")

    return project


async def delete_project(db: Session, project_id: int):
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    manager_id = project.manager_id
    project_name = project.name
    
    db.delete(project)
    db.commit()
    
    if manager_id:
        try:
            await sio.emit('project_deleted', {
                'project_id': project_id,
                'name': project_name,
                'message': f"Project was deleted: {project_name}"
            }, room=str(manager_id))
        except Exception as e:
            print(f"Socket emit failed: {e}")
            
    return {"message": "Project deleted successfully"}
