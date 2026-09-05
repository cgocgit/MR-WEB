import {
  createOrdenesMockState
} from './ordenes.mock.js';

import {
  ACCIONES_TRAZABILIDAD_ORDEN,
  ESTADO_ORDEN_LABELS,
  ESTADOS_ORDEN,
  PERMISOS_ORDENES,
  esEstadoOrdenCancelable
} from './ordenes.constants.js';

import {
  consultarReservasInventario,
  recibirSolicitudLiberacionPorOrden
} from './inventario-reservas.service.js';

import {
  obtenerLogisticaPorOrden,
  recibirSolicitudCancelacionPorOrden
} from './logistica.service.js';

import {
  getSession
} from '../shared/auth-guard.js';

import {
  hasPermission
} from '../shared/permissions.js';

const state =
  createOrdenesMockState();

function clonar(valor) {
  return typeof structuredClone ===
    'function'
    ? structuredClone(valor)
    : JSON.parse(
        JSON.stringify(valor)
      );
}

function error(
  codigo,
  mensaje
) {
  const ex =
    new Error(mensaje);

  ex.codigo = codigo;
  ex.code = codigo;

  return ex;
}

function normalizarTexto(
  valor
) {
  return String(
    valor ?? ''
  )
    .trim()
    .toLocaleLowerCase(
      'es-MX'
    )
    .normalize('NFD')
    .replace(
      /[\u0300-\u036f]/g,
      ''
    );
}

function obtenerOrdenInterna(
  id
) {
  const numero =
    Number(id);

  const orden =
    state.ordenes.find(
      item =>
        Number(item.id) ===
        numero
    );

  if (!orden) {
    throw error(
      'ORDEN_NO_ENCONTRADA',
      'No se encontró la Orden de servicio.'
    );
  }

  return orden;
}

function usuarioActual() {
  const usuario =
    getSession()?.user;

  return {
    id:
      usuario?.id ??
      null,

    username:
      usuario?.username ??
      null,

    nombre:
      usuario?.name ??
      usuario?.username ??
      'Usuario'
  };
}

function exigirPermiso(
  permiso
) {
  if (
    !hasPermission(
      getSession(),
      permiso
    )
  ) {
    throw error(
      'ACCESO_DENEGADO',
      'No cuenta con permiso para realizar esta operación.'
    );
  }
}

function ordenAsignadaUsuario(
  orden
) {
  const usuario =
    getSession()?.user;

  if (!usuario) {
    return false;
  }

  const username =
    normalizarTexto(
      usuario.username
    );

  return (
    orden.asignacionesOperativas ||
    []
  ).some(
    asignacion =>
      normalizarTexto(
        asignacion.usuario
      ) === username
  );
}

function puedeConsultarDetalle(
  orden
) {
  const session =
    getSession();

  if (
    hasPermission(
      session,
      PERMISOS_ORDENES
        .DETALLE_CONSULTAR
    )
  ) {
    return true;
  }

  return (
    hasPermission(
      session,
      PERMISOS_ORDENES.ASIGNADAS
    ) &&
    ordenAsignadaUsuario(
      orden
    )
  );
}

async function inventarioOrden(
  orden
) {
  if (
    !hasPermission(
      getSession(),
      PERMISOS_ORDENES
        .INVENTARIO_CONSULTAR
    )
  ) {
    return {
      disponible: false,
      motivo: 'SIN_PERMISO'
    };
  }

  try {
    const respuesta =
      await consultarReservasInventario({
        folioOrden:
          orden.folio,

        skip: 0,
        limit: 100
      });

    const items =
      respuesta.items || [];

    const estados = [
      ...new Set(
        items
          .map(
            item =>
              item.estado
          )
          .filter(Boolean)
      )
    ];

    return {
      disponible: true,

      total:
        items.length,

      estadoResumen:
        estados.length === 1
          ? estados[0]
          : estados.length > 1
            ? 'MIXTA'
            : null,

      fechaInicio:
        items
          .map(
            item =>
              item.fechaEntrega
          )
          .filter(Boolean)
          .sort()[0] ||
        null,

      fechaFin:
        items
          .map(
            item =>
              item.fechaRecoleccion
          )
          .filter(Boolean)
          .sort()
          .at(-1) ||
        null,

      cantidadReservada:
        items.reduce(
          (total, item) =>
            total +
            Number(
              item.cantidadReservada ||
              0
            ),
          0
        ),

      items
    };
  } catch (ex) {
    return {
      disponible: false,
      motivo:
        ex?.codigo ||
        'NO_DISPONIBLE'
    };
  }
}

