import pytest
import json
from src.auth.models import get_user_by_email
from bson.objectid import ObjectId

# Fixtures are auto-injected: client, get_auth_token_for, cleanup_db, create_test_user, test_user_data


# --- Helper to create a user for management tests ---
def setup_target_user(create_test_user):
    target_user_email = "target@user.com"
    target_user = create_test_user(role="user")
    # Update email for target user to be unique
    from src.auth.models import get_user_collection

    get_user_collection().update_one(
        {"_id": ObjectId(target_user["id"])}, {"$set": {"email": target_user_email}}
    )
    target_user["email"] = target_user_email
    return target_user


# --- Authorization Tests ---


def test_user_list_unauthorized(client):
    """Ensure unauthenticated access is denied."""
    response = client.get("/api/users/")
    assert response.status_code == 401


def test_user_list_non_admin_denied(client, get_auth_token_for):
    """Ensure non-admin users are denied access."""
    user_token, _ = get_auth_token_for("user")
    response = client.get("/api/users/", headers={"Authorization": user_token})
    assert response.status_code == 403  # Forbidden (Authorization failed)


# --- Admin CRUD Tests ---


def test_user_list_admin_success(client, get_auth_token_for, create_test_user):
    """Admin can list users."""
    admin_token, _ = get_auth_token_for("admin")
    create_test_user(email="user1@test.com")
    create_test_user(email="user2@test.com")

    response = client.get("/api/users/", headers={"Authorization": admin_token})
    assert response.status_code == 200
    data = response.get_json()
    # Should see the 2 created users + the admin user (3 total)
    assert len(data) >= 3
    assert all("_id" in user for user in data)


def test_user_read_admin_success(client, get_auth_token_for, create_test_user):
    """Admin can read details of any user."""
    admin_token, _ = get_auth_token_for("admin")
    target_user = setup_target_user(create_test_user)

    response = client.get(
        f'/api/users/{target_user["id"]}', headers={"Authorization": admin_token}
    )
    assert response.status_code == 200
    assert response.get_json()["email"] == target_user["email"]


def test_user_update_admin_success(client, get_auth_token_for, create_test_user):
    """Admin can update user role and email."""
    admin_token, _ = get_auth_token_for("admin")
    target_user = setup_target_user(create_test_user)

    new_data = {"email": "new_target@user.com", "role": "admin"}
    response = client.put(
        f'/api/users/{target_user["id"]}',
        data=json.dumps(new_data),
        content_type="application/json",
        headers={"Authorization": admin_token},
    )
    assert response.status_code == 200

    # Verify update in DB
    updated_user = get_user_by_email(new_data["email"])
    assert updated_user is not None
    assert updated_user["role"] == "admin"


def test_user_delete_admin_success(client, get_auth_token_for, create_test_user):
    """Admin can delete a user."""
    admin_token, _ = get_auth_token_for("admin")
    target_user = setup_target_user(create_test_user)

    response = client.delete(
        f'/api/users/{target_user["id"]}', headers={"Authorization": admin_token}
    )
    assert response.status_code == 204

    # Verify deletion
    deleted_user = get_user_by_email(target_user["email"])
    assert deleted_user is None
