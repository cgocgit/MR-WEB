/**
 * Constantes compartidas del módulo Cotizaciones.
 *
 * Mantiene separados los estados de la cotización general
 * y los estados propios de cada versión.
 */

export const ESTADOS_COTIZACION_GENERAL = Object.freeze({
  BORRADOR: 'BORRADOR',
  EN_SEGUIMIENTO: 'EN_SEGUIMIENTO',
  CONFIRMADA: 'CONFIRMADA',
  CANCELADA: 'CANCELADA',
  RECHAZADA: 'RECHAZADA',
  VENCIDA: 'VENCIDA'
});

export const ESTADO_COTIZACION_GENERAL_LABELS = Object.freeze({
  BORRADOR: 'Borrador',
  EN_SEGUIMIENTO: 'En seguimiento',
  CONFIRMADA: 'Confirmada',
  CANCELADA: 'Cancelada',
  RECHAZADA: 'Rechazada',
  VENCIDA: 'Vencida'
});

export const ESTADOS_VERSION_COTIZACION = Object.freeze({
  BORRADOR: 'BORRADOR',
  ENVIADA: 'ENVIADA'
});

export const ESTADO_VERSION_COTIZACION_LABELS = Object.freeze({
  BORRADOR: 'Borrador',
  ENVIADA: 'Enviada'
});

export const DISPONIBILIDAD_COTIZACION = Object.freeze({
  DISPONIBLE: 'DISPONIBLE',
  INCOMPLETO: 'INCOMPLETO'
});

export const DISPONIBILIDAD_COTIZACION_LABELS = Object.freeze({
  DISPONIBLE: 'Disponible',
  INCOMPLETO: 'No disponible / Incompleto'
});

export const TIPOS_CONCEPTO_COTIZACION = Object.freeze({
  PRODUCTO: 'PRODUCTO',
  SERVICIO: 'SERVICIO',
  PAQUETE: 'PAQUETE',
  CARGO: 'CARGO',
  DESCUENTO: 'DESCUENTO'
});

export const TIPO_CONCEPTO_COTIZACION_LABELS = Object.freeze({
  PRODUCTO: 'Producto',
  SERVICIO: 'Servicio',
  PAQUETE: 'Paquete',
  CARGO: 'Cargo',
  DESCUENTO: 'Descuento'
});

export const PERMISOS_COTIZACIONES = Object.freeze({
  CONSULTAR: 'cotizaciones.consultar',
  GESTIONAR: 'cotizaciones.gestionar'
});

export const CONFIG_COTIZACIONES = Object.freeze({
  PREFIJO_FOLIO: 'COTMR',
  DIGITOS_CONSECUTIVO: 6,
  TAMANIO_PAGINA: 10,
  TIEMPO_MAXIMO_DISPONIBILIDAD_MS: 3000
});

export const ESTADOS_TERMINALES_COTIZACION = Object.freeze([
  ESTADOS_COTIZACION_GENERAL.CANCELADA,
  ESTADOS_COTIZACION_GENERAL.RECHAZADA,
  ESTADOS_COTIZACION_GENERAL.VENCIDA
]);