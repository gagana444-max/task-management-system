from models.task_model import TaskCreate, TaskUpdate

tasks_db = {}
current_task_id = 1

def create_task(task_data: TaskCreate):
    global current_task_id

    new_task = {
        "id": current_task_id,
        "title": task_data.title,
        "description": task_data.description,
        "assigned_user_id": task_data.assigned_user_id,
        "due_date": task_data.due_date,
        "priority": task_data.priority,
        "status": "To Do"
    }

    tasks_db[current_task_id] = new_task
    current_task_id += 1

    return new_task

def get_all_tasks():
    return list(tasks_db.values())