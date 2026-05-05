# Production-Ready Dockerfile
FROM python:3.11-slim
WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    tesseract-ocr \
    libgl1 \
    && rm -rf /var/lib/apt/lists/*

# Copy backend requirements and install
COPY backend/requirements.txt ./backend/requirements.txt
RUN pip install --no-cache-dir -r backend/requirements.txt

# Copy the PRE-BUILT frontend dist folder
COPY dist ./dist

# Copy backend code
COPY backend ./backend

# Expose port
EXPOSE 8000

# Run the application
CMD ["python", "-m", "backend.main"]
