import pymysql
conn = pymysql.connect(
    host='gateway01.ap-southeast-1.prod.aws.tidbcloud.com',
    port=4000,
    user='3B6MvNGekqobRvK.root',
    password='8QOi7v8rJCiwlpX9',
    database='task_management_system',
    ssl={'ssl': True}
)
cursor = conn.cursor()
cursor.execute("DESCRIBE users")
print(cursor.fetchall())
conn.close()