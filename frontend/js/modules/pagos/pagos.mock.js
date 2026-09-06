/**
 * Datos simulados del módulo Pagos.
 *
 * Este archivo NO debe ser importado
 * directamente por controladores o vistas.
 *
 * Su único consumidor será
 * frontend/js/api/pagos.service.js.
 */

export const cuentasMock = [
  {
    idCotizacion: 3001,
    folioCotizacion:
      'COT-2026-001',

    idVersion: 3101,
    numeroVersion: 1,

    idCliente: 1001,
    nombreCliente:
      'Constructora del Norte',

    vendedorResponsable:
      'María González',

    totalCotizacion: 120000,
    porcentajeRequerido: 50,
    importeRequerido: 60000,

    cotizacionConfirmada: true,

    fechaUltimoMovimiento:
      '2026-09-15T10:20:00',

    resultadoIntegracion: {
      procesado: true,
      exitoso: true,
      fechaHoraProceso:
        '2026-09-10T11:32:00',

      referenciaCotizacionConfirmada:
        'COT-2026-001',

      referenciaReserva:
        'RES-2026-0041',

      referenciaOrdenServicio:
        'OS-2026-0038',

      idAlerta: null,

      mensaje:
        'Proceso completado correctamente.'
    }
  },

  {
    idCotizacion: 3002,
    folioCotizacion:
      'COT-2026-002',

    idVersion: 3102,
    numeroVersion: 2,

    idCliente: 1002,
    nombreCliente:
      'Eventos Monterrey',

    vendedorResponsable:
      'Luis Hernández',

    totalCotizacion: 250000,
    porcentajeRequerido: 50,
    importeRequerido: 125000,

    cotizacionConfirmada: true,

    fechaUltimoMovimiento:
      '2026-09-10T14:05:00',

    resultadoIntegracion: {
      procesado: true,
      exitoso: true,
      fechaHoraProceso:
        '2026-09-10T14:06:00',

      referenciaCotizacionConfirmada:
        'COT-2026-002',

      referenciaReserva:
        'RES-2026-0042',

      referenciaOrdenServicio:
        'OS-2026-0039',

      idAlerta: null,

      mensaje:
        'Proceso completado correctamente.'
    }
  },

  {
    idCotizacion: 3003,
    folioCotizacion:
      'COT-2026-003',

    idVersion: 3103,
    numeroVersion: 1,

    idCliente: 1003,
    nombreCliente:
      'Servicios Logísticos',

    vendedorResponsable:
      'María González',

    totalCotizacion: 95000,
    porcentajeRequerido: 50,
    importeRequerido: 47500,

    cotizacionConfirmada: false,

    fechaUltimoMovimiento:
      '2026-09-12T12:05:00',

    resultadoIntegracion: null
  },

  {
    idCotizacion: 3004,
    folioCotizacion:
      'COT-2026-004',

    idVersion: 3104,
    numeroVersion: 2,

    idCliente: 1004,
    nombreCliente:
      'Industria Reyes',

    vendedorResponsable:
      'Jorge Martínez',

    totalCotizacion: 180000,
    porcentajeRequerido: 50,
    importeRequerido: 90000,

    cotizacionConfirmada: false,

    fechaUltimoMovimiento:
      '2026-09-14T16:11:00',

    resultadoIntegracion: {
      procesado: true,
      exitoso: false,
      fechaHoraProceso:
        '2026-09-14T16:11:00',

      referenciaCotizacionConfirmada:
        null,

      referenciaReserva:
        null,

      referenciaOrdenServicio:
        null,

      idAlerta: 7001,

      mensaje:
        'No fue posible completar el proceso con Cotizaciones.'
    }
  },

  {
    idCotizacion: 3005,
    folioCotizacion:
      'COT-2026-005',

    idVersion: 3105,
    numeroVersion: 1,

    idCliente: 1005,
    nombreCliente:
      'Comercializadora PAE',

    vendedorResponsable:
      'Luis Hernández',

    totalCotizacion: 75000,
    porcentajeRequerido: 50,
    importeRequerido: 37500,

    cotizacionConfirmada: false,

    fechaUltimoMovimiento:
      '2026-09-05T14:21:00',

    resultadoIntegracion: null
  },

  {
    idCotizacion: 3006,
    folioCotizacion:
      'COT-2026-006',

    idVersion: 3106,
    numeroVersion: 1,

    idCliente: 1006,
    nombreCliente:
      'Producciones del Valle',

    vendedorResponsable:
      'Jorge Martínez',

    totalCotizacion: 140000,
    porcentajeRequerido: 40,
    importeRequerido: 56000,

    cotizacionConfirmada: false,

    fechaUltimoMovimiento:
      '2026-08-28T09:12:00',

    resultadoIntegracion: null
  }
];

