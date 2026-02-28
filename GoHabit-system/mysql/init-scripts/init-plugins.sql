INSTALL PLUGIN rpl_semi_sync_source SONAME 'semisync_source.so';
SET GLOBAL rpl_semi_sync_source_enabled = ON;

-- Configurar timeout (ms) - si la réplica no responde, vuelve a asíncrono
SET GLOBAL rpl_semi_sync_source_timeout = 10000;  -- 10 segundos



INSTALL PLUGIN rpl_semi_sync_replica SONAME 'semisync_replica.so';
SET GLOBAL rpl_semi_sync_replica_enabled = ON;

-- Reiniciar replicación para que tome efecto
-- STOP REPLICA;
-- START REPLICA;

-- Plugin de autenticar contraseña
INSTALL PLUGIN validate_password SONAME 'validate_password.so';

