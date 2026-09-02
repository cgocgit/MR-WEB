/**
 * Servicio de Catálogo
 * Maneja todas las operaciones CRUD de Productos, Servicios y Paquetes
 * Utilizará mocks en desarrollo y será reemplazado por llamadas REST en producción
 */
import {
  PRODUCTOS_MOCK,
  SERVICIOS_MOCK,
  PAQUETES_MOCK,
  LISTAS_PRECIOS_MOCK,
  clonarDatos,
  obtenerProductoPorId,
  obtenerServicioPorId,
  obtenerPaquetePorId,
  existeCodigoProducto,
  existeCodigoServicio,
  existeCodigoPaquete,
  simularLatencia
} from './catalogo.mock.js';
import {
  ESTADO_REGISTRO,
  CATEGORIAS_PRODUCTO,
  CATEGORIAS_SERVICIO,
  TIPOS_PRODUCTO,
  TIPOS_SERVICIO,
  COLORES,
  MENSAJES,
  LIMITES_CAMPOS
} from './catalogo.constants.js';
import { getSession } from '../shared/auth-guard.js';

// ====================
// OPERACIONES PRODUCTOS
// ====================

/**
 * Listar productos con filtros opcionales
 * @param {Object} filtros - { nombre, codigo, categoria, tipo, color, estado, skip, limit }
 * @returns {Promise<Object>} { items: [], total: 0 }
 */
export async function listarProductos(filtros = {}) {
  await simularLatencia(200);

  let resultado = clonarDatos(PRODUCTOS_MOCK);

  if (filtros.texto) {
    const texto = filtros.texto.toLowerCase().trim();

    resultado = resultado.filter(producto =>
      producto.codigo?.toLowerCase().includes(texto) ||
      producto.nombre?.toLowerCase().includes(texto) ||
      producto.descripcion?.toLowerCase().includes(texto)
    );
  }

  if (
    filtros.categoria !== undefined &&
    filtros.categoria !== null &&
    filtros.categoria !== ''
  ) {
    resultado = resultado.filter(
      producto =>
        producto.idCategoria === Number(filtros.categoria)
    );
  }

  if (
    filtros.tipo !== undefined &&
    filtros.tipo !== null &&
    filtros.tipo !== ''
  ) {
    resultado = resultado.filter(
      producto =>
        producto.idTipoProducto === Number(filtros.tipo)
    );
  }

  if (
    filtros.color !== undefined &&
    filtros.color !== null &&
    filtros.color !== ''
  ) {
    resultado = resultado.filter(
      producto =>
        producto.idColor === Number(filtros.color)
    );
  }

  if (
    filtros.estado !== undefined &&
    filtros.estado !== null &&
    filtros.estado !== ''
  ) {
    resultado = resultado.filter(
      producto =>
        producto.activo === Number(filtros.estado)
    );
  }

  if (filtros.soloActivos === true) {
    resultado = resultado.filter(
      producto => producto.activo === 1
    );
  }

  if (filtros.disponibilidad === 'disponible') {
    resultado = resultado.filter(
      producto => Number(producto.disponibilidad || 0) > 0
    );
  }

  if (filtros.disponibilidad === 'sin-disponibilidad') {
    resultado = resultado.filter(
      producto => Number(producto.disponibilidad || 0) <= 0
    );
  }

  const total = resultado.length;

  const skip = Number(filtros.skip || 0);
  const limit = Number(filtros.limit || 10);

  return {
    items: resultado.slice(skip, skip + limit),
    total,
    skip,
    limit
  };
}

/**
 * Obtener producto por ID
 */
export async function obtenerProducto(id) {
  await simularLatencia(150);

  const idProducto = normalizarId(id, 'producto');
  const producto = obtenerProductoPorId(idProducto);

  if (!producto) {
    throw crearError(
      'PRODUCTO_NO_ENCONTRADO',
      MENSAJES.PRODUCTO_NO_ENCONTRADO
    );
  }

  return producto;
}

/**
 * Registrar nuevo producto
 */
export async function registrarProducto(datos) {
  await simularLatencia(300);
  
  // Validaciones
  const errores = validarProducto(datos, null);
  if (errores.length > 0) {
    throw crearError('VALIDACION_ERROR', MENSAJES.VALIDACION_ERROR, errores);
  }
  
  // Verificar código duplicado
  if (existeCodigoProducto(datos.codigo)) {
    throw crearError('CODIGO_DUPLICADO', MENSAJES.PRODUCTO_CODIGO_DUPLICADO);
  }
  
  // Generar nuevo producto
  const nuevoProducto = {
    idProducto: Math.max(...PRODUCTOS_MOCK.map(p => p.idProducto), 0) + 1,
    ...datos,
    activo: datos.activo ? 1 : 0,
    fechaRegistro: new Date(),
    creadoPor: obtenerUsuarioActual(),
    fechaModificacion: new Date(),
    modificadoPor: obtenerUsuarioActual(),
    estadoRegistro: ESTADO_REGISTRO.ACTIVO
  };
  
  PRODUCTOS_MOCK.push(nuevoProducto);
  return clonarDatos(nuevoProducto);
}

/**
 * Actualizar producto existente
 */
export async function actualizarProducto(id, datos) {

  await simularLatencia(300);
  
  const idProducto = normalizarId(id, 'producto');

  const indice = PRODUCTOS_MOCK.findIndex(p => p.idProducto === idProducto);
  if (indice === -1) {
    throw crearError('PRODUCTO_NO_ENCONTRADO', MENSAJES.PRODUCTO_NO_ENCONTRADO);
  }
  
  // Validaciones
  const errores = validarProducto(datos, id);
  if (errores.length > 0) {
    throw crearError('VALIDACION_ERROR', MENSAJES.VALIDACION_ERROR, errores);
  }
  
  // Verificar código duplicado (excluyendo el actual)
  if (datos.codigo !== PRODUCTOS_MOCK[indice].codigo && existeCodigoProducto(datos.codigo, idProducto)) {
    throw crearError('CODIGO_DUPLICADO', MENSAJES.PRODUCTO_CODIGO_DUPLICADO);
  }
  
  // Actualizar
  const productoActualizado = {
    ...PRODUCTOS_MOCK[indice],
    ...datos,
    idProducto: idProducto,
    fechaModificacion: new Date(),
    modificadoPor: obtenerUsuarioActual(),
    estadoRegistro: ESTADO_REGISTRO.ACTIVO
  };
  
  PRODUCTOS_MOCK[indice] = productoActualizado;
  return clonarDatos(productoActualizado);
}

