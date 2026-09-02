export const DISPONIBILIDAD_ALMACEN_MOCK = [
  {
    idProducto: 1001,
    idAlmacen: 1,
    almacen: 'Almacén Central',
    existenciaFisica: 100,
    cantidadReservada: 25
  },
  {
    idProducto: 1001,
    idAlmacen: 2,
    almacen: 'Almacén Norte',
    existenciaFisica: 50,
    cantidadReservada: 15
  },
  {
    idProducto: 1001,
    idAlmacen: 3,
    almacen: 'Almacén Sur',
    existenciaFisica: 30,
    cantidadReservada: 5
  },
  {
    idProducto: 1002,
    idAlmacen: 1,
    almacen: 'Almacén Central',
    existenciaFisica: 30,
    cantidadReservada: 8
  },
  {
    idProducto: 1002,
    idAlmacen: 2,
    almacen: 'Almacén Norte',
    existenciaFisica: 15,
    cantidadReservada: 5
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
  }
];

export function clonarDatos(datos) {
  return structuredClone(datos);
}

export function simularLatencia(ms = 150) {
  return new Promise(resolve => setTimeout(resolve, ms));
}