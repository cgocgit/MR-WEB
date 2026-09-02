import {
  listarProductosInventariables,
  getExistencias
} from './inventario.service.js';

import {
  getSession
} from '../shared/auth-guard.js';

import {
  ALMACEN_CORTE_FISICO,
  CORTES_FISICOS_MOCK,
  clonarDatosCortes,
  simularLatenciaCortes
} from './inventario-cortes.mock.js';

export const ESTADOS_CORTE_FISICO = Object.freeze({
  EN_CAPTURA: 'En captura',
  DIFERENCIAS_PENDIENTES:
    'Con diferencias pendientes',
  CONCLUIDO: 'Concluido'
});

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

function obtenerUsuarioActual() {
  const session = getSession();

  return (
    session?.user?.name ||
    session?.user?.username ||
    'Usuario autenticado'
  );
}

function validarIdCorte(valor) {
  const idCorte = Number(valor);

  if (
    !Number.isInteger(idCorte) ||
    idCorte <= 0
  ) {
    throw crearError(
      'CORTE_INVALIDO',
      'El corte físico solicitado no es válido.'
    );
  }

  return idCorte;
}

function buscarCorteInterno(idCorte) {
  const id = validarIdCorte(idCorte);

  const corte = CORTES_FISICOS_MOCK.find(
    item => item.idCorte === id
  );

  if (!corte) {
    throw crearError(
      'CORTE_NO_ENCONTRADO',
      'No se encontró el corte físico solicitado.'
    );
  }

  return corte;
}

function normalizarObservaciones(valor) {
  return String(valor ?? '').trim();
}

function normalizarCantidadFisica(valor) {
  if (
    valor === null ||
    valor === undefined ||
    valor === ''
  ) {
    return null;
  }

  const cantidad = Number(valor);

  if (
    !Number.isInteger(cantidad) ||
    cantidad < 0
  ) {
    throw crearError(
      'CANTIDAD_FISICA_INVALIDA',
      'La cantidad física debe ser un número entero igual o mayor que cero.',
      'cantidadFisica'
    );
  }

  return cantidad;
}

function obtenerEstadoRenglon(
  cantidadRegistrada,
  cantidadFisica
) {
  if (cantidadFisica === null) {
    return 'Pendiente de conteo';
  }

  return cantidadFisica === cantidadRegistrada
    ? 'Sin diferencia'
    : 'Con diferencia';
}

function recalcularDetalle(detalle) {
  return detalle.map(item => {
    const cantidadFisica =
      normalizarCantidadFisica(
        item.cantidadFisica
      );

    const diferencia =
      cantidadFisica === null
        ? null
        : cantidadFisica -
          Number(item.cantidadRegistrada);

    return {
      ...item,
      cantidadFisica,
      diferencia,
      estadoRenglon:
        obtenerEstadoRenglon(
          Number(item.cantidadRegistrada),
          cantidadFisica
        )
    };
  });
}

function calcularResumen(detalle) {
  return detalle.reduce(
    (resumen, item) => {
      resumen.productosIncluidos += 1;

      if (item.cantidadFisica === null) {
        resumen.productosPendientes += 1;
        return resumen;
      }

      resumen.productosContados += 1;

      if (item.diferencia === 0) {
        resumen.productosSinDiferencia += 1;
        return resumen;
      }

      resumen.productosConDiferencia += 1;

      if (item.diferencia < 0) {
        resumen.unidadesFaltantes +=
          Math.abs(item.diferencia);
      }

      if (item.diferencia > 0) {
        resumen.unidadesSobrantes +=
          item.diferencia;
      }

      return resumen;
    },
    {
      productosIncluidos: 0,
      productosContados: 0,
      productosPendientes: 0,
      productosSinDiferencia: 0,
      productosConDiferencia: 0,
      unidadesFaltantes: 0,
      unidadesSobrantes: 0
    }
  );
}

function actualizarCalculos(corte) {
  corte.detalle =
    recalcularDetalle(corte.detalle || []);

  corte.resumen =
    calcularResumen(corte.detalle);

  return corte;
}