/**
 * Cambiar estado activo/inactivo de producto
 */
export async function cambiarEstadoProducto(id, activo) {
  await simularLatencia(200);

  const idProducto = normalizarId(id, 'producto');

  const indice = PRODUCTOS_MOCK.findIndex(
    producto => producto.idProducto === idProducto
  );

  if (indice === -1) {
    throw crearError(
      'PRODUCTO_NO_ENCONTRADO',
      MENSAJES.PRODUCTO_NO_ENCONTRADO
    );
  }

  PRODUCTOS_MOCK[indice].activo = activo ? 1 : 0;
  PRODUCTOS_MOCK[indice].fechaModificacion = new Date();
  PRODUCTOS_MOCK[indice].modificadoPor = obtenerUsuarioActual();

  return clonarDatos(PRODUCTOS_MOCK[indice]);
}

// ====================
// OPERACIONES SERVICIOS
// ====================

/**
 * Listar servicios con filtros opcionales
 */
export async function listarServicios(filtros = {}) {
  await simularLatencia(200);

  let resultado = clonarDatos(SERVICIOS_MOCK);

  if (filtros.texto) {
    const texto = filtros.texto
      .toLowerCase()
      .trim();

    resultado = resultado.filter(servicio =>
      servicio.codigo?.toLowerCase().includes(texto) ||
      servicio.nombre?.toLowerCase().includes(texto) ||
      servicio.descripcion?.toLowerCase().includes(texto)
    );
  }

  if (
    filtros.categoria !== undefined &&
    filtros.categoria !== null &&
    filtros.categoria !== ''
  ) {
    resultado = resultado.filter(
      servicio =>
        servicio.idCategoria === Number(filtros.categoria)
    );
  }

  if (
    filtros.tipo !== undefined &&
    filtros.tipo !== null &&
    filtros.tipo !== ''
  ) {
    resultado = resultado.filter(
      servicio =>
        servicio.tipoServicio === filtros.tipo
    );
  }

  if (
    filtros.estado !== undefined &&
    filtros.estado !== null &&
    filtros.estado !== ''
  ) {
    resultado = resultado.filter(
      servicio =>
        servicio.activo === Number(filtros.estado)
    );
  }

  if (filtros.soloActivos === true) {
    resultado = resultado.filter(
      servicio => servicio.activo === 1
    );
  }

  if (
    filtros.tarifaMin !== undefined &&
    filtros.tarifaMin !== null &&
    filtros.tarifaMin !== ''
  ) {
    resultado = resultado.filter(
      servicio =>
        Number(servicio.tarifaBase) >=
        Number(filtros.tarifaMin)
    );
  }

  if (
    filtros.tarifaMax !== undefined &&
    filtros.tarifaMax !== null &&
    filtros.tarifaMax !== ''
  ) {
    resultado = resultado.filter(
      servicio =>
        Number(servicio.tarifaBase) <=
        Number(filtros.tarifaMax)
    );
  }

  resultado.sort(
    (a, b) =>
      a.nombre.localeCompare(b.nombre)
  );

  const skip = Number(filtros.skip || 0);
  const limit = Number(filtros.limit || 10);
  const total = resultado.length;

  return {
    items: resultado.slice(skip, skip + limit),
    total,
    skip,
    limit
  };
}

/**
 * Obtener servicio por ID
 */
export async function obtenerServicio(id) {
  await simularLatencia(150);

  const idServicio = normalizarId(id, 'servicio');

  const servicio = obtenerServicioPorId(idServicio);

  if (!servicio) {
    throw crearError(
      'SERVICIO_NO_ENCONTRADO',
      MENSAJES.SERVICIO_NO_ENCONTRADO
    );
  }

  return servicio;
}

/**
 * Registrar nuevo servicio
 */
export async function registrarServicio(datos) {
  await simularLatencia(300);
  
  // Validaciones
  const errores = validarServicio(datos, null);
  if (errores.length > 0) {
    throw crearError('VALIDACION_ERROR', MENSAJES.VALIDACION_ERROR, errores);
  }
  
  // Verificar código duplicado
  if (existeCodigoServicio(datos.codigo)) {
    throw crearError('CODIGO_DUPLICADO', MENSAJES.SERVICIO_CODIGO_DUPLICADO);
  }
  
  // Generar nuevo servicio
  const nuevoServicio = {
    idServicio: Math.max(...SERVICIOS_MOCK.map(s => s.idServicio), 0) + 1,
    ...datos,
    activo: datos.activo ? 1 : 0,
    fechaRegistro: new Date(),
    creadoPor: obtenerUsuarioActual(),
    fechaModificacion: new Date(),
    modificadoPor: obtenerUsuarioActual(),
    estadoRegistro: ESTADO_REGISTRO.ACTIVO
  };
  
  SERVICIOS_MOCK.push(nuevoServicio);
  return clonarDatos(nuevoServicio);
}

/**
 * Actualizar servicio existente
 */
export async function actualizarServicio(id, datos) {
  await simularLatencia(300);

  const idServicio = normalizarId(id, 'servicio');

  const indice = SERVICIOS_MOCK.findIndex(
    servicio => servicio.idServicio === idServicio
  );

  if (indice === -1) {
    throw crearError(
      'SERVICIO_NO_ENCONTRADO',
      MENSAJES.SERVICIO_NO_ENCONTRADO
    );
  }

  const errores = validarServicio(datos, idServicio);

  if (errores.length > 0) {
    throw crearError(
      'VALIDACION_ERROR',
      MENSAJES.VALIDACION_ERROR,
      errores
    );
  }

  if (
    datos.codigo !== SERVICIOS_MOCK[indice].codigo &&
    existeCodigoServicio(datos.codigo, idServicio)
  ) {
    throw crearError(
      'CODIGO_DUPLICADO',
      MENSAJES.SERVICIO_CODIGO_DUPLICADO
    );
  }

  const servicioActualizado = {
    ...SERVICIOS_MOCK[indice],
    ...datos,
    idServicio,
    fechaModificacion: new Date(),
    modificadoPor: obtenerUsuarioActual(),
    estadoRegistro: ESTADO_REGISTRO.ACTIVO
  };

  SERVICIOS_MOCK[indice] = servicioActualizado;

  return clonarDatos(servicioActualizado);
}

