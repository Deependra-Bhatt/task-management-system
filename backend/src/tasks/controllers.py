from flask import Blueprint, request, jsonify, send_file
from flask_jwt_extended import jwt_required, get_jwt_identity, get_jwt
from bson.objectid import ObjectId
from src.utils.file_handler import save_uploaded_files, allowed_file
from src.utils.decorators import role_required  # We'll need this for admin operations
from .models import get_task_collection, TASK_STATUSES, TASK_PRIORITIES
import os
from flask_jwt_extended import jwt_required, get_jwt_identity  # Add get_jwt_identity
from src.utils.fsp_parser import parse_task_fsp_params  # Import the parser


tasks_bp = Blueprint("tasks", __name__)
TaskCollection = get_task_collection()


# --- 1. LIST TASKS (Filtering, Sorting, Pagination) ---
@tasks_bp.route("", methods=["GET"])
@jwt_required()
def list_tasks():
    """
    Lists tasks with filtering (status, priority, due date, assigned_to),
    sorting, and pagination.

    Non-admin users only see tasks assigned to them.
    Admin users see all tasks.
    """
    current_user_id = get_jwt_identity()
    user_role = get_jwt().get("role")

    # 1. Parse FSP parameters from the request
    # NOTE: We pass 5 as the default limit for initial load optimization
    base_filter, query_sort, skip, limit = parse_task_fsp_params(default_limit=5)

    # 2. Enforce Task Visibility/Authorization Filter
    if user_role != "admin":
        # Non-admin users can only view tasks assigned to them
        base_filter["assigned_to"] = ObjectId(current_user_id)

    # Combine the authorization filter with the user-defined filters
    final_query_filter = base_filter

    # 3. Execute the Query
    # Count total items matching the filter (for pagination metadata)
    total_count = TaskCollection.count_documents(final_query_filter)

    # Fetch tasks with FSP
    tasks_cursor = (
        TaskCollection.find(final_query_filter).sort(query_sort).skip(skip).limit(limit)
    )

    task_list = []
    for task in tasks_cursor:
        # Convert ObjectIds to strings for JSON serialization
        task["_id"] = str(task["_id"])
        task["assigned_to"] = str(task["assigned_to"])
        task_list.append(task)

    # 4. Prepare Pagination Metadata
    total_pages = (total_count + limit - 1) // limit
    current_page = skip // limit + 1

    response_data = {
        "tasks": task_list,
        "pagination": {
            "total_tasks": total_count,
            "current_page": current_page,
            "total_pages": total_pages,
            "page_size": limit,
        },
    }

    return jsonify(response_data), 200


# --- Authorization Helper ---
def check_task_ownership_or_admin(task):
    """Checks if the current user is the task's assigned user or an admin."""
    current_user_id = get_jwt_identity()
    user_role = get_jwt().get("role")

    # Check if user is admin
    if user_role == "admin":
        return True

    # Check if the user is the assigned user
    assigned_to_id = task.get("assigned_to")
    if assigned_to_id and str(assigned_to_id) == current_user_id:
        # Note: If tasks can only be managed by the creator, change 'assigned_to' to 'created_by'
        return True

    return False


# --- 1. CREATE Task ---
@tasks_bp.route("", methods=["POST"])
@jwt_required()
def create_task():
    """Create a new task, handling multi-part form data for files."""
    user_id = get_jwt_identity()

    # Flask handles file and form data separately for multi-part forms
    data = request.form

    # 1. Basic Validation
    title = data.get("title")
    description = data.get("description")
    due_date = data.get("due_date")
    assigned_to_id = data.get(
        "assigned_to", user_id
    )  # Defaults to self if not specified

    if not title:
        return jsonify({"msg": "Title is required"}), 400

    # 2. Handle File Uploads
    attached_documents = []
    # request.files is a MultiDict of uploaded files
    files = request.files.getlist(
        "documents"
    )  # Assuming frontend sends files under 'documents'

    try:
        if files and files[0].filename != "":
            attached_documents = save_uploaded_files(files)
    except ValueError as e:
        return jsonify({"msg": str(e)}), 400

    # 3. Construct Task Data

    # --- FIX START (Corrected Logic) ---

    # 1. Retrieve the input value (will be a string or None)
    assigned_to_input = data.get("assigned_to")

    # 2. Determine the final non-empty ID string
    # If the input is empty or None, use the current user_id from JWT.
    if not assigned_to_input:
        final_assigned_id_str = user_id
    else:
        # If the input exists, use it.
        final_assigned_id_str = assigned_to_input

    # 3. Safely convert the final, non-empty ID string to ObjectId
    try:
        assigned_to_objectid = ObjectId(final_assigned_id_str)
    except Exception:
        # Catch case where a malformed string (e.g., "hello") was sent
        return jsonify({"msg": "Invalid Assigned To User ID format"}), 400

    # 4. Safely convert created_by ID (which is guaranteed to be valid from JWT)
    try:
        created_by_objectid = ObjectId(user_id)
    except Exception:
        return jsonify({"msg": "Invalid Creator User ID format"}), 500

    # --- FIX END (Corrected Logic) ---

    new_task = {
        "title": title,
        "description": description,
        "status": data.get("status", TASK_STATUSES[0]),
        "priority": data.get("priority", TASK_PRIORITIES[0]),
        "due_date": due_date,
        # --- APPLY FIX HERE ---
        "assigned_to": assigned_to_objectid,
        "created_by": created_by_objectid,  # Record the creator
        # ---------------------
        "attached_documents": attached_documents,
    }

    # 4. Insert and Respond
    result = TaskCollection.insert_one(new_task)
    return (
        jsonify(
            {"msg": "Task created successfully", "task_id": str(result.inserted_id)}
        ),
        201,
    )


