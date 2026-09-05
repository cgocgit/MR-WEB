import {
  LISTAS_PRECIOS_MOCK,
  PRODUCTOS_MOCK,
  clonarDatos,
  simularLatencia
} from './catalogo.mock.js';

function normalizarId(id, entidad = 'registro') {
  const valor = Number(id);

  if (!Number.isInteger(valor) || valor <= 0) {
    const error = new Error(
      `El identificador de ${entidad} no es válido.`
    );

    error.codigo = 'ID_INVALIDO';

    throw error;
  }

  return valor;
}

function obtenerIndiceListaPrecio(idListaPrecio) {
  const id = normalizarId(
    idListaPrecio,
    'lista de precios'
  );

  return LISTAS_PRECIOS_MOCK.findIndex(
    lista =>
      Number(lista.idListaPrecio) === id
  );
}

/**
 * Obtiene todas las listas de precios.
 *
 * Este repositorio constituye la capa de acceso
 * a datos para Lista de Precios.
 *
 * Cuando los mocks sean reemplazados por REST,
 * este archivo será el punto de sustitución.
 */
export async function listarListasPrecioRepository() {
  await simularLatencia(100);

  return clonarDatos(
    LISTAS_PRECIOS_MOCK
  );
}

/**
 * Obtiene una lista de precios por identificador.
 *
 * @param {number|string} idListaPrecio
 * @returns {Promise<Object|null>}
 */
export async function obtenerListaPrecioRepository(
  idListaPrecio
) {
  await simularLatencia(100);

  const indice =
    obtenerIndiceListaPrecio(idListaPrecio);

  if (indice === -1) {
    return null;
  }

  return clonarDatos(
    LISTAS_PRECIOS_MOCK[indice]
  );
}

/**
 * Obtiene un producto del Catálogo.
 *
 * La Lista de Precios mantiene únicamente
 * la relación con idProducto.
 *
 * @param {number|string} idProducto
 * @returns {Promise<Object|null>}
 */
export async function obtenerProductoRepository(
  idProducto
) {
  await simularLatencia(80);

  const id = normalizarId(
    idProducto,
    'producto'
  );

  const producto = PRODUCTOS_MOCK.find(
    item =>
      Number(item.idProducto) === id
  );

  return producto
    ? clonarDatos(producto)
    : null;
}

/**
 * Actualiza únicamente la configuración comercial
 * perteneciente a la Lista de Precios.
 *
 * No modifica nombre, descripción, vigencia
 * ni estado de la lista.
 *
 * @param {number|string} idListaPrecio
 * @param {Object} configuracion
 * @param {number} configuracion.porcentajeAdicionalFueraLista
 * @param {Array} configuracion.detalleProductos
 * @param {string} usuario
 * @returns {Promise<Object|null>}
 */
export async function actualizarConfiguracionListaPrecioRepository(
  idListaPrecio,
  configuracion,
  usuario
) {
  await simularLatencia(150);

  const indice =
    obtenerIndiceListaPrecio(idListaPrecio);

  if (indice === -1) {
    return null;
  }

  LISTAS_PRECIOS_MOCK[indice] = {
    ...LISTAS_PRECIOS_MOCK[indice],

    porcentajeAdicionalFueraLista:
      configuracion.porcentajeAdicionalFueraLista,

    detalleProductos:
      clonarDatos(
        configuracion.detalleProductos || []
      ),

    fechaModificacion:
      new Date(),

    modificadoPor:
      usuario || 'usuario-sin-sesion'
  };

  return clonarDatos(
    LISTAS_PRECIOS_MOCK[indice]
  );
}