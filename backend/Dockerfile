FROM python:3.11-slim

WORKDIR /app

# Install dependencies first to leverage Docker layer caching
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of the backend files
COPY . .

EXPOSE 8000

# Launch the FastAPI server
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--reload"]