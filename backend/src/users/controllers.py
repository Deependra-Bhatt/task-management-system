from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from bson.objectid import ObjectId
from src.utils.decorators import role_required
from src.auth.models import get_user_collection  # Reuse user collection function
from .. import bcrypt  # For updating passwords

users_bp = Blueprint("users", __name__)
UserCollection = get_user_collection()  # Alias for convenience


# --- 1. READ ALL USERS (Admin Only) ---
@users_bp.route("/", methods=["GET"])
@jwt_required()
@role_required("admin")
def list_users():
    """Admin endpoint to list all users with basic pagination and filtering."""
    # To implement later: Filtering, sorting, and pagination [cite: 37]
    users = UserCollection.find({}, {"password": 0})  # Exclude passwords

    user_list = []
    for user in users:
        # Convert ObjectId to string for JSON serialization
        user["_id"] = str(user["_id"])
        user_list.append(user)

    return jsonify(user_list), 200


# --- 2. READ SINGLE USER (Admin Only) ---
@users_bp.route("/<user_id>", methods=["GET"])
@jwt_required()
@role_required("admin")
def get_user(user_id):
    """Admin endpoint to get a single user by ID."""
    try:
        user = UserCollection.find_one({"_id": ObjectId(user_id)}, {"password": 0})
    except:
        return jsonify({"msg": "Invalid User ID format"}), 400

    if not user:
        return jsonify({"msg": "User not found"}), 404

    user["_id"] = str(user["_id"])
    return jsonify(user), 200


# --- 3. UPDATE USER (Admin Only) ---
@users_bp.route("/<user_id>", methods=["PUT"])
@jwt_required()
@role_required("admin")
def update_user(user_id):
    """Admin endpoint to update user attributes (email, role, password)."""
    data = request.get_json()
    update_data = {}

    if "email" in data:
        update_data["email"] = data["email"]
    if "role" in data:
        # Prevent non-admin roles from being assigned
        if data["role"] not in ["user", "admin"]:
            return jsonify({"msg": "Invalid role specified"}), 400
        update_data["role"] = data["role"]
    if "password" in data:
        # Hash new password before saving
        update_data["password"] = bcrypt.generate_password_hash(
            data["password"]
        ).decode("utf-8")

    if not update_data:
        return jsonify({"msg": "No fields provided for update"}), 400

    try:
        # Use $set to update only the provided fields
        result = UserCollection.update_one(
            {"_id": ObjectId(user_id)}, {"$set": update_data}
        )

        if result.matched_count == 0:
            return jsonify({"msg": "User not found"}), 404

        return jsonify({"msg": "User updated successfully"}), 200

    except Exception as e:
        return jsonify({"msg": f"Error updating user: {e}"}), 500


# --- 4. DELETE USER (Admin Only) ---
@users_bp.route("/<user_id>", methods=["DELETE"])
@jwt_required()
@role_required("admin")
def delete_user(user_id):
    """Admin endpoint to delete a user."""
    try:
        result = UserCollection.delete_one({"_id": ObjectId(user_id)})
    except:
        return jsonify({"msg": "Invalid User ID format"}), 400

    if result.deleted_count == 0:
        return jsonify({"msg": "User not found"}), 404

    return jsonify({"msg": "User deleted successfully"}), 204  # 204 No Content
