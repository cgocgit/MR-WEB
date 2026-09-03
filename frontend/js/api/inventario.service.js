import {
  listarProductos,
  obtenerProducto
} from './catalogo.service.js';

import {
  DISPONIBILIDAD_ALMACEN_MOCK,
  LIMITES_INVENTARIO_MOCK,
  MOVIMIENTOS_INVENTARIO_MOCK,
  RESERVAS_FUTURAS_MOCK,
  clonarDatosInventario,
  simularLatenciaInventario
} from './inventario.mock.js';

function crearError(codigo, mensaje, campo = null) {
  const error = new Error(mensaje);
  error.codigo = codigo;
  error.campo = campo;

  return error;
}

function normalizarIdProducto(idProducto) {
  const id = Number(idProducto);

  if (!Number.isInteger(id) || id <= 0) {
    throw crearError(
      'PRODUCTO_INVALIDO',
      'Seleccione un producto válido.',
      'idProducto'
    );
  }

  return id;
}

function normalizarCantidadSolicitada(cantidad) {
  const numero = Number(cantidad);

  if (!Number.isInteger(numero) || numero <= 0) {
    throw crearError(
      'CANTIDAD_INVALIDA',
      'La cantidad solicitada debe ser un número entero mayor que cero.',
      'cantidad'
    );
  }

  return numero;
}

function normalizarFecha(valor, campo, etiqueta) {
  if (
    typeof valor !== 'string' ||
    !/^\d{4}-\d{2}-\d{2}$/.test(valor)
  ) {
    throw crearError(
      'FECHA_INVALIDA',
      `${etiqueta} es obligatoria.`,
      campo
    );
  }

  return valor;
}

function obtenerDisponibilidadAlmacenes(idProducto) {
  return DISPONIBILIDAD_ALMACEN_MOCK
    .filter(item => item.idProducto === idProducto)
    .map(item => ({
      idAlmacen: item.idAlmacen,
      almacen: item.almacen,
      existenciaFisica: item.existenciaFisica,
      cantidadReservada: item.cantidadReservada,
      disponibilidad: Math.max(
        0,
        item.existenciaFisica - item.cantidadReservada
      )
    }));
}

function calcularTotales(almacenes) {
  return almacenes.reduce(
    (totales, almacen) => ({
      existenciaFisica:
        totales.existenciaFisica + almacen.existenciaFisica,
      cantidadReservada:
        totales.cantidadReservada + almacen.cantidadReservada,
      disponibilidad:
        totales.disponibilidad + almacen.disponibilidad
    }),
    {
      existenciaFisica: 0,
      cantidadReservada: 0,
      disponibilidad: 0
    }
  );
}

function periodosSeTraslapan(
  fechaInicioConsulta,
  fechaFinConsulta,
  fechaInicioReserva,
  fechaFinReserva
) {
  return (
    fechaInicioConsulta <= fechaFinReserva &&
    fechaFinConsulta >= fechaInicioReserva
  );
}

export async function listarProductosInventariables() {
  const resultado = await listarProductos({
    soloActivos: true,
    skip: 0,
    limit: 1000
  });

  return resultado.items.map(producto => ({
    idProducto: producto.idProducto,
    codigo: producto.codigo,
    nombre: producto.nombre,
    unidadMedida: producto.unidadMedida
  }));
}

export async function getExistencias() {
  const productos = await listarProductosInventariables();

  const productosPorId = new Map(
    productos.map(producto => [
      producto.idProducto,
      producto
    ])
  );

  return clonarDatosInventario(
    DISPONIBILIDAD_ALMACEN_MOCK.map(item => ({
      idProducto: item.idProducto,
      producto:
        productosPorId.get(item.idProducto)?.nombre ||
        `Producto ${item.idProducto}`,
      almacen: item.almacen,
      cantidad: item.existenciaFisica,
      reservado: item.cantidadReservada,
      disponible: Math.max(
        0,
        item.existenciaFisica - item.cantidadReservada
      )
    }))
  );
}