# --- 2. READ Task Details ---
@tasks_bp.route("/<task_id>", methods=["GET"])
@jwt_required()
def get_task(task_id):
    """Retrieve details of a single task."""
    try:
        task = TaskCollection.find_one({"_id": ObjectId(task_id)})
    except:
        return jsonify({"msg": "Invalid Task ID format"}), 400

    if not task:
        return jsonify({"msg": "Task not found"}), 404

    # Security check: User must be assigned to it OR be an Admin
    if not check_task_ownership_or_admin(task):
        return jsonify({"msg": "You do not have permission to view this task"}), 403

    # Convert ObjectIds to strings for JSON
    task["_id"] = str(task["_id"])
    task["assigned_to"] = str(task["assigned_to"])

    return jsonify(task), 200


# --- 3. UPDATE Task ---
# NOTE: File updates will be complex (e.g., replace file, add file).
# For simplicity now, we assume this route updates metadata.
# A separate file-specific route may be cleaner for document replacement/deletion.
@tasks_bp.route("/<task_id>", methods=["PUT"])
@jwt_required()
def update_task(task_id):
    """Update task metadata. NOTE: This simplified version does not handle file uploads/replacements."""
    data = request.get_json()
    update_data = {}

    # 1. Retrieve current task and authorize
    try:
        task = TaskCollection.find_one({"_id": ObjectId(task_id)})
    except:
        return jsonify({"msg": "Invalid Task ID format"}), 400

    if not task:
        return jsonify({"msg": "Task not found"}), 404

    if not check_task_ownership_or_admin(task):
        return jsonify({"msg": "You do not have permission to modify this task"}), 403

    # 2. Build update payload (e.g., update status, priority, due date) [cite: 7]
    if "title" in data:
        update_data["title"] = data["title"]
    if "description" in data:
        update_data["description"] = data["description"]
    if "status" in data and data["status"] in TASK_STATUSES:
        update_data["status"] = data["status"]
    if "priority" in data and data["priority"] in TASK_PRIORITIES:
        update_data["priority"] = data["priority"]
    if "due_date" in data:
        update_data["due_date"] = data["due_date"]
    if "assigned_to" in data:
        update_data["assigned_to"] = ObjectId(
            data["assigned_to"]
        )  # Assign to different users [cite: 8]

    if not update_data:
        return jsonify({"msg": "No valid fields provided for update"}), 400

    # 3. Perform update
    result = TaskCollection.update_one(
        {"_id": ObjectId(task_id)}, {"$set": update_data}
    )

    return jsonify({"msg": "Task updated successfully"}), 200


# --- 4. DELETE Task ---
@tasks_bp.route("/<task_id>", methods=["DELETE"])
@jwt_required()
def delete_task(task_id):
    """Delete a task and its associated files."""
    try:
        task = TaskCollection.find_one({"_id": ObjectId(task_id)})
    except:
        return jsonify({"msg": "Invalid Task ID format"}), 400

    if not task:
        return jsonify({"msg": "Task not found"}), 404

    if not check_task_ownership_or_admin(task):
        return jsonify({"msg": "You do not have permission to delete this task"}), 403

    # 1. Delete actual files from storage [cite: 73]
    for doc in task.get("attached_documents", []):
        try:
            os.remove(doc["filepath"])
        except OSError as e:
            # Log error but continue to delete the database entry
            print(f"Error deleting file {doc['filepath']}: {e}")

    # 2. Delete task from database
    TaskCollection.delete_one({"_id": ObjectId(task_id)})

    return jsonify({"msg": "Task deleted successfully"}), 204


# --- 5. RETRIEVE Document ---
@tasks_bp.route("/<task_id>/documents/<stored_name>", methods=["GET"])
@jwt_required()
def download_document(task_id, stored_name):
    """Provides an API endpoint to retrieve and download an attached document."""
    try:
        task = TaskCollection.find_one({"_id": ObjectId(task_id)})
    except:
        return jsonify({"msg": "Invalid Task ID format"}), 400

    if not task:
        return jsonify({"msg": "Task not found"}), 404

    # Security check: User must be able to view the task to download its files [cite: 30]
    if not check_task_ownership_or_admin(task):
        return (
            jsonify({"msg": "You do not have permission to access this task's files"}),
            403,
        )

    # Find the document metadata
    doc_meta = next(
        (
            doc
            for doc in task.get("attached_documents", [])
            if doc["stored_name"] == stored_name
        ),
        None,
    )

    if not doc_meta:
        return jsonify({"msg": "Document not found on this task"}), 404

    # Use Flask's send_file function for streaming the file download
    try:
        return send_file(
            doc_meta["filepath"],
            mimetype=doc_meta["mime_type"],
            as_attachment=True,  # Forces download
            download_name=doc_meta["original_name"],  # Use the friendly original name
        )
    except FileNotFoundError:
        return jsonify({"msg": "File found in DB but not on server storage"}), 500
