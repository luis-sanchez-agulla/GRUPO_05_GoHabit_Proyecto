-- Crear tabla de usuarios
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL,
    username VARCHAR(50) NOT NULL,
    firstName VARCHAR(50),
    lastName VARCHAR(50),
    avatarUrl VARCHAR(255),
    role VARCHAR(20),
    points INT DEFAULT 0,
    coins INT DEFAULT 0,
    level INT DEFAULT 1,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insertar datos de prueba en la tabla de usuarios
INSERT INTO users (email, username, firstName, lastName, points, coins, level)
VALUES
('test1@example.com', 'testuser1', 'Test', 'User1', 100, 50, 2),
('test2@example.com', 'testuser2', 'Test', 'User2', 200, 100, 3);