async function logisticaOrden(
  orden
) {
  if (
    !hasPermission(
      getSession(),
      PERMISOS_ORDENES
        .LOGISTICA_CONSULTAR
    )
  ) {
    return {
      disponible: false,
      motivo: 'SIN_PERMISO'
    };
  }

  try {
    const datos =
      await obtenerLogisticaPorOrden(
        orden.id
      );

    return {
      disponible: true,

      ...datos,

      estadoLogistico:
        datos.estadoRecoleccion ||
        datos.fase ||
        null
    };
  } catch (ex) {
    return {
      disponible: false,
      motivo:
        ex?.codigo ||
        'NO_DISPONIBLE'
    };
  }
}

async function enriquecer(
  orden
) {
  const [
    inventario,
    logistica
  ] =
    await Promise.all([
      inventarioOrden(orden),
      logisticaOrden(orden)
    ]);

  return {
    ...clonar(orden),

    inventarioRelacionado:
      inventario,

    logisticaRelacionada:
      logistica,

    cancelable:
      esEstadoOrdenCancelable(
        orden.estadoOrden
      )
  };
}

function cumpleFiltros(
  orden,
  filtros = {}
) {
  const busqueda =
    normalizarTexto(
      filtros.busqueda
    );

  if (
    busqueda &&
    ![
      orden.folio,
      orden.cliente,
      orden.contactoEvento
    ].some(
      valor =>
        normalizarTexto(
          valor
        ).includes(
          busqueda
        )
    )
  ) {
    return false;
  }

  if (
    filtros.estadoOrden &&
    orden.estadoOrden !==
      filtros.estadoOrden
  ) {
    return false;
  }

  if (
    filtros.tipoCompromiso &&
    orden.tipoCompromiso !==
      filtros.tipoCompromiso
  ) {
    return false;
  }

  if (
    filtros.fechaEvento
  ) {
    const fecha =
      String(
        orden.fechaHoraEvento ||
        orden.fechaEntrega ||
        ''
      ).slice(
        0,
        10
      );

    if (
      fecha !==
      filtros.fechaEvento
    ) {
      return false;
    }
  }

  if (
    filtros.estadoReserva &&
    orden
      .inventarioRelacionado
      ?.estadoResumen !==
      filtros.estadoReserva
  ) {
    return false;
  }

  if (
    filtros.estadoLogistico &&
    orden
      .logisticaRelacionada
      ?.estadoLogistico !==
      filtros.estadoLogistico
  ) {
    return false;
  }

  return true;
}

function registrarTrazabilidad({
  orden,
  accion,
  estadoAnterior,
  estadoNuevo,
  comentario,
  fechaHora
}) {
  orden.trazabilidad =
    orden.trazabilidad || [];

  orden.trazabilidad.push({
    fechaHora:
      fechaHora ||
      new Date().toISOString(),

    usuario:
      usuarioActual().nombre,

    accion,

    estadoAnterior,

    estadoNuevo,

    comentario
  });
}

export async function listOrdenes(
  filtros = {},
  opciones = {}
) {
  const session =
    getSession();

  const consultaGeneral =
    hasPermission(
      session,
      PERMISOS_ORDENES.CONSULTAR
    );

  const consultaAsignadas =
    hasPermission(
      session,
      PERMISOS_ORDENES.ASIGNADAS
    );

  if (
    !consultaGeneral &&
    !consultaAsignadas
  ) {
    throw error(
      'ACCESO_DENEGADO',
      'No cuenta con permiso para consultar Órdenes.'
    );
  }

  let base =
    state.ordenes;

  if (
    opciones.soloAsignadas ||
    !consultaGeneral
  ) {
    if (!consultaAsignadas) {
      throw error(
        'ACCESO_DENEGADO',
        'No cuenta con permiso para consultar Órdenes asignadas.'
      );
    }

    base =
      base.filter(
        orden =>
          ordenAsignadaUsuario(
            orden
          )
      );
  }

  const enriquecidas =
    await Promise.all(
      base.map(
        enriquecer
      )
    );

  return enriquecidas.filter(
    orden =>
      cumpleFiltros(
        orden,
        filtros
      )
  );
}

export async function getOrden(
  id
) {
  const orden =
    obtenerOrdenInterna(id);

  if (
    !puedeConsultarDetalle(
      orden
    )
  ) {
    throw error(
      'ACCESO_DENEGADO',
      'No cuenta con permiso para consultar esta Orden.'
    );
  }

  return enriquecer(
    orden
  );
}