/**
 * Cotizaciones que el servicio de Pagos
 * puede devolver para registrar pagos.
 *
 * Todas contienen exclusivamente su
 * versión aceptada.
 */
export const cotizacionesHabilitadasMock =
  cuentasMock.map(cuenta => ({
    idCotizacion:
      cuenta.idCotizacion,

    folioCotizacion:
      cuenta.folioCotizacion,

    idVersion:
      cuenta.idVersion,

    numeroVersion:
      cuenta.numeroVersion,

    idCliente:
      cuenta.idCliente,

    nombreCliente:
      cuenta.nombreCliente,

    vendedorResponsable:
      cuenta.vendedorResponsable,

    totalCotizacion:
      cuenta.totalCotizacion,

    porcentajeRequerido:
      cuenta.porcentajeRequerido,

    importeRequerido:
      cuenta.importeRequerido,

    cotizacionConfirmada:
      cuenta.cotizacionConfirmada,

    resultadoIntegracion:
      cuenta.resultadoIntegracion
  }));

export const movimientosMock = [
  {
    idMovimiento: 8001,
    folioMovimiento:
      'PGO-0123',

    tipoMovimiento: 'PAGO',
    idPagoOriginal: null,

    idCotizacion: 3001,
    folioCotizacion:
      'COT-2026-001',

    idVersion: 3101,
    numeroVersion: 1,

    idCliente: 1001,
    nombreCliente:
      'Constructora del Norte',

    fechaPago:
      '2026-09-15',

    fechaHoraRegistro:
      '2026-09-15T10:20:00',

    monto: 50000,

    metodoPago:
      'TRANSFERENCIA',

    referencia:
      'SPEI 8844',

    observaciones: '',

    comprobante: {
      nombreArchivo:
        'comprobante_transferencia.pdf',

      tipoArchivo:
        'application/pdf',

      tamanoBytes: 250880,

      disponibleDuranteSesion: true
    },

    motivoCompensacion: null,

    usuarioResponsable:
      'Ana Pérez'
  },

  {
    idMovimiento: 8002,
    folioMovimiento:
      'PGO-0122',

    tipoMovimiento: 'PAGO',
    idPagoOriginal: null,

    idCotizacion: 3001,
    folioCotizacion:
      'COT-2026-001',

    idVersion: 3101,
    numeroVersion: 1,

    idCliente: 1001,
    nombreCliente:
      'Constructora del Norte',

    fechaPago:
      '2026-09-14',

    fechaHoraRegistro:
      '2026-09-14T12:30:00',

    monto: 30000,

    metodoPago:
      'EFECTIVO',

    referencia:
      'Pago en sucursal',

    observaciones: '',

    comprobante: null,

    motivoCompensacion: null,

    usuarioResponsable:
      'Ana Pérez'
  },

  {
    idMovimiento: 8003,
    folioMovimiento:
      'CMP-0001',

    tipoMovimiento:
      'COMPENSACION',

    idPagoOriginal: 8002,

    idCotizacion: 3001,
    folioCotizacion:
      'COT-2026-001',

    idVersion: 3101,
    numeroVersion: 1,

    idCliente: 1001,
    nombreCliente:
      'Constructora del Norte',

    fechaPago: null,

    fechaHoraRegistro:
      '2026-09-14T12:48:00',

    monto: 5000,

    metodoPago: null,

    referencia: '',

    observaciones:
      'Corrección de monto capturado.',

    comprobante: null,

    motivoCompensacion:
      'Error en el monto capturado.',

    usuarioResponsable:
      'Ana Pérez'
  },

  {
    idMovimiento: 8004,
    folioMovimiento:
      'PGO-0121',

    tipoMovimiento: 'PAGO',
    idPagoOriginal: null,

    idCotizacion: 3003,
    folioCotizacion:
      'COT-2026-003',

    idVersion: 3103,
    numeroVersion: 1,

    idCliente: 1003,
    nombreCliente:
      'Servicios Logísticos',

    fechaPago:
      '2026-09-12',

    fechaHoraRegistro:
      '2026-09-12T12:05:00',

    monto: 25000,

    metodoPago:
      'TRANSFERENCIA',

    referencia:
      'SPEI 6621',

    observaciones: '',

    comprobante: null,

    motivoCompensacion: null,

    usuarioResponsable:
      'Ana Pérez'
  },

  {
    idMovimiento: 8005,
    folioMovimiento:
      'PGO-0120',

    tipoMovimiento: 'PAGO',
    idPagoOriginal: null,

    idCotizacion: 3002,
    folioCotizacion:
      'COT-2026-002',

    idVersion: 3102,
    numeroVersion: 2,

    idCliente: 1002,
    nombreCliente:
      'Eventos Monterrey',

    fechaPago:
      '2026-09-10',

    fechaHoraRegistro:
      '2026-09-10T14:05:00',

    monto: 250000,

    metodoPago:
      'EFECTIVO',

    referencia:
      'Pago en sucursal',

    observaciones: '',

    comprobante: null,

    motivoCompensacion: null,

    usuarioResponsable:
      'Ana Pérez'
  },

  {
    idMovimiento: 8006,
    folioMovimiento:
      'PGO-0119',

    tipoMovimiento: 'PAGO',
    idPagoOriginal: null,

    idCotizacion: 3005,
    folioCotizacion:
      'COT-2026-005',

    idVersion: 3105,
    numeroVersion: 1,

    idCliente: 1005,
    nombreCliente:
      'Comercializadora PAE',

    fechaPago:
      '2026-09-05',

    fechaHoraRegistro:
      '2026-09-05T14:21:00',

    monto: 20000,

    metodoPago:
      'EFECTIVO',

    referencia:
      'Anticipo',

    observaciones: '',

    comprobante: null,

    motivoCompensacion: null,

    usuarioResponsable:
      'Ana Pérez'
  },

  {
    idMovimiento: 8007,
    folioMovimiento:
      'PGO-0118',

    tipoMovimiento: 'PAGO',
    idPagoOriginal: null,

    idCotizacion: 3006,
    folioCotizacion:
      'COT-2026-006',

    idVersion: 3106,
    numeroVersion: 1,

    idCliente: 1006,
    nombreCliente:
      'Producciones del Valle',

    fechaPago:
      '2026-08-28',

    fechaHoraRegistro:
      '2026-08-28T09:12:00',

    monto: 15000,

    metodoPago:
      'TRANSFERENCIA',

    referencia:
      'SPEI 9911',

    observaciones: '',

    comprobante: null,

    motivoCompensacion: null,

    usuarioResponsable:
      'Ana Pérez'
    },

  {
    idMovimiento: 8008,
    folioMovimiento:
      'PGO-0124',

    tipoMovimiento: 'PAGO',
    idPagoOriginal: null,

    idCotizacion: 3004,
    folioCotizacion:
      'COT-2026-004',

    idVersion: 3104,
    numeroVersion: 2,

    idCliente: 1004,
    nombreCliente:
      'Industria Reyes',

    fechaPago:
      '2026-09-14',

    fechaHoraRegistro:
      '2026-09-14T16:10:00',

    monto: 90000,

    metodoPago:
      'TRANSFERENCIA',

    referencia:
      'SPEI 7734',

    observaciones:
      'Pago registrado previo al fallo de integración.',

    comprobante: null,

    motivoCompensacion: null,

    usuarioResponsable:
      'Ana Pérez'
  }
];

