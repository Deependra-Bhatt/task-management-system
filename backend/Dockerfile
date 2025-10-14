# Use an official Python runtime as a parent image
FROM python:3.12-slim

# Set the working directory in the container
WORKDIR /app

# Copy the requirements file into the container
COPY requirements.txt /app/requirements.txt

# Install dependencies (use --no-cache-dir for slim image efficiency)
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of the application source code into the container
COPY . /app

# Expose the port the app runs on (Flask default is 5000)
EXPOSE 5000

# Set environment variables for Gunicorn and Flask
ENV FLASK_APP=app.py
ENV FLASK_RUN_HOST=0.0.0.0
ENV GUNICORN_CMD="gunicorn --bind 0.0.0.0:5000 wsgi:app"

# Command to run the application using Gunicorn (a production WSGI server)
# NOTE: You'll need to install Gunicorn in requirements.txt (pip install gunicorn)
CMD ["gunicorn", "--bind", "0.0.0.0:5000", "app:create_app()"]
# If using a wsgi.py file, the command would be: CMD ["gunicorn", "--bind", "0.0.0.0:5000", "wsgi:app"]
# Assuming your app entry point is app.py and the create_app function.