import {
  listarProductosInventariables,
  consultarExistenciasInventario
} from './inventario.service.js';

import {
  obtenerProducto
} from './catalogo.service.js';

import {
  DISPONIBILIDAD_ALMACEN_MOCK,
  MOVIMIENTOS_INVENTARIO_MOCK,
  simularLatenciaInventario
} from './inventario.mock.js';

import {
  RECOLECCIONES_REINGRESO_MOCK,
  clonarEntradasMock
} from './inventario-entradas.mock.js';

import {
  getSession
} from '../shared/auth-guard.js';

const ID_ALMACEN_CENTRAL = 1;
const ALMACEN_CENTRAL = 'Almacén Central';

const MOTIVOS_VALIDOS = [
  'CARGA_INICIAL',
  'REINGRESO'
];

/*
 * Impide que dos envíos concurrentes idénticos
 * generen dos movimientos.
 */
const registrosEnProceso = new Set();

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

function normalizarCantidad(cantidad) {
  const numero = Number(cantidad);

  if (
    !Number.isInteger(numero) ||
    numero <= 0
  ) {
    throw crearError(
      'CANTIDAD_INVALIDA',
      'La cantidad debe ser un número entero mayor que cero.',
      'cantidad'
    );
  }

  return numero;
}

function obtenerUsuarioActual() {
  const session = getSession();

  return (
    session?.user?.name ||
    session?.user?.username ||
    'usuario-sin-sesion'
  );
}

function obtenerRecoleccionValida(
  idOrdenServicio
) {
  const id = normalizarId(
    idOrdenServicio,
    'idOrdenServicio',
    'La Orden de Servicio'
  );

  const recoleccion =
    RECOLECCIONES_REINGRESO_MOCK.find(
      item =>
        item.idOrdenServicio === id &&
        item.estadoRecoleccion ===
          'RECOLECTADO'
    );

  if (!recoleccion) {
    throw crearError(
      'RECOLECCION_NO_VALIDA',
      'La Orden de Servicio no tiene una recolección disponible para reingreso.',
      'idOrdenServicio'
    );
  }

  return recoleccion;
}

async function consultarExistenciaProducto(
  idProducto
) {
  const resultado =
    await consultarExistenciasInventario({
      idProducto,
      mostrarInactivos: true,
      skip: 0,
      limit: 1
    });

  return resultado.items[0] || null;
}

export async function listarProductosEntrada() {
  return listarProductosInventariables();
}

export async function listarOrdenesReingreso() {
  await simularLatenciaInventario();

  const ordenes =
    RECOLECCIONES_REINGRESO_MOCK
      .filter(
        item =>
          item.estadoRecoleccion ===
          'RECOLECTADO'
      )
      .map(item => ({
        idOrdenServicio:
          item.idOrdenServicio,

        folio:
          item.folio,

        cliente:
          item.cliente,

        fechaEvento:
          item.fechaEvento,

        fase:
          item.fase,

        estadoRecoleccion:
          item.estadoRecoleccion
      }));

  return clonarEntradasMock(ordenes);
}

export async function obtenerOrdenReingreso(
  idOrdenServicio
) {
  await simularLatenciaInventario();

  const recoleccion =
    obtenerRecoleccionValida(
      idOrdenServicio
    );

  return clonarEntradasMock({
    idOrdenServicio:
      recoleccion.idOrdenServicio,

    folio:
      recoleccion.folio,

    cliente:
      recoleccion.cliente,

    fechaEvento:
      recoleccion.fechaEvento,

    fase:
      recoleccion.fase,

    estadoRecoleccion:
      recoleccion.estadoRecoleccion
  });
}

export async function listarProductosReingreso(
  idOrdenServicio
) {
  const recoleccion =
    obtenerRecoleccionValida(
      idOrdenServicio
    );

  const productosInventariables =
    await listarProductosInventariables();

  const idsPermitidos =
    new Set(
      recoleccion.productos.map(
        item => item.idProducto
      )
    );

  return productosInventariables
    .filter(
      producto =>
        idsPermitidos.has(
          producto.idProducto
        )
    )
    .map(producto => {
      const relacion =
        recoleccion.productos.find(
          item =>
            item.idProducto ===
            producto.idProducto
        );

      return {
        ...producto,
        cantidadRelacionada:
          relacion?.cantidadRelacionada ??
          null
      };
    });
}