/**
 * Cambiar estado activo/inactivo de servicio
 */
export async function cambiarEstadoServicio(id, activo) {
  await simularLatencia(200);

  const idServicio = normalizarId(id, 'servicio');

  const indice = SERVICIOS_MOCK.findIndex(
    servicio => servicio.idServicio === idServicio
  );

  if (indice === -1) {
    throw crearError(
      'SERVICIO_NO_ENCONTRADO',
      MENSAJES.SERVICIO_NO_ENCONTRADO
    );
  }

  SERVICIOS_MOCK[indice].activo = activo ? 1 : 0;
  SERVICIOS_MOCK[indice].fechaModificacion = new Date();
  SERVICIOS_MOCK[indice].modificadoPor = obtenerUsuarioActual();

  return clonarDatos(SERVICIOS_MOCK[indice]);
}

// ====================
// OPERACIONES PAQUETES
// ====================

function enriquecerPaquete(paquete) {
  const detalleProductos =
    (paquete.detalleProductos || []).map(detalle => {
      const producto =
        PRODUCTOS_MOCK.find(
          item =>
            item.idProducto ===
            Number(detalle.idProducto)
        );

      return {
        ...detalle,
        idProducto:
          Number(detalle.idProducto),

        codigo:
          producto?.codigo ||
          `Producto ${detalle.idProducto}`,

        nombre:
          producto?.nombre ||
          'Producto no disponible',

        activo:
          producto?.activo === 1 ? 1 : 0,

        existe:
          Boolean(producto)
      };
    });

  const detalleServicios =
    (paquete.detalleServicios || []).map(detalle => {
      const servicio =
        SERVICIOS_MOCK.find(
          item =>
            item.idServicio ===
            Number(detalle.idServicio)
        );

      return {
        ...detalle,
        idServicio:
          Number(detalle.idServicio),

        codigo:
          servicio?.codigo ||
          `Servicio ${detalle.idServicio}`,

        nombre:
          servicio?.nombre ||
          'Servicio no disponible',

        activo:
          servicio?.activo === 1 ? 1 : 0,

        existe:
          Boolean(servicio)
      };
    });

  const totalCalculado = [
    ...detalleProductos.map(
      detalle =>
        Number(detalle.subtotal || 0)
    ),
    ...detalleServicios.map(
      detalle =>
        Number(detalle.subtotal || 0)
    )
  ].reduce(
    (total, subtotal) =>
      total + subtotal,
    0
  );

  return {
    ...clonarDatos(paquete),

    detalleProductos,
    detalleServicios,

    totalProductos:
      detalleProductos.length,

    totalServicios:
      detalleServicios.length,

    totalComponentes:
      detalleProductos.length +
      detalleServicios.length,

    totalCalculado,

    tieneComponentesInactivos:
      detalleProductos.some(
        detalle =>
          detalle.activo !== 1
      ) ||
      detalleServicios.some(
        detalle =>
          detalle.activo !== 1
      )
  };
}

function prepararDetallesPaquete(
  datos,
  idPaquete
) {
  const idsProductos =
    PAQUETES_MOCK.flatMap(
      paquete =>
        paquete.detalleProductos || []
    )
      .map(
        detalle =>
          Number(
            detalle.idDetallePaqueteProducto || 0
          )
      );

  const idsServicios =
    PAQUETES_MOCK.flatMap(
      paquete =>
        paquete.detalleServicios || []
    )
      .map(
        detalle =>
          Number(
            detalle.idDetallePaqueteServicio || 0
          )
      );

  let siguienteProducto =
    Math.max(
      ...idsProductos,
      4000
    ) + 1;

  let siguienteServicio =
    Math.max(
      ...idsServicios,
      5000
    ) + 1;

  const detalleProductos =
    (datos.detalleProductos || [])
      .map(detalle => {
        const cantidad =
          Number(detalle.cantidad);

        const precioUnitario =
          Number(detalle.precioUnitario);

        return {
          idDetallePaqueteProducto:
            detalle.idDetallePaqueteProducto ||
            siguienteProducto++,

          idPaquete,

          idProducto:
            Number(detalle.idProducto),

          cantidad,

          precioUnitario,

          subtotal:
            cantidad * precioUnitario
        };
      });

  const detalleServicios =
    (datos.detalleServicios || [])
      .map(detalle => {
        const cantidad =
          Number(detalle.cantidad);

        const tarifa =
          Number(detalle.tarifa);

        return {
          idDetallePaqueteServicio:
            detalle.idDetallePaqueteServicio ||
            siguienteServicio++,

          idPaquete,

          idServicio:
            Number(detalle.idServicio),

          cantidad,

          tarifa,

          subtotal:
            cantidad * tarifa
        };
      });

  return {
    detalleProductos,
    detalleServicios
  };
}

