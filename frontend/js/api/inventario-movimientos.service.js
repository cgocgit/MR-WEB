import {
  getMovimientos
} from './inventario.service.js';

import {
  listarProductos
} from './catalogo.service.js';

import {
  getSession
} from '../shared/auth-guard.js';

import {
  hasPermission
} from '../shared/permissions.js';

export const TIPOS_MOVIMIENTO =
  Object.freeze({
    ENTRADA: 'ENTRADA',
    SALIDA: 'SALIDA',
    AJUSTE: 'AJUSTE'
  });

export const SENTIDOS_MOVIMIENTO =
  Object.freeze({
    INCREMENTO: 'INCREMENTO',
    DECREMENTO: 'DECREMENTO'
  });

export const ORIGENES_MOVIMIENTO =
  Object.freeze({
    CARGA_INICIAL: 'CARGA_INICIAL',
    REINGRESO: 'REINGRESO',
    ORDEN_SERVICIO: 'ORDEN_SERVICIO',
    CORTE_FISICO: 'CORTE_FISICO',
    SOPORTE_ADMINISTRADOR:
      'SOPORTE_ADMINISTRADOR'
  });

const PERMISO_CONSULTA =
  'inventario.movimientos.consultar';

function crearError(
  codigo,
  mensaje,
  campo = null
) {
  const error = new Error(mensaje);

  error.codigo = codigo;
  error.campo = campo;

  return error;
}

function validarPermiso() {
  const session = getSession();

  if (
    !hasPermission(
      session,
      PERMISO_CONSULTA
    )
  ) {
    throw crearError(
      'ACCESO_DENEGADO',
      'No dispone de permisos para consultar el historial de movimientos.'
    );
  }
}

