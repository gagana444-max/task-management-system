# Task Management System

A full-stack web application for managing tasks collaboratively in real time.

## Tech Stack

- **Frontend:** React, Vite, Tailwind CSS
- **Backend:** Node.js, Express
- **Database:** MySQL, Sequelize ORM
- **Real-Time:** Socket.io
- **Auth:** JWT, bcrypt
- **DevOps:** Docker, Docker Compose, GitHub Actions

## Team Members

| Member | Role | Tasks |
|--------|------|-------|
| Member 1 | Auth + Security | Tasks 3, 9, 12 |
| Member 2 | Database + Deployment | Tasks 2, 6, 14 |
| Member 3 | User API + WebSocket + Docs | Tasks 5, 8, 15 |
| Member 4 | Frontend + Admin | Tasks 4, 7, 11 |
| Member 5 | DevOps + UI + Testing | Tasks 1, 10, 13 |

## Getting Started

### Prerequisites
- Node.js 20+
- Docker Desktop
- Git

### Run Locally with Docker

1. Clone the repo
```bash
   git clone https://github.com/YourOrg/task-management-system.git
   cd task-management-system
```

2. Copy environment file
```bash
   cp .env.example .env
```

3. Start all services
```bash
   docker compose up --build
```

4. Open the app
   - Frontend: http://localhost:3000
   - Backend: http://localhost:5000
   - Swagger API docs: http://localhost:5000/api-docs

## Git Workflow

- Always work on a feature branch, never push directly to main
- Use pull requests to merge into main at the end of each phase
- All 5 members merge together at the end of each phase