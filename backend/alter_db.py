from config.database import engine
from sqlalchemy import text

with engine.begin() as conn:
    try:
        conn.execute(text("ALTER TABLE users ADD COLUMN failed_login_attempts INT DEFAULT 0 NOT NULL;"))
        print("Added failed_login_attempts")
    except Exception as e:
        print(e)
    try:
        conn.execute(text("ALTER TABLE users ADD COLUMN locked_until TIMESTAMP NULL;"))
        print("Added locked_until")
    except Exception as e:
        print(e)
