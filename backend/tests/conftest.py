import pytest

# from app import create_app, mongo, bcrypt
from flask import Flask
import sys
import os

# Add the parent directory (backend) to the Python path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app import create_app

# If 'mongo' and 'bcrypt' are defined in app.py or src/__init__.py, you might
# need to adjust the import depending on where they are truly defined.
# Based on your app.py, 'mongo' and 'bcrypt' are imported from 'src'.
# It's better to import the app and access extensions through it,
# but for now, let's stick to your original import structure after fixing the path.
from src import mongo, bcrypt

# Note: You might need to change the above line to:
# from app import create_app
# from src import mongo, bcrypt
# (assuming create_app, mongo, and bcrypt are the necessary imports)

from config import TestConfig

import json


# --- 1. Test Configuration Class ---
# class TestConfig(Config):
#     TESTING = True
#     # Use a separate database name for testing to avoid polluting development data
#     MONGO_DB = "task_managemet_test_db"
#     MONGO_URI = f"mongodb://{os.environ.get('MONGO_USER')}:{os.environ.get('MONGO_PASSWORD')}@{os.environ.get('DB_HOST')}:{os.environ.get('DB_PORT')}/{MONGO_DB}?authSource=admin"


# --- 2. PyTest Fixture for Flask App and Client ---
@pytest.fixture(scope="session")
def app():
    """Fixture to create and configure the Flask app for testing."""
    # Ensure environment variables are loaded for DB connection in TestConfig
    import os
    from dotenv import load_dotenv

    load_dotenv(os.path.join(os.path.dirname(__file__), "..", ".env"))

    app = create_app(config_class=TestConfig)

    with app.app_context():
        # Set up necessary collections/indexes before tests run
        pass

    yield app


@pytest.fixture(scope="function")
def client(app):
    """Fixture to provide a test client for making requests."""
    return app.test_client()


# --- 3. PyTest Fixture for Database Cleanup ---
@pytest.fixture(scope="function", autouse=True)
def cleanup_db(app):
    """Fixture to run before and after each test function to ensure clean state."""
    # Setup phase: Clear the database before the test runs
    with app.app_context():
        # Drop all collections (this is the cleanest way)
        # mongo.db.client.drop_database(TestConfig.MONGO_DB)

        database_name = (
            app.config.get("MONGO_DB") or "task_management_test_db"
        )  # Fallback is safer

        # Drop all collections (this is the cleanest way)
        mongo.db.client.drop_database(
            database_name
        )  # <-- Use the retrieved name or fallback

    yield  # Test runs here

    # Teardown phase: Clear the database after the test runs (redundant but safe)
    with app.app_context():
        # mongo.db.client.drop_database(TestConfig.MONGO_DB)
        mongo.db.client.drop_database(database_name)


# --- 4. Helper Fixture for Creating a User (for other tests) ---
@pytest.fixture
def test_user_data():
    """Returns standard data for a test user."""
    return {"email": "test@example.com", "password": "Password123"}


@pytest.fixture
def create_test_user(app, test_user_data):
    """A callable fixture to quickly register a user and return their data."""

    def _create_user(role="user", email=None):
        from src.auth.models import get_user_collection

        # Determine the email to use
        user_email = email if email is not None else test_user_data["email"]


        hashed_password = bcrypt.generate_password_hash(
            test_user_data["password"]
        ).decode("utf-8")

        user_data = {
            "email": user_email,
            "password": hashed_password,
            "role": role,
        }
        result = get_user_collection().insert_one(user_data)
        return {
            "id": str(result.inserted_id),
            "email": user_data["email"],
            "role": role,
        }

    return _create_user


@pytest.fixture
def get_auth_token_for(client, create_test_user, test_user_data):
    """
    Callable fixture to register a user/admin and return their token and ID.

    Usage: token, user_id = get_auth_token_for('admin')
    """

    def _get_token(role="user", email_suffix=""):
        # 1. Register the user (or admin)
        user_email = f"test_{role}{email_suffix}@example.com"
        password = test_user_data["password"]

        # Use a quick registration approach for simplicity in testing helpers
        # This bypasses the /register endpoint and inserts directly
        from src.auth.models import get_user_collection
        from app import bcrypt

        hashed_password = bcrypt.generate_password_hash(password).decode("utf-8")
        user_data = {"email": user_email, "password": hashed_password, "role": role}
        user_id = str(get_user_collection().insert_one(user_data).inserted_id)

        # 2. Log in to get the token
        response = client.post(
            "/api/auth/login",
            data=json.dumps({"email": user_email, "password": password}),
            content_type="application/json",
        )
        assert response.status_code == 200
        token = response.get_json()["access_token"]

        return f"Bearer {token}", user_id

    return _get_token
