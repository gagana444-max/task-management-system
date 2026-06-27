# Task Management System

A full-stack web application for managing tasks collaboratively in real time, designed for personal productivity, team collaboration, and structured project management.

##  Live Demo
- **Frontend URL:** [Insert Hosted Frontend URL Here]
- **Backend API URL:** [Insert Hosted Backend URL Here]

## 🛠 Technologies Used

- **Frontend:** React, Vite, Tailwind CSS
- **Backend:** Python, FastAPI
- **Database:** MySQL (via SQLAlchemy ORM)
- **Real-Time:** WebSockets (Socket.IO)
- **Auth:** JWT (JSON Web Tokens), bcrypt for secure password hashing
- **DevOps:** Docker, Docker Compose, GitHub Actions

##  Folder Structure

The application follows a clean, modular Model-View-Controller (MVC) architecture, strictly separated into frontend and backend layers.

```text
task-management-system/
├── backend/
│   ├── config/          # Database and Socket.io configurations
│   ├── controllers/     # Business logic and request handling
│   ├── middleware/      # Authentication & Security middleware
│   ├── models/          # SQLAlchemy DB models & Pydantic validation schemas
│   ├── routes/          # FastAPI REST API endpoints
│   └── services/        # Reusable service layer (Email, Auth, DB queries)
├── frontend/
│   ├── src/
│   │   ├── api/         # Axios API interceptors and endpoint definitions
│   │   ├── components/  # Reusable UI components
│   │   ├── context/     # React Context providers (Auth, Theme, WebSockets)
│   │   ├── layouts/     # Application layouts (Sidebar, Nav)
│   │   └── pages/       # Core application pages
├── database/            # ER Diagrams and database schema designs
└── testing/             # Functional test reports
```

## 👥 Team Member Contributions

| Member | Role | Tasks |
|--------|------|-------|
| Member 1 | Auth + Security | Tasks 3, 9, 12 |
| Member 2 | Database + Deployment | Tasks 2, 6, 14 |
| Member 3 | User API + WebSocket + Docs | Tasks 5, 8, 15 |
| Member 4 | Frontend + Admin | Tasks 4, 7, 11 |
| Member 5 | DevOps + UI + Testing | Tasks 1, 10, 13 |

## ⚙️ Setup Instructions

### Prerequisites
- Node.js 20+
- Python 3.10+ (for local backend development)
- Docker Desktop
- Git

### Option 1: Run via Docker (Recommended)
1. Clone the repository:
   ```bash
   git clone https://github.com/YourOrg/task-management-system.git
   cd task-management-system
   ```
2. Set up environment variables:
   ```bash
   cp .env.example .env
   ```
3. Start all services using Docker Compose:
   ```bash
   docker compose up --build
   ```
4. Access the application:
   - **Frontend:** `http://localhost:3000`
   - **Backend API:** `http://localhost:5000`

### Option 2: Run Locally (Without Docker)

**Backend Setup:**
```bash
cd backend
python -m venv venv
# Windows: venv\Scripts\activate
# Mac/Linux: source venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload --port 5000
```

**Frontend Setup:**
```bash
cd frontend
npm install
npm run dev
```
*(The frontend will be available at `http://localhost:5173` if running locally without Docker)*

## 📖 API Usage & Documentation

The backend REST endpoints are fully documented using Swagger/OpenAPI. 

Once the backend server is running, navigate to the following URL to view interactive API documentation, test endpoints directly from the browser, and view data schemas:
- **Swagger UI:** [http://localhost:5000/docs](http://localhost:5000/docs)

*Note: All protected routes require a valid JWT token in the `Authorization` header (`Bearer <token>`).*

## 📄 Deliverables Reference

The required project deliverables can be found in the following locations within this repository:
- **ER / Class Diagrams:** Located in the root directory (`Class Diagram.drawio.png`, `database/ER diagram.png`)
- **Deployment Diagrams:** Located in the root directory (`Deployment Diagram.drawio.png`)
- **Functional Testing:** Located in `testing/test-report.md`
- **UI Design System:** Located in `Design.md`