export async function consultarProductoEntrada(
  idProducto
) {
  const id = normalizarId(
    idProducto,
    'idProducto',
    'El producto'
  );

  const [
    producto,
    existencia
  ] = await Promise.all([
    obtenerProducto(id),
    consultarExistenciaProducto(id)
  ]);

  if (Number(producto.activo) !== 1) {
    throw crearError(
      'PRODUCTO_INACTIVO',
      'El producto seleccionado no se encuentra activo.',
      'idProducto'
    );
  }

  return {
    idProducto:
      producto.idProducto,

    codigo:
      producto.codigo,

    nombre:
      producto.nombre,

    unidadMedida:
      producto.unidadMedida ?? '',

    imagenUrl:
      producto.imagenUrl ?? null,

    activo: true,

    idInventario:
      existencia?.idInventario ??
      null,

    idAlmacen:
      existencia?.idAlmacen ??
      ID_ALMACEN_CENTRAL,

    almacen:
      existencia?.almacen ??
      ALMACEN_CENTRAL,

    existenciaFisica:
      existencia?.cantidadRegistrada ??
      0,

    cantidadReservada:
      existencia?.cantidadReservada ??
      0,

    disponibilidad:
      existencia?.cantidadDisponible ??
      0,

    minimo:
      existencia?.stockMinimo ??
      null,

    maximo:
      existencia?.stockMaximo ??
      null,

    fechaActualizacion:
      existencia?.fechaActualizacion ??
      null
  };
}

function validarProductoReingreso(
  idOrdenServicio,
  idProducto
) {
  const recoleccion =
    obtenerRecoleccionValida(
      idOrdenServicio
    );

  const pertenece =
    recoleccion.productos.some(
      item =>
        item.idProducto === idProducto
    );

  if (!pertenece) {
    throw crearError(
      'PRODUCTO_NO_PERTENECE_ORDEN',
      'El producto seleccionado no pertenece a la Orden de Servicio.',
      'idProducto'
    );
  }

  return recoleccion;
}

function obtenerFolioMovimiento(
  idMovimiento
) {
  return (
    `ENT-${String(idMovimiento).padStart(6, '0')}`
  );
}

function construirClaveOperacion({
  motivoEntrada,
  idProducto,
  cantidad,
  idOrdenServicio
}) {
  return [
    motivoEntrada,
    idProducto,
    cantidad,
    idOrdenServicio ?? ''
  ].join('|');
}