export async function revisarOrdenVentas(
  id
) {
  exigirPermiso(
    PERMISOS_ORDENES.REVISAR
  );

  const orden =
    obtenerOrdenInterna(id);

  if (
    orden.estadoOrden !==
    ESTADOS_ORDEN
      .EN_REVISION_VENTAS
  ) {
    throw error(
      'ESTADO_REVISION_INVALIDO',
      'La Orden no se encuentra en revisión de Ventas.'
    );
  }

  const estadoAnterior =
    orden.estadoOrden;

  const fechaHora =
    new Date().toISOString();

  orden.estadoOrden =
    ESTADOS_ORDEN
      .PENDIENTE_PROGRAMACION;

  orden.fechaUltimaActualizacion =
    fechaHora;

  orden.revisionVentas = {
    usuario:
      usuarioActual(),

    fechaHora
  };

  registrarTrazabilidad({
    orden,

    accion:
      ACCIONES_TRAZABILIDAD_ORDEN
        .REVISION_VENTAS,

    estadoAnterior,

    estadoNuevo:
      orden.estadoOrden,

    comentario:
      'Revisión de Ventas confirmada. Orden enviada a programación.',

    fechaHora
  });

  return enriquecer(
    orden
  );
}

export async function cancelarOrden(
  id,
  motivo
) {
  exigirPermiso(
    PERMISOS_ORDENES.CANCELAR
  );

  const orden =
    obtenerOrdenInterna(id);

  if (
    !esEstadoOrdenCancelable(
      orden.estadoOrden
    )
  ) {
    throw error(
      'ESTADO_CANCELACION_INVALIDO',
      'La Orden no se encuentra en un estado permitido para cancelar.'
    );
  }

  const motivoNormalizado =
    String(
      motivo ?? ''
    ).trim();

  if (!motivoNormalizado) {
    throw error(
      'MOTIVO_REQUERIDO',
      'Debe indicar el motivo de cancelación.'
    );
  }

  const fechaHora =
    new Date().toISOString();

  const usuario =
    usuarioActual();

  const solicitudes =
    await Promise.all([
      recibirSolicitudLiberacionPorOrden(
        orden.id,
        {
          motivo:
            motivoNormalizado,

          fechaHora,

          usuario:
            usuario.nombre
        }
      ),

      recibirSolicitudCancelacionPorOrden(
        orden.id,
        {
          motivo:
            motivoNormalizado,

          fechaHora,

          usuario:
            usuario.nombre
        }
      )
    ]);

  const estadoAnterior =
    orden.estadoOrden;

  orden.estadoOrden =
    ESTADOS_ORDEN.CANCELADA;

  orden.fechaUltimaActualizacion =
    fechaHora;

  orden.cancelada = true;

  /*
   * Compatibilidad con Registro de salida
   * asociado a Orden.
   */
  orden.estado =
    'CANCELADA';

  orden.estatus =
    'Cancelada';

  orden.cancelacion = {
    motivo:
      motivoNormalizado,

    usuario,

    fechaHora,

    solicitudes: {
      inventario:
        solicitudes[0],

      logistica:
        solicitudes[1]
    }
  };

  registrarTrazabilidad({
    orden,

    accion:
      ACCIONES_TRAZABILIDAD_ORDEN
        .CANCELACION,

    estadoAnterior,

    estadoNuevo:
      orden.estadoOrden,

    comentario:
      `Orden cancelada. Motivo: ${motivoNormalizado}`,

    fechaHora
  });

  return enriquecer(
    orden
  );
}

/*
 * CONTRATOS LEGACY.
 * No eliminar: Registro de salida de Inventario
 * ya depende de estas funciones.
 */
export async function listarOrdenesConfirmadas() {
  return clonar(
    state.ordenes.filter(
      orden =>
        orden.estado ===
          'CONFIRMADA' &&
        orden.cancelada !==
          true
    )
  );
}

export async function obtenerOrdenConfirmada(
  id
) {
  const orden =
    obtenerOrdenInterna(id);

  if (
    orden.cancelada === true ||
    orden.estado !==
      'CONFIRMADA'
  ) {
    throw error(
      'ORDEN_NO_CONFIRMADA',
      'La Orden de Servicio no se encuentra confirmada.'
    );
  }

  return clonar(
    orden
  );
}

export function obtenerEtiquetaEstadoOrdenService(
  estado
) {
  return (
    ESTADO_ORDEN_LABELS[
      estado
    ] ||
    estado ||
    ''
  );
}