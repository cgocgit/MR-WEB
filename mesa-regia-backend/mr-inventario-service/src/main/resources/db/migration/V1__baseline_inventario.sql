CREATE TABLE IF NOT EXISTS almacen (
  id_almacen BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  codigo VARCHAR(30) NOT NULL,
  nombre VARCHAR(120) NOT NULL,
  activo TINYINT(1) NOT NULL DEFAULT 1,
  creado_en DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  actualizado_en DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  version BIGINT UNSIGNED NOT NULL DEFAULT 1,
  CONSTRAINT pk_almacen PRIMARY KEY (id_almacen), CONSTRAINT uk_almacen_codigo UNIQUE (codigo), CONSTRAINT uk_almacen_nombre UNIQUE (nombre),
  CONSTRAINT ck_almacen_activo CHECK (activo IN (0,1))
) ENGINE=InnoDB;
CREATE TABLE IF NOT EXISTS existencia (
  id_existencia BIGINT UNSIGNED NOT NULL AUTO_INCREMENT, id_almacen BIGINT UNSIGNED NOT NULL, id_producto_externo BIGINT UNSIGNED NOT NULL,
  existencia_fisica INT UNSIGNED NOT NULL DEFAULT 0, actualizado_en DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), version BIGINT UNSIGNED NOT NULL DEFAULT 1,
  CONSTRAINT pk_existencia PRIMARY KEY (id_existencia), CONSTRAINT uk_existencia_almacen_producto UNIQUE (id_almacen,id_producto_externo),
  CONSTRAINT fk_existencia_almacen FOREIGN KEY (id_almacen) REFERENCES almacen(id_almacen), INDEX ix_existencia_producto (id_producto_externo)
) ENGINE=InnoDB;
CREATE TABLE IF NOT EXISTS limite_inventario (
  id_limite_inventario BIGINT UNSIGNED NOT NULL AUTO_INCREMENT, id_existencia BIGINT UNSIGNED NOT NULL, minimo INT UNSIGNED NOT NULL, maximo INT UNSIGNED NOT NULL,
  id_usuario_modificacion_externo BIGINT UNSIGNED NOT NULL, actualizado_en DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), version BIGINT UNSIGNED NOT NULL DEFAULT 1,
  CONSTRAINT pk_limite_inventario PRIMARY KEY (id_limite_inventario), CONSTRAINT uk_limite_existencia UNIQUE (id_existencia), CONSTRAINT fk_limite_existencia FOREIGN KEY (id_existencia) REFERENCES existencia(id_existencia),
  CONSTRAINT ck_limite_minimo CHECK (minimo > 0), CONSTRAINT ck_limite_maximo CHECK (maximo > 0), CONSTRAINT ck_limite_rango CHECK (maximo >= minimo)
) ENGINE=InnoDB;
CREATE TABLE IF NOT EXISTS reserva (
  id_reserva BIGINT UNSIGNED NOT NULL AUTO_INCREMENT, folio VARCHAR(40) NOT NULL, id_orden_externo BIGINT UNSIGNED NOT NULL, estado VARCHAR(20) NOT NULL,
  fecha_inicio DATE NOT NULL, fecha_fin DATE NOT NULL, motivo_cancelacion VARCHAR(500) NULL, referencia_salida VARCHAR(100) NULL,
  creado_en DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), actualizado_en DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  id_usuario_creacion_externo BIGINT UNSIGNED NULL, id_usuario_modificacion_externo BIGINT UNSIGNED NULL, version BIGINT UNSIGNED NOT NULL DEFAULT 1,
  CONSTRAINT pk_reserva PRIMARY KEY (id_reserva), CONSTRAINT uk_reserva_folio UNIQUE (folio), CONSTRAINT ck_reserva_estado CHECK (estado IN ('CONFIRMADA','ACTIVA','LIBERADA','CANCELADA')),
  CONSTRAINT ck_reserva_fechas CHECK (fecha_fin >= fecha_inicio), INDEX ix_reserva_orden (id_orden_externo), INDEX ix_reserva_estado_fechas (estado,fecha_inicio,fecha_fin)
) ENGINE=InnoDB;
CREATE TABLE IF NOT EXISTS reserva_detalle (
  id_reserva_detalle BIGINT UNSIGNED NOT NULL AUTO_INCREMENT, id_reserva BIGINT UNSIGNED NOT NULL, id_existencia BIGINT UNSIGNED NOT NULL, cantidad_reservada INT UNSIGNED NOT NULL,
  CONSTRAINT pk_reserva_detalle PRIMARY KEY (id_reserva_detalle), CONSTRAINT uk_reserva_detalle UNIQUE (id_reserva,id_existencia),
  CONSTRAINT fk_reserva_detalle_reserva FOREIGN KEY (id_reserva) REFERENCES reserva(id_reserva), CONSTRAINT fk_reserva_detalle_existencia FOREIGN KEY (id_existencia) REFERENCES existencia(id_existencia),
  CONSTRAINT ck_reserva_detalle_cantidad CHECK (cantidad_reservada > 0), INDEX ix_reserva_detalle_existencia (id_existencia)
) ENGINE=InnoDB;
CREATE TABLE IF NOT EXISTS corte_fisico (
  id_corte_fisico BIGINT UNSIGNED NOT NULL AUTO_INCREMENT, folio VARCHAR(50) NOT NULL, id_almacen BIGINT UNSIGNED NOT NULL, estado VARCHAR(20) NOT NULL DEFAULT 'ABIERTO',
  fecha_hora_inicio DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), fecha_hora_cierre DATETIME(6) NULL, id_usuario_inicio_externo BIGINT UNSIGNED NOT NULL,
  id_usuario_cierre_externo BIGINT UNSIGNED NULL, observaciones VARCHAR(500) NULL, version BIGINT UNSIGNED NOT NULL DEFAULT 1,
  CONSTRAINT pk_corte_fisico PRIMARY KEY (id_corte_fisico), CONSTRAINT uk_corte_fisico_folio UNIQUE (folio), CONSTRAINT fk_corte_almacen FOREIGN KEY (id_almacen) REFERENCES almacen(id_almacen),
  CONSTRAINT ck_corte_estado CHECK (estado IN ('ABIERTO','CERRADO')), CONSTRAINT ck_corte_cierre CHECK (fecha_hora_cierre IS NULL OR fecha_hora_cierre >= fecha_hora_inicio), INDEX ix_corte_almacen_fecha (id_almacen,fecha_hora_inicio)
) ENGINE=InnoDB;
CREATE TABLE IF NOT EXISTS corte_detalle (
  id_corte_detalle BIGINT UNSIGNED NOT NULL AUTO_INCREMENT, id_corte_fisico BIGINT UNSIGNED NOT NULL, id_existencia BIGINT UNSIGNED NOT NULL,
  cantidad_registrada INT UNSIGNED NOT NULL, cantidad_fisica INT UNSIGNED NULL,
  CONSTRAINT pk_corte_detalle PRIMARY KEY (id_corte_detalle), CONSTRAINT uk_corte_detalle UNIQUE (id_corte_fisico,id_existencia),
  CONSTRAINT fk_corte_detalle_corte FOREIGN KEY (id_corte_fisico) REFERENCES corte_fisico(id_corte_fisico), CONSTRAINT fk_corte_detalle_existencia FOREIGN KEY (id_existencia) REFERENCES existencia(id_existencia), INDEX ix_corte_detalle_existencia (id_existencia)
) ENGINE=InnoDB;
CREATE TABLE IF NOT EXISTS movimiento_inventario (
  id_movimiento_inventario BIGINT UNSIGNED NOT NULL AUTO_INCREMENT, folio VARCHAR(50) NOT NULL, id_existencia BIGINT UNSIGNED NOT NULL, tipo_movimiento VARCHAR(20) NOT NULL,
  origen_operacion VARCHAR(30) NOT NULL, cantidad INT UNSIGNED NOT NULL, existencia_anterior INT UNSIGNED NOT NULL, existencia_resultante INT UNSIGNED NOT NULL,
  id_orden_externo BIGINT UNSIGNED NULL, id_corte_fisico BIGINT UNSIGNED NULL, motivo VARCHAR(250) NULL, comentario VARCHAR(500) NULL,
  id_usuario_externo BIGINT UNSIGNED NOT NULL, fecha_hora DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), clave_operacion VARCHAR(100) NULL,
  CONSTRAINT pk_movimiento_inventario PRIMARY KEY (id_movimiento_inventario), CONSTRAINT uk_movimiento_folio UNIQUE (folio), CONSTRAINT uk_movimiento_clave_operacion UNIQUE (clave_operacion),
  CONSTRAINT fk_movimiento_existencia FOREIGN KEY (id_existencia) REFERENCES existencia(id_existencia), CONSTRAINT fk_movimiento_corte FOREIGN KEY (id_corte_fisico) REFERENCES corte_fisico(id_corte_fisico),
  CONSTRAINT ck_movimiento_tipo CHECK (tipo_movimiento IN ('ENTRADA','SALIDA','AJUSTE')),
  CONSTRAINT ck_movimiento_origen CHECK (origen_operacion IN ('CARGA_INICIAL','REINGRESO','SALIDA_ORDEN','RETORNO_ORDEN','AJUSTE_AUTORIZADO')),
  CONSTRAINT ck_movimiento_cantidad CHECK (cantidad > 0), INDEX ix_movimiento_existencia_fecha (id_existencia,fecha_hora), INDEX ix_movimiento_orden (id_orden_externo), INDEX ix_movimiento_fecha (fecha_hora)
) ENGINE=InnoDB;
INSERT INTO almacen (codigo,nombre,activo) VALUES ('ALM_CENTRAL','Almacén Central',1) ON DUPLICATE KEY UPDATE nombre=VALUES(nombre), activo=VALUES(activo);