function validarPaquete(datos) {
  const errores = [];

  if (
    !datos.codigo ||
    datos.codigo.trim() === ''
  ) {
    errores.push({
      campo: 'codigo',
      mensaje: 'Código es requerido'
    });
  } else if (
    datos.codigo.length >
    LIMITES_CAMPOS.CODIGO_PAQUETE.max
  ) {
    errores.push({
      campo: 'codigo',
      mensaje:
        `Código máximo ${LIMITES_CAMPOS.CODIGO_PAQUETE.max} caracteres`
    });
  }

  if (
    !datos.nombre ||
    datos.nombre.trim() === ''
  ) {
    errores.push({
      campo: 'nombre',
      mensaje: 'Nombre es requerido'
    });
  } else if (
    datos.nombre.length >
    LIMITES_CAMPOS.NOMBRE.max
  ) {
    errores.push({
      campo: 'nombre',
      mensaje:
        `Nombre máximo ${LIMITES_CAMPOS.NOMBRE.max} caracteres`
    });
  }

  if (
    datos.descripcion &&
    datos.descripcion.length >
    LIMITES_CAMPOS.DESCRIPCION.max
  ) {
    errores.push({
      campo: 'descripcion',
      mensaje:
        `Descripción máximo ${LIMITES_CAMPOS.DESCRIPCION.max} caracteres`
    });
  }

  if (
    typeof datos.precio !== 'number' ||
    Number.isNaN(datos.precio) ||
    datos.precio < 0
  ) {
    errores.push({
      campo: 'precio',
      mensaje:
        'Precio debe ser un número mayor o igual a cero'
    });
  }

  const productos =
    datos.detalleProductos || [];

  const servicios =
    datos.detalleServicios || [];

  if (
    productos.length === 0 &&
    servicios.length === 0
  ) {
    errores.push({
      campo: 'componentes',
      mensaje:
        MENSAJES.PAQUETE_SIN_COMPONENTES
    });
  }

  productos.forEach(
    (detalle, indice) => {
      const producto =
        PRODUCTOS_MOCK.find(
          item =>
            item.idProducto ===
            Number(detalle.idProducto)
        );

      if (!producto) {
        errores.push({
          campo: 'componentes',
          mensaje:
            `Producto ${indice + 1} no existe`
        });

        return;
      }

      if (
        !Number.isFinite(
          Number(detalle.cantidad)
        ) ||
        Number(detalle.cantidad) <= 0
      ) {
        errores.push({
          campo: 'componentes',
          mensaje:
            `Producto ${indice + 1}: cantidad inválida`
        });
      }

      if (
        !Number.isFinite(
          Number(detalle.precioUnitario)
        ) ||
        Number(detalle.precioUnitario) < 0
      ) {
        errores.push({
          campo: 'componentes',
          mensaje:
            `Producto ${indice + 1}: precio inválido`
        });
      }

      if (
        datos.activo &&
        producto.activo !== 1
      ) {
        errores.push({
          campo: 'activo',
          mensaje:
            `No puede activarse el paquete porque el producto "${producto.nombre}" está inactivo`
        });
      }
    }
  );

  servicios.forEach(
    (detalle, indice) => {
      const servicio =
        SERVICIOS_MOCK.find(
          item =>
            item.idServicio ===
            Number(detalle.idServicio)
        );

      if (!servicio) {
        errores.push({
          campo: 'componentes',
          mensaje:
            `Servicio ${indice + 1} no existe`
        });

        return;
      }

      if (
        !Number.isFinite(
          Number(detalle.cantidad)
        ) ||
        Number(detalle.cantidad) <= 0
      ) {
        errores.push({
          campo: 'componentes',
          mensaje:
            `Servicio ${indice + 1}: cantidad inválida`
        });
      }

      if (
        !Number.isFinite(
          Number(detalle.tarifa)
        ) ||
        Number(detalle.tarifa) < 0
      ) {
        errores.push({
          campo: 'componentes',
          mensaje:
            `Servicio ${indice + 1}: tarifa inválida`
        });
      }

      if (
        datos.activo &&
        servicio.activo !== 1
      ) {
        errores.push({
          campo: 'activo',
          mensaje:
            `No puede activarse el paquete porque el servicio "${servicio.nombre}" está inactivo`
        });
      }
    }
  );

  return errores;
}

export async function listarPaquetes(
  filtros = {}
) {
  await simularLatencia(200);

  let resultado =
    PAQUETES_MOCK.map(
      enriquecerPaquete
    );

  if (filtros.texto) {
    const texto =
      filtros.texto
        .toLowerCase()
        .trim();

    resultado = resultado.filter(
      paquete =>
        paquete.codigo
          ?.toLowerCase()
          .includes(texto) ||
        paquete.nombre
          ?.toLowerCase()
          .includes(texto) ||
        paquete.descripcion
          ?.toLowerCase()
          .includes(texto)
    );
  }

  if (filtros.componente === 'productos') {
    resultado = resultado.filter(
      paquete =>
        paquete.totalProductos > 0 &&
        paquete.totalServicios === 0
    );
  }

  if (filtros.componente === 'servicios') {
    resultado = resultado.filter(
      paquete =>
        paquete.totalServicios > 0 &&
        paquete.totalProductos === 0
    );
  }

  if (filtros.componente === 'ambos') {
    resultado = resultado.filter(
      paquete =>
        paquete.totalProductos > 0 &&
        paquete.totalServicios > 0
    );
  }

  if (
    filtros.precioMin !== undefined &&
    filtros.precioMin !== null &&
    filtros.precioMin !== ''
  ) {
    resultado = resultado.filter(
      paquete =>
        Number(paquete.precio) >=
        Number(filtros.precioMin)
    );
  }

  if (
    filtros.precioMax !== undefined &&
    filtros.precioMax !== null &&
    filtros.precioMax !== ''
  ) {
    resultado = resultado.filter(
      paquete =>
        Number(paquete.precio) <=
        Number(filtros.precioMax)
    );
  }

  if (
    filtros.estado !== undefined &&
    filtros.estado !== null &&
    filtros.estado !== ''
  ) {
    resultado = resultado.filter(
      paquete =>
        paquete.activo ===
        Number(filtros.estado)
    );
  }

  if (filtros.soloActivos === true) {
    resultado = resultado.filter(
      paquete =>
        paquete.activo === 1
    );
  }

  resultado.sort(
    (a, b) =>
      a.nombre.localeCompare(b.nombre)
  );

  const skip =
    Number(filtros.skip || 0);

  const limit =
    Number(filtros.limit || 10);

  const total =
    resultado.length;

  return {
    items:
      resultado.slice(
        skip,
        skip + limit
      ),
    total,
    skip,
    limit
  };
}

export async function obtenerPaquete(id) {
  await simularLatencia(150);

  const idPaquete =
    normalizarId(
      id,
      'paquete'
    );

  const paquete =
    obtenerPaquetePorId(
      idPaquete
    );

  if (!paquete) {
    throw crearError(
      'PAQUETE_NO_ENCONTRADO',
      MENSAJES.PAQUETE_NO_ENCONTRADO
    );
  }

  return enriquecerPaquete(
    paquete
  );
}