function construirDetalleActualizado(
  corte,
  conteos = []
) {
  if (!Array.isArray(conteos)) {
    throw crearError(
      'CONTEOS_INVALIDOS',
      'La información del conteo no es válida.'
    );
  }

  const detalle =
    recalcularDetalle(corte.detalle || []);

  const productosPorId = new Map(
    detalle.map(item => [
      item.idProducto,
      { ...item }
    ])
  );

  conteos.forEach(conteo => {
    const idProducto =
      Number(conteo?.idProducto);

    if (
      !Number.isInteger(idProducto) ||
      !productosPorId.has(idProducto)
    ) {
      throw crearError(
        'PRODUCTO_CORTE_INVALIDO',
        'El conteo contiene un producto que no pertenece al corte.'
      );
    }

    const producto =
      productosPorId.get(idProducto);

    producto.cantidadFisica =
      normalizarCantidadFisica(
        conteo.cantidadFisica
      );

    productosPorId.set(
      idProducto,
      producto
    );
  });

  return recalcularDetalle(
    Array.from(productosPorId.values())
  );
}

function generarIdCorte() {
  return (
    CORTES_FISICOS_MOCK.reduce(
      (maximo, corte) =>
        Math.max(maximo, corte.idCorte),
      0
    ) + 1
  );
}

function generarFolio(idCorte) {
  const anio =
    new Date().getFullYear();

  return `CF-${anio}-${String(
    idCorte
  ).padStart(4, '0')}`;
}

function obtenerCantidadRegistradaPorProducto(
  existencias
) {
  const cantidades = new Map();

  existencias
    .filter(
      item =>
        item.almacen ===
        ALMACEN_CORTE_FISICO.nombre
    )
    .forEach(item => {
      const actual =
        cantidades.get(item.idProducto) || 0;

      cantidades.set(
        item.idProducto,
        actual + Number(item.cantidad || 0)
      );
    });

  return cantidades;
}

CORTES_FISICOS_MOCK.forEach(
  actualizarCalculos
);

/**
 * Lista y filtra los cortes físicos existentes.
 */
export async function listarCortesFisicos({
  folio = '',
  estado = '',
  fechaDesde = '',
  fechaHasta = ''
} = {}) {
  await simularLatenciaCortes();

  const folioNormalizado =
    String(folio).trim().toLowerCase();

  let cortes =
    CORTES_FISICOS_MOCK.map(corte => {
      actualizarCalculos(corte);

      return {
        idCorte: corte.idCorte,
        folio: corte.folio,
        fechaInicio: corte.fechaInicio,
        responsable: corte.responsable,
        productosContados:
          corte.resumen.productosContados,
        productosIncluidos:
          corte.resumen.productosIncluidos,
        diferenciasDetectadas:
          corte.resumen.productosConDiferencia,
        estado: corte.estado
      };
    });

  if (folioNormalizado) {
    cortes = cortes.filter(corte =>
      corte.folio
        .toLowerCase()
        .includes(folioNormalizado)
    );
  }

  if (estado) {
    cortes = cortes.filter(
      corte => corte.estado === estado
    );
  }

  if (fechaDesde) {
    cortes = cortes.filter(
      corte =>
        corte.fechaInicio.slice(0, 10) >=
        fechaDesde
    );
  }

  if (fechaHasta) {
    cortes = cortes.filter(
      corte =>
        corte.fechaInicio.slice(0, 10) <=
        fechaHasta
    );
  }

  cortes.sort(
    (a, b) =>
      new Date(b.fechaInicio) -
      new Date(a.fechaInicio)
  );

  return clonarDatosCortes(cortes);
}

/**
 * Obtiene el corte físico completo.
 */
export async function obtenerCorteFisico(
  idCorte
) {
  await simularLatenciaCortes();

  const corte =
    buscarCorteInterno(idCorte);

  actualizarCalculos(corte);

  return clonarDatosCortes(corte);
}

/**
 * Crea un nuevo corte físico.
 *
 * Carga los productos inventariables activos
 * y toma la existencia registrada de
 * Almacén Central.
 */
