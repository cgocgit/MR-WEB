import {
  ESTADOS_ORDEN
} from './ordenes.constants.js';

/**
 * Datos mock propios de Órdenes de servicio.
 *
 * Se conservan los identificadores y campos legacy que ya utilizan
 * Inventario y Logística para no romper las implementaciones existentes.
 *
 * Los datos que la rama actual todavía no proporciona se mantienen
 * explícitamente como null o colecciones vacías. No se fabrican vínculos
 * con Cotizaciones, Clientes, Pagos, Inventario o Logística.
 */
const ORDENES_INICIALES = [
  {
    id: 5001,
    idOrdenServicio: 5001,
    folio: 'ORD-2026-001',

    estadoOrden:
      ESTADOS_ORDEN.EN_REVISION_VENTAS,

    cliente: 'Cliente A',
    contactoEvento: null,
    evento: 'Evento A',
    fechaHoraEvento: null,
    domicilioEvento: 'Evento A',
    observaciones: null,
    tipoCompromiso: null,

    fechaGeneracion: null,
    fechaUltimaActualizacion: null,

    cotizacionOrigen: {
      idCotizacion: null,
      folio: null,
      idVersionConfirmada: null,
      versionConfirmada: null,
      fechaConfirmacion: null,
      referenciaPago: null
    },

    detalleComprometido: {
      productos: [],
      servicios: [],
      paquetes: []
    },

    inventarioRelacionado: null,
    logisticaRelacionada: null,

    asignacionesOperativas: [
      {
        usuario: 'tech',
        tipo: 'OPERATIVO'
      },
      {
        usuario: 'tecnico',
        tipo: 'OPERATIVO'
      }
    ],

    revisionVentas: null,
    cancelacion: null,
    trazabilidad: [],

    /*
     * Compatibilidad con las funciones existentes consumidas
     * por Inventario.
     */
    direccionEntrega: 'Evento A',
    fechaEntrega: '2026-09-12T08:00:00',
    fechaRecoleccion: '2026-09-14T22:00:00',
    estado: 'CONFIRMADA',
    estatus: 'Confirmada',
    cancelada: false
  },

  {
    id: 5002,
    idOrdenServicio: 5002,
    folio: 'ORD-2026-002',

    estadoOrden:
      ESTADOS_ORDEN.EN_REVISION_VENTAS,

    cliente: 'Cliente B',
    contactoEvento: null,
    evento: 'Evento B',
    fechaHoraEvento: null,
    domicilioEvento: 'Evento B',
    observaciones: null,
    tipoCompromiso: null,

    fechaGeneracion: null,
    fechaUltimaActualizacion: null,

    cotizacionOrigen: {
      idCotizacion: null,
      folio: null,
      idVersionConfirmada: null,
      versionConfirmada: null,
      fechaConfirmacion: null,
      referenciaPago: null
    },

    detalleComprometido: {
      productos: [],
      servicios: [],
      paquetes: []
    },

    inventarioRelacionado: null,
    logisticaRelacionada: null,

    asignacionesOperativas: [],

    revisionVentas: null,
    cancelacion: null,
    trazabilidad: [],

    /*
     * Compatibilidad con las funciones existentes consumidas
     * por Inventario.
     */
    direccionEntrega: 'Evento B',
    fechaEntrega: '2026-09-13T08:00:00',
    fechaRecoleccion: '2026-09-15T22:00:00',
    estado: 'CONFIRMADA',
    estatus: 'Confirmada',
    cancelada: false
  }
];

function clone(value) {
  if (typeof structuredClone === 'function') {
    return structuredClone(value);
  }

  return JSON.parse(
    JSON.stringify(value)
  );
}

/**
 * Genera un estado independiente para el servicio mock.
 * Al recargar la aplicación se recuperan los datos iniciales.
 */
export function createOrdenesMockState() {
  return {
    ordenes: clone(ORDENES_INICIALES)
  };
}