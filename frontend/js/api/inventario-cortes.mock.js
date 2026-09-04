/**
 * Datos mock para Corte físico de Inventario.
 *
 * La operación actual se realiza exclusivamente
 * sobre Almacén Central.
 */

export const ALMACEN_CORTE_FISICO = Object.freeze({
  idAlmacen: 1,
  nombre: 'Almacén Central'
});

export const CORTES_FISICOS_MOCK = [
  {
    idCorte: 1,
    folio: 'CF-2026-0001',
    idAlmacen: 1,
    almacen: 'Almacén Central',
    estado: 'Concluido',
    fechaInicio: '2026-08-28T09:00:00',
    fechaConclusion: '2026-08-28T11:15:00',
    responsable: 'Responsable de Inventario',
    observaciones:
      'Corte físico concluido sin diferencias.',
    detalle: [
      {
        idProducto: 1001,
        codigo: 'PROD-001',
        producto: 'Mesa rectangular',
        unidadMedida: 'Pieza',
        cantidadRegistrada: 80,
        cantidadFisica: 80
      },
      {
        idProducto: 1002,
        codigo: 'PROD-002',
        producto: 'Silla plegable',
        unidadMedida: 'Pieza',
        cantidadRegistrada: 45,
        cantidadFisica: 45
      },
      {
        idProducto: 1003,
        codigo: 'PROD-003',
        producto: 'Mantel rectangular',
        unidadMedida: 'Pieza',
        cantidadRegistrada: 200,
        cantidadFisica: 200
      }
    ]
  },
  {
    idCorte: 2,
    folio: 'CF-2026-0002',
    idAlmacen: 1,
    almacen: 'Almacén Central',
    estado: 'Con diferencias pendientes',
    fechaInicio: '2026-08-31T08:30:00',
    fechaConclusion: '2026-08-31T10:40:00',
    responsable: 'Responsable de Inventario',
    observaciones:
      'Se detectaron diferencias pendientes de ajuste autorizado.',
    detalle: [
      {
        idProducto: 1001,
        codigo: 'PROD-001',
        producto: 'Mesa rectangular',
        unidadMedida: 'Pieza',
        cantidadRegistrada: 80,
        cantidadFisica: 78
      },
      {
        idProducto: 1002,
        codigo: 'PROD-002',
        producto: 'Silla plegable',
        unidadMedida: 'Pieza',
        cantidadRegistrada: 45,
        cantidadFisica: 46
      },
      {
        idProducto: 1003,
        codigo: 'PROD-003',
        producto: 'Mantel rectangular',
        unidadMedida: 'Pieza',
        cantidadRegistrada: 200,
        cantidadFisica: 200
      }
    ]
  },
  {
    idCorte: 3,
    folio: 'CF-2026-0003',
    idAlmacen: 1,
    almacen: 'Almacén Central',
    estado: 'En captura',
    fechaInicio: '2026-09-02T09:15:00',
    fechaConclusion: null,
    responsable: 'Responsable de Inventario',
    observaciones:
      'Conteo físico en proceso.',
    detalle: [
      {
        idProducto: 1001,
        codigo: 'PROD-001',
        producto: 'Mesa rectangular',
        unidadMedida: 'Pieza',
        cantidadRegistrada: 80,
        cantidadFisica: 80
      },
      {
        idProducto: 1002,
        codigo: 'PROD-002',
        producto: 'Silla plegable',
        unidadMedida: 'Pieza',
        cantidadRegistrada: 45,
        cantidadFisica: 44
      },
      {
        idProducto: 1003,
        codigo: 'PROD-003',
        producto: 'Mantel rectangular',
        unidadMedida: 'Pieza',
        cantidadRegistrada: 200,
        cantidadFisica: null
      },
      {
        idProducto: 1005,
        codigo: 'PROD-005',
        producto: 'Producto inventariable',
        unidadMedida: 'Pieza',
        cantidadRegistrada: 75,
        cantidadFisica: null
      }
    ]
  }
];

export function clonarDatosCortes(datos) {
  return structuredClone(datos);
}

export function simularLatenciaCortes(ms = 150) {
  return new Promise(resolve => {
    window.setTimeout(resolve, ms);
  });
}