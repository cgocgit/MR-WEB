import {
  DISPONIBILIDAD_ALMACEN_MOCK,
  RESERVAS_FUTURAS_MOCK,
  clonarDatosInventario,
  simularLatenciaInventario
} from './inventario.mock.js';

import {
  listarProductos
} from './catalogo.service.js';

import {
  getSession
} from '../shared/auth-guard.js';

import {
  hasPermission
} from '../shared/permissions.js';

export const ESTADOS_RESERVA =
  Object.freeze({
    CONFIRMADA: 'CONFIRMADA',
    ACTIVA: 'ACTIVA',
    LIBERADA: 'LIBERADA',
    CANCELADA: 'CANCELADA'
  });

const PERMISO_CONSULTA =
  'inventario.reservas.consultar';

function error(
  codigo,
  mensaje,
  campo = null
) {
  const error =
    new Error(mensaje);

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
      PERMISO_CONSULTA
    )
  ) {
    throw error(
      'ACCESO_DENEGADO',
      'No dispone de permisos para consultar las reservas por Orden de servicio.'
    );
  }
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

function validarFecha(
  valor,
  campo,
  etiqueta
) {
  if (
    valor === '' ||
    valor === null ||
    valor === undefined
  ) {
    return '';
  }

  const fecha =
    String(valor).trim();

  const prueba =
    new Date(
      `${fecha}T12:00:00`
    );

  if (
    !/^\d{4}-\d{2}-\d{2}$/.test(
      fecha
    ) ||
    Number.isNaN(
      prueba.getTime()
    )
  ) {
    throw error(
      'FECHA_INVALIDA',
      `${etiqueta} no es válida.`,
      campo
    );
  }

  return fecha;
}

function validarEstado(valor) {
  const estado =
    String(
      valor ?? ''
    )
      .trim()
      .toUpperCase();

  if (!estado) {
    return '';
  }

  if (
    !Object.values(
      ESTADOS_RESERVA
    ).includes(
      estado
    )
  ) {
    throw error(
      'ESTADO_INVALIDO',
      'El estado seleccionado no es válido.',
      'estado'
    );
  }

  return estado;
}

function validarPaginacion(
  skip,
  limit
) {
  const skipNormalizado =
    Number(
      skip ?? 0
    );

  const limitNormalizado =
    Number(
      limit ?? 10
    );

  return {
    skip:
      Number.isInteger(
        skipNormalizado
      ) &&
      skipNormalizado >= 0
        ? skipNormalizado
        : 0,

    limit:
      Number.isInteger(
        limitNormalizado
      ) &&
      limitNormalizado > 0 &&
      limitNormalizado <= 100
        ? limitNormalizado
        : 10
  };
}

function validarAlmacen(valor) {
  if (
    valor === '' ||
    valor === null ||
    valor === undefined
  ) {
    return null;
  }

  const id =
    Number(valor);

  if (
    !Number.isInteger(id) ||
    id <= 0
  ) {
    throw error(
      'ALMACEN_INVALIDO',
      'El almacén seleccionado no es válido.',
      'idAlmacen'
    );
  }

  return id;
}

function validarProducto(valor) {
  if (
    valor === '' ||
    valor === null ||
    valor === undefined
  ) {
    return null;
  }

  const id =
    Number(valor);

  if (
    !Number.isInteger(id) ||
    id <= 0
  ) {
    throw error(
      'PRODUCTO_INVALIDO',
      'El producto seleccionado no es válido.',
      'idProducto'
    );
  }

  return id;
}

function almacenesPorProducto() {
  const mapa =
    new Map();

  DISPONIBILIDAD_ALMACEN_MOCK
    .forEach(
      item => {
        if (
          !mapa.has(
            item.idProducto
          )
        ) {
          mapa.set(
            item.idProducto,
            {
              idAlmacen:
                item.idAlmacen ??
                null,

              almacen:
                item.almacen ??
                null
            }
          );
        }
      }
    );

  return mapa;
}

