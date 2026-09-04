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
  obtenerLogisticaPorOrden
} from './logistica.service.js';

import {
  getSession
} from '../shared/auth-guard.js';

import {
  hasPermission
} from '../shared/permissions.js';

const PERMISO_CONSULTA =
  'inventario.consultar';

const PERMISO_GESTION =
  'inventario.gestionar';

const ID_ALMACEN_CENTRAL = 1;

const ALMACEN_CENTRAL =
  'Almacén Central';

const ESTADO_RESERVA_RETORNABLE =
  'ACTIVA';

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
    new Error(mensaje);

  error.codigo = codigo;
  error.campo = campo;

  return error;
}

function validarPermisoConsulta() {
  if (
    !hasPermission(
      getSession(),
      PERMISO_CONSULTA
    )
  ) {
    throw crearError(
      'ACCESO_DENEGADO',
      'No dispone de permisos para consultar retornos de inventario.'
    );
  }
}

function validarPermisoGestion() {
  if (
    !hasPermission(
      getSession(),
      PERMISO_GESTION
    )
  ) {
    throw crearError(
      'ACCESO_DENEGADO',
      'No dispone de permisos para registrar retornos de inventario.'
    );
  }
}

function normalizarId(
  valor,
  campo,
  etiqueta
) {
  const id = Number(valor);

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
    !Number.isInteger(cantidad) ||
    cantidad <= 0
  ) {
    throw crearError(
      'CANTIDAD_INVALIDA',
      'La cantidad de retorno debe ser un número entero mayor que cero.',
      campo
    );
  }

  return cantidad;
}

