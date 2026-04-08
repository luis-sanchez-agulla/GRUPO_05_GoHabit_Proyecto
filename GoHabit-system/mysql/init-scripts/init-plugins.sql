DELIMITER //

DROP PROCEDURE IF EXISTS safe_install_plugins //
CREATE PROCEDURE safe_install_plugins()
BEGIN
	DECLARE CONTINUE HANDLER FOR SQLEXCEPTION BEGIN END;

	INSTALL PLUGIN rpl_semi_sync_source SONAME 'semisync_source.so';
	SET GLOBAL rpl_semi_sync_source_enabled = ON;
	SET GLOBAL rpl_semi_sync_source_timeout = 10000;

	INSTALL PLUGIN rpl_semi_sync_replica SONAME 'semisync_replica.so';
	SET GLOBAL rpl_semi_sync_replica_enabled = ON;

	INSTALL PLUGIN validate_password SONAME 'validate_password.so';
END //

CALL safe_install_plugins() //
DROP PROCEDURE IF EXISTS safe_install_plugins //

DELIMITER ;