function normalizarTexto(valor) {
  return String(valor ?? '')
    .trim()
    .toLocaleLowerCase('es-MX')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

function numeroOpcional(valor) {
  if (
    valor === '' ||
    valor === null ||
    valor === undefined
  ) {
    return null;
  }

  const numero = Number(valor);

  return Number.isFinite(numero)
    ? numero
    : null;
}

function idOpcional(valor) {
  const numero = numeroOpcional(valor);

  return (
    Number.isInteger(numero) &&
    numero > 0
  )
    ? numero
    : null;
}

function normalizarFechaFiltro(
  valor,
  campo,
  etiqueta,
  finDia = false
) {
  if (
    valor === '' ||
    valor === null ||
    valor === undefined
  ) {
    return null;
  }

  const texto = String(valor).trim();

  if (!/^\d{4}-\d{2}-\d{2}$/.test(texto)) {
    throw crearError(
      'FECHA_INVALIDA',
      `${etiqueta} no es válida.`,
      campo
    );
  }

  const fecha = new Date(
    `${texto}T${
      finDia
        ? '23:59:59.999'
        : '00:00:00.000'
    }`
  );

  if (Number.isNaN(fecha.getTime())) {
    throw crearError(
      'FECHA_INVALIDA',
      `${etiqueta} no es válida.`,
      campo
    );
  }

  return fecha.getTime();
}

function normalizarPaginacion(
  skip,
  limit
) {
  const skipNumero = Number(skip ?? 0);
  const limitNumero = Number(limit ?? 10);

  return {
    skip:
      Number.isInteger(skipNumero) &&
      skipNumero >= 0
        ? skipNumero
        : 0,

    limit:
      Number.isInteger(limitNumero) &&
      limitNumero > 0 &&
      limitNumero <= 100
        ? limitNumero
        : 10
  };
}

function validarFiltroEnum(
  valor,
  permitidos,
  campo,
  etiqueta
) {
  const normalizado = String(
    valor ?? ''
  )
    .trim()
    .toUpperCase();

  if (!normalizado) {
    return '';
  }

  if (!permitidos.includes(normalizado)) {
    throw crearError(
      'FILTRO_INVALIDO',
      `${etiqueta} no es válido.`,
      campo
    );
  }

  return normalizado;
}

function normalizarTipo(tipo) {
  const valor = String(tipo ?? '')
    .trim()
    .toUpperCase();

  return Object.values(
    TIPOS_MOVIMIENTO
  ).includes(valor)
    ? valor
    : null;
}

function normalizarSentido(
  movimiento,
  tipo
) {
  if (
    tipo ===
    TIPOS_MOVIMIENTO.ENTRADA
  ) {
    return SENTIDOS_MOVIMIENTO
      .INCREMENTO;
  }

  if (
    tipo ===
    TIPOS_MOVIMIENTO.SALIDA
  ) {
    return SENTIDOS_MOVIMIENTO
      .DECREMENTO;
  }

  if (
    tipo !==
    TIPOS_MOVIMIENTO.AJUSTE
  ) {
    return null;
  }

  const sentido = String(
    movimiento.sentido ?? ''
  )
    .trim()
    .toUpperCase();

  return Object.values(
    SENTIDOS_MOVIMIENTO
  ).includes(sentido)
    ? sentido
    : null;
}

function normalizarOrigen(
  movimiento,
  tipo
) {
  const motivoEntrada = String(
    movimiento.motivoEntrada ?? ''
  )
    .trim()
    .toUpperCase();

  if (
    motivoEntrada ===
      ORIGENES_MOVIMIENTO.CARGA_INICIAL ||
    motivoEntrada ===
      ORIGENES_MOVIMIENTO.REINGRESO
  ) {
    return motivoEntrada;
  }

  const origenAjuste = String(
    movimiento.origenAjuste ?? ''
  )
    .trim()
    .toUpperCase();

  if (
    origenAjuste ===
      ORIGENES_MOVIMIENTO.CORTE_FISICO ||
    origenAjuste ===
      ORIGENES_MOVIMIENTO.SOPORTE_ADMINISTRADOR
  ) {
    return origenAjuste;
  }

  const origen = String(
    movimiento.origen ?? ''
  )
    .trim()
    .toUpperCase();

  if (
    Object.values(
      ORIGENES_MOVIMIENTO
    ).includes(origen)
  ) {
    return origen;
  }

  const motivo = normalizarTexto(
    movimiento.motivo
  );

  if (
    tipo === TIPOS_MOVIMIENTO.ENTRADA &&
    motivo.includes('carga inicial')
  ) {
    return ORIGENES_MOVIMIENTO
      .CARGA_INICIAL;
  }

  if (
    tipo === TIPOS_MOVIMIENTO.ENTRADA &&
    motivo.includes('reingreso')
  ) {
    return ORIGENES_MOVIMIENTO
      .REINGRESO;
  }

  if (
    tipo === TIPOS_MOVIMIENTO.SALIDA &&
    (
      movimiento.idOrdenServicio ||
      movimiento.folioOrden
    )
  ) {
    return ORIGENES_MOVIMIENTO
      .ORDEN_SERVICIO;
  }

  return null;
}

function normalizarMovimiento(
  movimiento,
  productosPorId
) {
  const idProducto = idOpcional(
    movimiento.idProducto
  );

  const producto = idProducto
    ? productosPorId.get(idProducto)
    : null;

  const tipo = normalizarTipo(
    movimiento.tipo
  );

  const cantidadOriginal =
    numeroOpcional(
      movimiento.cantidad
    );

  return {
    idMovimiento:
      idOpcional(
        movimiento.idMovimiento
      ),

    folio:
      movimiento.folio ??
      movimiento.folioMovimiento ??
      null,

    fecha:
      movimiento.fecha ?? null,

    idProducto,

    codigoProducto:
      movimiento.codigoProducto ??
      movimiento.codigo ??
      producto?.codigo ??
      null,

    nombreProducto:
      movimiento.nombreProducto ??
      movimiento.producto ??
      producto?.nombre ??
      null,

    unidadMedida:
      movimiento.unidadMedida ??
      producto?.unidadMedida ??
      null,

    imagenProducto:
      movimiento.imagenProducto ??
      movimiento.imagenUrl ??
      producto?.imagenUrl ??
      null,

    idAlmacen:
      idOpcional(
        movimiento.idAlmacen
      ),

    almacen:
      movimiento.almacen ?? null,

    tipo,

    origen:
      normalizarOrigen(
        movimiento,
        tipo
      ),

    cantidad:
      cantidadOriginal === null
        ? null
        : Math.abs(
            cantidadOriginal
          ),

    sentido:
      normalizarSentido(
        movimiento,
        tipo
      ),

    existenciaAnterior:
      numeroOpcional(
        movimiento.existenciaAnterior
      ),

    existenciaResultante:
      numeroOpcional(
        movimiento.existenciaResultante
      ),

    cantidadReservada:
      numeroOpcional(
        movimiento.cantidadReservada ??
        movimiento.reservaConservada
      ),

    disponibilidadResultante:
      numeroOpcional(
        movimiento.disponibilidadResultante
      ),

    idOrdenServicio:
      idOpcional(
        movimiento.idOrdenServicio
      ),

    folioOrden:
      movimiento.folioOrden ?? null,

    idCorte:
      idOpcional(
        movimiento.idCorte
      ),

    folioCorte:
      movimiento.folioCorte ?? null,

    usuario:
      movimiento.usuario ?? null,

    comentario:
      movimiento.comentario ?? null,

    observaciones:
      movimiento.observaciones ?? null
  };
}

function coincideTexto(
  movimiento,
  texto
) {
  if (!texto) {
    return true;
  }

  const campos = [
    movimiento.folio,
    movimiento.codigoProducto,
    movimiento.nombreProducto
  ];

  return campos.some(
    campo =>
      normalizarTexto(campo)
        .includes(texto)
  );
}

function coincideReferencia(
  movimiento,
  referencia
) {
  if (!referencia) {
    return true;
  }

  return [
    movimiento.folioOrden,
    movimiento.folioCorte
  ].some(
    valor =>
      normalizarTexto(valor)
        .includes(referencia)
  );
}

function fechaMovimientoTiempo(fecha) {
  if (!fecha) {
    return null;
  }

  const valor = new Date(fecha);

  return Number.isNaN(valor.getTime())
    ? null
    : valor.getTime();
}

function construirResumen(
  movimientos
) {
  return movimientos.reduce(
    (resumen, movimiento) => {
      resumen.total += 1;

      if (
        movimiento.tipo ===
        TIPOS_MOVIMIENTO.ENTRADA
      ) {
        resumen.entradas += 1;
      } else if (
        movimiento.tipo ===
        TIPOS_MOVIMIENTO.SALIDA
      ) {
        resumen.salidas += 1;
      } else if (
        movimiento.tipo ===
        TIPOS_MOVIMIENTO.AJUSTE
      ) {
        resumen.ajustes += 1;
      }

      return resumen;
    },
    {
      total: 0,
      entradas: 0,
      salidas: 0,
      ajustes: 0
    }
  );
}

export async function consultarMovimientosInventario(
  filtros = {}
) {
  validarPermiso();

  const fechaDesde =
    normalizarFechaFiltro(
      filtros.fechaDesde,
      'fechaDesde',
      'Fecha desde'
    );

  const fechaHasta =
    normalizarFechaFiltro(
      filtros.fechaHasta,
      'fechaHasta',
      'Fecha hasta',
      true
    );

  if (
    fechaDesde !== null &&
    fechaHasta !== null &&
    fechaDesde > fechaHasta
  ) {
    throw crearError(
      'RANGO_FECHAS_INVALIDO',
      'Fecha desde no puede ser posterior a Fecha hasta.',
      'fechaDesde'
    );
  }

  const {
    skip,
    limit
  } = normalizarPaginacion(
    filtros.skip,
    filtros.limit
  );

  const [
    movimientosOrigen,
    productosResultado
  ] = await Promise.all([
    getMovimientos(),
    listarProductos({
      skip: 0,
      limit: 1000
    })
  ]);

  const productosPorId = new Map(
    productosResultado.items.map(
      producto => [
        producto.idProducto,
        producto
      ]
    )
  );

  const movimientos =
    movimientosOrigen.map(
      movimiento =>
        normalizarMovimiento(
          movimiento,
          productosPorId
        )
    );

  const totalHistorico =
    movimientos.length;

  const texto = normalizarTexto(
    filtros.texto
  );

  const referencia =
    normalizarTexto(
      filtros.referencia
    );

  const usuario = normalizarTexto(
    filtros.usuario
  );

  const idProductoFiltro =
    idOpcional(
      filtros.idProducto
    );

  const tipoFiltro =
    validarFiltroEnum(
      filtros.tipo,
      Object.values(TIPOS_MOVIMIENTO),
      'tipo',
      'Tipo de movimiento'
    );

  const origenFiltro =
    validarFiltroEnum(
      filtros.origen,
      Object.values(ORIGENES_MOVIMIENTO),
      'origen',
      'Origen'
    );

  const sentidoFiltro =
    validarFiltroEnum(
      filtros.sentido,
      Object.values(SENTIDOS_MOVIMIENTO),
      'sentido',
      'Sentido'
    );

  let resultado = movimientos.filter(
    movimiento => {
      const fechaTiempo =
        fechaMovimientoTiempo(
          movimiento.fecha
        );

      if (
        fechaDesde !== null &&
        (
          fechaTiempo === null ||
          fechaTiempo < fechaDesde
        )
      ) {
        return false;
      }

      if (
        fechaHasta !== null &&
        (
          fechaTiempo === null ||
          fechaTiempo > fechaHasta
        )
      ) {
        return false;
      }

      if (
        idProductoFiltro !== null &&
        movimiento.idProducto !==
          idProductoFiltro
      ) {
        return false;
      }

      if (
        !coincideTexto(
          movimiento,
          texto
        )
      ) {
        return false;
      }

      if (
        tipoFiltro &&
        movimiento.tipo !== tipoFiltro
      ) {
        return false;
      }

      if (
        origenFiltro &&
        movimiento.origen !==
          origenFiltro
      ) {
        return false;
      }

      if (
        usuario &&
        normalizarTexto(
          movimiento.usuario
        ) !== usuario
      ) {
        return false;
      }

      if (
        !coincideReferencia(
          movimiento,
          referencia
        )
      ) {
        return false;
      }

      if (
        sentidoFiltro &&
        movimiento.sentido !==
          sentidoFiltro
      ) {
        return false;
      }

      return true;
    }
  );

  resultado.sort((a, b) => {
    const fechaA =
      fechaMovimientoTiempo(a.fecha) ?? 0;

    const fechaB =
      fechaMovimientoTiempo(b.fecha) ?? 0;

    if (fechaA !== fechaB) {
      return fechaB - fechaA;
    }

    return (
      Number(b.idMovimiento ?? 0) -
      Number(a.idMovimiento ?? 0)
    );
  });

  const total = resultado.length;

  const resumen =
    construirResumen(
      resultado
    );

  const usuarios = [
    ...new Set(
      movimientos
        .map(
          movimiento =>
            String(
              movimiento.usuario ?? ''
            ).trim()
        )
        .filter(Boolean)
    )
  ].sort(
    (a, b) =>
      a.localeCompare(
        b,
        'es-MX',
        {
          sensitivity: 'base'
        }
      )
  );

  return {
    items:
      resultado.slice(
        skip,
        skip + limit
      ),

    total,
    totalHistorico,
    skip,
    limit,
    resumen,

    opciones: {
      usuarios
    },

    contextoProducto:
      idProductoFiltro !== null
        ? (() => {
            const producto =
              productosPorId.get(
                idProductoFiltro
              );

            return producto
              ? {
                  idProducto:
                    producto.idProducto,
                  codigo:
                    producto.codigo,
                  nombre:
                    producto.nombre
                }
              : {
                  idProducto:
                    idProductoFiltro,
                  codigo: null,
                  nombre: null
                };
          })()
        : null,

    fechaConsulta:
      new Date().toISOString()
  };
}