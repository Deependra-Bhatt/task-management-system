from src import mongo  # Import the PyMongo instance


def get_user_collection():
    """Returns the MongoDB users collection."""
    return mongo.db.users


def get_user_by_email(email):
    """Finds a user document by email."""
    return get_user_collection().find_one({"email": email})


# Note: We are using Flask-PyMongo's direct dictionary handling,
# which is typical for simple Flask/MongoDB projects.
# For complex schema validation, we might use MongoEngine or Pydantic.
