from functools import wraps
from flask import jsonify
from flask_jwt_extended import get_jwt_identity, get_jwt


def role_required(required_role):
    """
    Custom decorator to check if the current user has the required role.

    Usage:
    @auth_bp.route('/admin-only')
    @jwt_required()
    @role_required('admin')
    def admin_route():
        # ... logic only accessible by admins
    """

    def wrapper(fn):
        @wraps(fn)
        def decorator(*args, **kwargs):
            # 1. Get current claims (includes 'role' from JWT payload)
            claims = get_jwt()
            user_role = claims.get("role")

            # 2. Check if the user's role matches the required role
            if user_role == required_role:
                # Role matches, allow access
                return fn(*args, **kwargs)
            else:
                # Role does not match, deny access
                return (
                    jsonify(
                        msg="Authorization failed: insufficient permissions or role."
                    ),
                    403,
                )

        return decorator

    return wrapper
