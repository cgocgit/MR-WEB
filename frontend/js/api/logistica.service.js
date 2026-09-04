const ASIGNACIONES_LOGISTICA_MOCK = [
  {
    id: 7001,
    idActividadLogistica: 7001,
    orden: 5001,
    idOrden: 5001,
    fase: 'Salida',
    direccion: 'Evento A',
    fechaInicio:
      '2026-09-12T08:00:00',
    fechaFin:
      '2026-09-14T22:00:00',
    responsable:
      'Responsable de Logística',
    vehiculo:
      'Vehículo asignado',
    estadoRecoleccion:
      'RECOLECCION_EN_PROCESO'
  },
  {
    id: 7002,
    idActividadLogistica: 7002,
    orden: 5002,
    idOrden: 5002,
    fase: 'Salida',
    direccion: 'Evento B',
    fechaInicio:
      '2026-09-13T08:00:00',
    fechaFin:
      '2026-09-15T22:00:00',
    responsable:
      'Responsable de Logística',
    vehiculo:
      'Vehículo asignado',
    estadoRecoleccion:
      'RECOLECCION_EN_PROCESO'
  }
];

const ESTADOS_RECOLECCION_VALIDOS =
  new Set([
    'RECOLECCION_EN_PROCESO',
    'RECOLECCION_COMPLETADA'
  ]);

function clonar(valor) {
  return structuredClone(
    valor
  );
}

export async function listAsignadas(
  _usuario
) {
  return Promise.resolve(
    clonar(
      ASIGNACIONES_LOGISTICA_MOCK
    )
  );
}

export async function actualizarFase(
  ordenId,
  fase
) {
  const asignacion =
    ASIGNACIONES_LOGISTICA_MOCK.find(
      item =>
        Number(item.orden) ===
        Number(ordenId)
    );

  if (asignacion) {
    asignacion.fase =
      fase;
  }

  return Promise.resolve({
    ordenId,
    fase,
    ok: true
  });
}

export async function obtenerLogisticaPorOrden(
  ordenId
) {
  const asignacion =
    ASIGNACIONES_LOGISTICA_MOCK.find(
      item =>
        Number(item.orden) ===
        Number(ordenId)
    );

  if (!asignacion) {
    const error =
      new Error(
        'La Orden no tiene información de Logística asociada.'
      );

    error.codigo =
      'LOGISTICA_NO_ENCONTRADA';

    throw error;
  }

  return clonar(
    asignacion
  );
}

export async function actualizarEstadoRecoleccion(
  ordenId,
  estado
) {
  const asignacion =
    ASIGNACIONES_LOGISTICA_MOCK.find(
      item =>
        Number(item.orden) ===
        Number(ordenId)
    );

  if (!asignacion) {
    const error =
      new Error(
        'La Orden no tiene información de Logística asociada.'
      );

    error.codigo =
      'LOGISTICA_NO_ENCONTRADA';

    throw error;
  }

  if (
    !ESTADOS_RECOLECCION_VALIDOS.has(
      estado
    )
  ) {
    const error =
      new Error(
        'El estado de recolección no es válido.'
      );

    error.codigo =
      'ESTADO_LOGISTICA_INVALIDO';

    throw error;
  }

  asignacion.estadoRecoleccion =
    estado;

  return clonar({
    ordenId:
      Number(ordenId),

    estadoRecoleccion:
      estado,

    ok: true
  });
}