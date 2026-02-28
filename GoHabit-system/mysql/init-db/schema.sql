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
    etapa VARCHAR(255) NOT NULL,
    nivel INT,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_id) REFERENCES Usuarios(id) ON DELETE CASCADE,
);

CREATE TABLE IF NOT EXISTS Inventario (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT NOT NULL,
    equipado BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (usuario_id) REFERENCES Usuarios(id) ON DELETE CASCADE,
);

CREATE TABLE IF NOT EXISTS LootBox (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL,
    caste INT NOT NULL,
    rareza VARCHAR(100) NOT NULL,
);

CREATE TABLE IF NOT EXISTS Accesorio (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL,
    tipo VARCHAR(100) NOT NULL,
    rareza VARCHAR(100) NOT NULL,
);

CREATE TABLE IF NOT EXISTS Avatar_Accesorio (
    id INT AUTO_INCREMENT PRIMARY KEY,
    avatar_id INT NOT NULL,
    accesorio_id INT NOT NULL,
    FOREIGN KEY (avatar_id) REFERENCES Avatar(id) ON DELETE CASCADE,
    FOREIGN KEY (accesorio_id) REFERENCES Accesorio(id) ON DELETE CASCADE,
);

CREATE TABLE IF NOT EXISTS Accesorio_LootBox (
    id INT AUTO_INCREMENT PRIMARY KEY,
    accesorio_id INT NOT NULL,
    lootbox_id INT NOT NULL,
    FOREIGN KEY (accesorio_id) REFERENCES Accesorio(id) ON DELETE CASCADE,
    FOREIGN KEY (lootbox_id) REFERENCES LootBox(id) ON DELETE CASCADE,
);

CREATE TABLE IF NOT EXISTS Amigo (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT NOT NULL,
    amigo_id INT NOT NULL,
    estado ENUM('pendiente', 'aceptada', 'rechazada') DEFAULT 'pendiente',
    FOREIGN KEY (usuario_id) REFERENCES Usuarios(id) ON DELETE CASCADE,
    FOREIGN KEY (amigo_id) REFERENCES Usuarios(id) ON DELETE CASCADE,
    UNIQUE KEY unique_amistad (usuario_id, amigo_id),
    CHECK (usuario_id != amigo_id),
);