function normalizarReserva(
  reserva,
  productos,
  almacenes
) {
  const producto =
    productos.get(
      reserva.idProducto
    ) || null;

  const almacen =
    almacenes.get(
      reserva.idProducto
    ) || null;

  return {
    idReserva:
      reserva.idReserva ??
      null,

    folioReserva:
      reserva.folioReserva ??
      null,

    idOrden:
      reserva.idOrden ??
      null,

    folioOrden:
      reserva.folioOrden ??
      null,

    estadoOrden:
      reserva.estadoOrden ??
      null,

    cliente:
      reserva.cliente ??
      null,

    evento:
      reserva.evento ??
      null,

    direccionEvento:
      reserva.direccionEvento ??
      null,

    idProducto:
      reserva.idProducto ??
      null,

    codigoProducto:
      producto?.codigo ??
      null,

    producto:
      producto?.nombre ??
      null,

    unidadMedida:
      producto?.unidadMedida ??
      null,

    imagenUrl:
      producto?.imagenUrl ??
      null,

    cantidadReservada:
      Number(
        reserva.cantidadReservada ??
        0
      ),

    fechaEntrega:
      reserva.fechaInicio ??
      null,

    fechaRecoleccion:
      reserva.fechaFin ??
      null,

    estado:
      String(
        reserva.estado ?? ''
      )
        .trim()
        .toUpperCase(),

    idAlmacen:
      reserva.idAlmacen ??
      almacen?.idAlmacen ??
      null,

    almacen:
      reserva.almacen ??
      almacen?.almacen ??
      null,

    fechaGeneracion:
      reserva.fechaGeneracion ??
      null,

    usuarioGeneracion:
      reserva.usuarioGeneracion ??
      null,

    fechaUltimaModificacion:
      reserva.fechaUltimaModificacion ??
      null,

    usuarioUltimaModificacion:
      reserva.usuarioUltimaModificacion ??
      null,

    referenciaSalida:
      reserva.referenciaSalida ??
      null,

    referenciaRetorno:
      reserva.referenciaRetorno ??
      null,

    motivoCancelacion:
      reserva.motivoCancelacion ??
      null
  };
}

async function cargarReservas() {
  const productosResultado =
    await listarProductos({
      skip: 0,
      limit: 1000
    });

  const productos =
    new Map(
      productosResultado.items
        .map(
          producto => [
            producto.idProducto,
            producto
          ]
        )
    );

  const almacenes =
    almacenesPorProducto();

  return RESERVAS_FUTURAS_MOCK
    .map(
      reserva =>
        normalizarReserva(
          reserva,
          productos,
          almacenes
        )
    );
}

function contiene(
  valor,
  filtro
) {
  return (
    !filtro ||
    normalizarTexto(
      valor
    ).includes(
      filtro
    )
  );
}

function coincideProducto(
  reserva,
  filtro
) {
  return (
    !filtro ||
    [
      reserva.codigoProducto,
      reserva.producto
    ].some(
      valor =>
        normalizarTexto(
          valor
        ).includes(
          filtro
        )
    )
  );
}

function coincidePeriodo(
  reserva,
  desde,
  hasta
) {
  const inicio =
    reserva.fechaEntrega;

  const fin =
    reserva.fechaRecoleccion;

  if (
    !inicio ||
    !fin
  ) {
    return (
      !desde &&
      !hasta
    );
  }

  if (
    hasta &&
    inicio > hasta
  ) {
    return false;
  }

  if (
    desde &&
    fin < desde
  ) {
    return false;
  }

  return true;
}

function resumen(reservas) {
  return reservas.reduce(
    (
      resultado,
      reserva
    ) => {
      resultado.total += 1;

      if (
        reserva.estado ===
        ESTADOS_RESERVA.CONFIRMADA
      ) {
        resultado.confirmadas +=
          1;
      }

      if (
        reserva.estado ===
        ESTADOS_RESERVA.ACTIVA
      ) {
        resultado.activas +=
          1;
      }

      if (
        reserva.estado ===
        ESTADOS_RESERVA.LIBERADA
      ) {
        resultado.liberadas +=
          1;
      }

      if (
        reserva.estado ===
        ESTADOS_RESERVA.CANCELADA
      ) {
        resultado.canceladas +=
          1;
      }

      return resultado;
    },
    {
      total: 0,
      confirmadas: 0,
      activas: 0,
      liberadas: 0,
      canceladas: 0
    }
  );
}

