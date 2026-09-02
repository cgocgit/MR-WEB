import {
  listarProductos,
  obtenerProducto
} from './catalogo.service.js';

import {
  DISPONIBILIDAD_ALMACEN_MOCK,
  LIMITES_INVENTARIO_MOCK,
  clonarDatos,
  simularLatencia
} from './inventario-limites.mock.js';

import {
  getSession
} from '../shared/auth-guard.js';

function crearError(codigo, mensaje, campo = null) {
  const error = new Error(mensaje);
  error.codigo = codigo;
  error.campo = campo;
  return error;
}

function validarIdProducto(valor) {
  const idProducto = Number(valor);

  if (!Number.isInteger(idProducto) || idProducto <= 0) {
    throw crearError(
      'PRODUCTO_INVALIDO',
      'Seleccione un producto válido.',
      'idProducto'
    );
  }

  return idProducto;
}

function validarLimite(valor, campo, etiqueta) {
  const numero = Number(valor);

  if (!Number.isInteger(numero) || numero <= 0) {
    throw crearError(
      'LIMITE_INVALIDO',
      `${etiqueta} debe ser un entero mayor que cero.`,
      campo
    );
  }

  return numero;
}

function obtenerUsuarioActual() {
  const session = getSession();

  return session?.user?.name ||
    session?.user?.username ||
    'Usuario autenticado';
}

function calcularTotales(almacenes) {
  return almacenes.reduce(
    (total, almacen) => ({
      existenciaFisica:
        total.existenciaFisica + almacen.existenciaFisica,

      cantidadReservada:
        total.cantidadReservada + almacen.cantidadReservada,

      disponibilidad:
        total.disponibilidad + almacen.disponibilidad
    }),
    {
      existenciaFisica: 0,
      cantidadReservada: 0,
      disponibilidad: 0
    }
  );
}

/**
 * Simula:
 * GET /inventario/productos-inventariables
 */
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

/**
 * Simula:
 * GET /inventario/productos/{idProducto}/limites
 */
export async function obtenerConfiguracionLimites(idProducto) {
  await simularLatencia();

  const id = validarIdProducto(idProducto);
  const producto = await obtenerProducto(id);

  const almacenes = DISPONIBILIDAD_ALMACEN_MOCK
    .filter(item => item.idProducto === id)
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

  const totales = calcularTotales(almacenes);

  const limites = LIMITES_INVENTARIO_MOCK.find(
    item => item.idProducto === id
  ) || null;

  return clonarDatos({
    producto: {
      idProducto: producto.idProducto,
      codigo: producto.codigo,
      nombre: producto.nombre,
      unidadMedida: producto.unidadMedida
    },
    almacenes,
    totales,
    limites
  });
}

/**
 * Simula:
 * PUT /inventario/productos/{idProducto}/limites
 */
export async function guardarConfiguracionLimites({
  idProducto,
  minimo,
  maximo
}) {
  await simularLatencia(200);

  const id = validarIdProducto(idProducto);

  const minimoValidado = validarLimite(
    minimo,
    'minimo',
    'El mínimo'
  );

  const maximoValidado = validarLimite(
    maximo,
    'maximo',
    'El máximo'
  );

  if (maximoValidado < minimoValidado) {
    throw crearError(
      'LIMITES_INCONSISTENTES',
      'El máximo debe ser mayor o igual que el mínimo.',
      'maximo'
    );
  }

  const configuracion = {
    idProducto: id,
    minimo: minimoValidado,
    maximo: maximoValidado,
    fechaUltimaModificacion: new Date().toISOString(),
    usuarioUltimaModificacion: obtenerUsuarioActual()
  };

  const existente = LIMITES_INVENTARIO_MOCK.find(
    item => item.idProducto === id
  );

  if (existente) {
    Object.assign(existente, configuracion);
  } else {
    LIMITES_INVENTARIO_MOCK.push(configuracion);
  }

  return obtenerConfiguracionLimites(id);
}