# GoHabit Backend

This is the backend service for the GoHabit application, built using FastAPI.

## Requirements

- Python 3.9 or higher
- pip
- Docker (optional, for containerization)

## Setup

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd GoHabit-system/backend
   ```

2. Create a virtual environment and activate it:
   ```bash
   python -m venv venv
   source venv/bin/activate # On Windows: venv\Scripts\activate
   ```

3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Run the application:
   ```bash
   uvicorn app.main:app --reload
   ```

   The application will be available at `http://127.0.0.1:8000`.

## Docker Setup

1. Build the Docker image:
   ```bash
   docker build -t gohabit-backend .
   ```

2. Run the Docker container:
   ```bash
   docker run -p 8000:8000 gohabit-backend
   ```

   The application will be available at `http://127.0.0.1:8000`.

## API Endpoints

- `GET /`: Returns a welcome message.