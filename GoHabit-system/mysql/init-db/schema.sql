USE GoHabit;

CREATE TABLE IF NOT EXISTS Usuarios  (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL,
    apellidos VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    nacimiento DATE NOT NULL,
    telefono VARCHAR(20) NOT NULL,
    monedero DECIMAL(10, 2) DEFAULT 0.00,
    password VARCHAR(255) NOT NULL,
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
);


CREATE TABLE IF NOT EXISTS Habito (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT NOT NULL,
    titulo VARCHAR(255) NOT NULL,
    descripcion TEXT,
    horario DATETIME,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_id) REFERENCES Usuarios(id) ON DELETE CASCADE,
);

CREATE TABLE IF NOT EXISTS Registro_Habito (
    id INT AUTO_INCREMENT PRIMARY KEY,
    habito_id INT NOT NULL,
    fecha DATETIME,
    FOREIGN KEY (habito_id) REFERENCES Habito(id) ON DELETE CASCADE,
);

CREATE TABLE IF NOT EXISTS Avatar (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT NOT NULL,
    atacar VARCHAR(255),
    aria VARCHAR(255),
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_id) REFERENCES Usuarios(id) ON DELETE CASCADE,
    UNIQUE KEY unique_usuario_avatar (usuario_id)
);

-- Tabla Inventario
CREATE TABLE IF NOT EXISTS Inventario (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT NOT NULL,
    equipado BOOLEAN DEFAULT FALSE,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_id) REFERENCES Usuarios(id) ON DELETE CASCADE,
    UNIQUE KEY unique_usuario_inventario (usuario_id)
);

-- Tabla Loot Box
CREATE TABLE IF NOT EXISTS LootBox (
    id INT AUTO_INCREMENT PRIMARY KEY,
    inventario_id INT NOT NULL,
    nombre VARCHAR(255) NOT NULL,
    caso VARCHAR(255),
    nota TEXT,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (inventario_id) REFERENCES Inventario(id) ON DELETE CASCADE
);





-- Tabla Acciones
CREATE TABLE IF NOT EXISTS Acciones (
    id INT AUTO_INCREMENT PRIMARY KEY,
    ronda_id INT NOT NULL,
    avatar_id INT NOT NULL,
    nombre VARCHAR(255) NOT NULL,
    tipo VARCHAR(100),
    roes VARCHAR(255),
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (ronda_id) REFERENCES Ronda(id) ON DELETE CASCADE,
    FOREIGN KEY (avatar_id) REFERENCES Avatar(id) ON DELETE CASCADE,
    KEY idx_ronda_acciones (ronda_id),
    KEY idx_avatar_acciones (avatar_id)
);

