ALTER TABLE etapa_logistica
  ADD COLUMN duracion_prevista_minutos SMALLINT UNSIGNED NULL AFTER tolerancia_aplicada_minutos,
  ADD CONSTRAINT ck_etapa_duracion_prevista CHECK (duracion_prevista_minutos IS NULL OR duracion_prevista_minutos > 0);
