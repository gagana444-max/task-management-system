import bcrypt
import mysql.connector

new_password = "Admin@123"
hashed = bcrypt.hashpw(new_password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

conn = mysql.connector.connect(
    host="db",
    port=3306,
    user="root",
    password="rootpassword",
    database="tms_db"
)
cursor = conn.cursor()
cursor.execute(
    "UPDATE users SET user_password = %s WHERE email = %s",
    (hashed, "admin2@test.com")
)
conn.commit()
print(f"Updated {cursor.rowcount} row(s). New hash: {hashed}")
cursor.close()
conn.close()