/**
 * Normaliza texto para realizar búsquedas
 * sin distinguir mayúsculas ni acentos.
 *
 * @param {*} valor
 * @returns {string}
 */
function normalizarTextoExistencias(valor) {
  return String(valor ?? '')
    .trim()
    .toLocaleLowerCase('es-MX')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

/**
 * Determina si un límite representa
 * una configuración válida.
 *
 * @param {*} valor
 * @returns {boolean}
 */
function esLimiteInventarioValido(valor) {
  const numero =
    Number(valor);

  return (
    Number.isInteger(numero) &&
    numero > 0
  );
}

/**
 * Obtiene y consolida la existencia
 * registrada en todos los almacenes
 * para un producto.
 *
 * @param {number} idProducto
 * @returns {Object}
 */
function obtenerExistenciaConsolidada(
  idProducto
) {
  const registros =
    DISPONIBILIDAD_ALMACEN_MOCK
      .filter(
        item =>
          item.idProducto ===
          idProducto
      );

  const cantidadRegistrada =
    registros.reduce(
      (total, item) =>
        total +
        Number(
          item.existenciaFisica ||
          0
        ),
      0
    );

  const cantidadReservada =
    RESERVAS_FUTURAS_MOCK
      .filter(
        reserva =>
          reserva.idProducto ===
            idProducto &&
          (
            reserva.estado ===
              'CONFIRMADA' ||
            reserva.estado ===
              'ACTIVA'
          )
      )
      .reduce(
        (total, reserva) =>
          total +
          Number(
            reserva.cantidadReservada ||
            0
          ),
        0
      );

  const cantidadDisponible =
    Math.max(
      0,
      cantidadRegistrada -
      cantidadReservada
    );

  const fechas =
    registros
      .map(
        item =>
          item.fechaActualizacion
      )
      .filter(Boolean)
      .sort();

  return {
    idInventario:
      registros.length === 1
        ? registros[0].idInventario ??
          null
        : null,

    idAlmacen:
      registros.length > 0
        ? registros[0].idAlmacen
        : null,

    almacen:
      registros.length > 0
        ? registros[0].almacen
        : null,

    cantidadRegistrada,

    cantidadReservada,

    cantidadDisponible,

    fechaActualizacion:
      fechas.length > 0
        ? fechas[
            fechas.length - 1
          ]
        : null
  };
}

/**
 * Obtiene los límites configurados
 * para un producto.
 *
 * @param {number} idProducto
 * @returns {Object|null}
 */
function obtenerLimitesExistencia(
  idProducto
) {
  return (
    LIMITES_INVENTARIO_MOCK
      .find(
        item =>
          item.idProducto ===
          idProducto
      ) ||
    null
  );
}

/**
 * Determina el nivel actual del
 * producto de acuerdo con sus límites.
 *
 * @param {number} cantidad
 * @param {Object|null} limites
 * @returns {Object}
 */
function evaluarNivelExistencia(
  cantidad,
  limites
) {
  const minimoValido =
    esLimiteInventarioValido(
      limites?.minimo
    );

  const maximoValido =
    esLimiteInventarioValido(
      limites?.maximo
    );

  const stockMinimo =
    minimoValido
      ? Number(limites.minimo)
      : null;

  const stockMaximo =
    maximoValido
      ? Number(limites.maximo)
      : null;

  const configuracionInconsistente =
    minimoValido &&
    maximoValido &&
    stockMinimo >= stockMaximo;

  /*
   * No se infieren valores cuando
   * no existe una configuración
   * utilizable.
   */
  if (
    (
      !minimoValido &&
      !maximoValido
    ) ||
    configuracionInconsistente
  ) {
    return {
      nivel:
        'SIN_CONFIGURAR',

      stockMinimo,
      stockMaximo,

      configuracionInconsistente
    };
  }

  if (
    minimoValido &&
    cantidad <= stockMinimo
  ) {
    return {
      nivel:
        'BAJO_MINIMO',

      stockMinimo,
      stockMaximo,

      configuracionInconsistente:
        false
    };
  }

  if (
    maximoValido &&
    cantidad >= stockMaximo
  ) {
    return {
      nivel:
        'SOBRE_MAXIMO',

      stockMinimo,
      stockMaximo,

      configuracionInconsistente:
        false
    };
  }

  return {
    nivel:
      'EN_RANGO',

    stockMinimo,
    stockMaximo,

    configuracionInconsistente:
      false
  };
}

/**
 * Construye la vista consolidada de
 * existencia correspondiente a un producto.
 *
 * @param {Object} producto
 * @returns {Object}
 */
function construirExistenciaProducto(
  producto
) {
  const existencia =
    obtenerExistenciaConsolidada(
      producto.idProducto
    );

  const limites =
    obtenerLimitesExistencia(
      producto.idProducto
    );

  const nivel =
    evaluarNivelExistencia(
      existencia.cantidadRegistrada,
      limites
    );

  return {
    idInventario:
      existencia.idInventario,

    idProducto:
      producto.idProducto,

    codigo:
      producto.codigo,

    nombre:
      producto.nombre,

    descripcion:
      producto.descripcion ?? '',

    unidadMedida:
      producto.unidadMedida ?? '',

    imagenUrl:
      producto.imagenUrl ?? null,

    activo:
      Number(producto.activo) === 1,

    cantidadRegistrada:
      existencia.cantidadRegistrada,

    cantidadReservada:
      existencia.cantidadReservada,

    cantidadDisponible:
      existencia.cantidadDisponible,

    estadoDisponibilidad:
      existencia.cantidadDisponible > 0
        ? 'DISPONIBLE'
        : 'NO_DISPONIBLE',

    stockMinimo:
      nivel.stockMinimo,

    stockMaximo:
      nivel.stockMaximo,

    nivel:
      nivel.nivel,

    configuracionInconsistente:
      nivel.configuracionInconsistente,

    tieneAlerta:
      nivel.configuracionInconsistente ||
      nivel.nivel ===
        'BAJO_MINIMO' ||
      nivel.nivel ===
        'SOBRE_MAXIMO',

    idAlmacen:
      existencia.idAlmacen,

    almacen:
      existencia.almacen,

    reservaInconsistente:
      existencia.cantidadReservada >
      existencia.cantidadRegistrada,

    fechaActualizacion:
      existencia.fechaActualizacion
  };
}

/**
 * Consulta consolidada de existencias.
 *
 * Esta operación es exclusivamente
 * de lectura.
 *
 * @param {Object} filtros
 * @returns {Promise<Object>}
 */
export async function consultarExistenciasInventario(
  filtros = {}
) {
  const [
    productosResultado
  ] = await Promise.all([
    listarProductos({
      skip: 0,
      limit: 1000
    }),

    simularLatenciaInventario()
  ]);

  let resultado =
    productosResultado.items.map(
      construirExistenciaProducto
    );

  /*
   * Por defecto no se presentan
   * productos inactivos.
   */
  const estadoProducto =
    filtros.estadoProducto || '';

  if (
    estadoProducto ===
    'ACTIVO'
  ) {
    resultado =
      resultado.filter(
        item =>
          item.activo === true
      );
  } else if (
    estadoProducto ===
    'INACTIVO'
  ) {
    resultado =
      resultado.filter(
        item =>
          item.activo === false
      );
  } else if (
    filtros.mostrarInactivos !== true
  ) {
    resultado =
      resultado.filter(
        item =>
          item.activo === true
      );
  }

  /*
   * Producto recibido desde otra
   * pantalla del módulo.
   */
  if (
    filtros.idProducto !==
      undefined &&
    filtros.idProducto !==
      null &&
    filtros.idProducto !==
      ''
  ) {
    const idProducto =
      Number(
        filtros.idProducto
      );

    if (
      Number.isInteger(
        idProducto
      ) &&
      idProducto > 0
    ) {
      resultado =
        resultado.filter(
          item =>
            item.idProducto ===
            idProducto
        );
    }
  }

  /*
   * Búsqueda por código o nombre.
   */
  const texto =
    normalizarTextoExistencias(
      filtros.texto
    );

  if (texto) {
    resultado =
      resultado.filter(item =>
        normalizarTextoExistencias(
          item.codigo
        ).includes(texto) ||
        normalizarTextoExistencias(
          item.nombre
        ).includes(texto) ||
        normalizarTextoExistencias(
          item.descripcion
        ).includes(texto)
      );
  }

  if (
    filtros.disponibilidad ===
      'DISPONIBLE' ||
    filtros.disponibilidad ===
      'NO_DISPONIBLE'
  ) {
    resultado =
      resultado.filter(
        item =>
          item.estadoDisponibilidad ===
          filtros.disponibilidad
      );
  }

  const nivelesValidos = [
    'BAJO_MINIMO',
    'EN_RANGO',
    'SOBRE_MAXIMO',
    'SIN_CONFIGURAR'
  ];

  if (
    nivelesValidos.includes(
      filtros.nivel
    )
  ) {
    resultado =
      resultado.filter(
        item =>
          item.nivel ===
          filtros.nivel
      );
  }

  /*
   * Orden estable por código.
   */
  resultado.sort(
    (a, b) =>
      String(a.codigo)
        .localeCompare(
          String(b.codigo),
          'es-MX',
          {
            numeric: true
          }
        )
  );

  const total =
    resultado.length;

  const skip =
    Math.max(
      0,
      Number(
        filtros.skip ||
        0
      )
    );

  const limitSolicitado =
    Number(
      filtros.limit ||
      10
    );

  const limit =
    Number.isInteger(
      limitSolicitado
    ) &&
    limitSolicitado > 0
      ? limitSolicitado
      : 10;

  return clonarDatosInventario({
    items:
      resultado.slice(
        skip,
        skip + limit
      ),

    total,
    skip,
    limit,

    fechaConsulta:
      new Date()
        .toISOString()
  });
}

export async function getMovimientos() {
  await simularLatenciaInventario();

  return clonarDatosInventario(MOVIMIENTOS_INVENTARIO_MOCK);
}

export async function consultarDisponibilidadFutura({
  idProducto,
  cantidad,
  fechaInicio,
  fechaFin
}) {
  await simularLatenciaInventario();

  const id = normalizarIdProducto(idProducto);
  const cantidadSolicitada = normalizarCantidadSolicitada(cantidad);
  const inicio = normalizarFecha(
    fechaInicio,
    'fechaInicio',
    'La fecha de entrega o inicio'
  );
  const fin = normalizarFecha(
    fechaFin,
    'fechaFin',
    'La fecha de recolección o fin'
  );

  if (fin < inicio) {
    throw crearError(
      'PERIODO_INVALIDO',
      'La fecha de recolección o fin no puede ser anterior a la fecha de entrega o inicio.',
      'fechaFin'
    );
  }

  await obtenerProducto(id);

  const almacenes = obtenerDisponibilidadAlmacenes(id);
  const totales = calcularTotales(almacenes);

  const reservas = RESERVAS_FUTURAS_MOCK
    .filter(reserva =>
      reserva.idProducto === id &&
      reserva.estado === 'CONFIRMADA' &&
      periodosSeTraslapan(
        inicio,
        fin,
        reserva.fechaInicio,
        reserva.fechaFin
      )
    )
    .map(reserva => ({ ...reserva }));

  const cantidadComprometida = reservas.reduce(
    (total, reserva) => total + reserva.cantidadReservada,
    0
  );

  const cantidadDisponiblePeriodo = Math.max(
    0,
    totales.existenciaFisica - cantidadComprometida
  );

  return clonarDatosInventario({
    idProducto: id,
    cantidadSolicitada,
    fechaInicio: inicio,
    fechaFin: fin,
    cantidadRegistrada: totales.existenciaFisica,
    cantidadComprometida,
    cantidadDisponiblePeriodo,
    disponible: cantidadDisponiblePeriodo >= cantidadSolicitada,
    reservas
  });
}