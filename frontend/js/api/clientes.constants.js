/**
 * Estados disponibles para un registro
 * de cliente o prospecto.
 */
export const ESTADOS_CLIENTE_PROSPECTO =
  Object.freeze({
    PROSPECTO: 'PROSPECTO',
    CLIENTE: 'CLIENTE',
    PROSPECTO_REVISADO:
      'PROSPECTO_REVISADO'
  });

/**
 * Etiquetas visibles correspondientes
 * a los estados internos.
 */
export const ESTADO_LABELS =
  Object.freeze({
    PROSPECTO: 'Prospecto',
    CLIENTE: 'Cliente',
    PROSPECTO_REVISADO:
      'Prospecto revisado'
  });

/**
 * Tipos de medio de contacto
 * definidos actualmente.
 */
export const TIPOS_MEDIO_CONTACTO =
  Object.freeze({
    TELEFONO: 'TELEFONO',
    EMAIL: 'EMAIL',
    CELULAR: 'CELULAR'
  });

/**
 * Etiquetas visibles de los medios
 * de contacto.
 */
export const TIPO_MEDIO_CONTACTO_LABELS =
  Object.freeze({
    TELEFONO: 'Teléfono',
    EMAIL: 'E-mail',
    CELULAR: 'Celular'
  });

export const ESTADOS_COTIZACION =
  Object.freeze({
    BORRADOR: 'BORRADOR',
    ENVIADA: 'ENVIADA',
    ACEPTADA: 'ACEPTADA',
    RECHAZADA: 'RECHAZADA'
  });

export const DEFAULT_PAGE_SIZE = 10;