export async function registrarPaquete(
  datos
) {
  await simularLatencia(300);

  const errores =
    validarPaquete(datos);

  if (errores.length > 0) {
    throw crearError(
      'VALIDACION_ERROR',
      MENSAJES.VALIDACION_ERROR,
      errores
    );
  }

  if (
    existeCodigoPaquete(
      datos.codigo
    )
  ) {
    throw crearError(
      'CODIGO_DUPLICADO',
      MENSAJES.PAQUETE_CODIGO_DUPLICADO
    );
  }

  const idPaquete =
    Math.max(
      ...PAQUETES_MOCK.map(
        paquete =>
          paquete.idPaquete
      ),
      0
    ) + 1;

  const detalles =
    prepararDetallesPaquete(
      datos,
      idPaquete
    );

  const ahora =
    new Date();

  const usuario =
    obtenerUsuarioActual();

  const nuevoPaquete = {
    idPaquete,

    codigo:
      datos.codigo.trim(),

    nombre:
      datos.nombre.trim(),

    descripcion:
      datos.descripcion?.trim() || '',

    precio:
      Number(datos.precio),

    activo:
      datos.activo ? 1 : 0,

    fechaRegistro:
      ahora,

    creadoPor:
      usuario,

    fechaModificacion:
      ahora,

    modificadoPor:
      usuario,

    estadoRegistro:
      ESTADO_REGISTRO.ACTIVO,

    detalleProductos:
      detalles.detalleProductos,

    detalleServicios:
      detalles.detalleServicios
  };

  PAQUETES_MOCK.push(
    nuevoPaquete
  );

  return enriquecerPaquete(
    nuevoPaquete
  );
}

export async function actualizarPaquete(
  id,
  datos
) {
  await simularLatencia(300);

  const idPaquete =
    normalizarId(
      id,
      'paquete'
    );

  const indice =
    PAQUETES_MOCK.findIndex(
      paquete =>
        paquete.idPaquete ===
        idPaquete
    );

  if (indice === -1) {
    throw crearError(
      'PAQUETE_NO_ENCONTRADO',
      MENSAJES.PAQUETE_NO_ENCONTRADO
    );
  }

  const errores =
    validarPaquete(datos);

  if (errores.length > 0) {
    throw crearError(
      'VALIDACION_ERROR',
      MENSAJES.VALIDACION_ERROR,
      errores
    );
  }

  if (
    existeCodigoPaquete(
      datos.codigo,
      idPaquete
    )
  ) {
    throw crearError(
      'CODIGO_DUPLICADO',
      MENSAJES.PAQUETE_CODIGO_DUPLICADO
    );
  }

  const detalles =
    prepararDetallesPaquete(
      datos,
      idPaquete
    );

  const paqueteActualizado = {
    ...PAQUETES_MOCK[indice],

    codigo:
      datos.codigo.trim(),

    nombre:
      datos.nombre.trim(),

    descripcion:
      datos.descripcion?.trim() || '',

    precio:
      Number(datos.precio),

    activo:
      datos.activo ? 1 : 0,

    detalleProductos:
      detalles.detalleProductos,

    detalleServicios:
      detalles.detalleServicios,

    fechaModificacion:
      new Date(),

    modificadoPor:
      obtenerUsuarioActual(),

    estadoRegistro:
      ESTADO_REGISTRO.ACTIVO
  };

  PAQUETES_MOCK[indice] =
    paqueteActualizado;

  return enriquecerPaquete(
    paqueteActualizado
  );
}

export async function cambiarEstadoPaquete(
  id,
  activo
) {
  await simularLatencia(200);

  const idPaquete =
    normalizarId(
      id,
      'paquete'
    );

  const indice =
    PAQUETES_MOCK.findIndex(
      paquete =>
        paquete.idPaquete ===
        idPaquete
    );

  if (indice === -1) {
    throw crearError(
      'PAQUETE_NO_ENCONTRADO',
      MENSAJES.PAQUETE_NO_ENCONTRADO
    );
  }

  if (activo) {
    const paquete =
      enriquecerPaquete(
        PAQUETES_MOCK[indice]
      );

    if (
      paquete.tieneComponentesInactivos
    ) {
      throw crearError(
        'COMPONENTES_INACTIVOS',
        'No puede activarse el paquete mientras contenga productos o servicios inactivos.'
      );
    }
  }

  PAQUETES_MOCK[indice].activo =
    activo ? 1 : 0;

  PAQUETES_MOCK[indice].fechaModificacion =
    new Date();

  PAQUETES_MOCK[indice].modificadoPor =
    obtenerUsuarioActual();

  return enriquecerPaquete(
    PAQUETES_MOCK[indice]
  );
}

// ====================
// OPERACIONES LISTAS DE PRECIOS
// ====================

function existeNombreListaPrecio(
  nombre,
  excluyendoId = null
) {
  const valor =
    String(nombre || '')
      .trim()
      .toLowerCase();

  return LISTAS_PRECIOS_MOCK.some(
    lista =>
      String(lista.nombre || '')
        .trim()
        .toLowerCase() === valor &&
      (
        excluyendoId === null ||
        lista.idListaPrecio !==
          Number(excluyendoId)
      )
  );
}

function validarListaPrecio(datos) {
  const errores = [];

  if (
    !datos.nombre ||
    datos.nombre.trim() === ''
  ) {
    errores.push({
      campo: 'nombre',
      mensaje:
        'Nombre es requerido'
    });
  } else if (
    datos.nombre.length > 150
  ) {
    errores.push({
      campo: 'nombre',
      mensaje:
        'Nombre máximo 150 caracteres'
    });
  }

  if (
    datos.descripcion &&
    datos.descripcion.length > 255
  ) {
    errores.push({
      campo: 'descripcion',
      mensaje:
        'Descripción máximo 255 caracteres'
    });
  }

  if (!datos.vigenciaInicio) {
    errores.push({
      campo: 'vigenciaInicio',
      mensaje:
        'Inicio de vigencia es requerido'
    });
  }

  if (!datos.vigenciaFin) {
    errores.push({
      campo: 'vigenciaFin',
      mensaje:
        'Fin de vigencia es requerido'
    });
  }

  if (
    datos.vigenciaInicio &&
    datos.vigenciaFin &&
    datos.vigenciaFin <
      datos.vigenciaInicio
  ) {
    errores.push({
      campo: 'vigenciaFin',
      mensaje:
        'Fin de vigencia no puede ser anterior al inicio'
    });
  }

  return errores;
}

