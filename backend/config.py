# backend/config.py

import os
from datetime import timedelta

# --- CHANGES START HERE ---

# Define default values for local development
DEFAULT_MONGO_USER = "admin"  # Default for many local setups
DEFAULT_MONGO_PASSWORD = "password"  # Only if you enabled authentication
DEFAULT_DB_HOST = "localhost"
DEFAULT_DB_PORT = "27017"  # MongoDB's default port, ensure it's a string
DEFAULT_MONGO_DB = "task_management_db"  # A name for your local database


class Config:
    """Base configuration."""

    SECRET_KEY = os.environ.get("SECRET_KEY", "default_secret_key")

    # MongoDB Configuration - Use environment variables, but ensure the port is a string
    # The default value for the whole URI will be overridden in DevelopmentConfig
    _MONGO_USER = os.environ.get("MONGO_USER", DEFAULT_MONGO_USER)
    _MONGO_PASSWORD = os.environ.get("MONGO_PASSWORD", DEFAULT_MONGO_PASSWORD)
    _DB_HOST = os.environ.get("DB_HOST", DEFAULT_DB_HOST)
    # Crucially, ensure DB_PORT is a string, not None or empty
    _DB_PORT = os.environ.get("DB_PORT", DEFAULT_DB_PORT)
    _MONGO_DB = os.environ.get("MONGO_DB", DEFAULT_MONGO_DB)

    # Use f-string only if user/password are properly escaped (which they aren't by default here)
    # The error usually happens when environment variables are not set, and the f-string fails
    # We will fix this properly in DevelopmentConfig for local use.
    # MONGO_URI = f"mongodb://{_MONGO_USER}:{_MONGO_PASSWORD}@{_DB_HOST}:{_DB_PORT}/{_MONGO_DB}?authSource=admin"
    MONGO_URI = f"mongodb://{DEFAULT_DB_HOST}:{DEFAULT_DB_PORT}/{DEFAULT_MONGO_DB}"

    # JWT Configuration
    JWT_SECRET_KEY = os.environ.get("JWT_SECRET_KEY", "jwt-super-secret")
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(hours=1)
    # File Storage (Local)
    UPLOAD_FOLDER = os.path.join(os.getcwd(), "uploads")
    MAX_FILE_UPLOADS = 3  # Attach up to 3 documents (PDF format)
    ALLOWED_EXTENSIONS = {"pdf"}  # Only PDF files are allowed


class DevelopmentConfig(Config):
    """Development configuration."""

    DEBUG = True

    # OVERRIDE: Set a simple local MONGO_URI for development
    # This typically works for MongoDB running on default port without authentication
    # If your MongoDB is running on port 27017 locally without a username/password:
    # MONGO_URI = f"mongodb://{DEFAULT_DB_HOST}:{DEFAULT_DB_PORT}/{DEFAULT_MONGO_DB}"


# --- CHANGES END HERE ---
