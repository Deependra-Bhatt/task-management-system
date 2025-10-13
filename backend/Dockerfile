# Stage 1: Build Stage (Optional, but good practice for dependency installation)
FROM python:3.10-slim as builder

# Set the working directory
WORKDIR /usr/src/app/backend

# Install dependencies (to leverage Docker layer caching)
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Stage 2: Final Image
FROM python:3.10-slim

# Set the working directory
WORKDIR /usr/src/app/backend

# Copy installed dependencies from the builder stage
COPY --from=builder /usr/src/app/backend/venv /usr/local/venv
# Set environment variable for VENV path
ENV PATH="/usr/local/venv/bin:$PATH"

# Copy the rest of the source code
COPY . .

# Create the uploads directory for local file storage
RUN mkdir -p uploads

# Command to run the application
# We use Gunicorn or Waitress for production, but for simplicity, we use Flask's built-in server here
# CMD ["python", "app.py"] 

# NOTE: For deployment, replace the above with Gunicorn:
CMD ["gunicorn", "-w", "4", "-b", "0.0.0.0:5000", "app:create_app()"]