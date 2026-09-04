import {
  DISPONIBILIDAD_ALMACEN_MOCK,
  MOVIMIENTOS_INVENTARIO_MOCK,
  RESERVAS_FUTURAS_MOCK,
  clonarDatosInventario,
  simularLatenciaInventario
} from './inventario.mock.js';

import {
  obtenerProducto
} from './catalogo.service.js';

import {
  listarOrdenesConfirmadas,
  obtenerOrdenConfirmada
} from './ordenes.service.js';

import {
  obtenerLogisticaPorOrden,
  actualizarEstadoRecoleccion
} from './logistica.service.js';

import {
  getSession
} from '../shared/auth-guard.js';

import {
  hasPermission
} from '../shared/permissions.js';

const PERMISO_GESTION =
  'inventario.gestionar';

const ID_ALMACEN_CENTRAL = 1;
const ALMACEN_CENTRAL =
  'Almacén Central';

const ESTADOS_RESERVA_SALIDA =
  new Set([
    'CONFIRMADA',
    'ACTIVA'
  ]);

const registrosEnProceso =
  new Set();

const solicitudesRegistradas =
  new Set();

function crearError(
  codigo,
  mensaje,
  campo = null
) {
  const error =
    new Error(
      mensaje
    );

  error.codigo =
    codigo;

  error.campo =
    campo;

  return error;
}

function validarPermiso() {
  if (
    !hasPermission(
      getSession(),
      PERMISO_GESTION
    )
  ) {
    throw crearError(
      'ACCESO_DENEGADO',
      'No dispone de permisos para registrar salidas de inventario.'
    );
  }
}

function normalizarId(
  valor,
  campo,
  etiqueta
) {
  const id =
    Number(valor);

  if (
    !Number.isInteger(id) ||
    id <= 0
  ) {
    throw crearError(
      'ID_INVALIDO',
      `${etiqueta} no es válido.`,
      campo
    );
  }

  return id;
}

function normalizarCantidad(
  valor,
  campo
) {
  const cantidad =
    Number(valor);

  if (
    !Number.isInteger(
      cantidad
    ) ||
    cantidad <= 0
  ) {
    throw crearError(
      'CANTIDAD_INVALIDA',
      'La cantidad de salida debe ser un número entero mayor que cero.',
      campo
    );
  }

  return cantidad;
}

