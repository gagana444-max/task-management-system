INSERT INTO users(user_name, email, user_password, user_role, is_active) 
VALUES
('Admin User','admin@gmail.com','admin123','Admin',TRUE),
('Project Manager','projectManager@gmail.com','pm123','ProjectManager',TRUE),
('Collaborator User','collab@gmail.com','collab123','Collaborator',TRUE);

INSERT INTO tasks(title,task_description,assigned_user_id,due_date,priority,task_status)
VALUES
('Create Login Page','Design and implement the login page',3,'2026-06-15','High','To Do'),
('Create Database Schema','Design users, tasks, comments, attachments and notifications tables',2,'2026-06-10','Medium','In Progress'),
('Implement Task API','Develop CRUD operations for task management',2,'2026-06-20','High','To Do');

INSERT INTO comments(task_id, user_id, comment_text, created_at)
VALUES
(1, 3, 'Started working on login page', NOW()),
(1, 3, 'UI design completed', NOW()),
(2, 2, 'Database schema completed', NOW()),
(3, 2, 'Task API development started', NOW());

INSERT INTO attachments(task_id, file_name, file_path, uploaded_by, uploaded_at)
VALUES
(1, 'login_design.png', '/uploads/login_design.png', 3, NOW()),
(2, 'database_schema.pdf', '/uploads/database_schema.pdf', 2, NOW()),
(3, 'task_api_doc.pdf', '/uploads/task_api_doc.pdf', 2, NOW());

INSERT INTO notifications(user_id, message, is_read, created_at)
VALUES
(3, 'You have been assigned a new task', FALSE, NOW()),
(2, 'Database schema task deadline is approaching', FALSE, NOW()),
(1, 'Project progress updated', TRUE, NOW());


SELECT * FROM users;
SELECT * FROM tasks;
SELECT * FROM comments;
SELECT * FROM attachments;
SELECT * FROM notifications;