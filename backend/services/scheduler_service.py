import datetime
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from sqlalchemy import text
from config.database import SessionLocal
from services.notification_service import send_notification
from services.email_service import send_due_soon_email

scheduler = AsyncIOScheduler()

async def check_due_tasks():
    print(f"[{datetime.datetime.utcnow().isoformat()}] Running due-soon task checker...")
    try:
        with SessionLocal() as db:
            # Find tasks due today or tomorrow that are not completed
            # and have an assigned user
            query = text("""
                SELECT t.task_id, t.title, t.due_date, u.user_id, u.email, u.user_name
                FROM tasks t
                JOIN users u ON t.assigned_user_id = u.user_id
                WHERE t.task_status != 'Completed'
                  AND t.assigned_user_id IS NOT NULL
                  AND t.due_date IS NOT NULL
                  AND t.due_date >= CURRENT_DATE
                  AND t.due_date <= DATE_ADD(CURRENT_DATE, INTERVAL 1 DAY)
            """)
            
            result = db.execute(query).fetchall()
            
            tasks_to_notify = [
                {
                    "user_id": row[3],
                    "email": row[4],
                    "user_name": row[5],
                    "title": row[1],
                    "due_date": str(row[2]),
                    "message": f"Reminder: Task '{row[1]}' is due {'TODAY' if row[2] == datetime.date.today() else 'TOMORROW'} ({row[2]})."
                }
                for row in result
            ]

        # Process outside of DB lock
        with SessionLocal() as db:
            for task in tasks_to_notify:
                # 1. In-app notification
                await send_notification(db, task["user_id"], task["message"], 'task_due_soon')
                
                # 2. Email notification
                send_due_soon_email(
                    email=task["email"],
                    name=task["user_name"],
                    task_title=task["title"],
                    due_date=task["due_date"]
                )

        print(f"[{datetime.datetime.utcnow().isoformat()}] Due-soon checker completed. Notified {len(tasks_to_notify)} tasks.")
    
    except Exception as e:
        print(f"Error in check_due_tasks: {e}")

def start_scheduler():
    # Run every minute for testing purposes as specified in the plan
    scheduler.add_job(check_due_tasks, 'cron', minute='*')
    scheduler.start()
    print("Background scheduler started successfully.")

def shutdown_scheduler():
    scheduler.shutdown()
    print("Background scheduler shutdown successfully.")