export async function consultarReservasInventario(
  filtros = {}
) {
  validarPermiso();

  const fechaDesde =
    validarFecha(
      filtros.fechaDesde,
      'fechaDesde',
      'Fecha desde'
    );

  const fechaHasta =
    validarFecha(
      filtros.fechaHasta,
      'fechaHasta',
      'Fecha hasta'
    );

  if (
    fechaDesde &&
    fechaHasta &&
    fechaDesde > fechaHasta
  ) {
    throw error(
      'RANGO_FECHAS_INVALIDO',
      'Fecha desde no puede ser posterior a Fecha hasta.',
      'fechaDesde'
    );
  }

  const estado =
    validarEstado(
      filtros.estado
    );

  const idAlmacen =
    validarAlmacen(
      filtros.idAlmacen
    );

  const idProducto =
  validarProducto(
    filtros.idProducto
  );

  const {
    skip,
    limit
  } =
    validarPaginacion(
      filtros.skip,
      filtros.limit
    );

  const folioOrden =
    normalizarTexto(
      filtros.folioOrden
    );

  const cliente =
    normalizarTexto(
      filtros.cliente
    );

  const evento =
    normalizarTexto(
      filtros.evento
    );

  const producto =
    normalizarTexto(
      filtros.producto
    );

  await simularLatenciaInventario();

  const todas =
    await cargarReservas();

  const totalHistorico =
    todas.length;

  const resultado =
    todas.filter(
      reserva =>
        contiene(
          reserva.folioOrden,
          folioOrden
        ) &&
        contiene(
          reserva.cliente,
          cliente
        ) &&
        contiene(
          reserva.evento,
          evento
        ) &&
        coincideProducto(
          reserva,
          producto
        ) &&
        (
          idProducto === null ||
          reserva.idProducto ===
            idProducto
        ) &&
        coincidePeriodo(
          reserva,
          fechaDesde,
          fechaHasta
        ) &&
        (
          !estado ||
          reserva.estado === estado
        ) &&
        (
          idAlmacen === null ||
          reserva.idAlmacen ===
          idAlmacen
        )
    );

  resultado.sort(
    (
      anterior,
      siguiente
    ) => {
      const fechaAnterior =
        anterior.fechaEntrega ||
        '9999-12-31';

      const fechaSiguiente =
        siguiente.fechaEntrega ||
        '9999-12-31';

      return fechaAnterior ===
        fechaSiguiente
        ? Number(
            anterior.idReserva ||
            0
          ) -
          Number(
            siguiente.idReserva ||
            0
          )
        : fechaAnterior.localeCompare(
            fechaSiguiente
          );
    }
  );

  return clonarDatosInventario({
    items:
      resultado.slice(
        skip,
        skip + limit
      ),

    total:
      resultado.length,

    totalHistorico,

    skip,

    limit,

    resumen:
      resumen(resultado),

    fechaConsulta:
      new Date().toISOString()
  });
}

export async function obtenerReservaInventario(
  idReserva
) {
  validarPermiso();

  const id =
    Number(
      idReserva
    );

  if (
    !Number.isInteger(id) ||
    id <= 0
  ) {
    throw error(
      'RESERVA_INVALIDA',
      'La reserva solicitada no es válida.'
    );
  }

  await simularLatenciaInventario();

  const reserva =
    (
      await cargarReservas()
    ).find(
      item =>
        item.idReserva === id
    );

  if (!reserva) {
    throw error(
      'RESERVA_NO_ENCONTRADA',
      'No se encontró la reserva solicitada.'
    );
  }

  return clonarDatosInventario(
    reserva
  );
}