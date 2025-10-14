from app import create_app, bcrypt, mongo
from src.auth.models import get_user_collection

# Use development configuration for local execution
app = create_app()


def create_admin_user():
    with app.app_context():
        admin_email = "admin@gmail.com"
        admin_password = "AdminPassword123"

        # Check if admin already exists
        if get_user_collection().find_one({"email": admin_email}):
            print(f"Admin user {admin_email} already exists.")
            return

        hashed_password = bcrypt.generate_password_hash(admin_password).decode("utf-8")

        user_data = {
            "email": admin_email,
            "password": hashed_password,
            "role": "admin",  # Set role to admin
        }

        get_user_collection().insert_one(user_data)
        print(f"Admin user {admin_email} created successfully!")


if __name__ == "__main__":
    create_admin_user()
