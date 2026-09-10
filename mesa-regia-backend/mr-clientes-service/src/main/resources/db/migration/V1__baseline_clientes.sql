CREATE TABLE IF NOT EXISTS cliente_prospecto (
  id_cliente_prospecto BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  nombres VARCHAR(150) NOT NULL,
  apellidos VARCHAR(150) NULL,
  clasificacion VARCHAR(20) NOT NULL DEFAULT 'PROSPECTO',
  estado_prospecto VARCHAR(20) NULL DEFAULT 'PENDIENTE',
  activo TINYINT(1) NOT NULL DEFAULT 1,
  creado_en DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  actualizado_en DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  version BIGINT UNSIGNED NOT NULL DEFAULT 1,
  id_usuario_creacion_externo BIGINT UNSIGNED NULL,
  id_usuario_modificacion_externo BIGINT UNSIGNED NULL,
  CONSTRAINT pk_cliente_prospecto PRIMARY KEY (id_cliente_prospecto),
  CONSTRAINT ck_cliente_clasificacion CHECK (clasificacion IN ('PROSPECTO','CLIENTE')),
  CONSTRAINT ck_cliente_estado_prospecto CHECK (
    (clasificacion='PROSPECTO' AND estado_prospecto IN ('PENDIENTE','REVISADO')) OR
    (clasificacion='CLIENTE' AND estado_prospecto IS NULL)
  ),
  CONSTRAINT ck_cliente_activo CHECK (activo IN (0,1)),
  INDEX ix_cliente_clasificacion (clasificacion,estado_prospecto),
  INDEX ix_cliente_nombre (nombres,apellidos),
  INDEX ix_cliente_actualizado (actualizado_en)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS contacto (
  id_contacto BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  id_cliente_prospecto BIGINT UNSIGNED NOT NULL,
  tipo_medio_contacto VARCHAR(30) NOT NULL,
  medio_contacto VARCHAR(200) NOT NULL,
  es_principal TINYINT(1) NOT NULL DEFAULT 0,
  activo TINYINT(1) NOT NULL DEFAULT 1,
  creado_en DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  actualizado_en DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  version BIGINT UNSIGNED NOT NULL DEFAULT 1,
  CONSTRAINT pk_contacto PRIMARY KEY (id_contacto),
  CONSTRAINT fk_contacto_cliente FOREIGN KEY (id_cliente_prospecto) REFERENCES cliente_prospecto(id_cliente_prospecto),
  CONSTRAINT uk_contacto_medio UNIQUE (id_cliente_prospecto,tipo_medio_contacto,medio_contacto),
  CONSTRAINT ck_contacto_tipo CHECK (tipo_medio_contacto IN ('TELEFONO','CORREO','WHATSAPP')),
  CONSTRAINT ck_contacto_principal CHECK (es_principal IN (0,1)),
  CONSTRAINT ck_contacto_activo CHECK (activo IN (0,1)),
  INDEX ix_contacto_cliente_activo (id_cliente_prospecto,activo),
  INDEX ix_contacto_tipo_valor (tipo_medio_contacto,medio_contacto)
) ENGINE=InnoDB;
