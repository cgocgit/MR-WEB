CREATE TABLE IF NOT EXISTS integration_outbox (
 id_outbox BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,event_id VARCHAR(80) NOT NULL,tipo VARCHAR(100) NOT NULL,payload LONGTEXT NOT NULL,estado VARCHAR(20) NOT NULL DEFAULT 'PENDIENTE',intentos INT UNSIGNED NOT NULL DEFAULT 0,proximo_intento DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),ultimo_error VARCHAR(1000) NULL,creado_en DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),enviado_en DATETIME(6) NULL,
 CONSTRAINT pk_pagos_integration_outbox PRIMARY KEY(id_outbox),CONSTRAINT uk_pagos_outbox_event UNIQUE(event_id),CONSTRAINT ck_pagos_outbox_estado CHECK(estado IN ('PENDIENTE','ENVIADO','ERROR')),INDEX ix_pagos_outbox_pendiente(estado,proximo_intento)
) ENGINE=InnoDB;