export async function listarListasPrecio(
  filtros = {}
) {
  await simularLatencia(200);

  let resultado =
    clonarDatos(
      LISTAS_PRECIOS_MOCK
    );

  if (filtros.texto) {
    const texto =
      filtros.texto
        .trim()
        .toLowerCase();

    resultado =
      resultado.filter(
        lista =>
          lista.nombre
            ?.toLowerCase()
            .includes(texto) ||
          lista.descripcion
            ?.toLowerCase()
            .includes(texto)
      );
  }

  if (
    filtros.estado !== undefined &&
    filtros.estado !== null &&
    filtros.estado !== ''
  ) {
    resultado =
      resultado.filter(
        lista =>
          lista.activo ===
          Number(filtros.estado)
      );
  }

  if (
    filtros.soloActivos === true
  ) {
    resultado =
      resultado.filter(
        lista =>
          lista.activo === 1
      );
  }

  resultado.sort(
    (a, b) =>
      a.nombre.localeCompare(b.nombre)
  );

  const skip =
    Number(filtros.skip || 0);

  const limit =
    Number(filtros.limit || 10);

  const total =
    resultado.length;

  return {
    items:
      resultado.slice(
        skip,
        skip + limit
      ),
    total,
    skip,
    limit
  };
}

export async function obtenerListaPrecio(
  id
) {
  await simularLatencia(150);

  const idListaPrecio =
    normalizarId(
      id,
      'lista de precios'
    );

  const lista =
    LISTAS_PRECIOS_MOCK.find(
      item =>
        item.idListaPrecio ===
        idListaPrecio
    );

  if (!lista) {
    throw crearError(
      'LISTA_PRECIO_NO_ENCONTRADA',
      'Lista de precios no encontrada.'
    );
  }

  return clonarDatos(lista);
}

export async function registrarListaPrecio(
  datos
) {
  await simularLatencia(250);

  const errores =
    validarListaPrecio(datos);

  if (errores.length > 0) {
    throw crearError(
      'VALIDACION_ERROR',
      MENSAJES.VALIDACION_ERROR,
      errores
    );
  }

  if (
    existeNombreListaPrecio(
      datos.nombre
    )
  ) {
    throw crearError(
      'NOMBRE_DUPLICADO',
      'Ya existe una lista de precios con ese nombre.'
    );
  }

  const ahora =
    new Date();

  const usuario =
    obtenerUsuarioActual();

  const nuevaLista = {
    idListaPrecio:
      Math.max(
        ...LISTAS_PRECIOS_MOCK.map(
          lista =>
            lista.idListaPrecio
        ),
        6000
      ) + 1,

    nombre:
      datos.nombre.trim(),

    descripcion:
      datos.descripcion?.trim() || '',

    vigenciaInicio:
      datos.vigenciaInicio,

    vigenciaFin:
      datos.vigenciaFin,

    activo:
      datos.activo ? 1 : 0,

    fechaRegistro:
      ahora,

    creadoPor:
      usuario,

    fechaModificacion:
      ahora,

    modificadoPor:
      usuario,

    estadoRegistro:
      ESTADO_REGISTRO.ACTIVO
  };

  LISTAS_PRECIOS_MOCK.push(
    nuevaLista
  );

  return clonarDatos(
    nuevaLista
  );
}

export async function actualizarListaPrecio(
  id,
  datos
) {
  await simularLatencia(250);

  const idListaPrecio =
    normalizarId(
      id,
      'lista de precios'
    );

  const indice =
    LISTAS_PRECIOS_MOCK.findIndex(
      lista =>
        lista.idListaPrecio ===
        idListaPrecio
    );

  if (indice === -1) {
    throw crearError(
      'LISTA_PRECIO_NO_ENCONTRADA',
      'Lista de precios no encontrada.'
    );
  }

  const errores =
    validarListaPrecio(datos);

  if (errores.length > 0) {
    throw crearError(
      'VALIDACION_ERROR',
      MENSAJES.VALIDACION_ERROR,
      errores
    );
  }

  if (
    existeNombreListaPrecio(
      datos.nombre,
      idListaPrecio
    )
  ) {
    throw crearError(
      'NOMBRE_DUPLICADO',
      'Ya existe una lista de precios con ese nombre.'
    );
  }

  LISTAS_PRECIOS_MOCK[indice] = {
    ...LISTAS_PRECIOS_MOCK[indice],

    nombre:
      datos.nombre.trim(),

    descripcion:
      datos.descripcion?.trim() || '',

    vigenciaInicio:
      datos.vigenciaInicio,

    vigenciaFin:
      datos.vigenciaFin,

    activo:
      datos.activo ? 1 : 0,

    fechaModificacion:
      new Date(),

    modificadoPor:
      obtenerUsuarioActual()
  };

  return clonarDatos(
    LISTAS_PRECIOS_MOCK[indice]
  );
}

export async function cambiarEstadoListaPrecio(
  id,
  activo
) {
  await simularLatencia(200);

  const idListaPrecio =
    normalizarId(
      id,
      'lista de precios'
    );

  const indice =
    LISTAS_PRECIOS_MOCK.findIndex(
      lista =>
        lista.idListaPrecio ===
        idListaPrecio
    );

  if (indice === -1) {
    throw crearError(
      'LISTA_PRECIO_NO_ENCONTRADA',
      'Lista de precios no encontrada.'
    );
  }

  LISTAS_PRECIOS_MOCK[indice].activo =
    activo ? 1 : 0;

  LISTAS_PRECIOS_MOCK[indice].fechaModificacion =
    new Date();

  LISTAS_PRECIOS_MOCK[indice].modificadoPor =
    obtenerUsuarioActual();

  return clonarDatos(
    LISTAS_PRECIOS_MOCK[indice]
  );
}

// ====================
// CONSULTAR AUXILIARES
// ====================

/**
 * Listar categorías de producto
 */
export async function listarCategoriasProducto() {
  await simularLatencia(100);
  return clonarDatos(CATEGORIAS_PRODUCTO);
}

/**
 * Listar categorías de servicio
 */
export async function listarCategoriasServicio() {
  await simularLatencia(100);
  return clonarDatos(CATEGORIAS_SERVICIO);
}

/**
 * Listar tipos de producto
 */
export async function listarTiposProducto() {
  await simularLatencia(100);
  return clonarDatos(TIPOS_PRODUCTO);
}

/**
 * Listar colores
 */
export async function listarColores() {
  await simularLatencia(100);
  return clonarDatos(COLORES);
}

export async function listarCategoriasConfiguracion() {
  await simularLatencia(100);

  return clonarDatos([
    ...CATEGORIAS_PRODUCTO,
    ...CATEGORIAS_SERVICIO
  ]);
}

