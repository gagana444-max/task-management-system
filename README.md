# Task Management System (TMS) 🚀

A full-stack, enterprise-grade web application for managing tasks collaboratively in real time. Designed for personal productivity, team collaboration, and structured project management with role-based access control.

## 🌐 Live Demo & Access
- **Frontend App:** [http://taskmanagement.eastasia.cloudapp.azure.com:5173](http://taskmanagement.eastasia.cloudapp.azure.com:5173)
- **Backend API:** [http://taskmanagement.eastasia.cloudapp.azure.com:8000](http://taskmanagement.eastasia.cloudapp.azure.com:8000)
- **Interactive API Docs (Swagger):** [http://taskmanagement.eastasia.cloudapp.azure.com:8000/docs](http://taskmanagement.eastasia.cloudapp.azure.com:8000/docs)

---

## ✨ Key Features

- **Role-Based Access Control (RBAC):** Distinct permissions for Admins, Project Managers, and Collaborators.
- **Real-Time Notifications:** Instant WebSockets updates for task assignments, project creations, and status changes.
- **Secure Authentication:** JWT-based stateless authentication with securely hashed passwords using bcrypt.
- **Project & Task Isolation:** Project managers and collaborators only see projects and tasks assigned to them.
- **Modern User Interface:** Fully responsive design built with Tailwind CSS, utilizing glassmorphism and modern UI components.
- **Dockerized Environment:** Seamless one-click deployment using Docker and Docker Compose.

---

## 🛠 Technologies & Architecture

### **Frontend Layer**
- **React 18:** Component-based UI rendering.
- **Vite:** High-performance local development and optimized build tooling.
- **Tailwind CSS:** Utility-first styling framework.
- **Socket.IO-client:** Real-time bi-directional event listening.
- **Axios:** Managed HTTP client with JWT interceptors.

### **Backend Layer**
- **Python 3.10+ & FastAPI:** High-performance async API routing.
- **SQLAlchemy ORM:** Database abstraction and schema management.
- **MySQL:** Relational database for persistent storage.
- **Socket.IO (ASGI):** Async WebSockets server.
- **PyJWT & Passlib:** Token encoding and cryptographic password hashing.

---

## ⚙️ Environment Configuration

To run the application, you need to configure environment variables. Example templates are provided in `.env.example`.

### **Backend (`backend/.env`)**
| Variable | Description |
|----------|-------------|
| `DB_HOST` | Database host (e.g., `localhost` or `db`) |
| `DB_PORT` | Database port (usually `3306`) |
| `DB_NAME` | Database name (`tms_db`) |
| `DB_USER` | MySQL root user |
| `DB_PASSWORD` | MySQL root password |
| `JWT_SECRET` | Secret key for JWT signing |
| `JWT_EXPIRES_IN` | Token lifespan (e.g., `7d`) |
| `FRONTEND_URL` | Used for CORS and email callbacks |

### **Frontend (`frontend/.env`)** *(Optional for local dev)*
| Variable | Description |
|----------|-------------|
| `VITE_API_URL` | The base URL for the backend API (defaults to `/api` for proxy) |

---

## 🚀 Setup & Installation Instructions

### Prerequisites
- Node.js 20+
- Python 3.10+
- Docker & Docker Compose
- Git

### Option 1: Run via Docker Compose (Recommended)
1. Clone the repository:
   ```bash
   git clone https://github.com/YourOrg/task-management-system.git
   cd task-management-system
   ```
2. Set up environment variables based on the tables above.
3. Start all services (Database, Backend, Frontend):
   ```bash
   docker-compose up -d --build
   ```
4. Access the application:
   - **Frontend:** `http://localhost:3000`
   - **Backend API:** `http://localhost:8000`

### Option 2: Run Locally (Without Docker)

**Backend Setup:**
```bash
cd backend
python -m venv venv
# Windows: venv\Scripts\activate
# Mac/Linux: source venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

**Frontend Setup:**
```bash
cd frontend
npm install
npm run dev
```
*(The frontend will be available at `http://localhost:5173`)*

---

## 📡 API Endpoints Overview

The backend exposes a comprehensive RESTful API. Below are the primary resource groups:

- **`/api/auth`**: User registration, login, token generation, and password resets.
- **`/api/users`**: User retrieval and management (Admin only).
- **`/api/projects`**: Project creation, retrieval (filtered by role), and deletion.
- **`/api/tasks`**: Task assignment, status updates (To Do, In Progress, Review, Done), and management.
- **`/api/notifications`**: Fetch unread notifications, mark as read, and delete.

For full schemas and interactive testing, visit the **[Swagger UI Documentation](http://localhost:8000/docs)**.

---

## 📂 Project Structure

```text
task-management-system/
├── backend/
│   ├── config/          # Database, Socket.io, and Env config
│   ├── controllers/     # Route logic and business rules
│   ├── middleware/      # Auth & Role verification decorators
│   ├── models/          # SQLAlchemy DB models & Pydantic schemas
│   ├── routes/          # FastAPI API routers
│   └── services/        # Reusable service layer (Email, Auth)
├── frontend/
│   ├── src/
│   │   ├── api/         # Axios interceptors
│   │   ├── components/  # Atomic and shared UI components
│   │   ├── context/     # React Context (Auth, Sockets)
│   │   ├── layouts/     # Application structure (Sidebar, Nav)
│   │   └── pages/       # Core views (Dashboard, Projects, Tasks)
├── database/            # ER Diagrams and database designs
└── testing/             # QA Functional test reports
```

---

## 👥 Team Contributions

| Member | Role | Core Contributions |
|--------|------|--------------------|
| **Member 1** | Auth + Security | Implemented JWT architecture, password hashing, password reset flow, and RBAC middleware. |
| **Member 2** | DB + Deployment | Designed MySQL schema, wrote Dockerfiles, composed `docker-compose.yml`, and deployed to Azure. |
| **Member 3** | User API + Sockets | Built the Socket.IO real-time notification engine and REST endpoints for User Management. |
| **Member 4** | Frontend + Admin | Developed React UI components, Admin dashboard, and Tailwind glassmorphism aesthetics. |
| **Member 5** | DevOps + Testing | Handled GitHub Actions CI/CD pipelines, QA testing reports, and API bug fixing. |

---

## 📄 Deliverables Reference

The required university/course deliverables are located throughout the repository:
- **ER / Class Diagrams:** Root directory (`Class Diagram.drawio.png`, `database/ER diagram.png`)
- **Deployment Diagrams:** Root directory (`Deployment Diagram.drawio.png`)
- **Functional Testing:** Detailed test cases in `testing/test-report.md`
- **UI Design System:** Figma link or design specs in `Design.md`