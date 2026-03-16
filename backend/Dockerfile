# Use official Python 3.11 slim image
FROM python:3.11-slim

# Set working directory
WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements and install
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend source
COPY agents/ ./agents/
COPY ../mcp_examples/ ./mcp_examples/

# Set Python path to include root for mcp_examples imports
ENV PYTHONPATH=/app

# Expose WebSocket port
EXPOSE 8765

# Command to run the agent bridge
CMD ["python", "agents/agent_api.py"]
