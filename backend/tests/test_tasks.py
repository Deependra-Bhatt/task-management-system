import pytest
import json
import os
from flask import current_app
from io import BytesIO
from werkzeug.datastructures import FileStorage
from src.tasks.models import get_task_collection

# Fixtures are auto-injected: client, get_auth_token_for, cleanup_db


@pytest.fixture
def user_auth(get_auth_token_for):
    """Returns token and ID for a standard user."""
    return get_auth_token_for("user", "taskuser")


@pytest.fixture
def admin_auth(get_auth_token_for):
    """Returns token and ID for an admin user."""
    return get_auth_token_for("admin", "taskadmin")


@pytest.fixture
def task_data(user_auth):
    """Returns standard task data for posting."""
    return {
        "title": "Test Task 1",
        "description": "A task for testing purposes.",
        "status": "To Do",
        "priority": "High",
        "due_date": "2025-10-30",
        "assigned_to": user_auth[1],  # Assigned to the test user
    }


def create_task_in_db(user_id, **kwargs):
    """Helper to bypass POST and insert a task directly."""
    from bson.objectid import ObjectId

    data = {
        "title": "Default Title",
        "description": "Default description",
        "status": "To Do",
        "priority": "Low",
        "due_date": "2025-11-01",
        "assigned_to": ObjectId(user_id),
        "created_by": ObjectId(user_id),
        "attached_documents": [],
    }
    data.update(kwargs)
    result = get_task_collection().insert_one(data)
    return str(result.inserted_id)


# --- 1. Basic Task CRUD Tests ---


def test_task_create_success(client, user_auth, task_data):
    """Tests successful task creation without files."""
    headers = {"Authorization": user_auth[0]}

    # Use client.post with json for simple data
    response = client.post(
        "/api/tasks/",
        data=task_data,  # Flask POSTs non-JSON data as form data by default
        headers=headers,
    )
    assert response.status_code == 201
    data = response.get_json()
    assert "task_id" in data


def test_task_read_success(client, user_auth):
    """User can read task assigned to them."""
    task_id = create_task_in_db(user_auth[1])
    headers = {"Authorization": user_auth[0]}

    response = client.get(f"/api/tasks/{task_id}", headers=headers)
    assert response.status_code == 200
    assert response.get_json()["_id"] == task_id


def test_task_read_forbidden(client, user_auth, get_auth_token_for):
    """User cannot read task assigned to someone else."""
    other_user_token, other_user_id = get_auth_token_for("user", "other")
    task_id = create_task_in_db(other_user_id)  # Task assigned to 'other'

    headers = {"Authorization": user_auth[0]}  # Trying to view with 'user_auth'
    response = client.get(f"/api/tasks/{task_id}", headers=headers)
    assert response.status_code == 403


def test_task_delete_success(client, admin_auth):
    """Admin can delete any task."""
    task_id = create_task_in_db(admin_auth[1])
    headers = {"Authorization": admin_auth[0]}

    response = client.delete(f"/api/tasks/{task_id}", headers=headers)
    assert response.status_code == 204

    # Verify deletion
    assert get_task_collection().find_one({"_id": ObjectId(task_id)}) is None


# --- 2. File Upload Tests ---


def test_task_create_with_file_success(client, user_auth, task_data, app):
    """Tests task creation with a single PDF file upload."""
    headers = {"Authorization": user_auth[0]}

    # Simulate a file upload
    file_content = b"%PDF-1.4\ncontent"  # Simple mock PDF content
    file = FileStorage(
        stream=BytesIO(file_content),
        filename="test_doc.pdf",
        content_type="application/pdf",
    )

    # Need to send all data as multipart/form-data for files
    mimetype = "multipart/form-data"
    data = {**task_data, "documents": [file]}

    response = client.post(
        "/api/tasks/", data=data, content_type=mimetype, headers=headers
    )
    assert response.status_code == 201

    # Verify file saved on disk (check uploads folder)
    task_id = response.get_json()["task_id"]
    task = get_task_collection().find_one({"_id": ObjectId(task_id)})
    assert len(task["attached_documents"]) == 1

    stored_path = task["attached_documents"][0]["filepath"]
    assert os.path.exists(stored_path)

    # Cleanup the test file
    os.remove(stored_path)


def test_task_download_document_success(client, user_auth, app):
    """Tests successful document retrieval."""

    # 1. Manually create a mock file in the uploads folder
    with app.app_context():
        upload_folder = current_app.config["UPLOAD_FOLDER"]

    mock_filename = "mock_file.pdf"
    mock_stored_name = f"abcde_{mock_filename}"
    mock_filepath = os.path.join(upload_folder, mock_stored_name)
    file_content = b"This is a test PDF content."

    os.makedirs(upload_folder, exist_ok=True)
    with open(mock_filepath, "wb") as f:
        f.write(file_content)

    # 2. Insert task metadata pointing to the mock file
    doc_meta = {
        "original_name": mock_filename,
        "stored_name": mock_stored_name,
        "filepath": mock_filepath,
        "mime_type": "application/pdf",
        "size_bytes": len(file_content),
    }
    task_id = create_task_in_db(user_auth[1], attached_documents=[doc_meta])

    # 3. Request the file
    response = client.get(
        f"/api/tasks/{task_id}/documents/{mock_stored_name}",
        headers={"Authorization": user_auth[0]},
    )

    assert response.status_code == 200
    assert response.data == file_content
    assert response.headers["Content-Disposition"].startswith(
        f"attachment; filename={mock_filename}"
    )

    # Cleanup the test file
    os.remove(mock_filepath)


# --- 3. FSP Tests (List Tasks) ---


def test_task_list_fsp(client, user_auth):
    """Tests filtering and pagination for task list."""
    # Create multiple tasks assigned to the test user
    user_id = user_auth[1]
    create_task_in_db(
        user_id, title="High Priority Task", priority="High", status="To Do"
    )
    create_task_in_db(
        user_id, title="Low Priority Task", priority="Low", status="Completed"
    )
    create_task_in_db(
        user_id, title="In Progress Task", priority="Medium", status="In Progress"
    )

    # Test 1: Filter by Status='To Do'
    response_filter = client.get(
        "/api/tasks/?status=To Do", headers={"Authorization": user_auth[0]}
    )
    assert response_filter.status_code == 200
    assert response_filter.get_json()["pagination"]["total_tasks"] == 1
    assert response_filter.get_json()["tasks"][0]["status"] == "To Do"

    # Test 2: Filter by Priority and Sort by Title descending (-title)
    response_sort_filter = client.get(
        "/api/tasks/?priority=Low&sort=-title", headers={"Authorization": user_auth[0]}
    )
    assert response_sort_filter.status_code == 200
    assert response_sort_filter.get_json()["pagination"]["total_tasks"] == 1
    assert response_sort_filter.get_json()["tasks"][0]["title"] == "Low Priority Task"
