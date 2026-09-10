CREATE TABLE IF NOT EXISTS saga_confirmacion (
 id_saga BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
 clave_idempotencia VARCHAR(120) NOT NULL,
 id_cotizacion BIGINT UNSIGNED NOT NULL,
 id_version BIGINT UNSIGNED NOT NULL,
 id_usuario_externo BIGINT UNSIGNED NULL,
 correlation_id VARCHAR(100) NOT NULL,
 estado VARCHAR(30) NOT NULL,
 referencia_pago VARCHAR(100) NULL,
 id_reserva_externa BIGINT UNSIGNED NULL,
 referencia_reserva VARCHAR(100) NULL,
 id_orden_externa BIGINT UNSIGNED NULL,
 folio_orden VARCHAR(50) NULL,
 ultimo_error VARCHAR(1000) NULL,
 intentos INT UNSIGNED NOT NULL DEFAULT 0,
 creado_en DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
 actualizado_en DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
 version BIGINT UNSIGNED NOT NULL DEFAULT 1,
 CONSTRAINT pk_saga_confirmacion PRIMARY KEY(id_saga),
 CONSTRAINT uk_saga_confirmacion_clave UNIQUE(clave_idempotencia),
 CONSTRAINT ck_saga_confirmacion_estado CHECK(estado IN ('INICIADA','PAGO_VALIDADO','RESERVA_CREADA','ORDEN_CREADA','RESERVA_VINCULADA','CONFIRMADA','COMPENSACION_PENDIENTE','COMPENSADA','ERROR')),
 INDEX ix_saga_confirmacion_estado(estado,actualizado_en)
) ENGINE=InnoDB;
CREATE TABLE IF NOT EXISTS integration_inbox (
 id_inbox BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,event_id VARCHAR(80) NOT NULL,tipo VARCHAR(100) NOT NULL,origen VARCHAR(80) NOT NULL,payload LONGTEXT NULL,
 recibido_en DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),CONSTRAINT pk_integration_inbox PRIMARY KEY(id_inbox),CONSTRAINT uk_integration_inbox_event UNIQUE(event_id)
) ENGINE=InnoDB;
CREATE TABLE IF NOT EXISTS integration_outbox (
 id_outbox BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,event_id VARCHAR(80) NOT NULL,tipo VARCHAR(100) NOT NULL,agregado_tipo VARCHAR(80) NOT NULL,agregado_id VARCHAR(100) NOT NULL,payload LONGTEXT NULL,
 estado VARCHAR(20) NOT NULL DEFAULT 'PENDIENTE',intentos INT UNSIGNED NOT NULL DEFAULT 0,proximo_intento DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),ultimo_error VARCHAR(1000) NULL,
 creado_en DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),enviado_en DATETIME(6) NULL,
 CONSTRAINT pk_integration_outbox PRIMARY KEY(id_outbox),CONSTRAINT uk_integration_outbox_event UNIQUE(event_id),CONSTRAINT ck_integration_outbox_estado CHECK(estado IN ('PENDIENTE','ENVIADO','ERROR')),INDEX ix_outbox_pendiente(estado,proximo_intento)
) ENGINE=InnoDB;
