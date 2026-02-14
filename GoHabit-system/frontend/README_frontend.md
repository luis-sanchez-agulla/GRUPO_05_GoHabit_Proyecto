# GoHabit Frontend

This is the frontend service for the GoHabit application.

## Setup

1. Open the `index.html` file in your browser to view the application.

## Docker Setup

1. Build the Docker image:
   ```bash
   docker build -t gohabit-frontend .
   ```

2. Run the Docker container:
   ```bash
   docker run -p 8080:80 gohabit-frontend
   ```

   The application will be available at `http://127.0.0.1:8080`. 
