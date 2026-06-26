import os
import sqlalchemy
from dotenv import load_dotenv

load_dotenv()

DB_URL = "mysql+pymysql://" + os.getenv("DB_USER") + ":" + os.getenv("DB_PASSWORD") + "@" + os.getenv("DB_HOST") + ":" + os.getenv("DB_PORT") + "/" + os.getenv("DB_NAME")

engine = sqlalchemy.create_engine(DB_URL, connect_args={"ssl": __import__("ssl").create_default_context()})

with engine.connect() as conn:
    res = conn.execute(sqlalchemy.text("SHOW COLUMNS FROM tasks WHERE Field = 'task_status'"))
    for row in res:
        print("ENUM DEFINITION:", row[1])
