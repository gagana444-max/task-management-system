import os
import sys
from pathlib import Path

env_path = Path(__file__).resolve().parent / ".env"
from dotenv import load_dotenv
load_dotenv(env_path)

import mysql.connector

def add_project_id_column():
    try:
        conn = mysql.connector.connect(
            host=os.getenv("DB_HOST", "localhost"),
            port=int(os.getenv("DB_PORT", "3306")),
            user=os.getenv("DB_USER", "root"),
            password=os.getenv("DB_PASSWORD", ""),
            database=os.getenv("DB_NAME", "tms_db"),
        )
        cursor = conn.cursor()

        # Check if column already exists
        cursor.execute("""
            SELECT COUNT(*) FROM information_schema.columns
            WHERE table_schema = %s
            AND table_name = 'tasks'
            AND column_name = 'project_id'
        """, (os.getenv("DB_NAME", "tms_db"),))

        exists = cursor.fetchone()[0]

        if exists:
            print("project_id column already exists in tasks table")
        else:
            cursor.execute("""
                ALTER TABLE tasks
                ADD COLUMN project_id INT NULL
            """)
            cursor.execute("""
                ALTER TABLE tasks
                ADD CONSTRAINT fk_task_project
                FOREIGN KEY (project_id) REFERENCES projects(id)
                ON DELETE SET NULL
            """)
            conn.commit()
            print("project_id column added successfully to tasks table")

        cursor.close()
        conn.close()

    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    add_project_id_column()
