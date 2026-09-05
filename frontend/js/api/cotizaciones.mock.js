import {
  DISPONIBILIDAD_COTIZACION,
  ESTADOS_COTIZACION_GENERAL,
  ESTADOS_VERSION_COTIZACION,
  TIPOS_CONCEPTO_COTIZACION
} from './cotizaciones.constants.js';

/**
 * Datos mock propios de Cotizaciones.
 *
 * Los registros conservan referencias a Clientes/Prospectos,
 * Catálogo y Listas de Precios mediante sus identificadores.
 * No duplican la administración de esas entidades.
 */
const COTIZACIONES_INICIALES = [
  {
    idCotizacion: 9101,
    ejercicio: 2026,
    consecutivo: 21,
    idClienteProspecto: 104,
    evento: 'Evento empresarial',
    fechaEvento: '2026-09-20',
    horaEvento: '17:00',
    porcentajeConfirmacion: 50,
    estadoGeneral:
      ESTADOS_COTIZACION_GENERAL.EN_SEGUIMIENTO,
    idVersionElegida: 91012,

    responsable: {
      idUsuario: 5001,
      nombre: 'Carlos Olvera'
    },

    motivoCancelacion: null,
    motivoRechazo: null,

    fechaCreacion:
      '2026-08-18T10:15:00',

    fechaActualizacion:
      '2026-09-02T16:45:00',

    versiones: [
      {
        idVersion: 91011,
        numeroVersion: 1,
        idListaPrecio: 6001,

        estadoVersion:
          ESTADOS_VERSION_COTIZACION.ENVIADA,

        elegida: false,

        disponibilidadGlobal:
          DISPONIBILIDAD_COTIZACION.DISPONIBLE,

        importeConceptos: 3650,
        descuentos: 0,
        impuestos: 0,
        cargos: 0,
        total: 3650,

        fechaCreacion:
          '2026-08-18T10:15:00',

        fechaEnvio:
          '2026-08-19T09:30:00',

        usuarioCreador:
          'Carlos Olvera',

        detalle: [
          {
            idDetalle: 910111,

            tipoConcepto:
              TIPOS_CONCEPTO_COTIZACION.PRODUCTO,

            idProducto: 1001,
            idServicio: null,
            idPaquete: null,

            descripcionHistorica:
              'Silla Windsor',

            cantidad: 50,

            precioBase: 45,
            precioLista: 40,
            porcentajeAdicional: 0,
            precioAplicado: 40,

            subtotal: 2000,

            disponibilidad:
              DISPONIBILIDAD_COTIZACION.DISPONIBLE
          },

          {
            idDetalle: 910112,

            tipoConcepto:
              TIPOS_CONCEPTO_COTIZACION.PRODUCTO,

            idProducto: 1002,
            idServicio: null,
            idPaquete: null,

            descripcionHistorica:
              'Mesa Redonda',

            cantidad: 10,

            precioBase: 125,
            precioLista: 115,
            porcentajeAdicional: 0,
            precioAplicado: 115,

            subtotal: 1150,

            disponibilidad:
              DISPONIBILIDAD_COTIZACION.DISPONIBLE
          },

          {
            idDetalle: 910113,

            tipoConcepto:
              TIPOS_CONCEPTO_COTIZACION.SERVICIO,

            idProducto: null,
            idServicio: 2002,
            idPaquete: null,

            descripcionHistorica:
              'Decoración Elegante',

            cantidad: 1,

            precioBase: 500,
            precioLista: 500,
            porcentajeAdicional: 0,
            precioAplicado: 500,

            subtotal: 500,

            disponibilidad:
              DISPONIBILIDAD_COTIZACION.DISPONIBLE
          }
        ]
      },

      {
        idVersion: 91012,
        numeroVersion: 2,
        idListaPrecio: 6002,

        estadoVersion:
          ESTADOS_VERSION_COTIZACION.ENVIADA,

        elegida: true,

        disponibilidadGlobal:
          DISPONIBILIDAD_COTIZACION.DISPONIBLE,

        importeConceptos: 3550,
        descuentos: 0,
        impuestos: 0,
        cargos: 0,
        total: 3550,

        fechaCreacion:
          '2026-08-21T11:00:00',

        fechaEnvio:
          '2026-08-21T16:20:00',

        usuarioCreador:
          'Carlos Olvera',

        detalle: [
          {
            idDetalle: 910121,

            tipoConcepto:
              TIPOS_CONCEPTO_COTIZACION.PRODUCTO,

            idProducto: 1001,
            idServicio: null,
            idPaquete: null,

            descripcionHistorica:
              'Silla Windsor',

            cantidad: 50,

            precioBase: 45,
            precioLista: 42,
            porcentajeAdicional: 0,
            precioAplicado: 42,

            subtotal: 2100,

            disponibilidad:
              DISPONIBILIDAD_COTIZACION.DISPONIBLE
          },

          {
            idDetalle: 910122,

            tipoConcepto:
              TIPOS_CONCEPTO_COTIZACION.PRODUCTO,

            idProducto: 1003,
            idServicio: null,
            idPaquete: null,

            descripcionHistorica:
              'Arreglo Floral Premium',

            cantidad: 10,

            precioBase: 0,
            precioLista: 95,
            porcentajeAdicional: 0,
            precioAplicado: 95,

            subtotal: 950,

            disponibilidad:
              DISPONIBILIDAD_COTIZACION.DISPONIBLE
          },

          {
            idDetalle: 910123,

            tipoConcepto:
              TIPOS_CONCEPTO_COTIZACION.SERVICIO,

            idProducto: null,
            idServicio: 2002,
            idPaquete: null,

            descripcionHistorica:
              'Decoración Elegante',

            cantidad: 1,

            precioBase: 500,
            precioLista: 500,
            porcentajeAdicional: 0,
            precioAplicado: 500,

            subtotal: 500,

            disponibilidad:
              DISPONIBILIDAD_COTIZACION.DISPONIBLE
          }
        ]
      },

      {
        idVersion: 91013,
        numeroVersion: 3,
        idListaPrecio: 6001,

        estadoVersion:
          ESTADOS_VERSION_COTIZACION.BORRADOR,

        elegida: false,

        disponibilidadGlobal:
          DISPONIBILIDAD_COTIZACION.INCOMPLETO,

        importeConceptos: 2900,
        descuentos: 0,
        impuestos: 0,
        cargos: 0,
        total: 2900,

        fechaCreacion:
          '2026-09-02T16:45:00',

        fechaEnvio: null,

        usuarioCreador:
          'Carlos Olvera',

        detalle: [
          {
            idDetalle: 910131,

            tipoConcepto:
              TIPOS_CONCEPTO_COTIZACION.PRODUCTO,

            idProducto: 1001,
            idServicio: null,
            idPaquete: null,

            descripcionHistorica:
              'Silla Windsor',

            cantidad: 50,

            precioBase: 45,
            precioLista: 40,
            porcentajeAdicional: 0,
            precioAplicado: 40,

            subtotal: 2000,

            disponibilidad:
              DISPONIBILIDAD_COTIZACION.INCOMPLETO
          },

          {
            idDetalle: 910132,

            tipoConcepto:
              TIPOS_CONCEPTO_COTIZACION.PRODUCTO,

            idProducto: 1005,
            idServicio: null,
            idPaquete: null,

            descripcionHistorica:
              'Mantel de Lino',

            cantidad: 30,

            precioBase: 35,
            precioLista: 30,
            porcentajeAdicional: 0,
            precioAplicado: 30,

            subtotal: 900,

            disponibilidad:
              DISPONIBILIDAD_COTIZACION.DISPONIBLE
          }
        ]
      }
    ],

    historial: [
      {
        idHistorial: 1,
        tipo: 'COTIZACION_CREADA',

        descripcion:
          'Se creó la cotización general y la versión V1.',

        usuario:
          'Carlos Olvera',

        fechaHora:
          '2026-08-18T10:15:00'
      },

      {
        idHistorial: 2,
        tipo: 'VERSION_ENVIADA',

        descripcion:
          'La versión V1 fue enviada.',

        usuario:
          'Carlos Olvera',

        fechaHora:
          '2026-08-19T09:30:00'
      },

      {
        idHistorial: 3,
        tipo: 'VERSION_ENVIADA',

        descripcion:
          'La versión V2 fue enviada.',

        usuario:
          'Carlos Olvera',

        fechaHora:
          '2026-08-21T16:20:00'
      },

      {
        idHistorial: 4,
        tipo: 'VERSION_ELEGIDA',

        descripcion:
          'La versión V2 fue marcada como elegida.',

        usuario:
          'Carlos Olvera',

        fechaHora:
          '2026-08-22T12:10:00'
      },

      {
        idHistorial: 5,
        tipo: 'VERSION_CREADA',

        descripcion:
          'Se creó la versión V3 en borrador.',

        usuario:
          'Carlos Olvera',

        fechaHora:
          '2026-09-02T16:45:00'
      }
    ]
  },

  {
    idCotizacion: 9102,
    ejercicio: 2026,
    consecutivo: 22,
    idClienteProspecto: 102,

    evento:
      'XV años',

    fechaEvento:
      '2026-10-10',

    horaEvento:
      '18:00',

    porcentajeConfirmacion: 50,

    estadoGeneral:
      ESTADOS_COTIZACION_GENERAL.BORRADOR,

    idVersionElegida: null,

    responsable: {
      idUsuario: 5001,
      nombre: 'Carlos Olvera'
    },

    motivoCancelacion: null,
    motivoRechazo: null,

    fechaCreacion:
      '2026-09-03T11:20:00',

    fechaActualizacion:
      '2026-09-03T11:20:00',

    versiones: [
      {
        idVersion: 91021,
        numeroVersion: 1,
        idListaPrecio: 6001,

        estadoVersion:
          ESTADOS_VERSION_COTIZACION.BORRADOR,

        elegida: false,

        disponibilidadGlobal: null,

        importeConceptos: 0,
        descuentos: 0,
        impuestos: 0,
        cargos: 0,
        total: 0,

        fechaCreacion:
          '2026-09-03T11:20:00',

        fechaEnvio: null,

        usuarioCreador:
          'Carlos Olvera',

        detalle: []
      }
    ],

    historial: [
      {
        idHistorial: 6,

        tipo:
          'COTIZACION_CREADA',

        descripcion:
          'Se creó la cotización general y la versión V1.',

        usuario:
          'Carlos Olvera',

        fechaHora:
          '2026-09-03T11:20:00'
      }
    ]
  },

  {
    idCotizacion: 9103,
    ejercicio: 2026,
    consecutivo: 18,
    idClienteProspecto: 101,

    evento:
      'Boda',

    fechaEvento:
      '2026-09-12',

    horaEvento:
      '16:00',

    porcentajeConfirmacion: 50,

    estadoGeneral:
      ESTADOS_COTIZACION_GENERAL.CONFIRMADA,

    idVersionElegida: 91031,

    responsable: {
      idUsuario: 5002,
      nombre: 'Encargado de Ventas'
    },

    motivoCancelacion: null,
    motivoRechazo: null,

    fechaCreacion:
      '2026-08-10T09:00:00',

    fechaActualizacion:
      '2026-09-01T13:05:00',

    versiones: [
      {
        idVersion: 91031,
        numeroVersion: 1,
        idListaPrecio: 6001,

        estadoVersion:
          ESTADOS_VERSION_COTIZACION.ENVIADA,

        elegida: true,

        disponibilidadGlobal:
          DISPONIBILIDAD_COTIZACION.DISPONIBLE,

        importeConceptos: 2500,
        descuentos: 0,
        impuestos: 0,
        cargos: 0,
        total: 2500,

        fechaCreacion:
          '2026-08-10T09:00:00',

        fechaEnvio:
          '2026-08-10T12:30:00',

        usuarioCreador:
          'Encargado de Ventas',

        detalle: [
          {
            idDetalle: 910311,

            tipoConcepto:
              TIPOS_CONCEPTO_COTIZACION.PAQUETE,

            idProducto: null,
            idServicio: null,
            idPaquete: 3001,

            descripcionHistorica:
              'Paquete Corporativo',

            cantidad: 1,

            precioBase: 2500,
            precioLista: 2500,
            porcentajeAdicional: 0,
            precioAplicado: 2500,

            subtotal: 2500,

            disponibilidad:
              DISPONIBILIDAD_COTIZACION.DISPONIBLE
          }
        ]
      }
    ],

    historial: []
  },

  {
    idCotizacion: 9104,
    ejercicio: 2026,
    consecutivo: 17,
    idClienteProspecto: 105,

    evento:
      'Graduación',

    fechaEvento:
      '2026-09-25',

    horaEvento:
      '20:00',

    porcentajeConfirmacion: 50,

    estadoGeneral:
      ESTADOS_COTIZACION_GENERAL.RECHAZADA,

    idVersionElegida: null,

    responsable: {
      idUsuario: 5001,
      nombre: 'Carlos Olvera'
    },

    motivoCancelacion: null,

    motivoRechazo:
      'El prospecto eligió otra propuesta comercial.',

    fechaCreacion:
      '2026-08-22T14:00:00',

    fechaActualizacion:
      '2026-09-01T10:30:00',

    versiones: [
      {
        idVersion: 91041,
        numeroVersion: 1,
        idListaPrecio: 6001,

        estadoVersion:
          ESTADOS_VERSION_COTIZACION.ENVIADA,

        elegida: false,

        disponibilidadGlobal:
          DISPONIBILIDAD_COTIZACION.DISPONIBLE,

        importeConceptos: 1750,
        descuentos: 0,
        impuestos: 0,
        cargos: 0,
        total: 1750,

        fechaCreacion:
          '2026-08-22T14:00:00',

        fechaEnvio:
          '2026-08-23T09:00:00',

        usuarioCreador:
          'Carlos Olvera',

        detalle: []
      }
    ],

    historial: []
  },

  {
    idCotizacion: 9105,
    ejercicio: 2026,
    consecutivo: 16,
    idClienteProspecto: 103,

    evento:
      'Evento social',

    fechaEvento:
      '2026-09-01',

    horaEvento:
      '12:00',

    porcentajeConfirmacion: 50,

    estadoGeneral:
      ESTADOS_COTIZACION_GENERAL.VENCIDA,

    idVersionElegida: 91051,

    responsable: {
      idUsuario: 5001,
      nombre: 'Carlos Olvera'
    },

    motivoCancelacion: null,
    motivoRechazo: null,

    fechaCreacion:
      '2026-08-15T10:00:00',

    fechaActualizacion:
      '2026-09-01T12:00:00',

    versiones: [
      {
        idVersion: 91051,
        numeroVersion: 1,
        idListaPrecio: 6001,

        estadoVersion:
          ESTADOS_VERSION_COTIZACION.ENVIADA,

        elegida: true,

        disponibilidadGlobal:
          DISPONIBILIDAD_COTIZACION.DISPONIBLE,

        importeConceptos: 1200,
        descuentos: 0,
        impuestos: 0,
        cargos: 0,
        total: 1200,

        fechaCreacion:
          '2026-08-15T10:00:00',

        fechaEnvio:
          '2026-08-15T13:30:00',

        usuarioCreador:
          'Carlos Olvera',

        detalle: []
      }
    ],

    historial: []
  },

  {
    idCotizacion: 9106,
    ejercicio: 2026,
    consecutivo: 15,
    idClienteProspecto: 106,

    evento:
      'Cumpleaños',

    fechaEvento:
      '2026-09-18',

    horaEvento:
      '15:00',

    porcentajeConfirmacion: 50,

    estadoGeneral:
      ESTADOS_COTIZACION_GENERAL.CANCELADA,

    idVersionElegida: 91061,

    responsable: {
      idUsuario: 5001,
      nombre: 'Carlos Olvera'
    },

    motivoCancelacion:
      'El cliente solicitó cancelar el evento.',

    motivoRechazo: null,

    fechaCreacion:
      '2026-08-12T09:10:00',

    fechaActualizacion:
      '2026-08-30T18:20:00',

    versiones: [
      {
        idVersion: 91061,
        numeroVersion: 1,
        idListaPrecio: 6001,

        estadoVersion:
          ESTADOS_VERSION_COTIZACION.ENVIADA,

        elegida: true,

        disponibilidadGlobal:
          DISPONIBILIDAD_COTIZACION.DISPONIBLE,

        importeConceptos: 980,
        descuentos: 0,
        impuestos: 0,
        cargos: 0,
        total: 980,

        fechaCreacion:
          '2026-08-12T09:10:00',

        fechaEnvio:
          '2026-08-12T12:00:00',

        usuarioCreador:
          'Carlos Olvera',

        detalle: []
      }
    ],

    historial: []
  }
];

function clone(value) {
  if (
    typeof structuredClone ===
    'function'
  ) {
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
export function createCotizacionesMockState() {
  return {
    cotizaciones:
      clone(COTIZACIONES_INICIALES)
  };
}