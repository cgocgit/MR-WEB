CREATE TABLE IF NOT EXISTS categoria (
  id_categoria BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  nombre VARCHAR(100) NOT NULL,
  ambito VARCHAR(20) NOT NULL,
  activo TINYINT(1) NOT NULL DEFAULT 1,
  creado_en DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  actualizado_en DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  version BIGINT UNSIGNED NOT NULL DEFAULT 1,
  CONSTRAINT pk_categoria PRIMARY KEY (id_categoria),
  CONSTRAINT uk_categoria_ambito_nombre UNIQUE (ambito,nombre),
  CONSTRAINT ck_categoria_ambito CHECK (ambito IN ('PRODUCTO','SERVICIO')),
  CONSTRAINT ck_categoria_activo CHECK (activo IN (0,1))
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS tipo_producto (
  id_tipo_producto BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  nombre VARCHAR(100) NOT NULL,
  activo TINYINT(1) NOT NULL DEFAULT 1,
  creado_en DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  actualizado_en DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  version BIGINT UNSIGNED NOT NULL DEFAULT 1,
  CONSTRAINT pk_tipo_producto PRIMARY KEY (id_tipo_producto),
  CONSTRAINT uk_tipo_producto_nombre UNIQUE (nombre),
  CONSTRAINT ck_tipo_producto_activo CHECK (activo IN (0,1))
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS color (
  id_color BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  nombre VARCHAR(80) NOT NULL,
  activo TINYINT(1) NOT NULL DEFAULT 1,
  creado_en DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  actualizado_en DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  version BIGINT UNSIGNED NOT NULL DEFAULT 1,
  CONSTRAINT pk_color PRIMARY KEY (id_color),
  CONSTRAINT uk_color_nombre UNIQUE (nombre),
  CONSTRAINT ck_color_activo CHECK (activo IN (0,1))
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS producto (
  id_producto BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  codigo VARCHAR(50) NOT NULL,
  nombre VARCHAR(150) NOT NULL,
  descripcion VARCHAR(500) NULL,
  id_categoria BIGINT UNSIGNED NOT NULL,
  id_tipo_producto BIGINT UNSIGNED NOT NULL,
  id_color BIGINT UNSIGNED NULL,
  unidad_medida VARCHAR(40) NOT NULL,
  precio_base DECIMAL(14,2) NOT NULL DEFAULT 0,
  activo TINYINT(1) NOT NULL DEFAULT 1,
  creado_en DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  actualizado_en DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  version BIGINT UNSIGNED NOT NULL DEFAULT 1,
  CONSTRAINT pk_producto PRIMARY KEY (id_producto),
  CONSTRAINT uk_producto_codigo UNIQUE (codigo),
  CONSTRAINT fk_producto_categoria FOREIGN KEY (id_categoria) REFERENCES categoria(id_categoria),
  CONSTRAINT fk_producto_tipo FOREIGN KEY (id_tipo_producto) REFERENCES tipo_producto(id_tipo_producto),
  CONSTRAINT fk_producto_color FOREIGN KEY (id_color) REFERENCES color(id_color),
  CONSTRAINT ck_producto_precio_base CHECK (precio_base >= 0),
  CONSTRAINT ck_producto_activo CHECK (activo IN (0,1)),
  INDEX ix_producto_nombre (nombre),
  INDEX ix_producto_categoria (id_categoria),
  INDEX ix_producto_tipo (id_tipo_producto),
  INDEX ix_producto_activo (activo)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS servicio (
  id_servicio BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  codigo VARCHAR(50) NOT NULL,
  nombre VARCHAR(150) NOT NULL,
  descripcion VARCHAR(500) NULL,
  id_categoria BIGINT UNSIGNED NOT NULL,
  tipo_servicio VARCHAR(60) NOT NULL,
  tarifa_base DECIMAL(14,2) NOT NULL DEFAULT 0,
  activo TINYINT(1) NOT NULL DEFAULT 1,
  creado_en DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  actualizado_en DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  version BIGINT UNSIGNED NOT NULL DEFAULT 1,
  CONSTRAINT pk_servicio PRIMARY KEY (id_servicio),
  CONSTRAINT uk_servicio_codigo UNIQUE (codigo),
  CONSTRAINT fk_servicio_categoria FOREIGN KEY (id_categoria) REFERENCES categoria(id_categoria),
  CONSTRAINT ck_servicio_tarifa CHECK (tarifa_base >= 0),
  CONSTRAINT ck_servicio_activo CHECK (activo IN (0,1)),
  INDEX ix_servicio_nombre (nombre),
  INDEX ix_servicio_categoria (id_categoria),
  INDEX ix_servicio_activo (activo)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS paquete (
  id_paquete BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  codigo VARCHAR(50) NOT NULL,
  nombre VARCHAR(150) NOT NULL,
  descripcion VARCHAR(500) NULL,
  activo TINYINT(1) NOT NULL DEFAULT 1,
  creado_en DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  actualizado_en DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  version BIGINT UNSIGNED NOT NULL DEFAULT 1,
  CONSTRAINT pk_paquete PRIMARY KEY (id_paquete),
  CONSTRAINT uk_paquete_codigo UNIQUE (codigo),
  CONSTRAINT ck_paquete_activo CHECK (activo IN (0,1)),
  INDEX ix_paquete_nombre (nombre),
  INDEX ix_paquete_activo (activo)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS paquete_detalle (
  id_paquete_detalle BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  id_paquete BIGINT UNSIGNED NOT NULL,
  id_producto BIGINT UNSIGNED NULL,
  id_servicio BIGINT UNSIGNED NULL,
  cantidad DECIMAL(12,3) NOT NULL,
  orden SMALLINT UNSIGNED NULL,
  CONSTRAINT pk_paquete_detalle PRIMARY KEY (id_paquete_detalle),
  CONSTRAINT fk_paquete_detalle_paquete FOREIGN KEY (id_paquete) REFERENCES paquete(id_paquete),
  CONSTRAINT fk_paquete_detalle_producto FOREIGN KEY (id_producto) REFERENCES producto(id_producto),
  CONSTRAINT fk_paquete_detalle_servicio FOREIGN KEY (id_servicio) REFERENCES servicio(id_servicio),
  CONSTRAINT ck_paquete_detalle_concepto CHECK (
    (id_producto IS NOT NULL AND id_servicio IS NULL) OR
    (id_producto IS NULL AND id_servicio IS NOT NULL)
  ),
  CONSTRAINT ck_paquete_detalle_cantidad CHECK (cantidad > 0),
  INDEX ix_paquete_detalle_paquete (id_paquete),
  INDEX ix_paquete_detalle_producto (id_producto),
  INDEX ix_paquete_detalle_servicio (id_servicio)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS lista_precio (
  id_lista_precio BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  codigo VARCHAR(40) NOT NULL,
  nombre VARCHAR(150) NOT NULL,
  descripcion VARCHAR(500) NULL,
  vigencia_inicio DATE NOT NULL,
  vigencia_fin DATE NOT NULL,
  porcentaje_adicional_fuera_lista DECIMAL(5,2) NOT NULL DEFAULT 0,
  activo TINYINT(1) NOT NULL DEFAULT 1,
  creado_en DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  actualizado_en DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  version BIGINT UNSIGNED NOT NULL DEFAULT 1,
  CONSTRAINT pk_lista_precio PRIMARY KEY (id_lista_precio),
  CONSTRAINT uk_lista_precio_codigo UNIQUE (codigo),
  CONSTRAINT ck_lista_precio_vigencia CHECK (vigencia_fin >= vigencia_inicio),
  CONSTRAINT ck_lista_precio_adicional CHECK (porcentaje_adicional_fuera_lista >= 0 AND porcentaje_adicional_fuera_lista <= 100),
  CONSTRAINT ck_lista_precio_activo CHECK (activo IN (0,1)),
  INDEX ix_lista_precio_vigencia (vigencia_inicio,vigencia_fin,activo)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS lista_precio_detalle (
  id_lista_precio_detalle BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  id_lista_precio BIGINT UNSIGNED NOT NULL,
  id_producto BIGINT UNSIGNED NULL,
  id_paquete BIGINT UNSIGNED NULL,
  precio DECIMAL(14,2) NOT NULL,
  activo TINYINT(1) NOT NULL DEFAULT 1,
  creado_en DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  actualizado_en DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  version BIGINT UNSIGNED NOT NULL DEFAULT 1,
  CONSTRAINT pk_lista_precio_detalle PRIMARY KEY (id_lista_precio_detalle),
  CONSTRAINT fk_lpd_lista FOREIGN KEY (id_lista_precio) REFERENCES lista_precio(id_lista_precio),
  CONSTRAINT fk_lpd_producto FOREIGN KEY (id_producto) REFERENCES producto(id_producto),
  CONSTRAINT fk_lpd_paquete FOREIGN KEY (id_paquete) REFERENCES paquete(id_paquete),
  CONSTRAINT uk_lpd_producto UNIQUE (id_lista_precio,id_producto),
  CONSTRAINT uk_lpd_paquete UNIQUE (id_lista_precio,id_paquete),
  CONSTRAINT ck_lpd_concepto CHECK (
    (id_producto IS NOT NULL AND id_paquete IS NULL) OR
    (id_producto IS NULL AND id_paquete IS NOT NULL)
  ),
  CONSTRAINT ck_lpd_precio CHECK (precio >= 0),
  CONSTRAINT ck_lpd_activo CHECK (activo IN (0,1)),
  INDEX ix_lpd_producto (id_producto),
  INDEX ix_lpd_paquete (id_paquete)
) ENGINE=InnoDB;
