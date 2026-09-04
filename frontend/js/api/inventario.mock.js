/**
 * Datos mock del módulo Inventario.
 *
 * La operación actual considera un solo almacén: Almacén Central.
 * La estructura conserva idAlmacen para permitir crecimiento futuro
 * sin modificar los contratos de los servicios.
 */

export const DISPONIBILIDAD_ALMACEN_MOCK = [
  {
    idInventario: 5001,
    idProducto: 1001,
    idAlmacen: 1,
    almacen: 'Almacén Central',
    existenciaFisica: 80,
    cantidadReservada: 0,
    fechaActualizacion:
      '2026-09-02T15:10:00'
  },
  {
    idInventario: 5002,
    idProducto: 1002,
    idAlmacen: 1,
    almacen: 'Almacén Central',
    existenciaFisica: 45,
    cantidadReservada: 0,
    fechaActualizacion:
      '2026-09-02T14:45:00'
  },
  {
    idInventario: 5003,
    idProducto: 1003,
    idAlmacen: 1,
    almacen: 'Almacén Central',
    existenciaFisica: 200,
    cantidadReservada: 0,
    fechaActualizacion:
      '2026-09-02T13:30:00'
  },
  {
    idInventario: 5005,
    idProducto: 1005,
    idAlmacen: 1,
    almacen: 'Almacén Central',
    existenciaFisica: 75,
    cantidadReservada: 0,
    fechaActualizacion:
      '2026-09-02T12:50:00'
  }
];

export const LIMITES_INVENTARIO_MOCK = [
  {
    idProducto: 1001,
    minimo: 40,
    maximo: 150,
    fechaUltimaModificacion: '2026-09-02T15:00:00',
    usuarioUltimaModificacion: 'Administrador'
  },
  {
    idProducto: 1002,
    minimo: 10,
    maximo: 60,
    fechaUltimaModificacion: '2026-09-01T11:30:00',
    usuarioUltimaModificacion: 'Responsable de Inventario'
  },
  {
    idProducto: 1003,
    minimo: 50,
    maximo: 250,
    fechaUltimaModificacion: '2026-08-30T09:20:00',
    usuarioUltimaModificacion: 'Responsable de Inventario'
  },
  {
    idProducto: 1005,
    minimo: 20,
    maximo: 100,
    fechaUltimaModificacion: '2026-08-28T16:45:00',
    usuarioUltimaModificacion: 'Administrador'
  }
];

export const MOVIMIENTOS_INVENTARIO_MOCK = [
  {
    idMovimiento: 1,
    idProducto: 1001,
    tipo: 'ENTRADA',
    cantidad: 80,
    fecha: '2026-09-01T09:00:00',
    motivo: 'Carga inicial de inventario',
    folioOrden: null,
    usuario: 'Administrador'
  }
];

export const RESERVAS_FUTURAS_MOCK = [
  {
    idReserva: 1,
    folioReserva:
      'RES-2026-001',

    idOrden: 5001,
    folioOrden:
      'ORD-2026-001',

    estadoOrden:
      'CONFIRMADA',

    cliente:
      'Cliente A',

    evento:
      'Evento A',

    direccionEvento:
      'Evento A',

    idProducto: 1001,
    idAlmacen: 1,

    cantidadReservada: 20,

    fechaInicio:
      '2026-09-12',

    fechaFin:
      '2026-09-14',

    estado:
      'CONFIRMADA',

    fechaGeneracion:
      '2026-09-02T10:00:00',

    usuarioGeneracion:
      'Responsable de Inventario',

    fechaUltimaModificacion:
      '2026-09-02T10:00:00',

    usuarioUltimaModificacion:
      'Responsable de Inventario',

    referenciaSalida:
      null
  },
  {
    idReserva: 2,
    folioReserva:
      'RES-2026-002',

    idOrden: 5002,
    folioOrden:
      'ORD-2026-002',

    estadoOrden:
      'CONFIRMADA',

    cliente:
      'Cliente B',

    evento:
      'Evento B',

    direccionEvento:
      'Evento B',

    idProducto: 1001,
    idAlmacen: 1,

    cantidadReservada: 15,

    fechaInicio:
      '2026-09-13',

    fechaFin:
      '2026-09-15',

    estado:
      'CONFIRMADA',

    fechaGeneracion:
      '2026-09-02T10:15:00',

    usuarioGeneracion:
      'Responsable de Inventario',

    fechaUltimaModificacion:
      '2026-09-02T10:15:00',

    usuarioUltimaModificacion:
      'Responsable de Inventario',

    referenciaSalida:
      null
  },
  {
    idReserva: 3,
    folioReserva:
      'RES-2026-003',

    idOrden: 5003,
    folioOrden:
      'ORD-2026-003',

    estadoOrden:
      'CANCELADA',

    cliente:
      'Cliente C',

    evento:
      'Evento C',

    direccionEvento:
      'Evento C',

    idProducto: 1002,
    idAlmacen: 1,

    cantidadReservada: 8,

    fechaInicio:
      '2026-09-12',

    fechaFin:
      '2026-09-13',

    estado:
      'CANCELADA',

    motivoCancelacion:
      'Reserva cancelada'
  },
  {
    idReserva: 4,
    folioReserva:
      'RES-2026-004',

    idOrden: 5001,
    folioOrden:
      'ORD-2026-001',

    estadoOrden:
      'CONFIRMADA',

    cliente:
      'Cliente A',

    evento:
      'Evento A',

    direccionEvento:
      'Evento A',

    idProducto: 1002,
    idAlmacen: 1,

    cantidadReservada: 8,

    fechaInicio:
      '2026-09-12',

    fechaFin:
      '2026-09-14',

    estado:
      'CONFIRMADA',

    fechaGeneracion:
      '2026-09-02T10:20:00',

    usuarioGeneracion:
      'Responsable de Inventario',

    fechaUltimaModificacion:
      '2026-09-02T10:20:00',

    usuarioUltimaModificacion:
      'Responsable de Inventario',

    referenciaSalida:
      null
  },
  {
    idReserva: 5,
    folioReserva:
      'RES-2026-005',

    idOrden: 5001,
    folioOrden:
      'ORD-2026-001',

    estadoOrden:
      'CONFIRMADA',

    cliente:
      'Cliente A',

    evento:
      'Evento A',

    direccionEvento:
      'Evento A',

    idProducto: 1005,
    idAlmacen: 1,

    cantidadReservada: 5,

    fechaInicio:
      '2026-09-12',

    fechaFin:
      '2026-09-14',

    estado:
      'CONFIRMADA',

    fechaGeneracion:
      '2026-09-02T10:25:00',

    usuarioGeneracion:
      'Responsable de Inventario',

    fechaUltimaModificacion:
      '2026-09-02T10:25:00',

    usuarioUltimaModificacion:
      'Responsable de Inventario',

    referenciaSalida:
      null
  }
];

export function clonarDatosInventario(datos) {
  return structuredClone(datos);
}

export function simularLatenciaInventario(ms = 150) {
  return new Promise(resolve => {
    window.setTimeout(resolve, ms);
  });
}