import os
from dotenv import load_dotenv

from pathlib import Path
from dotenv import load_dotenv

env_path = Path(__file__).resolve().parent.parent.parent / ".env"
load_dotenv(env_path)

import mysql.connector
from fastapi import HTTPException

from models.task_model import TaskCreate


def _get_db_config():
    try:
        port = int(os.getenv("DB_PORT", "3306"))
    except ValueError as exc:
        raise HTTPException(status_code=500, detail="DB_PORT must be a valid integer") from exc

    return {
        "host": os.getenv("DB_HOST", "localhost"),
        "port": port,
        "user": os.getenv("DB_USER", "root"),
        "password": os.getenv("DB_PASSWORD", ""),
        "database": os.getenv("DB_NAME", "task_management_system"),
    }


def get_connection():
    try:
        return mysql.connector.connect(**_get_db_config())
    except mysql.connector.Error as exc:
        raise HTTPException(status_code=500, detail=f"Database connection failed: {exc}") from exc


STATUS_MAP_API_TO_DB = {
    "to-do": "To Do",
    "to do": "To Do",
    "in-progress": "In Progress",
    "in progress": "In Progress",
    "done": "Completed",
    "completed": "Completed"
}

STATUS_MAP_DB_TO_API = {
    "to do": "to-do",
    "in progress": "in-progress",
    "completed": "done",
    "done": "done",
    "to-do": "to-do",
    "in-progress": "in-progress"
}

def _row_to_task(row):
    if row is None:
        return None

    db_status = row[6]
    api_status = STATUS_MAP_DB_TO_API.get(db_status, db_status)

    return {
        "id": row[0],
        "title": row[1],
        "description": row[2],
        "assigned_user_id": row[3],
        "due_date": row[4].isoformat() if row[4] else None,
        "priority": row[5],
        "status": api_status,
        "project_id": row[7] if len(row) > 7 else None,
    }


def create_task(task_data: TaskCreate):
    connection = get_connection()
    cursor = connection.cursor()

    try:
        # Check whether assigned user exists
        cursor.execute(
            "SELECT user_id FROM users WHERE user_id = %s",
            (task_data.assigned_user_id,)
        )

        user = cursor.fetchone()

        if not user:
            raise HTTPException(
                status_code=400,
                detail="Assigned user does not exist"
            )

        # Create task
        cursor.execute(
            """
            INSERT INTO tasks (
                title,
                task_description,
                assigned_user_id,
                project_id,
                due_date,
                priority,
                task_status
            )
            VALUES (%s, %s, %s, %s, %s, %s, %s)
            """,
            (
                task_data.title,
                task_data.description,
                task_data.assigned_user_id,
                task_data.project_id,
                task_data.due_date,
                task_data.priority,
                "To Do",
            ),
        )

        connection.commit()

        cursor.execute(
            """
            SELECT task_id,
                   title,
                   task_description,
                   assigned_user_id,
                   due_date,
                   priority,
                   task_status,
                   project_id
            FROM tasks
            WHERE task_id = %s
            """,
            (cursor.lastrowid,),
        )

        return _row_to_task(cursor.fetchone())

    finally:
        cursor.close()
        connection.close()


def get_all_tasks(
    priority=None,
    status=None,
    assigned_user_id=None,
    project_id=None
):
    connection = get_connection()
    cursor = connection.cursor()

    try:
        query = """
            SELECT task_id,
                   title,
                   task_description,
                   assigned_user_id,
                   due_date,
                   priority,
                   task_status,
                   project_id
            FROM tasks
            WHERE 1=1
        """

        params = []

        if priority:
            query += " AND priority = %s"
            params.append(priority)

        if status:
            query += " AND task_status = %s"
            params.append(status)

        if assigned_user_id:
            query += " AND assigned_user_id = %s"
            params.append(assigned_user_id)

        if project_id:
            query += " AND project_id = %s"
            params.append(project_id)

        query += " ORDER BY task_id DESC"

        cursor.execute(query, tuple(params))

        return [
            _row_to_task(row)
            for row in cursor.fetchall()
        ]

    finally:
        cursor.close()
        connection.close()

def get_task_by_id(task_id: int):
    connection = get_connection()
    cursor = connection.cursor()

    try:
        cursor.execute(
            """
            SELECT task_id, title, task_description,
                   assigned_user_id, due_date,
                   priority, task_status,
                   project_id
            FROM tasks
            WHERE task_id = %s
            """,
            (task_id,)
        )

        row = cursor.fetchone()

        if row is None:
            return None

        return _row_to_task(row)

    finally:
        cursor.close()
        connection.close()
        