function normalizarTexto(valor) {
  return String(valor ?? '')
    .trim()
    .toLocaleLowerCase('es-MX')
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

function salidaAcumuladaReserva(
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

function retornoAcumuladoReserva(
  idReserva
) {
  return MOVIMIENTOS_INVENTARIO_MOCK
    .filter(
      movimiento =>
        movimiento.tipo ===
          'RETORNO' &&
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

function pendienteRetornoReserva(
  idReserva
) {
  return Math.max(
    0,
    salidaAcumuladaReserva(
      idReserva
    ) -
      retornoAcumuladoReserva(
        idReserva
      )
  );
}

function reservasRetornablesDeOrden(
  idOrden
) {
  return RESERVAS_FUTURAS_MOCK
    .filter(
      reserva =>
        Number(
          reserva.idOrden
        ) ===
          Number(idOrden) &&
        String(
          reserva.estado ?? ''
        )
          .trim()
          .toUpperCase() ===
          ESTADO_RESERVA_RETORNABLE &&
        salidaAcumuladaReserva(
          reserva.idReserva
        ) > 0
    );
}

function tienePendientesRetorno(
  idOrden
) {
  return reservasRetornablesDeOrden(
    idOrden
  )
    .some(
      reserva =>
        pendienteRetornoReserva(
          reserva.idReserva
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
          Number(idProducto) &&
        Number(
          item.idAlmacen
        ) ===
          Number(idAlmacen)
    ) || null
  );
}

async function construirProductoRetorno(
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

  const cantidadSalida =
    salidaAcumuladaReserva(
      reserva.idReserva
    );

  const cantidadRetornada =
    retornoAcumuladoReserva(
      reserva.idReserva
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

    cantidadSolicitada:
      Number(
        reserva.cantidadReservada ||
        0
      ),

    cantidadSalida,

    cantidadRetornadaAcumulada:
      cantidadRetornada,

    cantidadPendiente:
      Math.max(
        0,
        cantidadSalida -
        cantidadRetornada
      ),

    existenciaRegistrada:
      Number(
        inventario.existenciaFisica ||
        0
      ),

    fechaInicio:
      reserva.fechaInicio ??
      null,

    fechaFin:
      reserva.fechaFin ??
      null
  };
}

export async function listarOrdenesRetorno(
  texto = ''
) {
  validarPermisoConsulta();

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
        tienePendientesRetorno(
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

export async function obtenerOrdenRetorno(
  idOrden
) {
  validarPermisoConsulta();

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

  const reservas =
    reservasRetornablesDeOrden(
      ordenId
    )
      .filter(
        reserva =>
          pendienteRetornoReserva(
            reserva.idReserva
          ) > 0
      );

  if (
    reservas.length === 0
  ) {
    throw crearError(
      'SIN_CANTIDADES_PENDIENTES',
      'La Orden no tiene productos con salida registrada pendientes de retorno.'
    );
  }

  const productos =
    await Promise.all(
      reservas.map(
        construirProductoRetorno
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
      'Debe proporcionar los productos que retornarán.'
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
      'SIN_PRODUCTOS_RETORNO',
      'Capture la cantidad de retorno de al menos un producto.'
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
          'Una reservación no puede incluirse dos veces en el mismo retorno.'
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
  partidas,
  cerrarCiclo
) {
  return [
    idOrden,
    cerrarCiclo
      ? 'cerrar'
      : 'parcial',

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
      ...MOVIMIENTOS_INVENTARIO_MOCK
        .map(
          item =>
            Number(
              item.idMovimiento ||
              0
            )
        )
    ) + 1
  );
}

function siguienteIdRetorno() {
  return (
    Math.max(
      0,
      ...MOVIMIENTOS_INVENTARIO_MOCK
        .map(
          item =>
            Number(
              item.idRetorno ||
              0
            )
        )
    ) + 1
  );
}

function folioRetorno(
  idRetorno
) {
  return (
    `RET-${String(
      idRetorno
    ).padStart(
      6,
      '0'
    )}`
  );
}

export async function registrarRetorno({
  idOrden,
  partidas,
  observaciones = '',
  cerrarCiclo = false,
  idSolicitud = ''
}) {
  validarPermisoGestion();

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
      'No fue posible identificar la solicitud de retorno.'
    );
  }

  if (
    solicitudesRegistradas.has(
      solicitud
    )
  ) {
    throw crearError(
      'RETORNO_DUPLICADO',
      'La solicitud de retorno ya fue registrada previamente.'
    );
  }

  const claveOperacion =
    construirClaveOperacion(
      ordenId,
      partidasNormalizadas,
      Boolean(
        cerrarCiclo
      )
    );

  if (
    registrosEnProceso.has(
      claveOperacion
    )
  ) {
    throw crearError(
      'OPERACION_EN_PROCESO',
      'El retorno ya se encuentra en proceso.'
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

    const reservasVigentes =
      reservasRetornablesDeOrden(
        ordenId
      );

    if (
      reservasVigentes.length ===
      0
    ) {
      throw crearError(
        'SIN_RESERVAS_RETORNABLES',
        'La Orden ya no tiene reservaciones activas con salida registrada.'
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
          'Una de las reservaciones cambió y ya no permite registrar el retorno.'
        );
      }

      const producto =
        await construirProductoRetorno(
          reserva
        );

      const pendienteAnterior =
        producto.cantidadPendiente;

      if (
        pendienteAnterior <= 0
      ) {
        throw crearError(
          'SIN_CANTIDAD_PENDIENTE',
          'Una de las reservaciones ya no tiene cantidad pendiente de retorno.'
        );
      }

      if (
        partida.cantidad >
        pendienteAnterior
      ) {
        throw crearError(
          'CANTIDAD_SUPERA_PENDIENTE',
          'La cantidad de retorno no puede superar la cantidad pendiente.'
        );
      }

      partidasPreparadas.push({
        reserva,
        producto,

        cantidadRetorno:
          partida.cantidad,

        retornadoAnterior:
          producto.cantidadRetornadaAcumulada,

        retornadoResultante:
          producto.cantidadRetornadaAcumulada +
          partida.cantidad,

        pendienteAnterior,

        pendienteResultante:
          pendienteAnterior -
          partida.cantidad,

        existenciaAnterior:
          producto.existenciaRegistrada,

        existenciaResultante:
          producto.existenciaRegistrada +
          partida.cantidad
      });
    }

    const cantidadesPorReserva =
      new Map(
        partidasPreparadas.map(
          partida => [
            Number(
              partida.reserva.idReserva
            ),
            partida.cantidadRetorno
          ]
        )
      );

    const pendientesPosteriores =
      reservasVigentes.map(
        reserva => {
          const salida =
            salidaAcumuladaReserva(
              reserva.idReserva
            );

          const retornadoActual =
            retornoAcumuladoReserva(
              reserva.idReserva
            );

          const retornoActual =
            cantidadesPorReserva.get(
              Number(
                reserva.idReserva
              )
            ) || 0;

          return Math.max(
            0,
            salida -
            retornadoActual -
            retornoActual
          );
        }
      );

    const sinPendientes =
      pendientesPosteriores.every(
        cantidad =>
          cantidad === 0
      );

    const liberarReserva =
      Boolean(
        cerrarCiclo
      ) ||
      sinPendientes;

    const fechaRegistro =
      new Date().toISOString();

    const usuario =
      obtenerUsuarioActual();

    const idRetorno =
      siguienteIdRetorno();

    const folio =
      folioRetorno(
        idRetorno
      );

    const indiceMovimientosInicial =
      MOVIMIENTOS_INVENTARIO_MOCK.length;

    const inventariosOriginales =
      partidasPreparadas.map(
        partida => {
          const inventario =
            obtenerRegistroInventario(
              partida.producto.idProducto,
              partida.producto.idAlmacen
            );

          return {
            inventario,

            existenciaFisica:
              inventario.existenciaFisica,

            fechaActualizacion:
              inventario.fechaActualizacion
          };
        }
      );

    const reservasOriginales =
      reservasVigentes.map(
        reserva => ({
          reserva,

          estado:
            reserva.estado,

          fechaUltimaModificacion:
            reserva.fechaUltimaModificacion,

          usuarioUltimaModificacion:
            reserva.usuarioUltimaModificacion
        })
      );

    try {
      partidasPreparadas.forEach(
        (
          partida,
          indice
        ) => {
          const inventario =
            obtenerRegistroInventario(
              partida.producto.idProducto,
              partida.producto.idAlmacen
            );

          inventario.existenciaFisica =
            partida.existenciaResultante;

          inventario.fechaActualizacion =
            fechaRegistro;

          const idMovimiento =
            siguienteIdMovimiento();

          const faltante =
            liberarReserva
              ? partida.pendienteResultante
              : 0;

          MOVIMIENTOS_INVENTARIO_MOCK.push({
            idMovimiento,

            folio:
              `${folio}-${String(
                indice + 1
              ).padStart(
                2,
                '0'
              )}`,

            idRetorno,

            folioRetorno:
              folio,

            tipo:
              'RETORNO',

            origen:
              'ORDEN_SERVICIO',

            idOrdenServicio:
              ordenId,

            folioOrden:
              orden.folio,

            idReserva:
              partida.reserva.idReserva,

            idSalida:
              null,

            referenciaSalida:
              partida.reserva.referenciaSalida ??
              null,

            idProducto:
              partida.producto.idProducto,

            idInventario:
              partida.producto.idInventario,

            idAlmacen:
              partida.producto.idAlmacen,

            almacen:
              partida.producto.almacen,

            cantidad:
              partida.cantidadRetorno,

            cantidadSalida:
              partida.producto.cantidadSalida,

            cantidadRetornadaAcumulada:
              partida.retornadoResultante,

            cantidadPendienteRetorno:
              partida.pendienteResultante,

            faltante,

            existenciaAnterior:
              partida.existenciaAnterior,

            existenciaResultante:
              partida.existenciaResultante,

            estadoReservaAnterior:
              partida.reserva.estado,

            estadoReservaResultante:
              liberarReserva
                ? 'LIBERADA'
                : partida.reserva.estado,

            estadoLogisticoConsulta:
              logistica.estadoRecoleccion,

            motivo:
              'Retorno asociado a Orden de Servicio',

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

      if (
        liberarReserva
      ) {
        reservasVigentes.forEach(
          reserva => {
            reserva.estado =
              'LIBERADA';

            reserva.fechaUltimaModificacion =
              fechaRegistro;

            reserva.usuarioUltimaModificacion =
              usuario;
          }
        );
      } else {
        partidasPreparadas.forEach(
          partida => {
            partida.reserva.fechaUltimaModificacion =
              fechaRegistro;

            partida.reserva.usuarioUltimaModificacion =
              usuario;
          }
        );
      }

      solicitudesRegistradas.add(
        solicitud
      );

      const productosResultado =
        reservasVigentes.map(
          reserva => {
            const salida =
              salidaAcumuladaReserva(
                reserva.idReserva
              );

            const retornado =
              retornoAcumuladoReserva(
                reserva.idReserva
              );

            const pendiente =
              Math.max(
                0,
                salida -
                retornado
              );

            return {
              idReserva:
                reserva.idReserva,

              idProducto:
                reserva.idProducto,

              cantidadSalida:
                salida,

              cantidadRetornadaAcumulada:
                retornado,

              cantidadPendiente:
                pendiente,

              faltante:
                liberarReserva
                  ? pendiente
                  : 0,

              estadoReserva:
                reserva.estado
            };
          }
        );

      return clonarDatosInventario({
        idRetorno,

        folioRetorno:
          folio,

        idOrden:
          ordenId,

        folioOrden:
          orden.folio,

        fechaRegistro,

        usuario,

        totalRetornado:
          partidasPreparadas.reduce(
            (
              total,
              partida
            ) =>
              total +
              partida.cantidadRetorno,
            0
          ),

        estadoReservaResultante:
          liberarReserva
            ? 'LIBERADA'
            : 'ACTIVA',

        estadoLogisticoConsulta:
          logistica.estadoRecoleccion,

        cicloCerrado:
          liberarReserva,

        productos:
          productosResultado
      });
    } catch (error) {
      MOVIMIENTOS_INVENTARIO_MOCK.splice(
        indiceMovimientosInicial
      );

      inventariosOriginales.forEach(
        original => {
          original.inventario.existenciaFisica =
            original.existenciaFisica;

          original.inventario.fechaActualizacion =
            original.fechaActualizacion;
        }
      );

      reservasOriginales.forEach(
        original => {
          original.reserva.estado =
            original.estado;

          original.reserva.fechaUltimaModificacion =
            original.fechaUltimaModificacion;

          original.reserva.usuarioUltimaModificacion =
            original.usuarioUltimaModificacion;
        }
      );

      throw error;
    }
  } finally {
    registrosEnProceso.delete(
      claveOperacion
    );
  }
}