export async function registrarCategoria(datos) {
  await simularLatencia(150);

  const todas = [
    ...CATEGORIAS_PRODUCTO,
    ...CATEGORIAS_SERVICIO
  ];

  const id =
    Math.max(...todas.map(item => item.id), 0) + 1;

  const nueva = {
    id,
    nombre: datos.nombre.trim(),
    tipo: datos.tipo,
    activo: datos.activo ? 1 : 0
  };

  const destino =
    datos.tipo === 'Servicio'
      ? CATEGORIAS_SERVICIO
      : CATEGORIAS_PRODUCTO;

  destino.push(nueva);

  return clonarDatos(nueva);
}

export async function actualizarCategoria(id, datos) {
  await simularLatencia(150);

  const idCategoria = normalizarId(id, 'categoría');

  let origen = CATEGORIAS_PRODUCTO;
  let indice = origen.findIndex(
    item => item.id === idCategoria
  );

  if (indice === -1) {
    origen = CATEGORIAS_SERVICIO;
    indice = origen.findIndex(
      item => item.id === idCategoria
    );
  }

  if (indice === -1) {
    throw crearError(
      'CATEGORIA_NO_ENCONTRADA',
      'Categoría no encontrada.'
    );
  }

  const actualizado = {
    ...origen[indice],
    nombre: datos.nombre.trim(),
    tipo: datos.tipo,
    activo: datos.activo ? 1 : 0
  };

  const destino =
    datos.tipo === 'Servicio'
      ? CATEGORIAS_SERVICIO
      : CATEGORIAS_PRODUCTO;

  if (destino !== origen) {
    origen.splice(indice, 1);
    destino.push(actualizado);
  } else {
    origen[indice] = actualizado;
  }

  return clonarDatos(actualizado);
}

export async function cambiarEstadoCategoria(id, activo) {
  const categorias =
    await listarCategoriasConfiguracion();

  const categoria = categorias.find(
    item => item.id === Number(id)
  );

  if (!categoria) {
    throw crearError(
      'CATEGORIA_NO_ENCONTRADA',
      'Categoría no encontrada.'
    );
  }

  return actualizarCategoria(id, {
    ...categoria,
    activo
  });
}

export async function registrarTipoProducto(datos) {
  await simularLatencia(150);

  const nuevo = {
    id:
      Math.max(
        ...TIPOS_PRODUCTO.map(item => item.id),
        0
      ) + 1,
    nombre: datos.nombre.trim(),
    activo: datos.activo ? 1 : 0
  };

  TIPOS_PRODUCTO.push(nuevo);

  return clonarDatos(nuevo);
}

export async function actualizarTipoProducto(id, datos) {
  await simularLatencia(150);

  const idTipo = normalizarId(id, 'tipo de producto');

  const indice = TIPOS_PRODUCTO.findIndex(
    item => item.id === idTipo
  );

  if (indice === -1) {
    throw crearError(
      'TIPO_NO_ENCONTRADO',
      'Tipo de producto no encontrado.'
    );
  }

  TIPOS_PRODUCTO[indice] = {
    ...TIPOS_PRODUCTO[indice],
    nombre: datos.nombre.trim(),
    activo: datos.activo ? 1 : 0
  };

  return clonarDatos(TIPOS_PRODUCTO[indice]);
}

export async function cambiarEstadoTipoProducto(
  id,
  activo
) {
  const tipos = await listarTiposProducto();

  const tipo = tipos.find(
    item => item.id === Number(id)
  );

  if (!tipo) {
    throw crearError(
      'TIPO_NO_ENCONTRADO',
      'Tipo de producto no encontrado.'
    );
  }

  return actualizarTipoProducto(id, {
    ...tipo,
    activo
  });
}

export async function registrarColor(datos) {
  await simularLatencia(150);

  const nuevo = {
    id:
      Math.max(
        ...COLORES.map(item => item.id),
        0
      ) + 1,
    nombre: datos.nombre.trim(),
    hexadecimal:
      datos.hexadecimal.toUpperCase(),
    activo: datos.activo ? 1 : 0
  };

  COLORES.push(nuevo);

  return clonarDatos(nuevo);
}

export async function actualizarColor(id, datos) {
  await simularLatencia(150);

  const idColor = normalizarId(id, 'color');

  const indice = COLORES.findIndex(
    item => item.id === idColor
  );

  if (indice === -1) {
    throw crearError(
      'COLOR_NO_ENCONTRADO',
      'Color no encontrado.'
    );
  }

  COLORES[indice] = {
    ...COLORES[indice],
    nombre: datos.nombre.trim(),
    hexadecimal:
      datos.hexadecimal.toUpperCase(),
    activo: datos.activo ? 1 : 0
  };

  return clonarDatos(COLORES[indice]);
}

export async function cambiarEstadoColor(id, activo) {
  const colores = await listarColores();

  const color = colores.find(
    item => item.id === Number(id)
  );

  if (!color) {
    throw crearError(
      'COLOR_NO_ENCONTRADO',
      'Color no encontrado.'
    );
  }

  return actualizarColor(id, {
    ...color,
    activo
  });
}

/**
 * Consultar disponibilidad de un producto.
 */
export async function consultarDisponibilidad(id) {
  await simularLatencia(100);

  const idProducto = normalizarId(id, 'producto');

  const producto = PRODUCTOS_MOCK.find(
    item => item.idProducto === idProducto
  );

  if (!producto) {
    throw crearError(
      'PRODUCTO_NO_ENCONTRADO',
      MENSAJES.PRODUCTO_NO_ENCONTRADO
    );
  }

  const cantidadDisponible = Number(producto.disponibilidad || 0);

  return {
    idProducto,
    disponible: cantidadDisponible > 0,
    cantidadDisponible
  };
}

// ====================
// VALIDACIONES
// ====================

/**
 * Validar producto
 */
