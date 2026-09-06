/**
 * Constantes compartidas del módulo Órdenes de servicio.
 */

export const ESTADOS_ORDEN = Object.freeze({
  EN_REVISION_VENTAS: 'EN_REVISION_VENTAS',
  PENDIENTE_PROGRAMACION: 'PENDIENTE_PROGRAMACION',
  PROGRAMADA: 'PROGRAMADA',
  EN_EJECUCION: 'EN_EJECUCION',
  REALIZADA: 'REALIZADA',
  CANCELADA: 'CANCELADA'
});

export const ESTADO_ORDEN_LABELS = Object.freeze({
  EN_REVISION_VENTAS: 'En revisión de Ventas',
  PENDIENTE_PROGRAMACION: 'Pendiente de programación',
  PROGRAMADA: 'Programada',
  EN_EJECUCION: 'En ejecución',
  REALIZADA: 'Realizada',
  CANCELADA: 'Cancelada'
});

export const ESTADOS_ORDEN_CANCELABLES = Object.freeze([
  ESTADOS_ORDEN.EN_REVISION_VENTAS,
  ESTADOS_ORDEN.PENDIENTE_PROGRAMACION,
  ESTADOS_ORDEN.PROGRAMADA,
  ESTADOS_ORDEN.EN_EJECUCION
]);

export const ESTADOS_ORDEN_TERMINALES = Object.freeze([
  ESTADOS_ORDEN.REALIZADA,
  ESTADOS_ORDEN.CANCELADA
]);

export const TIPOS_COMPROMISO_ORDEN = Object.freeze({
  SOLO_SERVICIOS: 'SOLO_SERVICIOS',
  PRODUCTOS_RENTADOS: 'PRODUCTOS_RENTADOS',
  MIXTA: 'MIXTA'
});

export const TIPO_COMPROMISO_ORDEN_LABELS = Object.freeze({
  SOLO_SERVICIOS: 'Solo servicios',
  PRODUCTOS_RENTADOS: 'Productos rentados',
  MIXTA: 'Mixta'
});

export const ACCIONES_TRAZABILIDAD_ORDEN = Object.freeze({
  GENERACION: 'GENERACION',
  REVISION_VENTAS: 'REVISION_VENTAS',
  CAMBIO_ESTADO: 'CAMBIO_ESTADO',
  CANCELACION: 'CANCELACION'
});

export const PERMISOS_ORDENES = Object.freeze({
  CONSULTAR: 'ordenes.consultar',
  DETALLE_CONSULTAR: 'ordenes.detalle.consultar',
  REVISAR: 'ordenes.revisar',
  CANCELAR: 'ordenes.cancelar',
  ASIGNADAS: 'ordenes.asignadas',

  ORIGEN_COTIZACION_CONSULTAR:
    'ordenes.origen-cotizacion.consultar',

  INVENTARIO_CONSULTAR:
    'ordenes.inventario.consultar',

  LOGISTICA_CONSULTAR:
    'ordenes.logistica.consultar'
});

export function esEstadoOrdenCancelable(estado) {
  return ESTADOS_ORDEN_CANCELABLES.includes(estado);
}

export function esEstadoOrdenTerminal(estado) {
  return ESTADOS_ORDEN_TERMINALES.includes(estado);
}