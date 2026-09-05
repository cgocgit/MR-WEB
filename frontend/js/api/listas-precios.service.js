import {
  getSession
} from '../shared/auth-guard.js';

import {
  listarListasPrecioRepository,
  obtenerListaPrecioRepository,
  obtenerProductoRepository,
  actualizarConfiguracionListaPrecioRepository
} from './listas-precios.repository.js';


function crearError(
  codigo,
  mensaje,
  detalles = null
) {
  const error = new Error(mensaje);

  error.codigo = codigo;
  error.detalles = detalles;

  return error;
}


function normalizarId(
  id,
  entidad = 'registro'
) {
  const valor = Number(id);

  if (
    !Number.isInteger(valor) ||
    valor <= 0
  ) {
    throw crearError(
      'ID_INVALIDO',
      `El identificador de ${entidad} no es válido.`
    );
  }

  return valor;
}


function normalizarNumeroNoNegativo(
  valor,
  campo
) {
  if (
    valor === null ||
    valor === undefined ||
    valor === ''
  ) {
    throw crearError(
      'VALIDACION_ERROR',
      `${campo} es requerido.`,
      [
        {
          campo,
          mensaje:
            `${campo} es requerido.`
        }
      ]
    );
  }

  const numero = Number(valor);

  if (
    !Number.isFinite(numero) ||
    numero < 0
  ) {
    throw crearError(
      'VALIDACION_ERROR',
      `${campo} debe ser un número mayor o igual a cero.`,
      [
        {
          campo,
          mensaje:
            `${campo} debe ser mayor o igual a cero.`
        }
      ]
    );
  }

  return numero;
}


function redondearMoneda(valor) {
  return Math.round(
    (
      Number(valor) +
      Number.EPSILON
    ) * 100
  ) / 100;
}


function obtenerFechaIso(
  fecha = new Date()
) {
  if (
    typeof fecha === 'string' &&
    /^\d{4}-\d{2}-\d{2}$/.test(fecha)
  ) {
    return fecha;
  }

  const valor =
    fecha instanceof Date
      ? fecha
      : new Date(fecha);

  if (
    Number.isNaN(
      valor.getTime()
    )
  ) {
    throw crearError(
      'FECHA_INVALIDA',
      'La fecha de referencia no es válida.'
    );
  }

  const year =
    valor.getFullYear();

  const month =
    String(
      valor.getMonth() + 1
    ).padStart(2, '0');

  const day =
    String(
      valor.getDate()
    ).padStart(2, '0');

  return `${year}-${month}-${day}`;
}


function obtenerUsuarioActual() {
  const session = getSession();

  return (
    session?.user?.username ||
    'usuario-sin-sesion'
  );
}


function normalizarConfiguracion(
  lista
) {
  return {
    ...lista,

    porcentajeAdicionalFueraLista:
      Number(
        lista.porcentajeAdicionalFueraLista ??
        0
      ),

    detalleProductos:
      Array.isArray(
        lista.detalleProductos
      )
        ? lista.detalleProductos
        : []
  };
}


/**
 * Indica si una Lista de Precios
 * se encuentra activa y vigente.
 *
 * @param {Object} lista
 * @param {Date|string} fecha
 * @returns {boolean}
 */
export function estaListaPrecioVigente(
  lista,
  fecha = new Date()
) {
  if (!lista) {
    return false;
  }

  if (
    Number(lista.activo) !== 1
  ) {
    return false;
  }

  const referencia =
    obtenerFechaIso(fecha);

  const inicio =
    String(
      lista.vigenciaInicio || ''
    );

  const fin =
    String(
      lista.vigenciaFin || ''
    );

  if (
    !inicio ||
    !fin
  ) {
    return false;
  }

  return (
    referencia >= inicio &&
    referencia <= fin
  );
}


/**
 * Devuelve las Listas de Precios
 * activas y vigentes para una fecha.
 *
 * Será la operación principal que
 * consumirá Cotizaciones para llenar
 * el selector de Lista de Precios.
 *
 * @param {Object} opciones
 * @param {Date|string} opciones.fecha
 */
export async function listarListasPrecioDisponibles(
  {
    fecha = new Date()
  } = {}
) {
  const listas =
    await listarListasPrecioRepository();

  return listas
    .map(
      normalizarConfiguracion
    )
    .filter(
      lista =>
        estaListaPrecioVigente(
          lista,
          fecha
        )
    )
    .sort(
      (a, b) =>
        String(
          a.nombre || ''
        ).localeCompare(
          String(
            b.nombre || ''
          )
        )
    );
}


/**
 * Obtiene la configuración comercial completa
 * de una Lista de Precios.
 *
 * Enriquece la relación idProducto
 * con información proveniente de Catálogo.
 *
 * @param {number|string} idListaPrecio
 */
