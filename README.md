Task Management System
This repository contains a full-stack, authenticated Task Management System built with a Flask API (Python) backend and a React (JavaScript) frontend, using MongoDB for persistence.

The entire application is containerized using Docker Compose, providing a consistent development and deployment environment.

🚀 Quick Start (Docker Compose)
Follow these steps to get the entire application stack running quickly.

Prerequisites
Git: Installed on your machine.

Docker Desktop: Installed and running (required for Docker and Docker Compose).

1. Clone the Repository
   git clone <repository-url>
   cd task-management-system

2. Configure Environment
   Create a file named .env in the root directory (task-management-system/) to define critical environment variables used by the backend service.

# .env file content (Add your actual secrets if deploying to production)

# --- Flask/JWT Configuration ---

SECRET_KEY=your_very_secret_key_change_me
JWT_SECRET_KEY=your_jwt_signing_key_change_me

# --- MongoDB Configuration (Used internally by Flask/Docker) ---

# NOTE: The MONGO_URI in docker-compose.yml overrides this for the container,

# but it's good practice to keep them synced for local CLI testing.

MONGO_USER=admin
MONGO_PASSWORD=password
DB_HOST=mongodb
DB_PORT=27017
MONGO_DB=task_management_db

3. Build and Run Services
   Run the following command from the project root directory (task-management-system/):

docker compose up --build -d

Command Argument

Purpose

--build

Forces Docker to rebuild the images from the Dockerfiles (essential for the first run).

-d

Runs the containers in detached mode (in the background).

🌐 Application Access
Once all services are up and running (this may take a moment on the first build):

Service

Address

Notes

Frontend (React)

http://localhost:3000

Access the Task Dashboard UI here.

Backend API (Flask)

http://localhost:5000

The REST API base URL.

Database (MongoDB)

mongodb://localhost:27017

Accessible for external tools (e.g., MongoDB Compass).

⚙️ Project Structure & Architecture
The application is structured as a modular mono-repository:

Directory

Service

Technology

Description

backend/

backend

Flask, PyMongo, JWT

Provides the REST API for CRUD operations, authentication, and file management.

frontend/

frontend

React, Redux Toolkit, MUI

Single-page application (SPA) providing the user interface.

mongodb/

mongodb

Mongo DB

Database service for data persistence.

🐳 Docker Management Commands
Use these commands from the project root directory (task-management-system/):

Command

Description

docker compose ps

View the status of all running services.

docker compose logs [service_name]

View real-time logs for a specific service (e.g., backend).

docker compose stop

Gracefully stop the running containers.

docker compose down

Stops and removes containers, networks, and volumes (use with caution).

docker compose exec backend bash

Get a shell inside the running backend container for debugging.
