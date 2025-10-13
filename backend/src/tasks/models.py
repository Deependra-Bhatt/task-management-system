from .. import mongo  # Import the PyMongo instance


def get_task_collection():
    """Returns the MongoDB tasks collection."""
    return mongo.db.tasks


# We'll use simple dictionary representations for status and priority for now,
# but in a real application, these might be stored in separate config collections.
TASK_STATUSES = ["To Do", "In Progress", "Completed"]
TASK_PRIORITIES = ["Low", "Medium", "High"]
