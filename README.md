# Task Management System

This is a modular, full-stack Task Management System featuring authenticated CRUD operations, built for portability using Docker Compose. The system consists of a **Flask API backend** and a **React SPA frontend** with **MongoDB** for persistence.

## Core Features

- **Authentication & Access Control:** JWT-based login/registration with Role-Based Access Control (RBAC).
- **Task Management:** Complete CRUD functionality with filtering, sorting, and pagination (FSP).
- **File Handling:** Secure upload and retrieval of PDF documents.
- **Data Integrity:** Cascading deletion of associated tasks when a user account is removed.

---

## 💻 Project Architecture and Stack

### Backend Stack

| Component          | Technology                     | Role                                        |
| :----------------- | :----------------------------- | :------------------------------------------ |
| **Framework**      | Python 3.12, **Flask**         | RESTful API, Routing, and Business Logic.   |
| **Authentication** | Flask-JWT-Extended, **Bcrypt** | JWT issuance and password hashing.          |
| **Data Access**    | **Flask-PyMongo**              | MongoDB client and integration.             |
| **Server**         | **Gunicorn**                   | Production-ready WSGI server within Docker. |

### Frontend Stack

| Component      | Technology            | Role                                                          |
| :------------- | :-------------------- | :------------------------------------------------------------ |
| **Framework**  | **React.js**          | Single-Page Application (SPA) development.                    |
| **State**      | **Redux Toolkit**     | Centralized state management and asynchronous logic (Thunks). |
| **UI/Styling** | **Material-UI (MUI)** | Component library for consistent, modern interface design.    |
| **Networking** | **Axios**             | HTTP client for communicating with the Flask API.             |

---

## 🚀 Quick Start (Docker Compose)

The entire stack can be launched using Docker Compose from the root directory.

### Prerequisites

- Git
- Docker Desktop (must be running)

### 1. Setup and Cloning

```bash
git clone [repository-url]
cd task-management-system
```

### 2\. Configure Environment

Create a file named **`.env`** in the root directory to define necessary secrets and MongoDB credentials. **These credentials enable authenticated access to the MongoDB service.**

```bash
# .env file content

# --- Flask/JWT Configuration ---
SECRET_KEY=your_very_secret_key_change_me
JWT_SECRET_KEY=your_jwt_signing_key_change_me

# --- MongoDB Authentication ---
MONGO_USER=taskuser
MONGO_PASSWORD=strongpassword
MONGO_DB=task_management_db
DB_HOST=mongodb
DB_PORT=27017
```

### 3\. Build and Run Services

Execute the following command to build the images and launch the three services (`mongodb`, `backend`, `frontend`):

```bash
docker compose up --build -d
```

| Argument  | Purpose                                        |
| :-------- | :--------------------------------------------- |
| `--build` | Forces a rebuild of the Docker images.         |
| `-d`      | Runs containers in detached (background) mode. |

---

## 🌐 Application Access and API

The services are exposed on the host machine via the following addresses:

| Service         | Address                 | Notes                               |
| :-------------- | :---------------------- | :---------------------------------- |
| **Frontend UI** | `http://localhost:3000` | Access the application dashboard.   |
| **Backend API** | `http://localhost:5000` | Base URL for all RESTful API calls. |

### API Documentation and Postman

The complete set of API endpoints, including setup and test data, is available via the **Postman Collection** located in the repository source. This collection defines all endpoints for Authentication, Task CRUD, and Admin User Management.

---

## 🐳 Docker Management Commands

Use these commands from the project root directory for container control:

| Command                         | Description                                                                               |
| :------------------------------ | :---------------------------------------------------------------------------------------- |
| `docker compose ps`             | View the status of all containers.                                                        |
| `docker compose logs [service]` | View real-time logs for a specific service (e.g., `backend`).                             |
| `docker compose stop`           | Gracefully stop running containers.                                                       |
| `docker compose down`           | Stops and removes containers, networks, and volumes (use `-v` to remove persistent data). |
