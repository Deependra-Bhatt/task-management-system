from flask import request
from bson.objectid import ObjectId


def parse_task_fsp_params(default_limit=10):
    """
    Parses Flask request arguments for Filtering, Sorting, and Pagination (FSP)
    parameters specific to tasks.

    Returns:
        tuple: (query_filter, query_sort, skip, limit)
    """
    args = request.args

    # 1. Pagination Parameters
    try:
        page = int(args.get("page", 1))
        limit = int(args.get("limit", default_limit))
    except ValueError:
        page = 1
        limit = default_limit

    skip = (page - 1) * limit if page > 0 else 0
    limit = max(1, limit)  # Ensure limit is at least 1

    # 2. Filtering Parameters
    query_filter = {}

    # Filter by Status
    status = args.get("status")
    if status:
        query_filter["status"] = status

    # Filter by Priority
    priority = args.get("priority")
    if priority:
        query_filter["priority"] = priority

    # Filter by Due Date (e.g., tasks due before a certain date)
    # This example assumes a simple 'due_date_max' format
    due_date_max = args.get("due_date_max")
    if due_date_max:
        # In a production app, validation of date format is crucial
        query_filter["due_date"] = {"$lte": due_date_max}

    # Filter by assigned_to user ID
    assigned_to = args.get("assigned_to")
    if assigned_to:
        try:
            query_filter["assigned_to"] = ObjectId(assigned_to)
        except:
            # Handle case where assigned_to ID is invalid
            pass

    # 3. Sorting Parameters
    # Format: ?sort=field1,-field2 (positive for ascending, negative for descending)
    sort_param = args.get("sort", "-due_date")  # Default sort by descending due date
    query_sort = []

    sort_fields = sort_param.split(",")
    for field in sort_fields:
        field = field.strip()
        if field.startswith("-"):
            # Descending order (-1)
            query_sort.append((field[1:], -1))
        elif field:
            # Ascending order (1)
            query_sort.append((field, 1))

    return query_filter, query_sort, skip, limit