function validarProducto(datos, idActual) {
  const errores = [];

  if (!datos.codigo || datos.codigo.trim() === '') {
    errores.push({
      campo: 'codigo',
      mensaje: 'Código es requerido'
    });
  } else if (
    datos.codigo.length >
    LIMITES_CAMPOS.CODIGO_PRODUCTO.max
  ) {
    errores.push({
      campo: 'codigo',
      mensaje:
        `Código máximo ${LIMITES_CAMPOS.CODIGO_PRODUCTO.max} caracteres`
    });
  }

  if (!datos.nombre || datos.nombre.trim() === '') {
    errores.push({
      campo: 'nombre',
      mensaje: 'Nombre es requerido'
    });
  } else if (
    datos.nombre.length >
    LIMITES_CAMPOS.NOMBRE.max
  ) {
    errores.push({
      campo: 'nombre',
      mensaje:
        `Nombre máximo ${LIMITES_CAMPOS.NOMBRE.max} caracteres`
    });
  }

  if (
    datos.descripcion &&
    datos.descripcion.length >
    LIMITES_CAMPOS.DESCRIPCION.max
  ) {
    errores.push({
      campo: 'descripcion',
      mensaje:
        `Descripción máximo ${LIMITES_CAMPOS.DESCRIPCION.max} caracteres`
    });
  }

  if (!datos.idTipoProducto) {
    errores.push({
      campo: 'idTipoProducto',
      mensaje: 'Tipo de producto es requerido'
    });
  } else {
    const tipoValido = TIPOS_PRODUCTO.some(
      tipo =>
        tipo.id === datos.idTipoProducto &&
        tipo.activo === 1
    );

    if (!tipoValido) {
      errores.push({
        campo: 'idTipoProducto',
        mensaje: 'Tipo de producto inválido o inactivo'
      });
    }
  }

  if (!datos.idCategoria) {
    errores.push({
      campo: 'idCategoria',
      mensaje: 'Categoría es requerida'
    });
  } else {
    const categoriaValida = CATEGORIAS_PRODUCTO.some(
      categoria =>
        categoria.id === datos.idCategoria &&
        categoria.activo === 1
    );

    if (!categoriaValida) {
      errores.push({
        campo: 'idCategoria',
        mensaje: 'Categoría inválida o inactiva'
      });
    }
  }

  if (
    datos.idColor !== null &&
    datos.idColor !== undefined
  ) {
    const colorValido = COLORES.some(
      color =>
        color.id === datos.idColor &&
        color.activo === 1
    );

    if (!colorValido) {
      errores.push({
        campo: 'idColor',
        mensaje: 'Color inválido o inactivo'
      });
    }
  }

  if (
    !datos.unidadMedida ||
    datos.unidadMedida.trim() === ''
  ) {
    errores.push({
      campo: 'unidadMedida',
      mensaje: 'Unidad de medida es requerida'
    });
  }

  if (
    typeof datos.precioBase !== 'number' ||
    Number.isNaN(datos.precioBase) ||
    datos.precioBase < 0
  ) {
    errores.push({
      campo: 'precioBase',
      mensaje:
        'Precio base debe ser un número mayor o igual a cero'
    });
  }

  return errores;
}

/**
 * Validar servicio
 */
function validarServicio(datos, idActual) {
  const errores = [];

  if (!datos.codigo || datos.codigo.trim() === '') {
    errores.push({
      campo: 'codigo',
      mensaje: 'Código es requerido'
    });
  } else if (
    datos.codigo.length >
    LIMITES_CAMPOS.CODIGO_SERVICIO.max
  ) {
    errores.push({
      campo: 'codigo',
      mensaje:
        `Código máximo ${LIMITES_CAMPOS.CODIGO_SERVICIO.max} caracteres`
    });
  }

  if (!datos.nombre || datos.nombre.trim() === '') {
    errores.push({
      campo: 'nombre',
      mensaje: 'Nombre es requerido'
    });
  } else if (
    datos.nombre.length >
    LIMITES_CAMPOS.NOMBRE.max
  ) {
    errores.push({
      campo: 'nombre',
      mensaje:
        `Nombre máximo ${LIMITES_CAMPOS.NOMBRE.max} caracteres`
    });
  }

  if (
    datos.descripcion &&
    datos.descripcion.length >
    LIMITES_CAMPOS.DESCRIPCION.max
  ) {
    errores.push({
      campo: 'descripcion',
      mensaje:
        `Descripción máximo ${LIMITES_CAMPOS.DESCRIPCION.max} caracteres`
    });
  }

  if (!datos.idCategoria) {
    errores.push({
      campo: 'idCategoria',
      mensaje: 'Categoría es requerida'
    });
  } else {
    const categoriaValida =
      CATEGORIAS_SERVICIO.some(
        categoria =>
          categoria.id === datos.idCategoria &&
          categoria.activo === 1
      );

    if (!categoriaValida) {
      errores.push({
        campo: 'idCategoria',
        mensaje: 'Categoría inválida o inactiva'
      });
    }
  }

  if (
    !datos.tipoServicio ||
    datos.tipoServicio.trim() === ''
  ) {
    errores.push({
      campo: 'tipoServicio',
      mensaje: 'Tipo de servicio es requerido'
    });
  } else if (
    !TIPOS_SERVICIO.includes(datos.tipoServicio)
  ) {
    errores.push({
      campo: 'tipoServicio',
      mensaje: 'Tipo de servicio inválido'
    });
  }

  if (
    typeof datos.tarifaBase !== 'number' ||
    Number.isNaN(datos.tarifaBase) ||
    datos.tarifaBase < 0
  ) {
    errores.push({
      campo: 'tarifaBase',
      mensaje:
        'Tarifa base debe ser un número mayor o igual a cero'
    });
  }

  return errores;
}

// ====================
// UTILIDADES
// ====================

/**
 * Obtiene el usuario autenticado para auditoría.
 */
function obtenerUsuarioActual() {
  const session = getSession();

  return session?.user?.username || 'usuario-sin-sesion';
}

/**
 * Normaliza un identificador recibido desde URL, dataset o controlador.
 *
 * @param {number|string} id
 * @param {string} entidad
 * @returns {number}
 */
function normalizarId(id, entidad = 'registro') {
  const valor = Number(id);

  if (!Number.isInteger(valor) || valor <= 0) {
    throw crearError(
      'ID_INVALIDO',
      `El identificador de ${entidad} no es válido.`
    );
  }

  return valor;
}

/**
 * Crear objeto de error normalizado.
 */
function crearError(codigo, mensaje, detalles = null) {
  const error = new Error(mensaje);

  error.codigo = codigo;
  error.detalles = detalles;

  return error;
}