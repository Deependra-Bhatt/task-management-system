from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token
from src import bcrypt  # Import bcrypt for hashing
from .models import get_user_by_email, get_user_collection
from bson.objectid import ObjectId  # Used to convert string IDs to MongoDB
from flask_jwt_extended import jwt_required, get_jwt  # Add get_jwt
from src import BLACKLIST  # Import the global blacklist set from your __init__.py


auth_bp = Blueprint("auth", __name__)


@auth_bp.route("/register", methods=["POST"])
def register():
    """Implements user registration with password hashing and role setting."""
    data = request.get_json()
    email = data.get("email")
    password = data.get("password")
    # Default role is 'user'. Admin role must be set explicitly by an admin later.
    role = "user"

    if not email or not password:
        return jsonify({"msg": "Missing email or password"}), 400

    if get_user_by_email(email):
        return jsonify({"msg": "User already exists"}), 409

    # Password Hashing
    hashed_password = bcrypt.generate_password_hash(password).decode("utf-8")

    user_data = {
        "email": email,
        "password": hashed_password,
        "role": role,  # Users should have attributes: email, password, role.
    }

    try:
        # Insert the new user into the database
        result = get_user_collection().insert_one(user_data)
        # Create a simple access token for immediate login after registration
        access_token = create_access_token(
            identity=str(result.inserted_id), additional_claims={"role": role}
        )

        return (
            jsonify({"msg": "User created successfully", "access_token": access_token}),
            201,
        )

    except Exception as e:
        # Log the exception for debugging
        print(f"Error during registration: {e}")
        return jsonify({"msg": "An internal error occurred"}), 500


@auth_bp.route("/login", methods=["POST"])
def login():
    """Implements user login with JWT-based authentication."""
    data = request.get_json()
    email = data.get("email")
    password = data.get("password")

    user = get_user_by_email(email)
    print(
        f"Attempted login for: {email}. Password check result: {bcrypt.check_password_hash(user['password'], password) if user else False}"
    )

    # Check user existence and password validity
    if user and bcrypt.check_password_hash(user["password"], password):
        # Create JWT Token [cite: 5, 18]
        # Use user's MongoDB ID as the identity
        user_id = str(user["_id"])
        role = user.get("role", "user")

        access_token = create_access_token(
            identity=user_id, additional_claims={"role": role}
        )

        return (
            jsonify(
                {
                    "msg": "Login successful",
                    "access_token": access_token,
                    "user_id": user_id,
                    "role": role,
                }
            ),
            200,
        )
    else:
        return jsonify({"msg": "Invalid credentials"}), 401


@auth_bp.route("/logout", methods=["POST"])
@jwt_required()
def logout():
    """Revokes the current JWT token by adding its JTI to the global blocklist."""
    jti = get_jwt()["jti"]

    # Add the token's unique ID to the set, instantly invalidating it.
    BLACKLIST.add(jti)

    return jsonify({"msg": "Successfully logged out and token revoked"}), 200
