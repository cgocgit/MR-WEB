CREATE TABLE IF NOT EXISTS cotizacion (
  id_cotizacion BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  ejercicio SMALLINT UNSIGNED NOT NULL,
  consecutivo INT UNSIGNED NOT NULL,
  folio VARCHAR(40) NOT NULL,
  id_cliente_prospecto_externo BIGINT UNSIGNED NOT NULL,
  estado_general VARCHAR(30) NOT NULL DEFAULT 'BORRADOR',
  id_version_elegida BIGINT UNSIGNED NULL,
  porcentaje_confirmacion DECIMAL(5,2) NOT NULL,
  referencia_pago_externa VARCHAR(100) NULL,
  referencia_reserva_externa VARCHAR(100) NULL,
  fecha_confirmacion DATETIME(6) NULL,
  creado_en DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  actualizado_en DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  id_usuario_creacion_externo BIGINT UNSIGNED NULL,
  id_usuario_modificacion_externo BIGINT UNSIGNED NULL,
  version BIGINT UNSIGNED NOT NULL DEFAULT 1,
  CONSTRAINT pk_cotizacion PRIMARY KEY (id_cotizacion),
  CONSTRAINT uk_cotizacion_folio UNIQUE (folio),
  CONSTRAINT uk_cotizacion_ejercicio_consecutivo UNIQUE (ejercicio,consecutivo),
  CONSTRAINT ck_cotizacion_estado CHECK (estado_general IN ('BORRADOR','EN_SEGUIMIENTO','CONFIRMADA','CANCELADA','RECHAZADA','VENCIDA')),
  CONSTRAINT ck_cotizacion_porcentaje CHECK (porcentaje_confirmacion >= 0 AND porcentaje_confirmacion <= 100),
  INDEX ix_cotizacion_cliente (id_cliente_prospecto_externo),
  INDEX ix_cotizacion_estado_actualizado (estado_general,actualizado_en)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS domicilio (
  id_domicilio BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  id_cotizacion BIGINT UNSIGNED NOT NULL,
  direccion VARCHAR(500) NOT NULL,
  referencias VARCHAR(500) NULL,
  CONSTRAINT pk_domicilio PRIMARY KEY (id_domicilio),
  CONSTRAINT uk_domicilio_cotizacion UNIQUE (id_cotizacion),
  CONSTRAINT fk_domicilio_cotizacion FOREIGN KEY (id_cotizacion) REFERENCES cotizacion(id_cotizacion)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS evento (
  id_evento BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  id_cotizacion BIGINT UNSIGNED NOT NULL,
  descripcion VARCHAR(150) NOT NULL,
  fecha_evento DATE NOT NULL,
  hora_evento TIME NOT NULL,
  CONSTRAINT pk_evento PRIMARY KEY (id_evento),
  CONSTRAINT uk_evento_cotizacion UNIQUE (id_cotizacion),
  CONSTRAINT fk_evento_cotizacion FOREIGN KEY (id_cotizacion) REFERENCES cotizacion(id_cotizacion)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS cotizacion_version (
  id_cotizacion_version BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  id_cotizacion BIGINT UNSIGNED NOT NULL,
  numero_version SMALLINT UNSIGNED NOT NULL,
  folio_version VARCHAR(50) NOT NULL,
  estado_version VARCHAR(20) NOT NULL DEFAULT 'BORRADOR',
  id_lista_precio_externo BIGINT UNSIGNED NOT NULL,
  observaciones VARCHAR(1000) NULL,
  creado_en DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  actualizado_en DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  id_usuario_creacion_externo BIGINT UNSIGNED NULL,
  version BIGINT UNSIGNED NOT NULL DEFAULT 1,
  CONSTRAINT pk_cotizacion_version PRIMARY KEY (id_cotizacion_version),
  CONSTRAINT uk_cotizacion_numero_version UNIQUE (id_cotizacion,numero_version),
  CONSTRAINT uk_cotizacion_folio_version UNIQUE (folio_version),
  CONSTRAINT fk_cotizacion_version_cotizacion FOREIGN KEY (id_cotizacion) REFERENCES cotizacion(id_cotizacion),
  CONSTRAINT ck_cotizacion_version_estado CHECK (estado_version IN ('BORRADOR','ENVIADA')),
  INDEX ix_cotizacion_version_lista (id_lista_precio_externo)
) ENGINE=InnoDB;

SET @fk_exists := (
  SELECT COUNT(*) FROM information_schema.TABLE_CONSTRAINTS
  WHERE CONSTRAINT_SCHEMA=DATABASE() AND TABLE_NAME='cotizacion'
    AND CONSTRAINT_NAME='fk_cotizacion_version_elegida' AND CONSTRAINT_TYPE='FOREIGN KEY'
);
SET @ddl_fk := IF(@fk_exists=0,
  'ALTER TABLE cotizacion ADD CONSTRAINT fk_cotizacion_version_elegida FOREIGN KEY (id_version_elegida) REFERENCES cotizacion_version(id_cotizacion_version)',
  'SELECT 1'
);
PREPARE stmt_fk FROM @ddl_fk; EXECUTE stmt_fk; DEALLOCATE PREPARE stmt_fk;

CREATE TABLE IF NOT EXISTS cotizacion_detalle (
  id_cotizacion_detalle BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  id_cotizacion_version BIGINT UNSIGNED NOT NULL,
  tipo_concepto VARCHAR(20) NOT NULL,
  id_concepto_externo BIGINT UNSIGNED NOT NULL,
  codigo_snapshot VARCHAR(50) NOT NULL,
  nombre_snapshot VARCHAR(200) NOT NULL,
  cantidad DECIMAL(12,3) NOT NULL,
  precio_unitario_aplicado DECIMAL(14,2) NOT NULL,
  porcentaje_adicional_aplicado DECIMAL(5,2) NULL,
  orden SMALLINT UNSIGNED NULL,
  CONSTRAINT pk_cotizacion_detalle PRIMARY KEY (id_cotizacion_detalle),
  CONSTRAINT fk_cotizacion_detalle_version FOREIGN KEY (id_cotizacion_version) REFERENCES cotizacion_version(id_cotizacion_version),
  CONSTRAINT ck_cotizacion_detalle_tipo CHECK (tipo_concepto IN ('PRODUCTO','SERVICIO','PAQUETE')),
  CONSTRAINT ck_cotizacion_detalle_cantidad CHECK (cantidad > 0),
  CONSTRAINT ck_cotizacion_detalle_precio CHECK (precio_unitario_aplicado >= 0),
  CONSTRAINT ck_cotizacion_detalle_adicional CHECK (porcentaje_adicional_aplicado IS NULL OR (porcentaje_adicional_aplicado >= 0 AND porcentaje_adicional_aplicado <= 100)),
  INDEX ix_cotizacion_detalle_concepto (tipo_concepto,id_concepto_externo)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS envio_cotizacion (
  id_envio_cotizacion BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  id_cotizacion_version BIGINT UNSIGNED NOT NULL,
  medio VARCHAR(30) NOT NULL,
  destinatario VARCHAR(200) NOT NULL,
  fecha_hora_envio DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  resultado VARCHAR(30) NOT NULL,
  referencia_envio VARCHAR(150) NULL,
  id_usuario_externo BIGINT UNSIGNED NOT NULL,
  CONSTRAINT pk_envio_cotizacion PRIMARY KEY (id_envio_cotizacion),
  CONSTRAINT fk_envio_cotizacion_version FOREIGN KEY (id_cotizacion_version) REFERENCES cotizacion_version(id_cotizacion_version),
  CONSTRAINT ck_envio_resultado CHECK (resultado IN ('ENVIADO','ERROR')),
  INDEX ix_envio_version_fecha (id_cotizacion_version,fecha_hora_envio)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS historial_estado_cotizacion (
  id_historial_estado_cotizacion BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  id_cotizacion BIGINT UNSIGNED NOT NULL,
  id_cotizacion_version BIGINT UNSIGNED NULL,
  evento VARCHAR(60) NOT NULL,
  estado_anterior VARCHAR(30) NULL,
  estado_nuevo VARCHAR(30) NULL,
  motivo VARCHAR(500) NULL,
  fecha_hora DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  id_usuario_externo BIGINT UNSIGNED NULL,
  CONSTRAINT pk_historial_estado_cotizacion PRIMARY KEY (id_historial_estado_cotizacion),
  CONSTRAINT fk_historial_cotizacion FOREIGN KEY (id_cotizacion) REFERENCES cotizacion(id_cotizacion),
  CONSTRAINT fk_historial_cotizacion_version FOREIGN KEY (id_cotizacion_version) REFERENCES cotizacion_version(id_cotizacion_version),
  INDEX ix_historial_cotizacion_fecha (id_cotizacion,fecha_hora)
) ENGINE=InnoDB;