export async function registrarEntrada({
  motivoEntrada,
  idProducto,
  cantidad,
  idOrdenServicio = null,
  observaciones = ''
}) {
  if (
    !MOTIVOS_VALIDOS.includes(
      motivoEntrada
    )
  ) {
    throw crearError(
      'MOTIVO_INVALIDO',
      'Seleccione un motivo de entrada válido.',
      'motivoEntrada'
    );
  }

  const productoId =
    normalizarId(
      idProducto,
      'idProducto',
      'El producto'
    );

  const cantidadEntrada =
    normalizarCantidad(cantidad);

  let recoleccion = null;

  if (motivoEntrada === 'REINGRESO') {
    recoleccion =
      validarProductoReingreso(
        idOrdenServicio,
        productoId
      );
  }

  const claveOperacion =
    construirClaveOperacion({
      motivoEntrada,
      idProducto: productoId,
      cantidad: cantidadEntrada,
      idOrdenServicio:
        recoleccion?.idOrdenServicio ??
        null
    });

  if (
    registrosEnProceso.has(
      claveOperacion
    )
  ) {
    throw crearError(
      'OPERACION_EN_PROCESO',
      'La entrada ya se encuentra en proceso.'
    );
  }

  registrosEnProceso.add(
    claveOperacion
  );

  try {
    await simularLatenciaInventario(300);

    /*
     * Se vuelve a consultar la existencia
     * inmediatamente antes de registrar.
     */
    const existenciaVigente =
      await consultarProductoEntrada(
        productoId
      );

    const existenciaAnterior =
      existenciaVigente.existenciaFisica;

    const existenciaResultante =
      existenciaAnterior +
      cantidadEntrada;

    const cantidadReservada =
      existenciaVigente.cantidadReservada;

    const disponibilidadResultante =
      Math.max(
        0,
        existenciaResultante -
        cantidadReservada
      );

    const maximo =
      existenciaVigente.maximo;

    const maximoExcedido =
      Number.isInteger(maximo) &&
      existenciaResultante > maximo;

    const fechaRegistro =
      new Date().toISOString();

    let registroInventario =
      DISPONIBILIDAD_ALMACEN_MOCK.find(
        item =>
          item.idProducto ===
            productoId &&
          item.idAlmacen ===
            ID_ALMACEN_CENTRAL
      );

    if (!registroInventario) {
      const siguienteIdInventario =
        Math.max(
          0,
          ...DISPONIBILIDAD_ALMACEN_MOCK
            .map(
              item =>
                Number(
                  item.idInventario || 0
                )
            )
        ) + 1;

      registroInventario = {
        idInventario:
          siguienteIdInventario,

        idProducto:
          productoId,

        idAlmacen:
          ID_ALMACEN_CENTRAL,

        almacen:
          ALMACEN_CENTRAL,

        existenciaFisica:
          0,

        /*
         * No se alteran reservas desde
         * Registro de entrada.
         */
        cantidadReservada:
          0,

        fechaActualizacion:
          fechaRegistro
      };

      DISPONIBILIDAD_ALMACEN_MOCK.push(
        registroInventario
      );
    }

    /*
     * A partir de este punto se aplican
     * conjuntamente existencia y movimiento.
     */
    const existenciaOriginal =
      registroInventario.existenciaFisica;

    try {
      registroInventario.existenciaFisica =
        existenciaResultante;

      registroInventario.fechaActualizacion =
        fechaRegistro;

      const siguienteIdMovimiento =
        Math.max(
          0,
          ...MOVIMIENTOS_INVENTARIO_MOCK
            .map(
              item =>
                Number(
                  item.idMovimiento || 0
                )
            )
        ) + 1;

      const folioMovimiento =
        obtenerFolioMovimiento(
          siguienteIdMovimiento
        );

      const movimiento = {
        idMovimiento:
          siguienteIdMovimiento,

        folio:
          folioMovimiento,

        idProducto:
          productoId,

        idAlmacen:
          ID_ALMACEN_CENTRAL,

        almacen:
          ALMACEN_CENTRAL,

        tipo:
          'ENTRADA',

        cantidad:
          cantidadEntrada,

        fecha:
          fechaRegistro,

        motivoEntrada,

        motivo:
          motivoEntrada ===
            'CARGA_INICIAL'
            ? 'Carga inicial de inventario'
            : 'Reingreso de inventario',

        idOrdenServicio:
          recoleccion?.idOrdenServicio ??
          null,

        folioOrden:
          recoleccion?.folio ??
          null,

        observaciones:
          String(
            observaciones ?? ''
          ).trim(),

        usuario:
          obtenerUsuarioActual()
      };

      MOVIMIENTOS_INVENTARIO_MOCK.push(
        movimiento
      );

      return {
        idMovimiento:
          siguienteIdMovimiento,

        folioMovimiento,

        tipoMovimiento:
          'ENTRADA',

        fechaRegistro,

        usuario:
          movimiento.usuario,

        existenciaAnterior,

        cantidadIngresada:
          cantidadEntrada,

        existenciaResultante,

        cantidadReservada,

        disponibilidadResultante,

        maximoExcedido,

        excesoMaximo:
          maximoExcedido
            ? existenciaResultante -
              maximo
            : 0
      };
    } catch (error) {
      /*
       * Rollback del mock si el movimiento
       * no logra registrarse.
       */
      registroInventario.existenciaFisica =
        existenciaOriginal;

      throw error;
    }
  } finally {
    registrosEnProceso.delete(
      claveOperacion
    );
  }
}