export const alertasMock = [
  {
    idAlerta: 7001,
    folioAlerta:
      'ALT-PAG-0001',

    idPago: 8008,
    folioPago:
      'PGO-0124',

    idCotizacion: 3004,
    folioCotizacion:
      'COT-2026-004',

    idVersion: 3104,
    numeroVersion: 2,

    idCliente: 1004,
    nombreCliente:
      'Industria Reyes',

    operacionFallida:
      'CONFIRMAR_COTIZACION',

    descripcionError:
      'No fue posible completar el proceso con Cotizaciones.',

    fechaHora:
      '2026-09-14T16:11:00',

    estado: 'PENDIENTE',

    resultadoConocido:
      'Pago registrado; confirmación no completada.',

    referenciasGeneradas: {
      cotizacionConfirmada: null,
      reservaInventario: null,
      ordenServicio: null
    }
  }
];

/**
 * Registro interno de claves de operación
 * utilizado posteriormente por
 * pagos.service.js para simular
 * idempotencia.
 */
export const operacionesProcesadasMock =
  new Map();

/**
 * Secuencias simuladas para generar
 * identificadores y folios.
 */
export const secuenciasMock = {
  movimiento: 8008,
  pago: 124,
  compensacion: 2,
  alerta: 7002,
  folioAlerta: 2
};

/**
 * Escenarios disponibles para probar
 * integración.
 *
 * No son controles de interfaz.
 * pagos.service.js decidirá cuándo
 * utilizarlos durante las pruebas mock.
 */
export const configuracionMock = {
  latenciaMs: 250,

  integracion: {
    modo:
      'EXITO'
  }
};