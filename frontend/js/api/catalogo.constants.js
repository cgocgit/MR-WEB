/**
 * Constantes del módulo Catálogo
 * Define categorías, tipos, estados y valores por defecto del dominio
 */

// Estados de registro
export const ESTADO_REGISTRO = {
  ACTIVO: 1,
  INACTIVO: 0
};

// Tipos de categoría
export const TIPO_CATEGORIA = {
  PRODUCTO: 'Producto',
  SERVICIO: 'Servicio'
};

// Tipos de producto disponibles
export const TIPOS_PRODUCTO = [
  { id: 1, nombre: 'Mobiliario', activo: 1 },
  { id: 2, nombre: 'Decoración', activo: 1 },
  { id: 3, nombre: 'Cristalería', activo: 1 },
  { id: 4, nombre: 'Menaje', activo: 1 },
  { id: 5, nombre: 'Lencería', activo: 1 }
];

// Tipos de servicio disponibles
export const TIPOS_SERVICIO = [
  'Banquete',
  'Decoración',
  'Flete',
  'Meseros'
];

// Colores disponibles
export const COLORES = [
  { id: 1, nombre: 'Rojo', hexadecimal: '#FF0000', activo: 1 },
  { id: 2, nombre: 'Azul', hexadecimal: '#0000FF', activo: 1 },
  { id: 3, nombre: 'Verde', hexadecimal: '#00AA00', activo: 1 },
  { id: 4, nombre: 'Blanco', hexadecimal: '#FFFFFF', activo: 1 },
  { id: 5, nombre: 'Negro', hexadecimal: '#000000', activo: 1 },
  { id: 6, nombre: 'Oro', hexadecimal: '#FFD700', activo: 1 },
  { id: 7, nombre: 'Plata', hexadecimal: '#C0C0C0', activo: 1 }
];

// Unidades de medida
export const UNIDADES_MEDIDA = [
  'Unidad',
  'Docena',
  'Metro',
  'Kilogramo',
  'Litro'
];

// Categorías de productos
export const CATEGORIAS_PRODUCTO = [
  { id: 1, nombre: 'Muebles', tipo: 'Producto', activo: 1 },
  { id: 2, nombre: 'Accesorios', tipo: 'Producto', activo: 1 },
  { id: 3, nombre: 'Textiles', tipo: 'Producto', activo: 1 },
  { id: 4, nombre: 'Iluminación', tipo: 'Producto', activo: 1 },
  { id: 5, nombre: 'Flores', tipo: 'Producto', activo: 1 }
];

// Categorías de servicios
export const CATEGORIAS_SERVICIO = [
  { id: 101, nombre: 'Servicio de Alimentos', tipo: 'Servicio', activo: 1 },
  { id: 102, nombre: 'Servicio de Personal', tipo: 'Servicio', activo: 1 },
  { id: 103, nombre: 'Logística', tipo: 'Servicio', activo: 1 },
  { id: 104, nombre: 'Ambientación', tipo: 'Servicio', activo: 1 }
];

// Mensajes del sistema
export const MENSAJES = {
  // Productos
  PRODUCTO_REGISTRADO: 'Producto registrado correctamente.',
  PRODUCTO_ACTUALIZADO: 'Producto actualizado correctamente.',
  PRODUCTO_ACTIVADO: 'Producto activado correctamente.',
  PRODUCTO_DESACTIVADO: 'Producto desactivado correctamente.',
  PRODUCTO_CODIGO_DUPLICADO: 'El código del producto ya está registrado.',
  PRODUCTO_NO_ENCONTRADO: 'Producto no encontrado.',
  
  // Servicios
  SERVICIO_REGISTRADO: 'Servicio registrado correctamente.',
  SERVICIO_ACTUALIZADO: 'Servicio actualizado correctamente.',
  SERVICIO_ACTIVADO: 'Servicio activado correctamente.',
  SERVICIO_DESACTIVADO: 'Servicio desactivado correctamente.',
  SERVICIO_CODIGO_DUPLICADO: 'El código del servicio ya está registrado.',
  SERVICIO_NO_ENCONTRADO: 'Servicio no encontrado.',
  
  // Paquetes
  PAQUETE_REGISTRADO: 'Paquete registrado correctamente.',
  PAQUETE_ACTUALIZADO: 'Paquete actualizado correctamente.',
  PAQUETE_ACTIVADO: 'Paquete activado correctamente.',
  PAQUETE_DESACTIVADO: 'Paquete desactivado correctamente.',
  PAQUETE_CODIGO_DUPLICADO: 'El código del paquete ya está registrado.',
  PAQUETE_NO_ENCONTRADO: 'Paquete no encontrado.',
  PAQUETE_SIN_COMPONENTES: 'El paquete debe contener al menos un componente.',
  
  // Errores generales
  VALIDACION_ERROR: 'Revise los campos indicados antes de guardar.',
  SERVICIO_ERROR: 'No fue posible guardar el registro. Los cambios no se aplicaron.',
  CONFLICTO_ACTUALIZACIÓN: 'El registro cambió desde que fue consultado. Actualice la información antes de guardar nuevamente.',
  ACCESO_DENEGADO: 'No tiene permisos para realizar esta acción.',
  REGISTRO_NO_ENCONTRADO: 'El registro solicitado no fue encontrado.',
  CARGANDO: 'Cargando...',
  SIN_RESULTADOS: 'No hay registros que coincidan con los filtros aplicados.',
  LISTA_VACIA: 'No hay registros disponibles.',
  ERROR_DESACTIVACION: 'Desactivar este elemento hará que no esté disponible para nuevas operaciones.'
};

