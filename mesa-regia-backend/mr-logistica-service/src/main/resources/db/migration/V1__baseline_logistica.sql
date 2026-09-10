CREATE TABLE IF NOT EXISTS vehiculo (
  id_vehiculo BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  placa VARCHAR(20) NOT NULL,
  activo TINYINT(1) NOT NULL DEFAULT 1,
  creado_en DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  actualizado_en DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  version BIGINT UNSIGNED NOT NULL DEFAULT 1,
  CONSTRAINT pk_vehiculo PRIMARY KEY (id_vehiculo),
  CONSTRAINT uk_vehiculo_placa UNIQUE (placa),
  CONSTRAINT ck_vehiculo_activo CHECK (activo IN (0,1))
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS programacion_logistica (
  id_programacion_logistica BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  fecha_hora_preparacion DATETIME(6) NOT NULL,
  id_supervisor_externo BIGINT UNSIGNED NOT NULL,
  id_representante_externo BIGINT UNSIGNED NULL,
  id_chofer_externo BIGINT UNSIGNED NULL,
  id_vehiculo BIGINT UNSIGNED NULL,
  estado VARCHAR(30) NOT NULL DEFAULT 'PROGRAMADA',
  motivo_reprogramacion VARCHAR(500) NULL,
  creado_en DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  actualizado_en DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  version BIGINT UNSIGNED NOT NULL DEFAULT 1,
  CONSTRAINT pk_programacion_logistica PRIMARY KEY (id_programacion_logistica),
  CONSTRAINT fk_programacion_vehiculo FOREIGN KEY (id_vehiculo) REFERENCES vehiculo(id_vehiculo),
  CONSTRAINT ck_programacion_estado CHECK (estado IN ('PROGRAMADA','EN_EJECUCION','REALIZADA','CANCELADA')),
  INDEX ix_programacion_fecha_estado (fecha_hora_preparacion,estado),
  INDEX ix_programacion_chofer (id_chofer_externo),
  INDEX ix_programacion_representante (id_representante_externo)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS asignacion_logistica (
  id_asignacion_logistica BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  id_programacion_logistica BIGINT UNSIGNED NOT NULL,
  id_orden_externo BIGINT UNSIGNED NOT NULL,
  orden_parada SMALLINT UNSIGNED NOT NULL,
  fecha_hora_programada DATETIME(6) NULL,
  domicilio_snapshot VARCHAR(500) NULL,
  estado VARCHAR(30) NOT NULL DEFAULT 'PROGRAMADA',
  CONSTRAINT pk_asignacion_logistica PRIMARY KEY (id_asignacion_logistica),
  CONSTRAINT fk_asignacion_programacion FOREIGN KEY (id_programacion_logistica) REFERENCES programacion_logistica(id_programacion_logistica),
  CONSTRAINT uk_asignacion_orden UNIQUE (id_programacion_logistica,id_orden_externo),
  CONSTRAINT uk_asignacion_parada UNIQUE (id_programacion_logistica,orden_parada),
  CONSTRAINT ck_asignacion_estado CHECK (estado IN ('PENDIENTE','PROGRAMADA','EN_PROCESO','CONCLUIDA','CANCELADA')),
  INDEX ix_asignacion_orden_externo (id_orden_externo)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS tolerancia (
  id_tolerancia BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  codigo_etapa VARCHAR(40) NOT NULL,
  unidad VARCHAR(20) NOT NULL,
  minutos SMALLINT UNSIGNED NULL,
  aplica TINYINT(1) NOT NULL DEFAULT 1,
  activo TINYINT(1) NOT NULL DEFAULT 1,
  creado_en DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  actualizado_en DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  version BIGINT UNSIGNED NOT NULL DEFAULT 1,
  CONSTRAINT pk_tolerancia PRIMARY KEY (id_tolerancia),
  CONSTRAINT uk_tolerancia_etapa UNIQUE (codigo_etapa),
  CONSTRAINT ck_tolerancia_unidad CHECK (unidad IN ('MINUTOS','FECHA_HORA')),
  CONSTRAINT ck_tolerancia_aplica CHECK (aplica IN (0,1)),
  CONSTRAINT ck_tolerancia_activo CHECK (activo IN (0,1)),
  CONSTRAINT ck_tolerancia_valor CHECK ((unidad='MINUTOS' AND aplica=1 AND minutos IS NOT NULL) OR (unidad='FECHA_HORA' AND aplica=0 AND minutos IS NULL))
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS etapa_logistica (
  id_etapa_logistica BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  id_programacion_logistica BIGINT UNSIGNED NOT NULL,
  codigo_etapa VARCHAR(40) NOT NULL,
  estado VARCHAR(30) NOT NULL DEFAULT 'PENDIENTE',
  orden_etapa SMALLINT UNSIGNED NOT NULL,
  tolerancia_aplicada_minutos SMALLINT UNSIGNED NULL,
  fecha_hora_inicio DATETIME(6) NULL,
  fecha_hora_termino DATETIME(6) NULL,
  id_responsable_externo BIGINT UNSIGNED NULL,
  cantidad_prevista INT UNSIGNED NULL,
  cantidad_atendida INT UNSIGNED NULL,
  comentario VARCHAR(1000) NULL,
  evidencia_1_referencia VARCHAR(500) NULL,
  evidencia_2_referencia VARCHAR(500) NULL,
  evidencia_3_referencia VARCHAR(500) NULL,
  confirmada TINYINT(1) NOT NULL DEFAULT 0,
  version BIGINT UNSIGNED NOT NULL DEFAULT 1,
  CONSTRAINT pk_etapa_logistica PRIMARY KEY (id_etapa_logistica),
  CONSTRAINT fk_etapa_programacion FOREIGN KEY (id_programacion_logistica) REFERENCES programacion_logistica(id_programacion_logistica),
  CONSTRAINT uk_etapa_programacion_codigo UNIQUE (id_programacion_logistica,codigo_etapa),
  CONSTRAINT uk_etapa_programacion_orden UNIQUE (id_programacion_logistica,orden_etapa),
  CONSTRAINT ck_etapa_estado CHECK (estado IN ('PENDIENTE','EN_PROCESO','PARCIAL','CONCLUIDA','NO_APLICA')),
  CONSTRAINT ck_etapa_confirmada CHECK (confirmada IN (0,1)),
  CONSTRAINT ck_etapa_fechas CHECK (fecha_hora_termino IS NULL OR fecha_hora_inicio IS NULL OR fecha_hora_termino >= fecha_hora_inicio),
  CONSTRAINT ck_etapa_cantidades CHECK (cantidad_atendida IS NULL OR cantidad_prevista IS NULL OR cantidad_atendida <= cantidad_prevista),
  INDEX ix_etapa_programacion_orden (id_programacion_logistica,orden_etapa)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS tipo_incidencia (
  id_tipo_incidencia BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  codigo VARCHAR(50) NOT NULL,
  nombre VARCHAR(150) NOT NULL,
  perfil_reportante VARCHAR(30) NOT NULL,
  activo TINYINT(1) NOT NULL DEFAULT 1,
  creado_en DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  actualizado_en DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  version BIGINT UNSIGNED NOT NULL DEFAULT 1,
  CONSTRAINT pk_tipo_incidencia PRIMARY KEY (id_tipo_incidencia),
  CONSTRAINT uk_tipo_incidencia_codigo UNIQUE (codigo),
  CONSTRAINT ck_tipo_incidencia_perfil CHECK (perfil_reportante IN ('REPRESENTANTE','CHOFER')),
  CONSTRAINT ck_tipo_incidencia_activo CHECK (activo IN (0,1))
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS incidencia (
  id_incidencia BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  folio VARCHAR(50) NOT NULL,
  id_programacion_logistica BIGINT UNSIGNED NOT NULL,
  id_etapa_logistica BIGINT UNSIGNED NULL,
  id_tipo_incidencia BIGINT UNSIGNED NOT NULL,
  id_orden_externo BIGINT UNSIGNED NOT NULL,
  id_producto_externo BIGINT UNSIGNED NULL,
  cantidad_afectada INT UNSIGNED NULL,
  estado VARCHAR(30) NOT NULL DEFAULT 'REPORTADA',
  descripcion VARCHAR(1000) NOT NULL,
  id_usuario_reporta_externo BIGINT UNSIGNED NOT NULL,
  id_supervisor_externo BIGINT UNSIGNED NULL,
  resolucion VARCHAR(1000) NULL,
  fecha_hora_reporte DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  fecha_hora_resolucion DATETIME(6) NULL,
  version BIGINT UNSIGNED NOT NULL DEFAULT 1,
  CONSTRAINT pk_incidencia PRIMARY KEY (id_incidencia),
  CONSTRAINT uk_incidencia_folio UNIQUE (folio),
  CONSTRAINT fk_incidencia_programacion FOREIGN KEY (id_programacion_logistica) REFERENCES programacion_logistica(id_programacion_logistica),
  CONSTRAINT fk_incidencia_etapa FOREIGN KEY (id_etapa_logistica) REFERENCES etapa_logistica(id_etapa_logistica),
  CONSTRAINT fk_incidencia_tipo FOREIGN KEY (id_tipo_incidencia) REFERENCES tipo_incidencia(id_tipo_incidencia),
  CONSTRAINT ck_incidencia_estado CHECK (estado IN ('REPORTADA','EN_SEGUIMIENTO','RESUELTA')),
  CONSTRAINT ck_incidencia_cantidad CHECK (cantidad_afectada IS NULL OR cantidad_afectada > 0),
  CONSTRAINT ck_incidencia_resolucion CHECK ((estado='RESUELTA' AND fecha_hora_resolucion IS NOT NULL AND resolucion IS NOT NULL) OR (estado<>'RESUELTA')),
  INDEX ix_incidencia_estado_fecha (estado,fecha_hora_reporte),
  INDEX ix_incidencia_programacion (id_programacion_logistica),
  INDEX ix_incidencia_orden (id_orden_externo)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS seguimiento_incidencia (
  id_seguimiento_incidencia BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  id_incidencia BIGINT UNSIGNED NOT NULL,
  estado_anterior VARCHAR(30) NULL,
  estado_nuevo VARCHAR(30) NOT NULL,
  comentario VARCHAR(1000) NULL,
  id_usuario_externo BIGINT UNSIGNED NOT NULL,
  fecha_hora DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  CONSTRAINT pk_seguimiento_incidencia PRIMARY KEY (id_seguimiento_incidencia),
  CONSTRAINT fk_seguimiento_incidencia FOREIGN KEY (id_incidencia) REFERENCES incidencia(id_incidencia),
  CONSTRAINT ck_seguimiento_estado CHECK (estado_nuevo IN ('REPORTADA','EN_SEGUIMIENTO','RESUELTA')),
  INDEX ix_seguimiento_incidencia_fecha (id_incidencia,fecha_hora)
) ENGINE=InnoDB;

INSERT INTO tipo_incidencia (codigo,nombre,perfil_reportante,activo) VALUES
 ('MATERIAL_INCORRECTO','Material incorrecto','REPRESENTANTE',1),('MATERIAL_DANADO','Material dañado','REPRESENTANTE',1),('INCIDENTE_VIAL','Incidente vial','CHOFER',1),('DANO_VEHICULO','Daño en vehículo','CHOFER',1)
ON DUPLICATE KEY UPDATE nombre=VALUES(nombre), perfil_reportante=VALUES(perfil_reportante), activo=VALUES(activo);

INSERT INTO tolerancia (codigo_etapa,unidad,minutos,aplica,activo) VALUES
 ('RECEPCION','MINUTOS',30,1,1),('PLANEACION','MINUTOS',30,1,1),('PREPARACION','MINUTOS',30,1,1),('CARGA_DESPACHO','MINUTOS',30,1,1),('TRASLADO_SITIO','FECHA_HORA',NULL,0,1),('ENTREGA','MINUTOS',30,1,1),('MONTAJE','MINUTOS',30,1,1),('EJECUCION','MINUTOS',30,1,1),('DESMONTAJE','MINUTOS',30,1,1),('RECOLECCION','MINUTOS',30,1,1),('TRASLADO_RETORNO','FECHA_HORA',NULL,0,1),('ENTREGA_ALMACEN','MINUTOS',30,1,1),('INSPECCION','MINUTOS',30,1,1),('LIMPIEZA_REACONDICIONAMIENTO','MINUTOS',30,1,1),('REINGRESO_INVENTARIO','MINUTOS',30,1,1),('CIERRE','MINUTOS',30,1,1)
ON DUPLICATE KEY UPDATE unidad=VALUES(unidad), minutos=VALUES(minutos), aplica=VALUES(aplica), activo=VALUES(activo);