export async function obtenerConfiguracionListaPrecio(
  idListaPrecio
) {
  const id =
    normalizarId(
      idListaPrecio,
      'lista de precios'
    );

  const lista =
    await obtenerListaPrecioRepository(
      id
    );

  if (!lista) {
    throw crearError(
      'LISTA_PRECIO_NO_ENCONTRADA',
      'Lista de precios no encontrada.'
    );
  }

  const configuracion =
    normalizarConfiguracion(
      lista
    );

  const detalleProductos =
    await Promise.all(
      configuracion.detalleProductos.map(
        async detalle => {
          const producto =
            await obtenerProductoRepository(
              detalle.idProducto
            );

          return {
            idProducto:
              Number(
                detalle.idProducto
              ),

            precio:
              Number(
                detalle.precio
              ),

            codigo:
              producto?.codigo ||
              '',

            nombre:
              producto?.nombre ||
              'Producto no disponible',

            precioBase:
              Number(
                producto?.precioBase ??
                0
              ),

            activo:
              producto?.activo === 1
                ? 1
                : 0,

            existe:
              Boolean(producto)
          };
        }
      )
    );

  return {
    ...configuracion,
    detalleProductos
  };
}


/**
 * Resuelve el precio aplicable
 * de un producto para una Lista de Precios.
 *
 * Si está incluido:
 *   utiliza el precio configurado en la lista.
 *
 * Si está fuera:
 *   utiliza precioBase + porcentaje adicional.
 *
 * Cotizaciones deberá consumir el resultado
 * sin volver a implementar esta regla.
 *
 * @param {Object} parametros
 * @param {number|string} parametros.idListaPrecio
 * @param {number|string} parametros.idProducto
 */
export async function resolverPrecioProducto(
  {
    idListaPrecio,
    idProducto
  }
) {
  const idLista =
    normalizarId(
      idListaPrecio,
      'lista de precios'
    );

  const idProd =
    normalizarId(
      idProducto,
      'producto'
    );

  const [
    lista,
    producto
  ] =
    await Promise.all([
      obtenerConfiguracionListaPrecio(
        idLista
      ),

      obtenerProductoRepository(
        idProd
      )
    ]);

  if (!producto) {
    throw crearError(
      'PRODUCTO_NO_ENCONTRADO',
      'Producto no encontrado.'
    );
  }

  const detalle =
    lista.detalleProductos.find(
      item =>
        Number(
          item.idProducto
        ) === idProd
    );

  const precioBase =
    Number(
      producto.precioBase ??
      0
    );

  if (detalle) {
    const precioAplicado =
      redondearMoneda(
        detalle.precio
      );

    return {
      idListaPrecio:
        idLista,

      idProducto:
        idProd,

      incluidoEnLista:
        true,

      precioBase,

      precioLista:
        precioAplicado,

      porcentajeAdicional:
        0,

      precioAplicado
    };
  }

  const porcentajeAdicional =
    Number(
      lista
        .porcentajeAdicionalFueraLista ??
      0
    );

  const precioAplicado =
    redondearMoneda(
      precioBase *
      (
        1 +
        porcentajeAdicional / 100
      )
    );

  return {
    idListaPrecio:
      idLista,

    idProducto:
      idProd,

    incluidoEnLista:
      false,

    precioBase,

    precioLista:
      null,

    porcentajeAdicional,

    precioAplicado
  };
}


/**
 * Guarda la configuración completa
 * de productos/precios de una lista.
 *
 * @param {number|string} idListaPrecio
 * @param {Object} configuracion
 * @param {number|string} configuracion.porcentajeAdicionalFueraLista
 * @param {Array} configuracion.detalleProductos
 */
export async function guardarConfiguracionListaPrecio(
  idListaPrecio,
  {
    porcentajeAdicionalFueraLista = 0,
    detalleProductos = []
  } = {}
) {
  const idLista =
    normalizarId(
      idListaPrecio,
      'lista de precios'
    );

  const lista =
    await obtenerListaPrecioRepository(
      idLista
    );

  if (!lista) {
    throw crearError(
      'LISTA_PRECIO_NO_ENCONTRADA',
      'Lista de precios no encontrada.'
    );
  }

  const porcentaje =
    normalizarNumeroNoNegativo(
      porcentajeAdicionalFueraLista,
      'porcentajeAdicionalFueraLista'
    );

  if (
    !Array.isArray(
      detalleProductos
    )
  ) {
    throw crearError(
      'VALIDACION_ERROR',
      'El detalle de productos de la lista no es válido.'
    );
  }

  const normalizados = [];
  const ids = new Set();

  for (
    const detalle
    of detalleProductos
  ) {
    const idProducto =
      normalizarId(
        detalle.idProducto,
        'producto'
      );

    const precio =
      normalizarNumeroNoNegativo(
        detalle.precio,
        'precio'
      );

    if (
      ids.has(
        idProducto
      )
    ) {
      throw crearError(
        'PRODUCTO_DUPLICADO',
        'Un producto no puede aparecer más de una vez en la misma lista de precios.',
        [
          {
            campo:
              'detalleProductos',

            idProducto
          }
        ]
      );
    }

    const producto =
      await obtenerProductoRepository(
        idProducto
      );

    if (!producto) {
      throw crearError(
        'PRODUCTO_NO_ENCONTRADO',
        `El producto ${idProducto} no existe.`
      );
    }

    ids.add(
      idProducto
    );

    normalizados.push({
      idProducto,

      precio:
        redondearMoneda(
          precio
        )
    });
  }

  const actualizado =
    await actualizarConfiguracionListaPrecioRepository(
      idLista,

      {
        porcentajeAdicionalFueraLista:
          porcentaje,

        detalleProductos:
          normalizados
      },

      obtenerUsuarioActual()
    );

  if (!actualizado) {
    throw crearError(
      'LISTA_PRECIO_NO_ENCONTRADA',
      'Lista de precios no encontrada.'
    );
  }

  return obtenerConfiguracionListaPrecio(
    idLista
  );
}