// Errores de validación
export const ERRORES_VALIDACION = {
  CAMPO_REQUERIDO: 'Este campo es requerido.',
  LONGITUD_MINIMA: 'La longitud mínima es {min} caracteres.',
  LONGITUD_MAXIMA: 'La longitud máxima es {max} caracteres.',
  NUMERO_MINIMO: 'El valor mínimo es {min}.',
  NUMERO_MAXIMO: 'El valor máximo es {max}.',
  NUMERO_VALIDO: 'Ingrese un número válido.',
  FORMATO_INVALIDO: 'El formato es inválido.',
  SELECCION_INVALIDA: 'Seleccione una opción válida.',
  VALOR_DUPLICADO: 'Este valor ya está registrado.'
};

// Límites de campos
export const LIMITES_CAMPOS = {
  CODIGO_PRODUCTO: { min: 1, max: 20 },
  CODIGO_SERVICIO: { min: 1, max: 10 },
  CODIGO_PAQUETE: { min: 1, max: 20 },
  NOMBRE: { min: 1, max: 150 },
  DESCRIPCION: { min: 0, max: 255 }
};

// Configuración de paginación
export const PAGINACION = {
  ITEMS_POR_PAGINA: 10,
  ITEMS_MAXIMOS: [5, 10, 25, 50]
};

// Tiempos de respuesta esperados (ms)
export const TIEMPOS_RESPUESTA = {
  CONSULTA_GENERAL: 3000,
  CONSULTA_PRODUCTOS: 2000  // 95% de solicitudes
};

// Rutas de imágenes
export const RUTAS_IMAGENES = {
  PLACEHOLDER_PRODUCTO: './assets/images/catalogo/placeholder-producto.svg',
  PLACEHOLDER_SERVICIO: './assets/images/catalogo/placeholder-servicio.svg',
  RUTA_PRODUCTOS: './assets/images/catalogo/productos/',
  RUTA_SERVICIOS: './assets/images/catalogo/servicios/'
};

// Permisos del módulo Catálogo
export const PERMISOS_CATALOGO = {
  CONSULTAR: 'catalogo.consultar',
  PRODUCTOS_REGISTRAR: 'catalogo.productos.registrar',
  PRODUCTOS_MODIFICAR: 'catalogo.productos.modificar',
  PRODUCTOS_DESACTIVAR: 'catalogo.productos.desactivar',
  SERVICIOS_REGISTRAR: 'catalogo.servicios.registrar',
  SERVICIOS_MODIFICAR: 'catalogo.servicios.modificar',
  SERVICIOS_DESACTIVAR: 'catalogo.servicios.desactivar',
  PAQUETES_REGISTRAR: 'catalogo.paquetes.registrar',
  PAQUETES_MODIFICAR: 'catalogo.paquetes.modificar',
  PAQUETES_DESACTIVAR: 'catalogo.paquetes.desactivar',
  AUXILIARES_GESTIONAR: 'catalogo.auxiliares.gestionar',
  ABC_GESTIONAR: 'catalogo.abc.gestionar',
  PRECIOS_GESTIONAR: 'catalogo.precios.gestionar',
  COSTOS_CONSULTAR: 'catalogo.costos.consultar'
};
