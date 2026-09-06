import {
  ACCIONES_TRAZABILIDAD_ORDEN,
  ESTADOS_ORDEN,
  TIPOS_COMPROMISO_ORDEN
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

    visibleEnModuloOrdenes: true,

    estadoOrden:
      ESTADOS_ORDEN.EN_REVISION_VENTAS,

    /*
    * Snapshot comercial.
    *
    * Cotización origen:
    * COTMR-26-000018 / id 9103
    * versión elegida 91031.
    */
    cliente:
      'Mariana López Hernández',

    contactoEvento:
      '81 1234 5678',

    evento:
      'Boda',

    fechaHoraEvento:
      '2026-09-12T16:00:00',

    /*
    * La información actual de Cotizaciones
    * y Clientes no contiene domicilio del evento.
    * Se conserva null para que la UI muestre
    * "No informado" y no una dirección ficticia.
    */
    domicilioEvento: null,

    observaciones: null,

    /*
    * El Paquete Corporativo contiene
    * productos y servicios.
    */
    tipoCompromiso:
      TIPOS_COMPROMISO_ORDEN.MIXTA,

    /*
    * En este mock la generación se representa
    * asociada al momento de confirmación de la
    * cotización origen.
    */
    fechaGeneracion:
      '2026-09-01T13:05:00',

    fechaUltimaActualizacion:
      '2026-09-01T13:05:00',

    cotizacionOrigen: {
      idCotizacion: 9103,

      folio:
        'COTMR-26-000018',

      idVersionConfirmada:
        91031,

      versionConfirmada:
        'V1',

      fechaConfirmacion:
        '2026-09-01T13:05:00',

      referenciaPago:
        'PAGO-COT-9103'
    },

    /*
    * Snapshot del compromiso.
    *
    * La versión confirmada contiene
    * el Paquete Corporativo.
    *
    * Su composición se conserva aquí para
    * que Detalle y Revisión puedan mostrar
    * claramente qué incluye el paquete
    * sin aparentar que son conceptos
    * independientes adicionales.
    */
    detalleComprometido: {
      productos: [],

      servicios: [],

      paquetes: [
        {
          idPaquete: 3001,

          nombre:
            'Paquete Corporativo',

          cantidad: 1,

          composicion: {
            productos: [
              {
                idProducto: 1001,
                nombre:
                  'Silla Windsor',
                cantidad: 10
              },
              {
                idProducto: 1002,
                nombre:
                  'Mesa Redonda',
                cantidad: 2
              },
              {
                idProducto: 1005,
                nombre:
                  'Mantel de Lino',
                cantidad: 5
              }
            ],

            servicios: [
              {
                idServicio: 2001,
                nombre:
                  'Banquete Ejecutivo',
                cantidad: 1
              },
              {
                idServicio: 2002,
                nombre:
                  'Decoración Elegante',
                cantidad: 1
              },
              {
                idServicio: 2003,
                nombre:
                  'Flete y Logística',
                cantidad: 1
              }
            ]
          }
        }
      ]
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

    trazabilidad: [
      {
        fechaHora:
          '2026-09-01T13:05:00',

        usuario:
          'Encargado de Ventas',

        accion:
          ACCIONES_TRAZABILIDAD_ORDEN
            .GENERACION,

        estadoAnterior: null,

        estadoNuevo:
          ESTADOS_ORDEN
            .EN_REVISION_VENTAS,

        comentario:
          'Orden generada desde la cotización confirmada COTMR-26-000018, versión V1.'
      }
    ],

    /*
    * Compatibilidad legacy con Inventario.
    * No modificar estos contratos en esta
    * corrección visual.
    */
    direccionEntrega:
      'Evento A',

    fechaEntrega:
      '2026-09-12T08:00:00',

    fechaRecoleccion:
      '2026-09-14T22:00:00',

    estado: 'CONFIRMADA',
    estatus: 'Confirmada',
    cancelada: false
  },

  {
    id: 5002,
    idOrdenServicio: 5002,
    folio: 'ORD-2026-002',
    visibleEnModuloOrdenes: false,
    
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

    trazabilidad: [
      {
        fechaHora: null,
        usuario: null,

        accion:
          ACCIONES_TRAZABILIDAD_ORDEN
            .GENERACION,

        estadoAnterior: null,

        estadoNuevo:
          ESTADOS_ORDEN
            .EN_REVISION_VENTAS,

        comentario:
          'Orden generada desde la cotización confirmada.'
      }
    ],

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