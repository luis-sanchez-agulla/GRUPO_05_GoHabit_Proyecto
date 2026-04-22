CREATE DATABASE IF NOT EXISTS goto;
USE goto;

CREATE TABLE IF NOT EXISTS Usuarios  (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL,
    apellidos VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    nacimiento DATE NOT NULL,
    telefono VARCHAR(20) NOT NULL,
    monedero DECIMAL(10, 2) DEFAULT 0.00,
    password VARCHAR(255) NOT NULL,
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS Habito (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT NOT NULL,
    titulo VARCHAR(255) NOT NULL,
    descripcion TEXT,
    horario DATETIME,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_id) REFERENCES Usuarios(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS Registro_Habito (
    id INT AUTO_INCREMENT PRIMARY KEY,
    habito_id INT NOT NULL,
    fecha DATETIME,
    FOREIGN KEY (habito_id) REFERENCES Habito(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS Avatar (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT NOT NULL,
    etapa VARCHAR(255) NOT NULL,
    nivel INT,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_id) REFERENCES Usuarios(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS Inventario (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT NOT NULL,
    equipado BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (usuario_id) REFERENCES Usuarios(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS LootBox (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL,
    coste INT NOT NULL,
    rareza VARCHAR(100) NOT NULL
);

CREATE TABLE IF NOT EXISTS Accesorio (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL,
    tipo VARCHAR(100) NOT NULL,
    rareza VARCHAR(100) NOT NULL,
    activo INT DEFAULT 0
);

CREATE TABLE IF NOT EXISTS Avatar_Accesorio (
    id INT AUTO_INCREMENT PRIMARY KEY,
    avatar_id INT NOT NULL,
    accesorio_id INT NOT NULL,
    FOREIGN KEY (avatar_id) REFERENCES Avatar(id) ON DELETE CASCADE,
    FOREIGN KEY (accesorio_id) REFERENCES Accesorio(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS Accesorio_LootBox (
    id INT AUTO_INCREMENT PRIMARY KEY,
    accesorio_id INT NOT NULL,
    lootbox_id INT NOT NULL,
    FOREIGN KEY (accesorio_id) REFERENCES Accesorio(id) ON DELETE CASCADE,
    FOREIGN KEY (lootbox_id) REFERENCES LootBox(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS Amigo (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT NOT NULL,
    amigo_id INT NOT NULL,
    estado ENUM('pendiente', 'aceptada', 'rechazada') DEFAULT 'pendiente',
    FOREIGN KEY (usuario_id) REFERENCES Usuarios(id) ON DELETE CASCADE,
    FOREIGN KEY (amigo_id) REFERENCES Usuarios(id) ON DELETE CASCADE,
    UNIQUE KEY unique_amistad (usuario_id, amigo_id),
    CHECK (usuario_id != amigo_id)
);

-- ======================================================
-- Esquema usado por el backend actual (tabla/columnas EN)
-- ======================================================

CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(36) PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'USER',
    first_name VARCHAR(100) NULL,
    last_name VARCHAR(100) NULL,
    avatar_url LONGTEXT NULL,
    points INT NOT NULL DEFAULT 0,
    coins INT NOT NULL DEFAULT 0,
    level INT NOT NULL DEFAULT 1,
    streak INT NOT NULL DEFAULT 0,
    created_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    updated_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
    -- Compatibilidad con consultas legacy en camelCase
    firstName VARCHAR(100) NULL,
    lastName VARCHAR(100) NULL,
    avatarUrl LONGTEXT NULL,
    createdAt TIMESTAMP(3) NULL
);

CREATE TABLE IF NOT EXISTS tasks (
    id INT AUTO_INCREMENT PRIMARY KEY,
    userId VARCHAR(36) NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT NULL,
    priority ENUM('LOW', 'MEDIUM', 'HIGH') NOT NULL DEFAULT 'MEDIUM',
    status ENUM('PENDING', 'IN_PROGRESS', 'COMPLETED') NOT NULL DEFAULT 'PENDING',
    dueDate DATETIME NULL,
    scheduledAt DATETIME NULL,
    completedAt DATETIME NULL,
    createdAt TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    updatedAt TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
    INDEX idx_tasks_userId (userId),
    INDEX idx_tasks_status (status)
);

CREATE TABLE IF NOT EXISTS habits (
    id INT AUTO_INCREMENT PRIMARY KEY,
    userId VARCHAR(36) NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT NULL,
    frequency VARCHAR(50) NOT NULL DEFAULT 'DAILY',
    targetCount INT NOT NULL DEFAULT 1,
    color VARCHAR(20) NOT NULL DEFAULT '#6366f1',
    icon VARCHAR(50) NOT NULL DEFAULT 'star',
    isActive TINYINT(1) NOT NULL DEFAULT 1,
    createdAt TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    updatedAt TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
    INDEX idx_habits_userId (userId)
);

CREATE TABLE IF NOT EXISTS habit_completions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    habitId INT NOT NULL,
    userId VARCHAR(36) NOT NULL,
    note TEXT NULL,
    imageUrl LONGTEXT NULL,
    completedAt TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    INDEX idx_habit_completions_habitId (habitId),
    INDEX idx_habit_completions_userId (userId)
);

CREATE TABLE IF NOT EXISTS friendships (
    id INT AUTO_INCREMENT PRIMARY KEY,
    senderId VARCHAR(36) NOT NULL,
    receiverId VARCHAR(36) NOT NULL,
    status ENUM('PENDING', 'ACCEPTED', 'REJECTED') NOT NULL DEFAULT 'PENDING',
    createdAt TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    UNIQUE KEY unique_friendship (senderId, receiverId),
    INDEX idx_friendships_receiver (receiverId),
    INDEX idx_friendships_status (status)
);

CREATE TABLE IF NOT EXISTS rewards (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT NULL,
    cost INT NOT NULL,
    icon VARCHAR(100) NULL,
    rarity VARCHAR(30) NULL,
    isActive TINYINT(1) NOT NULL DEFAULT 1,
    createdAt TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3)
);

CREATE TABLE IF NOT EXISTS user_rewards (
    id INT AUTO_INCREMENT PRIMARY KEY,
    userId VARCHAR(36) NOT NULL,
    rewardId INT NOT NULL,
    redeemedAt TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    INDEX idx_user_rewards_user (userId),
    INDEX idx_user_rewards_reward (rewardId)
);