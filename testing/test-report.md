# TMS Functional Test Report

**Project:** Task Management System  
**Course:** INTE 21323  
**Tester:** Member 5 (Gagana)  
**Date:** June 2026  
**Environment:** Docker Compose · Frontend: http://localhost:3000 · Backend: http://localhost:8000  

---

## Test Summary

| Category               | Total Tests | Passed | Failed |
|------------------------|-------------|--------|--------|
| Authentication         | 7           |        |        |
| Task CRUD              | 7           |        |        |
| Role Permissions       | 4           |        |        |
| Real-Time WebSocket    | 5           |        |        |
| **Total**              | **23**      |        |        |

---

## Section 1 — Authentication Tests

### TC-001: Register with valid data
- **Steps:** POST /api/auth/register with name, email, password
- **Expected:** 201 status, user object returned
- **Actual:**
- **Status:** PASS / FAIL

### TC-002: Register with missing email
- **Steps:** POST /api/auth/register with no email field
- **Expected:** 400 status, error message about email
- **Actual:**
- **Status:** PASS / FAIL

### TC-003: Register with duplicate email
- **Steps:** POST /api/auth/register with already used email
- **Expected:** 400 status, email already exists message
- **Actual:**
- **Status:** PASS / FAIL

### TC-004: Login with correct credentials
- **Steps:** POST /api/auth/login with correct email and password
- **Expected:** 200 status, JWT token returned
- **Actual:**
- **Status:** PASS / FAIL

### TC-005: Login with wrong password
- **Steps:** POST /api/auth/login with wrong password
- **Expected:** 401 status, error message
- **Actual:**
- **Status:** PASS / FAIL

### TC-006: Access protected route without token
- **Steps:** GET /api/tasks with no Authorization header
- **Expected:** 401 status
- **Actual:**
- **Status:** PASS / FAIL

### TC-007: Access protected route with valid token
- **Steps:** GET /api/tasks with valid Bearer token
- **Expected:** 200 status, tasks array
- **Actual:**
- **Status:** PASS / FAIL

---

## Section 2 — Task CRUD Tests

### TC-008: Create task as Project Manager
- **Steps:** POST /api/tasks with valid data and PM token
- **Expected:** 201 status, task object with id
- **Actual:**
- **Status:** PASS / FAIL

### TC-009: Create task as Collaborator (should fail)
- **Steps:** POST /api/tasks with Collaborator token
- **Expected:** 403 Forbidden
- **Actual:**
- **Status:** PASS / FAIL

### TC-010: Create task with no title
- **Steps:** POST /api/tasks with missing title field
- **Expected:** 400 status, title is required error
- **Actual:**
- **Status:** PASS / FAIL

### TC-011: Get all tasks
- **Steps:** GET /api/tasks with valid token
- **Expected:** 200 status, array of tasks
- **Actual:**
- **Status:** PASS / FAIL

### TC-012: Update task status as Collaborator
- **Steps:** PUT /api/tasks/:id with status change and Collaborator token
- **Expected:** 200 status, task updated
- **Actual:**
- **Status:** PASS / FAIL

### TC-013: Delete task as Collaborator (should fail)
- **Steps:** DELETE /api/tasks/:id with Collaborator token
- **Expected:** 403 Forbidden
- **Actual:**
- **Status:** PASS / FAIL

### TC-014: Delete task as Project Manager
- **Steps:** DELETE /api/tasks/:id with PM token
- **Expected:** 200 status, task deleted
- **Actual:**
- **Status:** PASS / FAIL

---

## Section 3 — Role Permission Tests

### TC-015: Admin can view all users
- **Steps:** GET /api/users with Admin token
- **Expected:** 200 status, list of users
- **Actual:**
- **Status:** PASS / FAIL

### TC-016: Collaborator cannot view all users
- **Steps:** GET /api/users with Collaborator token
- **Expected:** 403 Forbidden
- **Actual:**
- **Status:** PASS / FAIL

### TC-017: Admin can deactivate a user
- **Steps:** PUT /api/users/:id/deactivate with Admin token
- **Expected:** 200 status, user deactivated
- **Actual:**
- **Status:** PASS / FAIL

### TC-018: Non-Admin cannot deactivate a user
- **Steps:** PUT /api/users/:id/deactivate with Collaborator token
- **Expected:** 403 Forbidden
- **Actual:**
- **Status:** PASS / FAIL

---

## Section 4 — Real-Time WebSocket Tests

### TC-019: WebSocket connects after authentication
- **Steps:** Connect to WebSocket with valid JWT token
- **Expected:** Green connected status
- **Actual:**
- **Status:** PASS / FAIL

### TC-020: Task assignment triggers notification
- **Steps:** Assign a task to logged in user via Postman
- **Expected:** task:assigned event appears in browser
- **Actual:**
- **Status:** PASS / FAIL

### TC-021: Status change triggers notification
- **Steps:** Update task status via Postman
- **Expected:** task:statusChanged event appears
- **Actual:**
- **Status:** PASS / FAIL

### TC-022: New comment triggers notification
- **Steps:** Post a comment on a task via Postman
- **Expected:** task:comment event appears
- **Actual:**
- **Status:** PASS / FAIL

### TC-023: WebSocket without token is rejected
- **Steps:** Connect to WebSocket with invalid token
- **Expected:** Connection refused or immediately disconnected
- **Actual:**
- **Status:** PASS / FAIL

---

## Issues Found

| Test | Issue | Severity |
|------|-------|----------|
|      |       |          |

---

## Conclusion

