# Task Management System — Auth Backend

This repository contains the Phase 1 Member 1 implementation for the authentication and RBAC backend.

## Features delivered

- JWT authentication with login and token validation
- bcrypt password hashing
- `POST /api/auth/register` for new user sign-up
- `POST /api/auth/login` for token issuance
- `GET /api/auth/me` to validate the current user session
- RBAC middleware for future protected routes
- Structured `401` and `403` error responses

## Setup

1. Copy `.env.example` to `.env`
2. Configure MySQL connection details and `JWT_SECRET`
3. Install dependencies:

```bash
npm install
```

4. Start the backend:

```bash
npm start
```

## Notes

- Registration defaults to the `Collaborator` role
- Role assignment beyond collaborator is reserved for Admin workflows in later tasks
- This deliverable is scoped to authentication/RBAC only
