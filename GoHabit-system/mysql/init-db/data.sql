USE GoHabit;

INSERT INTO Usuarios (id, nombre, apellidos, email, nacimiento, telefono, monedero, password) VALUES
(1, 'Carlos',  'García López',    'carlos@gohabit.com',  '1995-03-12', '600111222', 150.00, '1234'),
(2, 'Laura',   'Martínez Ruiz',   'laura@gohabit.com',   '1998-07-24', '611222333', 80.00,  '1234'),
(3, 'Sergio',  'Pérez Domínguez', 'sergio@gohabit.com',  '2000-01-05', '622333444', 200.00, '1234'),
(4, 'Ana',     'Sánchez Torres',  'ana@gohabit.com',     '1993-11-30', '633444555', 0.00,   '1234'),
(5, 'Miguel',  'Fernández Gil',   'miguel@gohabit.com',  '1990-06-18', '644555666', 320.00, '1234');

INSERT INTO Habito (id, usuario_id, titulo, descripcion, horario) VALUES
(1,  1, 'Correr 30 minutos',     'Salir a correr por el parque',          '2026-03-04 07:30:00'),
(2,  1, 'Leer 20 páginas',       'Leer antes de dormir',                  '2026-03-04 22:00:00'),
(3,  1, 'Beber 2L de agua',      'Registrar el consumo de agua diario',   NULL),
(4,  2, 'Meditar 10 minutos',    'Meditación guiada por la mañana',       '2026-03-04 08:00:00'),
(5,  2, 'Estudiar inglés',       'Duolingo o flashcards 15 minutos',      '2026-03-04 19:00:00'),
(6,  3, 'Gimnasio',              'Rutina de fuerza 3 días a la semana',   '2026-03-04 18:00:00'),
(7,  3, 'No usar móvil 1h',      'Tiempo sin pantallas antes de dormir',  '2026-03-04 21:30:00'),
(8,  4, 'Escribir diario',       'Apuntar 3 cosas positivas del día',     '2026-03-04 23:00:00'),
(9,  4, 'Estiramientos',         'Rutina de 10 minutos al despertar',     '2026-03-04 07:00:00'),
(10, 5, 'Programar 1 hora',      'Proyecto personal o kata de código',    '2026-03-04 20:00:00'),
(11, 5, 'Caminar 10.000 pasos',  'Salir a caminar durante el día',        NULL);

INSERT INTO Registro_Habito (habito_id, fecha) VALUES
-- Carlos: hábito 1 (correr)
(1, '2026-02-28 07:35:00'),
(1, '2026-03-01 07:30:00'),
(1, '2026-03-02 07:40:00'),
-- Carlos: hábito 2 (leer)

(2, '2026-03-01 22:10:00'),
(2, '2026-03-02 22:05:00'),
-- Carlos: hábito 3 (agua)
(3, '2026-03-01 20:00:00'),
(3, '2026-03-02 20:00:00'),
(3, '2026-03-03 20:00:00'),
-- Laura: hábito 4 (meditar)
(4, '2026-03-01 08:05:00'),
(4, '2026-03-02 08:00:00'),
(4, '2026-03-03 08:10:00'),
-- Laura: hábito 5 (inglés)
(5, '2026-03-02 19:15:00'),
-- Sergio: hábito 6 (gimnasio)
(6, '2026-03-01 18:00:00'),
(6, '2026-03-03 18:30:00'),
-- Sergio: hábito 7 (sin móvil)
(7, '2026-03-02 21:30:00'),
-- Ana: hábito 8 (diario)
(8, '2026-03-01 23:05:00'),
(8, '2026-03-02 23:00:00'),
-- Ana: hábito 9 (estiramientos)
(9, '2026-03-03 07:10:00'),
-- Miguel: hábito 10 (programar)
(10, '2026-03-01 20:00:00'),
(10, '2026-03-02 20:30:00'),
(10, '2026-03-03 20:00:00'),
-- Miguel: hábito 11 (caminar)
(11, '2026-03-01 15:00:00'),
(11, '2026-03-02 16:00:00');

INSERT INTO Accesorio (id, nombre, tipo, rareza) VALUES
(1,  'Sombrero de vaquero',   'gorro',  'comun'),
(2,  'Corona dorada',         'gorro',  'legendario'),
(3,  'Gafas de sol',          'gafas',     'comun'),
(4,  'Monóculo steampunk',    'gafas',     'raro'),
(5,  'Capa de héroe',         'espalda',      'raro'),
(6,  'Alas de ángel',         'espalda',      'legendario'),
(7,  'Bufanda de rayas',      'cuello',   'comun'),
(8,  'Collar de diamantes',   'cuello',    'legendario'),
(9,  'Mochila aventurero',    'espalda',   'raro');

INSERT INTO LootBox (id, nombre, coste, rareza) VALUES
(1, 'Caja Común',     50,  'comun'),
(2, 'Caja Rara',   150, 'raro'),
(3, 'Caja Legendaria', 500, 'legendario');


INSERT INTO Accesorio_LootBox (accesorio_id, lootbox_id) VALUES
(1, 1), (3, 1), (7, 1),   -- Básica: comunes
(4, 2), (5, 2), (9, 2),   -- Avanzada: raros
(2, 3), (6, 3), (8, 3);   -- Legendaria: legendarios

INSERT INTO Avatar (id, usuario_id, etapa, nivel) VALUES
(1, 1, 'adulto',  5),
(2, 2, 'joven',   2),
(3, 3, 'adulto',  7),
(4, 4, 'joven',   3),
(5, 5, 'experto', 10);

INSERT INTO Avatar_Accesorio (avatar_id, accesorio_id) VALUES
(1, 1), (1, 3),        -- Carlos tiene sombrero vaquero y gafas
(2, 7),                -- Laura tiene bufanda
(3, 2), (3, 5), (3, 9),-- Sergio tiene corona, capa y mochila
(4, 1), (4, 4),        -- Ana tiene sombrero y monóculo
(5, 2), (5, 6), (5, 8), (5, 9); -- Miguel tiene todo lo legendario

INSERT INTO Inventario (usuario_id, equipado) VALUES
(1, FALSE),
(1, TRUE),
(2, FALSE),
(3, FALSE),
(3, FALSE),
(3, TRUE),
(5, TRUE);

INSERT INTO Amigo (usuario_id, amigo_id, estado) VALUES
(1, 2, 'aceptada'),   -- Carlos ↔ Laura
(1, 3, 'aceptada'),   -- Carlos ↔ Sergio
(2, 4, 'aceptada'),   -- Laura ↔ Ana
(3, 5, 'aceptada'),   -- Sergio ↔ Miguel
(4, 5, 'pendiente'),  -- Ana → Miguel (sin responder)
(1, 5, 'rechazada'),  -- Carlos → Miguel (rechazada)
(2, 3, 'pendiente');  -- Laura → Sergio (sin responder)
