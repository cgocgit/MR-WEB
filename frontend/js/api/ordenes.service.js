const ORDENES_MOCK = [
  {
    id: 5001,
    idOrdenServicio: 5001,
    folio: 'ORD-2026-001',
    cliente: 'Cliente A',
    evento: 'Evento A',
    direccionEntrega: 'Evento A',
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
    cliente: 'Cliente B',
    evento: 'Evento B',
    direccionEntrega: 'Evento B',
    fechaEntrega:
      '2026-09-13T08:00:00',
    fechaRecoleccion:
      '2026-09-15T22:00:00',
    estado: 'CONFIRMADA',
    estatus: 'Confirmada',
    cancelada: false
  }
];

function clonar(valor) {
  return structuredClone(
    valor
  );
}

export async function listOrdenes() {
  return Promise.resolve(
    clonar(
      ORDENES_MOCK
    )
  );
}

export async function getOrden(id) {
  const orden =
    ORDENES_MOCK.find(
      item =>
        Number(item.id) ===
        Number(id)
    );

  if (orden) {
    return Promise.resolve(
      clonar(
        orden
      )
    );
  }

  return Promise.resolve({
    id,
    cliente: 'Cliente X',
    estatus: 'En preparación'
  });
}

export async function listarOrdenesConfirmadas() {
  return Promise.resolve(
    clonar(
      ORDENES_MOCK.filter(
        orden =>
          orden.estado ===
            'CONFIRMADA' &&
          orden.cancelada !==
            true
      )
    )
  );
}

export async function obtenerOrdenConfirmada(
  id
) {
  const orden =
    ORDENES_MOCK.find(
      item =>
        Number(item.id) ===
        Number(id)
    );

  if (!orden) {
    const error =
      new Error(
        'No se encontró la Orden de Servicio.'
      );

    error.codigo =
      'ORDEN_NO_ENCONTRADA';

    throw error;
  }

  if (
    orden.cancelada === true ||
    orden.estado !==
      'CONFIRMADA'
  ) {
    const error =
      new Error(
        'La Orden de Servicio no se encuentra confirmada.'
      );

    error.codigo =
      'ORDEN_NO_CONFIRMADA';

    throw error;
  }

  return clonar(
    orden
  );
}