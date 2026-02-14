# GoHabit Backend

This is the backend service for the GoHabit application, built using Spring Boot.

## Requirements

- Java 17 or higher
- Maven
- Docker (optional, for containerization)

## Setup

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd GoHabit-system/backend
   ```

2. Build and run the application using Maven:
   ```bash
   mvn spring-boot:run
   ```

   The application will be available at `http://localhost:8000`.

## Docker Setup

1. Build the Docker image:
   ```bash
   docker build -t gohabit-backend .
   ```

2. Run the Docker container:
   ```bash
   docker run -p 8000:8000 gohabit-backend
   ```

   The application will be available at `http://localhost:8000`.

## API Endpoints

- `GET /`: Returns a welcome message.