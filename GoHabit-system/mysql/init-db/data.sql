-- Estamos en BD 'goto' (creada por Docker)
USE goto;

-- Insertar usuarios en tabla 'users' (tabla principal del backend)
-- Contraseña de todos: 1234 (bcrypt hash)
INSERT INTO users (id, email, username, password, role, first_name, last_name, points, coins, level, updated_at) VALUES
('e701da1a-244a-43a9-8555-434a477f113d', 'carlos@gohabit.com', 'carlos_dev', '$2b$10$wd/gRKV.A5ad90974Hkdsul0Cdp/7N4pEHIf9K5kuVY4KkOVTiTMS', 'USER', 'Carlos', 'García', 150, 100, 5, NOW()),
('b802eb2b-355b-54ba-9666-545a588g224e', 'laura@gohabit.com', 'laura_dev', '$2b$10$wd/gRKV.A5ad90974Hkdsul0Cdp/7N4pEHIf9K5kuVY4KkOVTiTMS', 'USER', 'Laura', 'Martínez', 80, 50, 2, NOW()),
('c903fc3c-466c-65cb-0777-656b699h335f', 'sergio@gohabit.com', 'sergio_dev', '$2b$10$wd/gRKV.A5ad90974Hkdsul0Cdp/7N4pEHIf9K5kuVY4KkOVTiTMS', 'USER', 'Sergio', 'Pérez', 200, 150, 7, NOW()),
('d104gd4d-577d-76dc-1888-767c7aaa446g', 'ana@gohabit.com', 'ana_dev', '$2b$10$wd/gRKV.A5ad90974Hkdsul0Cdp/7N4pEHIf9K5kuVY4KkOVTiTMS', 'USER', 'Ana', 'Sánchez', 0, 25, 3, NOW()),
('e205he5e-688e-87ed-2999-878d8bbj557h', 'miguel@gohabit.com', 'miguel_dev', '$2b$10$wd/gRKV.A5ad90974Hkdsul0Cdp/7N4pEHIf9K5kuVY4KkOVTiTMS', 'USER', 'Miguel', 'Fernández', 320, 200, 10, NOW()),
('aaaa1111-bbbb-cccc-dddd-eeee00000001', 'pro@gohabit.com', 'pro_tester', '$2b$10$wd/gRKV.A5ad90974Hkdsul0Cdp/7N4pEHIf9K5kuVY4KkOVTiTMS', 'USER', 'Pro', 'Tester', 9500, 999, 20, NOW());

-- Insertar usuarios LEGACY en 'Usuarios' para compatibilidad
INSERT IGNORE INTO Usuarios (id, nombre, apellidos, email, nacimiento, telefono, monedero, password) VALUES
(1, 'Carlos',  'García López',    'carlos@gohabit.com',  '1995-03-12', '600111222', 150.00, '1234'),
(2, 'Laura',   'Martínez Ruiz',   'laura@gohabit.com',   '1998-07-24', '611222333', 80.00,  '1234'),
(3, 'Sergio',  'Pérez Domínguez', 'sergio@gohabit.com',  '2000-01-05', '622333444', 200.00, '1234'),
(4, 'Ana',     'Sánchez Torres',  'ana@gohabit.com',     '1993-11-30', '633444555', 0.00,   '1234'),
(5, 'Miguel',  'Fernández Gil',   'miguel@gohabit.com',  '1990-06-18', '644555666', 320.00, '1234');