def update_task(task_id: int, task_data):
    connection = get_connection()
    cursor = connection.cursor()

    status_lower = task_data.status.lower() if task_data.status else ""
    db_status = STATUS_MAP_API_TO_DB.get(status_lower, "To Do") if task_data.status is not None else None

    try:
        cursor.execute(
            """
            UPDATE tasks
            SET title=%s,
                task_description=%s,
                assigned_user_id=%s,
                due_date=%s,
                priority=%s,
                task_status=%s
            WHERE task_id=%s
            """,
            (
                task_data.title,
                task_data.description,
                task_data.assigned_user_id,
                task_data.due_date,
                task_data.priority,
                db_status,
                task_id,
            ),
        )

        connection.commit()

        cursor.execute(
            """
            SELECT task_id, title, task_description,
                   assigned_user_id, due_date,
                   priority, task_status,
                   project_id
            FROM tasks
            WHERE task_id=%s
            """,
            (task_id,),
        )

        task = cursor.fetchone()

        if not task:
            raise HTTPException(status_code=404, detail="Task not found")

        return _row_to_task(task)

    finally:
        cursor.close()
        connection.close()


def update_task_status(task_id: int, status: str):
    """Lightweight status-only update that skips full task validation (e.g. due_date past-date check)."""
    connection = get_connection()
    cursor = connection.cursor()

    status_lower = status.lower() if status else ""
    db_status = STATUS_MAP_API_TO_DB.get(status_lower, "To Do")

    try:
        cursor.execute(
            "UPDATE tasks SET task_status=%s WHERE task_id=%s",
            (db_status, task_id),
        )

        connection.commit()

        if cursor.rowcount == 0:
            raise HTTPException(status_code=404, detail="Task not found")

        cursor.execute(
            """
            SELECT task_id, title, task_description,
                   assigned_user_id, due_date,
                   priority, task_status,
                   project_id
            FROM tasks
            WHERE task_id=%s
            """,
            (task_id,),
        )

        task = cursor.fetchone()
        return _row_to_task(task)

    finally:
        cursor.close()
        connection.close()


def delete_task(task_id: int):
    connection = get_connection()
    cursor = connection.cursor()

    try:
        cursor.execute(
            "DELETE FROM tasks WHERE task_id = %s",
            (task_id,)
        )

        connection.commit()

        if cursor.rowcount == 0:
            return None

        return {"message": "Task deleted successfully"}

    finally:
        cursor.close()
        connection.close()

from models.task_model import TaskUpdate

def update_task(task_id: int, task_data: TaskUpdate):
    connection = get_connection()
    cursor = connection.cursor()

    try:
        # Check whether assigned user exists if provided
        if task_data.assigned_user_id is not None:
            cursor.execute("SELECT user_id FROM users WHERE user_id = %s", (task_data.assigned_user_id,))
            user = cursor.fetchone()
            if not user:
                raise HTTPException(status_code=400, detail="Assigned user does not exist")

        fields = []
        values = []

        if task_data.title is not None:
            fields.append("title=%s")
            values.append(task_data.title)
        
        if task_data.description is not None:
            fields.append("task_description=%s")
            values.append(task_data.description)
            
        if task_data.assigned_user_id is not None:
            fields.append("assigned_user_id=%s")
            values.append(task_data.assigned_user_id)
            
        if task_data.due_date is not None:
            fields.append("due_date=%s")
            values.append(task_data.due_date)
            
        if task_data.priority is not None:
            fields.append("priority=%s")
            values.append(task_data.priority)
            
        if task_data.status is not None:
            db_status = STATUS_MAP_API_TO_DB.get(task_data.status, task_data.status)
            fields.append("task_status=%s")
            values.append(db_status)

        if not fields:
            # Nothing to update
            return get_task_by_id(task_id)

        values.append(task_id)

        query = f"UPDATE tasks SET {', '.join(fields)} WHERE task_id=%s"
        
        cursor.execute(query, tuple(values))
        connection.commit()

        if cursor.rowcount == 0:
            # Might be 0 if task_id doesn't exist OR values were exactly the same
            # Let's verify task exists
            cursor.execute("SELECT task_id FROM tasks WHERE task_id=%s", (task_id,))
            if not cursor.fetchone():
                raise HTTPException(status_code=404, detail="Task not found")

        cursor.execute(
            """
            SELECT task_id, title, task_description,
                   assigned_user_id, due_date,
                   priority, task_status,
                   project_id
            FROM tasks
            WHERE task_id=%s
            """,
            (task_id,),
        )

        task = cursor.fetchone()
        return _row_to_task(task)

    finally:
        cursor.close()
        connection.close()