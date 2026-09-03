/**
 * Datos exclusivos de apoyo para Registro de entrada.
 *
 * No duplica Catálogo, existencias, reservas ni límites.
 *
 * Representa recolecciones asociadas con Órdenes de Servicio.
 */
export const RECOLECCIONES_REINGRESO_MOCK = [
  {
    idOrdenServicio: 2001,
    folio: 'OS-2026-001',
    cliente: 'Eventos Regios',
    fechaEvento: '2026-08-28',
    fase: 'RECOLECCION',
    estadoRecoleccion: 'RECOLECTADO',
    productos: [
      {
        idProducto: 1001,
        cantidadRelacionada: 40
      },
      {
        idProducto: 1002,
        cantidadRelacionada: 10
      }
    ]
  },
  {
    idOrdenServicio: 2002,
    folio: 'OS-2026-002',
    cliente: 'Salón Monterrey',
    fechaEvento: '2026-08-30',
    fase: 'RECOLECCION',
    estadoRecoleccion: 'RECOLECTADO',
    productos: [
      {
        idProducto: 1005,
        cantidadRelacionada: 20
      }
    ]
  },

  /*
   * Se conserva este escenario para validar
   * que una recolección no terminada no sea
   * ofrecida por el servicio.
   */
  {
    idOrdenServicio: 2003,
    folio: 'OS-2026-003',
    cliente: 'Eventos del Norte',
    fechaEvento: '2026-09-05',
    fase: 'RECOLECCION',
    estadoRecoleccion: 'EN_PROCESO',
    productos: [
      {
        idProducto: 1001,
        cantidadRelacionada: 15
      }
    ]
  }
];

export function clonarEntradasMock(datos) {
  return structuredClone(datos);
}