/**
 * Agrega un producto a una Lista de Precios.
 *
 * @param {number|string} idListaPrecio
 * @param {Object} detalle
 * @param {number|string} detalle.idProducto
 * @param {number|string} detalle.precio
 */
export async function agregarProductoListaPrecio(
  idListaPrecio,
  {
    idProducto,
    precio
  }
) {
  const lista =
    await obtenerConfiguracionListaPrecio(
      idListaPrecio
    );

  const idProd =
    normalizarId(
      idProducto,
      'producto'
    );

  const yaExiste =
    lista.detalleProductos.some(
      item =>
        Number(
          item.idProducto
        ) === idProd
    );

  if (yaExiste) {
    throw crearError(
      'PRODUCTO_DUPLICADO',
      'El producto ya forma parte de la lista de precios.'
    );
  }

  return guardarConfiguracionListaPrecio(
    idListaPrecio,
    {
      porcentajeAdicionalFueraLista:
        lista
          .porcentajeAdicionalFueraLista,

      detalleProductos: [
        ...lista.detalleProductos.map(
          item => ({
            idProducto:
              item.idProducto,

            precio:
              item.precio
          })
        ),

        {
          idProducto:
            idProd,

          precio
        }
      ]
    }
  );
}


/**
 * Modifica únicamente el precio
 * de un producto ya incluido.
 *
 * @param {number|string} idListaPrecio
 * @param {Object} detalle
 * @param {number|string} detalle.idProducto
 * @param {number|string} detalle.precio
 */
export async function actualizarPrecioProductoLista(
  idListaPrecio,
  {
    idProducto,
    precio
  }
) {
  const lista =
    await obtenerConfiguracionListaPrecio(
      idListaPrecio
    );

  const idProd =
    normalizarId(
      idProducto,
      'producto'
    );

  let encontrado = false;

  const detalleProductos =
    lista.detalleProductos.map(
      item => {
        if (
          Number(
            item.idProducto
          ) !== idProd
        ) {
          return {
            idProducto:
              item.idProducto,

            precio:
              item.precio
          };
        }

        encontrado = true;

        return {
          idProducto:
            idProd,

          precio
        };
      }
    );

  if (!encontrado) {
    throw crearError(
      'PRODUCTO_NO_INCLUIDO',
      'El producto no forma parte de la lista de precios.'
    );
  }

  return guardarConfiguracionListaPrecio(
    idListaPrecio,
    {
      porcentajeAdicionalFueraLista:
        lista
          .porcentajeAdicionalFueraLista,

      detalleProductos
    }
  );
}


/**
 * Elimina la relación producto-precio
 * de una Lista de Precios.
 *
 * No elimina el producto del Catálogo.
 *
 * @param {number|string} idListaPrecio
 * @param {number|string} idProducto
 */
export async function eliminarProductoListaPrecio(
  idListaPrecio,
  idProducto
) {
  const lista =
    await obtenerConfiguracionListaPrecio(
      idListaPrecio
    );

  const idProd =
    normalizarId(
      idProducto,
      'producto'
    );

  const detalleProductos =
    lista.detalleProductos
      .filter(
        item =>
          Number(
            item.idProducto
          ) !== idProd
      )
      .map(
        item => ({
          idProducto:
            item.idProducto,

          precio:
            item.precio
        })
      );

  if (
    detalleProductos.length ===
    lista.detalleProductos.length
  ) {
    throw crearError(
      'PRODUCTO_NO_INCLUIDO',
      'El producto no forma parte de la lista de precios.'
    );
  }

  return guardarConfiguracionListaPrecio(
    idListaPrecio,
    {
      porcentajeAdicionalFueraLista:
        lista
          .porcentajeAdicionalFueraLista,

      detalleProductos
    }
  );
}