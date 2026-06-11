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


def _row_to_task(row):
    if row is None:
        return None

    return {
        "id": row[0],
        "title": row[1],
        "description": row[2],
        "assigned_user_id": row[3],
        "due_date": row[4].isoformat() if row[4] else None,
        "priority": row[5],
        "status": row[6],
    }


def create_task(task_data: TaskCreate):
    connection = get_connection()
    cursor = connection.cursor()

    try:
        cursor.execute(
            """
            INSERT INTO tasks (title, task_description, assigned_user_id, due_date, priority, task_status)
            VALUES (%s, %s, %s, %s, %s, %s)
            """,
            (
                task_data.title,
                task_data.description,
                task_data.assigned_user_id,
                task_data.due_date,
                task_data.priority,
                "To Do",
            ),
        )
        connection.commit()

        cursor.execute(
            """
            SELECT task_id, title, task_description, assigned_user_id, due_date, priority, task_status
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
    assigned_user_id=None
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
                   task_status
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
                   priority, task_status
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
                task_data.status,
                task_id,
            ),
        )

        connection.commit()

        cursor.execute(
            """
            SELECT task_id, title, task_description,
                   assigned_user_id, due_date,
                   priority, task_status
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