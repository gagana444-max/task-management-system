import sys
import sqlalchemy
from sqlalchemy import create_engine, inspect

DB_URL = "mysql+pymysql://3B6MvNGekqobRvK.root:8QOi7v8rJCiwlpX9@gateway01.ap-southeast-1.prod.aws.tidbcloud.com:4000/task_management_system"

try:
    engine = create_engine(DB_URL)
    inspector = inspect(engine)
    
    tables = inspector.get_table_names()
    print("=== DATABASE TABLES ===")
    print(tables)
    print("\n=== COLUMN SCHEMAS ===")
    
    for table_name in tables:
        print(f"\nTable: {table_name}")
        for col in inspector.get_columns(table_name):
            print(f"  - {col['name']}: {col['type']} (Nullable: {col['nullable']})")
except Exception as e:
    print(f"Connection failed: {e}")
    sys.exit(1)
