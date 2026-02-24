# VIEW para el login
CREATE VIEW goto.v_login_rider AS
SELECT * FROM goto.RIDER;

CREATE VIEW goto.v_login_driver AS
SELECT * FROM goto.DRIVER;

# VIEW ver conductores de compañia
CREATE VIEW goto.v_driver_compania AS
SELECT d.apellido1, d.nombre, d.dni, c.nombre AS nombre_compania
FROM goto.CONTRATA cp
LEFT JOIN goto.DRIVER AS d ON cp.driver_id = d.id
LEFT JOIN goto.COMPANIA AS c ON  cp.compania_id  = c.id
WHERE cp.fecha_fin IS NOT NULL;

# VIEW conductor y coche
CREATE VIEW goto.v_conductor_vehiculo AS
SELECT d.apellido1, d.nombre, d.dni, v.id AS id_coche ,v.marca AS marca, v.modelo AS modelo
FROM goto.CONDUCE cd
LEFT JOIN goto.DRIVER AS d ON cd.driver_id = d.id
LEFT JOIN goto.VEHICULO AS v ON cd.vehiculo_id = v.id;

# VIEW condcutor sin viaje
CREATE VIEW goto.v_conductor_sin_viaje AS
SELECT 
    d.id AS driver_id,
    d.nombre AS driver_nombre,
    d.apellido1 AS driver_apellido1,
    d.apellido2 AS driver_apellido2,
    d.email AS driver_email,
    d.telf AS driver_telf
FROM 
    goto.DRIVER d
LEFT JOIN 
    goto.VIAJE v ON d.id = v.driver_id AND v.estado NOT IN (SELECT id FROM goto.ESTADO WHERE descripcion 
    IN (('solicitado'), ('aceptado'), ('en curso'), ('finalizado'), ('cancelado')))
WHERE 
    v.id IS NULL;