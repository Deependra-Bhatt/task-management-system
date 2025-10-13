import pytest
import json
from src.auth.models import get_user_by_email

# NOTE: client, cleanup_db, test_user_data, and create_test_user are auto-injected fixtures


def get_auth_headers(client, email, password):
    """Helper to log in a user and return the Authorization header."""
    response = client.post(
        "/api/auth/login",
        data=json.dumps({"email": email, "password": password}),
        content_type="application/json",
    )
    assert response.status_code == 200
    token = response.get_json()["access_token"]
    return {"Authorization": f"Bearer {token}"}


# --- Test Registration ---


def test_registration_success(client, test_user_data):
    """Tests successful user registration."""
    response = client.post(
        "/api/auth/register",
        data=json.dumps(test_user_data),
        content_type="application/json",
    )
    assert response.status_code == 201
    data = response.get_json()
    assert "msg" in data
    assert "access_token" in data

    # Check if user exists in DB
    user = get_user_by_email(test_user_data["email"])
    assert user is not None
    assert user["role"] == "user"


def test_registration_duplicate_user(client, create_test_user, test_user_data):
    """Tests failure when registering an existing user."""
    create_test_user()  # Create the user first

    response = client.post(
        "/api/auth/register",
        data=json.dumps(test_user_data),
        content_type="application/json",
    )
    assert response.status_code == 409
    assert "User already exists" in response.get_json()["msg"]


def test_registration_missing_data(client):
    """Tests failure when missing email or password."""
    response = client.post(
        "/api/auth/register",
        data=json.dumps({"email": "bad@data.com"}),
        content_type="application/json",
    )
    assert response.status_code == 400
    assert "Missing email or password" in response.get_json()["msg"]


# --- Test Login ---


def test_login_success(client, create_test_user, test_user_data):
    """Tests successful user login."""
    create_test_user()

    response = client.post(
        "/api/auth/login",
        data=json.dumps(test_user_data),
        content_type="application/json",
    )
    assert response.status_code == 200
    data = response.get_json()
    assert "access_token" in data
    assert data["role"] == "user"


def test_login_invalid_password(client, create_test_user, test_user_data):
    """Tests login failure with wrong password."""
    create_test_user()

    response = client.post(
        "/api/auth/login",
        data=json.dumps(
            {"email": test_user_data["email"], "password": "wrongpassword"}
        ),
        content_type="application/json",
    )
    assert response.status_code == 401
    assert "Invalid credentials" in response.get_json()["msg"]


def test_login_user_not_found(client, test_user_data):
    """Tests login failure for a non-existent user."""
    response = client.post(
        "/api/auth/login",
        data=json.dumps(test_user_data),
        content_type="application/json",
    )
    assert response.status_code == 401
    assert "Invalid credentials" in response.get_json()["msg"]