function normalizarTexto(valor) {
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

function obtenerUsuarioActual() {
  const session =
    getSession();

  return (
    session?.user?.name ||
    session?.user?.username ||
    'Usuario'
  );
}

function reservasDeOrden(
  idOrden
) {
  return RESERVAS_FUTURAS_MOCK.filter(
    reserva =>
      Number(
        reserva.idOrden
      ) ===
        Number(idOrden) &&
      ESTADOS_RESERVA_SALIDA.has(
        String(
          reserva.estado ?? ''
        )
          .trim()
          .toUpperCase()
      )
  );
}

function acumuladoReserva(
  idReserva
) {
  return MOVIMIENTOS_INVENTARIO_MOCK
    .filter(
      movimiento =>
        movimiento.tipo ===
          'SALIDA' &&
        Number(
          movimiento.idReserva
        ) ===
          Number(idReserva)
    )
    .reduce(
      (
        total,
        movimiento
      ) =>
        total +
        Number(
          movimiento.cantidad || 0
        ),
      0
    );
}

function pendienteReserva(
  reserva
) {
  return Math.max(
    0,
    Number(
      reserva.cantidadReservada || 0
    ) -
      acumuladoReserva(
        reserva.idReserva
      )
  );
}

function tienePendientes(
  idOrden
) {
  return reservasDeOrden(
    idOrden
  ).some(
    reserva =>
      pendienteReserva(
        reserva
      ) > 0
  );
}

function obtenerRegistroInventario(
  idProducto,
  idAlmacen
) {
  return (
    DISPONIBILIDAD_ALMACEN_MOCK.find(
      item =>
        Number(
          item.idProducto
        ) ===
          Number(
            idProducto
          ) &&
        Number(
          item.idAlmacen
        ) ===
          Number(
            idAlmacen
          )
    ) || null
  );
}

async function construirProductoSalida(
  reserva
) {
  const producto =
    await obtenerProducto(
      reserva.idProducto
    );

  const idAlmacen =
    Number(
      reserva.idAlmacen
    ) ||
    ID_ALMACEN_CENTRAL;

  const inventario =
    obtenerRegistroInventario(
      reserva.idProducto,
      idAlmacen
    );

  if (!inventario) {
    throw crearError(
      'INVENTARIO_NO_ENCONTRADO',
      `El producto ${producto.codigo} ` +
      'no tiene registro de Inventario ' +
      'en el Almacén Central.'
    );
  }

  const entregadaAcumulada =
    acumuladoReserva(
      reserva.idReserva
    );

  const cantidadReservada =
    Number(
      reserva.cantidadReservada ||
      0
    );

  return {
    idReserva:
      reserva.idReserva,

    estadoReserva:
      reserva.estado,

    idOrden:
      reserva.idOrden,

    idProducto:
      reserva.idProducto,

    idInventario:
      inventario.idInventario,

    idAlmacen,

    almacen:
      inventario.almacen ||
      ALMACEN_CENTRAL,

    codigo:
      producto.codigo,

    nombre:
      producto.nombre,

    descripcion:
      producto.descripcion ??
      '',

    unidadMedida:
      producto.unidadMedida ??
      '',

    imagenUrl:
      producto.imagenUrl ??
      null,

    activo:
      Number(
        producto.activo
      ) === 1,

    existenciaRegistrada:
      Number(
        inventario.existenciaFisica ||
        0
      ),

    cantidadReservada,

    cantidadEntregadaAcumulada:
      entregadaAcumulada,

    cantidadPendiente:
      Math.max(
        0,
        cantidadReservada -
          entregadaAcumulada
      ),

    fechaInicio:
      reserva.fechaInicio ??
      null,

    fechaFin:
      reserva.fechaFin ??
      null
  };
}

export async function listarOrdenesSalida(
  texto = ''
) {
  validarPermiso();

  await simularLatenciaInventario();

  const filtro =
    normalizarTexto(
      texto
    );

  const ordenes =
    await listarOrdenesConfirmadas();

  const disponibles =
    ordenes.filter(
      orden =>
        tienePendientes(
          orden.id
        ) &&
        (
          !filtro ||
          [
            orden.folio,
            orden.cliente,
            orden.evento
          ].some(
            valor =>
              normalizarTexto(
                valor
              ).includes(
                filtro
              )
          )
        )
    );

  return clonarDatosInventario(
    disponibles
  );
}

export async function obtenerOrdenSalida(
  idOrden
) {
  validarPermiso();

  const ordenId =
    normalizarId(
      idOrden,
      'idOrden',
      'La Orden de Servicio'
    );

  const [
    orden,
    logistica
  ] =
    await Promise.all([
      obtenerOrdenConfirmada(
        ordenId
      ),
      obtenerLogisticaPorOrden(
        ordenId
      )
    ]);

  if (
    !logistica?.fechaInicio ||
    !logistica?.fechaFin
  ) {
    throw crearError(
      'PERIODO_LOGISTICA_NO_DEFINIDO',
      'La Orden no tiene un periodo de uso definido por Logística.'
    );
  }

  const reservas =
    reservasDeOrden(
      ordenId
    ).filter(
      reserva =>
        pendienteReserva(
          reserva
        ) > 0
    );

  if (
    reservas.length === 0
  ) {
    throw crearError(
      'SIN_CANTIDADES_PENDIENTES',
      'La Orden no tiene reservaciones vigentes con cantidades pendientes de salida.'
    );
  }

  const productos =
    await Promise.all(
      reservas.map(
        construirProductoSalida
      )
    );

  return clonarDatosInventario({
    orden,
    logistica,
    productos,

    almacen: {
      idAlmacen:
        ID_ALMACEN_CENTRAL,

      nombre:
        ALMACEN_CENTRAL
    },

    fechaConsulta:
      new Date().toISOString()
  });
}

function normalizarPartidas(
  partidas,
  idOrden
) {
  if (
    !Array.isArray(
      partidas
    )
  ) {
    throw crearError(
      'PARTIDAS_INVALIDAS',
      'Debe proporcionar los productos que saldrán.'
    );
  }

  const normalizadas =
    partidas
      .filter(
        partida =>
          partida?.cantidad !== '' &&
          partida?.cantidad !== null &&
          partida?.cantidad !==
            undefined
      )
      .map(
        (
          partida,
          indice
        ) => ({
          idReserva:
            normalizarId(
              partida.idReserva,
              `partidas.${indice}.idReserva`,
              'La reservación'
            ),

          cantidad:
            normalizarCantidad(
              partida.cantidad,
              `partidas.${indice}.cantidad`
            )
        })
      );

  if (
    normalizadas.length === 0
  ) {
    throw crearError(
      'SIN_PRODUCTOS_SALIDA',
      'Capture la cantidad de salida de al menos un producto.'
    );
  }

  const ids =
    new Set();

  normalizadas.forEach(
    partida => {
      if (
        ids.has(
          partida.idReserva
        )
      ) {
        throw crearError(
          'RESERVA_DUPLICADA',
          'Una reservación no puede incluirse dos veces en la misma salida.'
        );
      }

      ids.add(
        partida.idReserva
      );

      const reserva =
        RESERVAS_FUTURAS_MOCK.find(
          item =>
            Number(
              item.idReserva
            ) ===
            Number(
              partida.idReserva
            )
        );

      if (
        !reserva ||
        Number(
          reserva.idOrden
        ) !==
          Number(idOrden)
      ) {
        throw crearError(
          'RESERVA_NO_PERTENECE_ORDEN',
          'La reservación seleccionada no pertenece a la Orden de Servicio.'
        );
      }
    }
  );

  return normalizadas;
}

function construirClaveOperacion(
  idOrden,
  partidas
) {
  return [
    idOrden,

    ...partidas
      .slice()
      .sort(
        (a, b) =>
          a.idReserva -
          b.idReserva
      )
      .map(
        partida =>
          `${partida.idReserva}:${partida.cantidad}`
      )
  ].join('|');
}

function siguienteIdMovimiento() {
  return (
    Math.max(
      0,
      ...MOVIMIENTOS_INVENTARIO_MOCK.map(
        item =>
          Number(
            item.idMovimiento || 0
          )
      )
    ) + 1
  );
}

function siguienteIdSalida() {
  return (
    Math.max(
      0,
      ...MOVIMIENTOS_INVENTARIO_MOCK.map(
        item =>
          Number(
            item.idSalida || 0
          )
      )
    ) + 1
  );
}

function folioSalida(
  idSalida
) {
  return (
    `SAL-${String(idSalida).padStart(6, '0')}`
  );
}

export async function registrarSalida({
  idOrden,
  partidas,
  observaciones = '',
  idSolicitud = ''
}) {
  validarPermiso();

  const ordenId =
    normalizarId(
      idOrden,
      'idOrden',
      'La Orden de Servicio'
    );

  const partidasNormalizadas =
    normalizarPartidas(
      partidas,
      ordenId
    );

  const solicitud =
    String(
      idSolicitud ?? ''
    ).trim();

  if (!solicitud) {
    throw crearError(
      'SOLICITUD_INVALIDA',
      'No fue posible identificar la solicitud de salida.'
    );
  }

  if (
    solicitudesRegistradas.has(
      solicitud
    )
  ) {
    throw crearError(
      'SALIDA_DUPLICADA',
      'La solicitud de salida ya fue registrada previamente.'
    );
  }

  const claveOperacion =
    construirClaveOperacion(
      ordenId,
      partidasNormalizadas
    );

  if (
    registrosEnProceso.has(
      claveOperacion
    )
  ) {
    throw crearError(
      'OPERACION_EN_PROCESO',
      'La salida ya se encuentra en proceso.'
    );
  }

  registrosEnProceso.add(
    claveOperacion
  );

  try {
    await simularLatenciaInventario(
      300
    );

    const [
      orden,
      logistica
    ] =
      await Promise.all([
        obtenerOrdenConfirmada(
          ordenId
        ),

        obtenerLogisticaPorOrden(
          ordenId
        )
      ]);

    if (
      !logistica?.fechaInicio ||
      !logistica?.fechaFin
    ) {
      throw crearError(
        'PERIODO_LOGISTICA_NO_DEFINIDO',
        'La Orden no tiene un periodo de uso definido por Logística.'
      );
    }

    const reservasVigentes =
      reservasDeOrden(
        ordenId
      );

    if (
      reservasVigentes.length ===
      0
    ) {
      throw crearError(
        'SIN_RESERVAS_VIGENTES',
        'La Orden ya no tiene reservaciones vigentes para registrar una salida.'
      );
    }

    const partidasPreparadas =
      [];

    for (
      const partida
      of partidasNormalizadas
    ) {
      const reserva =
        reservasVigentes.find(
          item =>
            Number(
              item.idReserva
            ) ===
              Number(
                partida.idReserva
              )
        );

      if (!reserva) {
        throw crearError(
          'RESERVA_NO_VIGENTE',
          'Una de las reservaciones cambió y ya no permite registrar la salida.'
        );
      }

      const acumuladoAnterior =
        acumuladoReserva(
          reserva.idReserva
        );

      const pendienteAnterior =
        Number(
          reserva.cantidadReservada ||
          0
        ) -
        acumuladoAnterior;

      if (
        pendienteAnterior <= 0
      ) {
        throw crearError(
          'SIN_CANTIDAD_PENDIENTE',
          'Una de las reservaciones ya no tiene cantidad pendiente de salida.'
        );
      }

      if (
        partida.cantidad >
        pendienteAnterior
      ) {
        throw crearError(
          'CANTIDAD_SUPERA_PENDIENTE',
          'La cantidad de salida no puede superar la cantidad pendiente.'
        );
      }

      const producto =
        await construirProductoSalida(
          reserva
        );

      partidasPreparadas.push({
        reserva,
        producto,

        cantidadSalida:
          partida.cantidad,

        acumuladoAnterior,

        acumuladoResultante:
          acumuladoAnterior +
          partida.cantidad,

        pendienteAnterior,

        pendienteResultante:
          pendienteAnterior -
          partida.cantidad,

        estadoAnterior:
          reserva.estado,

        estadoResultante:
          'ACTIVA'
      });
    }

    const cantidadesPorReserva =
      new Map(
        partidasPreparadas.map(
          partida => [
            Number(
              partida.reserva.idReserva
            ),
            partida.cantidadSalida
          ]
        )
      );

    const existePendienteResultante =
      reservasVigentes.some(
        reserva => {
          const acumuladoActual =
            acumuladoReserva(
              reserva.idReserva
            );

          const salidaActual =
            cantidadesPorReserva.get(
              Number(
                reserva.idReserva
              )
            ) || 0;

          return (
            Number(
              reserva.cantidadReservada ||
              0
            ) -
            acumuladoActual -
            salidaActual
          ) > 0;
        }
      );

    const estadoLogisticoResultante =
      existePendienteResultante
        ? 'RECOLECCION_EN_PROCESO'
        : 'RECOLECCION_COMPLETADA';

    const fechaRegistro =
      new Date().toISOString();

    const usuario =
      obtenerUsuarioActual();

    const idSalida =
      siguienteIdSalida();

    const folio =
      folioSalida(
        idSalida
      );

    const indiceMovimientosInicial =
      MOVIMIENTOS_INVENTARIO_MOCK.length;

    const reservasOriginales =
      partidasPreparadas.map(
        partida => ({
          reserva:
            partida.reserva,

          estado:
            partida.reserva.estado,

          referenciaSalida:
            partida.reserva.referenciaSalida,

          fechaUltimaModificacion:
            partida.reserva.fechaUltimaModificacion,

          usuarioUltimaModificacion:
            partida.reserva.usuarioUltimaModificacion
        })
      );

    const estadoLogisticoAnterior =
      logistica.estadoRecoleccion;

    try {
      partidasPreparadas.forEach(
        (
          partida,
          indice
        ) => {
          partida.reserva.estado =
            'ACTIVA';

          partida.reserva.referenciaSalida =
            folio;

          partida.reserva.fechaUltimaModificacion =
            fechaRegistro;

          partida.reserva.usuarioUltimaModificacion =
            usuario;

          const idMovimiento =
            siguienteIdMovimiento();

          MOVIMIENTOS_INVENTARIO_MOCK.push({
            idMovimiento,

            folio:
              `${folio}-${String(
                indice + 1
              ).padStart(2, '0')}`,

            idSalida,

            folioSalida:
              folio,

            tipo:
              'SALIDA',

            origen:
              'ORDEN_SERVICIO',

            idOrdenServicio:
              ordenId,

            folioOrden:
              orden.folio,

            idReserva:
              partida.reserva.idReserva,

            idProducto:
              partida.producto.idProducto,

            idInventario:
              partida.producto.idInventario,

            idAlmacen:
              partida.producto.idAlmacen,

            almacen:
              partida.producto.almacen,

            cantidad:
              partida.cantidadSalida,

            cantidadReservada:
              partida.producto.cantidadReservada,

            cantidadEntregadaAcumulada:
              partida.acumuladoResultante,

            cantidadPendiente:
              partida.pendienteResultante,

            /*
             * La salida registra actividad,
             * pero NO disminuye nuevamente
             * la existencia física.
             */
            existenciaAnterior:
              partida.producto.existenciaRegistrada,

            existenciaResultante:
              partida.producto.existenciaRegistrada,

            estadoReservaAnterior:
              partida.estadoAnterior,

            estadoReservaResultante:
              partida.estadoResultante,

            estadoLogisticoResultante,

            fechaInicio:
              logistica.fechaInicio,

            fechaFin:
              logistica.fechaFin,

            motivo:
              'Salida asociada a Orden de Servicio',

            observaciones:
              String(
                observaciones ?? ''
              ).trim(),

            usuario,

            fecha:
              fechaRegistro,

            idSolicitud:
              solicitud
          });
        }
      );

      await actualizarEstadoRecoleccion(
        ordenId,
        estadoLogisticoResultante
      );

      solicitudesRegistradas.add(
        solicitud
      );

      return clonarDatosInventario({
        idSalida,

        folioSalida:
          folio,

        idOrden:
          ordenId,

        folioOrden:
          orden.folio,

        fechaRegistro,

        usuario,

        estadoLogisticoResultante,

        productos:
          partidasPreparadas.map(
            partida => ({
              idReserva:
                partida.reserva.idReserva,

              idProducto:
                partida.producto.idProducto,

              codigo:
                partida.producto.codigo,

              nombre:
                partida.producto.nombre,

              cantidadSalida:
                partida.cantidadSalida,

              cantidadEntregadaAcumulada:
                partida.acumuladoResultante,

              cantidadPendiente:
                partida.pendienteResultante,

              estadoReservaAnterior:
                partida.estadoAnterior,

              estadoReservaResultante:
                partida.estadoResultante
            })
          )
      });
    } catch (error) {
      MOVIMIENTOS_INVENTARIO_MOCK.splice(
        indiceMovimientosInicial
      );

      reservasOriginales.forEach(
        original => {
          original.reserva.estado =
            original.estado;

          original.reserva.referenciaSalida =
            original.referenciaSalida;

          original.reserva.fechaUltimaModificacion =
            original.fechaUltimaModificacion;

          original.reserva.usuarioUltimaModificacion =
            original.usuarioUltimaModificacion;
        }
      );

      try {
        await actualizarEstadoRecoleccion(
          ordenId,
          estadoLogisticoAnterior
        );
      } catch (_rollbackError) {
        /*
         * El error original conserva
         * prioridad.
         */
      }

      throw error;
    }
  } finally {
    registrosEnProceso.delete(
      claveOperacion
    );
  }
}