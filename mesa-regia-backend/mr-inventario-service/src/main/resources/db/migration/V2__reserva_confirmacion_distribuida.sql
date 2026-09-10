ALTER TABLE reserva MODIFY id_orden_externo BIGINT UNSIGNED NULL;
ALTER TABLE reserva ADD COLUMN clave_confirmacion VARCHAR(120) NULL AFTER id_orden_externo;
ALTER TABLE reserva ADD COLUMN id_cotizacion_externo BIGINT UNSIGNED NULL AFTER clave_confirmacion;
ALTER TABLE reserva ADD COLUMN id_version_externa BIGINT UNSIGNED NULL AFTER id_cotizacion_externo;
CREATE UNIQUE INDEX uk_reserva_clave_confirmacion ON reserva(clave_confirmacion);
CREATE INDEX ix_reserva_cotizacion_version ON reserva(id_cotizacion_externo,id_version_externa);