export async function crearCorteFisico() {
  await simularLatenciaCortes(200);

  const [
    productos,
    existencias
  ] = await Promise.all([
    listarProductosInventariables(),
    getExistencias()
  ]);

  if (!productos.length) {
    throw crearError(
      'SIN_PRODUCTOS',
      'No existen productos inventariables activos para iniciar el corte.'
    );
  }

  const cantidades =
    obtenerCantidadRegistradaPorProducto(
      existencias
    );

  const idCorte =
    generarIdCorte();

  const corte = {
    idCorte,
    folio: generarFolio(idCorte),
    idAlmacen:
      ALMACEN_CORTE_FISICO.idAlmacen,
    almacen:
      ALMACEN_CORTE_FISICO.nombre,
    estado:
      ESTADOS_CORTE_FISICO.EN_CAPTURA,
    fechaInicio:
      new Date().toISOString(),
    fechaConclusion: null,
    responsable:
      obtenerUsuarioActual(),
    observaciones: '',
    detalle: productos.map(producto => ({
      idProducto: producto.idProducto,
      codigo: producto.codigo,
      producto: producto.nombre,
      unidadMedida:
        producto.unidadMedida,
      cantidadRegistrada:
        cantidades.get(
          producto.idProducto
        ) || 0,
      cantidadFisica: null
    }))
  };

  actualizarCalculos(corte);

  CORTES_FISICOS_MOCK.push(corte);

  return clonarDatosCortes(corte);
}

/**
 * Guarda el avance sin concluir el corte.
 */
export async function guardarAvanceCorteFisico({
  idCorte,
  observaciones,
  conteos = []
}) {
  await simularLatenciaCortes(200);

  const corte =
    buscarCorteInterno(idCorte);

  if (
    corte.estado !==
    ESTADOS_CORTE_FISICO.EN_CAPTURA
  ) {
    throw crearError(
      'CORTE_NO_EDITABLE',
      'El corte físico ya no permite modificaciones.'
    );
  }

  const detalleActualizado =
    construirDetalleActualizado(
      corte,
      conteos
    );

  corte.detalle = detalleActualizado;

  if (observaciones !== undefined) {
    corte.observaciones =
      normalizarObservaciones(
        observaciones
      );
  }

  corte.fechaUltimaModificacion =
    new Date().toISOString();

  actualizarCalculos(corte);

  return clonarDatosCortes(corte);
}

/**
 * Concluye el corte.
 *
 * No permite concluir si existe algún
 * producto pendiente de conteo.
 */
export async function concluirCorteFisico({
  idCorte,
  observaciones,
  conteos = []
}) {
  await simularLatenciaCortes(200);

  const corte =
    buscarCorteInterno(idCorte);

  if (
    corte.estado !==
    ESTADOS_CORTE_FISICO.EN_CAPTURA
  ) {
    throw crearError(
      'CORTE_NO_EDITABLE',
      'El corte físico ya fue concluido o no permite modificaciones.'
    );
  }

  const detalleActualizado =
    construirDetalleActualizado(
      corte,
      conteos
    );

  const resumen =
    calcularResumen(
      detalleActualizado
    );

  if (
    resumen.productosPendientes > 0
  ) {
    throw crearError(
      'CONTEO_INCOMPLETO',
      'No se puede concluir el corte mientras existan productos pendientes de conteo.'
    );
  }

  corte.detalle =
    detalleActualizado;

  corte.resumen = resumen;

  corte.observaciones =
    normalizarObservaciones(
      observaciones
    );

  corte.fechaConclusion =
    new Date().toISOString();

  corte.fechaUltimaModificacion =
    corte.fechaConclusion;

  corte.estado =
    resumen.productosConDiferencia > 0
      ? ESTADOS_CORTE_FISICO
          .DIFERENCIAS_PENDIENTES
      : ESTADOS_CORTE_FISICO
          .CONCLUIDO;

  return clonarDatosCortes(corte);
}

/**
 * Cancela un corte que permanece en captura.
 *
 * Dado que el catálogo de estados definido
 * para esta funcionalidad no contempla
 * "Cancelado", el mock elimina el corte
 * iniciado y aún no concluido.
 */
export async function cancelarCorteFisico(
  idCorte
) {
  await simularLatenciaCortes(200);

  const corte =
    buscarCorteInterno(idCorte);

  if (
    corte.estado !==
    ESTADOS_CORTE_FISICO.EN_CAPTURA
  ) {
    throw crearError(
      'CORTE_NO_CANCELABLE',
      'Solo puede cancelarse un corte que permanezca en captura.'
    );
  }

  const indice =
    CORTES_FISICOS_MOCK.findIndex(
      item =>
        item.idCorte === corte.idCorte
    );

  CORTES_FISICOS_MOCK.splice(
    indice,
    1
  );

  return {
    idCorte: corte.idCorte,
    cancelado: true
  };
}