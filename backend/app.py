from flask import Flask
from config import DevelopmentConfig
from src import bcrypt, mongo, jwt
import os
from dotenv import load_dotenv


def create_app(config_class=DevelopmentConfig):
    app = Flask(__name__)
    app.config.from_object(config_class)

    # Initialize extensions with the app
    mongo.init_app(app)
    bcrypt.init_app(app)
    jwt.init_app(app)

    # Create the uploads folder if it doesn't exist
    os.makedirs(app.config["UPLOAD_FOLDER"], exist_ok=True)

    # --- Register Blueprints ---
    from src.auth.controllers import auth_bp
    app.register_blueprint(auth_bp, url_prefix="/api/auth")

    # Register the new User Blueprint
    from src.users.controllers import users_bp
    app.register_blueprint(users_bp, url_prefix="/api/users")

    from src.tasks.controllers import tasks_bp
    app.register_blueprint(tasks_bp, url_prefix='/api/tasks')
    # ...

    # Basic route for testing
    @app.route("/")
    def index():
        return {"message": "Task Manager API is running!"}

    return app


if __name__ == "__main__":
    load_dotenv(os.path.join(os.path.dirname(__file__), "..", ".env"))

    app = create_app()
    app.run(host="0.0.0.0", port=5000)
