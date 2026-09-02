/**
 * Datos Mock del módulo Catálogo
 * Datos centralizados para simular el backend durante desarrollo
 * En producción serán reemplazados por llamadas a REST API
 */

import {
  ESTADO_REGISTRO,
  CATEGORIAS_PRODUCTO,
  CATEGORIAS_SERVICIO,
  TIPOS_PRODUCTO,
  COLORES,
  UNIDADES_MEDIDA
} from './catalogo.constants.js';

/**
 * Productos Mock
 * Incluye escenarios: completo, sin imagen, inactivo, sin color, precio cero, en paquetes, con disponibilidad
 */
export const PRODUCTOS_MOCK = [
  {
    idProducto: 1001,
    codigo: 'PROD-001',
    nombre: 'Silla Windsor',
    descripcion: 'Silla de madera con respaldo alto, ideal para eventos formales.',
    idTipoProducto: 1,
    tipoProducto: 'Mobiliario',
    idCategoria: 1,
    categoria: 'Muebles',
    idColor: 1,
    color: 'Blanco',
    unidadMedida: 'Unidad',
    precioBase: 45.00,
    activo: 1,
    imagenUrl: './assets/images/catalogo/productos/silla-windsor.svg',
    fechaRegistro: new Date('2024-01-15'),
    creadoPor: 'admin@mesaregia.com',
    fechaModificacion: new Date('2024-01-15'),
    modificadoPor: 'admin@mesaregia.com',
    estadoRegistro: 1,
    disponibilidad: 150
  },
  {
    idProducto: 1002,
    codigo: 'PROD-002',
    nombre: 'Mesa Redonda',
    descripcion: 'Mesa de comedor redonda con capacidad para 8 personas.',
    idTipoProducto: 1,
    tipoProducto: 'Mobiliario',
    idCategoria: 1,
    categoria: 'Muebles',
    idColor: null,
    color: null,
    unidadMedida: 'Unidad',
    precioBase: 125.00,
    activo: 1,
    imagenUrl: './assets/images/catalogo/productos/mesa-redonda.jpg',
    fechaRegistro: new Date('2024-01-15'),
    creadoPor: 'admin@mesaregia.com',
    fechaModificacion: new Date('2024-01-15'),
    modificadoPor: 'admin@mesaregia.com',
    estadoRegistro: 1,
    disponibilidad: 45
  },
  {
    idProducto: 1003,
    codigo: 'PROD-003',
    nombre: 'Arreglo Floral Premium',
    descripcion: 'Arreglo floral de temporada con flores importadas.',
    idTipoProducto: null,
    tipoProducto: null,
    idCategoria: 5,
    categoria: 'Flores',
    idColor: 3,
    color: 'Verde',
    unidadMedida: 'Unidad',
    precioBase: 0.00,
    activo: 1,
    imagenUrl: null,
    fechaRegistro: new Date('2024-02-01'),
    creadoPor: 'admin@mesaregia.com',
    fechaModificacion: new Date('2024-02-01'),
    modificadoPor: 'admin@mesaregia.com',
    estadoRegistro: 1,
    disponibilidad: 200
  },
  {
    idProducto: 1004,
    codigo: 'PROD-004',
    nombre: 'Copas de Cristal',
    descripcion: 'Juego de 12 copas de cristal bohemio para bebidas.',
    idTipoProducto: 3,
    tipoProducto: 'Cristalería',
    idCategoria: 2,
    categoria: 'Accesorios',
    idColor: 4,
    color: 'Blanco',
    unidadMedida: 'Docena',
    precioBase: 75.00,
    activo: 0,
    imagenUrl: './assets/images/catalogo/productos/copas-cristal.jpg',
    fechaRegistro: new Date('2023-12-20'),
    creadoPor: 'admin@mesaregia.com',
    fechaModificacion: new Date('2024-02-10'),
    modificadoPor: 'admin@mesaregia.com',
    estadoRegistro: 1,
    disponibilidad: 0
  },
  {
    idProducto: 1005,
    codigo: 'PROD-005',
    nombre: 'Mantel de Lino',
    descripcion: 'Mantel de lino importado 2.5m x 1.5m, múltiples colores.',
    idTipoProducto: null,
    tipoProducto: null,
    idCategoria: 3,
    categoria: 'Textiles',
    idColor: 4,
    color: 'Blanco',
    unidadMedida: 'Unidad',
    precioBase: 35.00,
    activo: 1,
    imagenUrl: './assets/images/catalogo/productos/mantel-lino.jpg',
    fechaRegistro: new Date('2024-01-20'),
    creadoPor: 'admin@mesaregia.com',
    fechaModificacion: new Date('2024-01-20'),
    modificadoPor: 'admin@mesaregia.com',
    estadoRegistro: 1,
    disponibilidad: 80
  }
];

/**
 * Servicios Mock
 * Incluye escenarios: por cada tipo, sin imagen, inactivo, en paquetes, tarifa cero
 */
export const SERVICIOS_MOCK = [
  {
    idServicio: 2001,
    codigo: 'SERV-001',
    nombre: 'Banquete Ejecutivo',
    descripcion: 'Servicio de banquete para 50-100 personas con 3 tiempos.',
    idCategoria: 101,
    categoria: 'Servicio de Alimentos',
    tipoServicio: 'Banquete',
    tarifaBase: 850.00,
    costoInterno: 450.00,
    activo: 1,
    imagenUrl: './assets/images/catalogo/servicios/banquete-ejecutivo.svg',
    fechaRegistro: new Date('2024-01-10'),
    creadoPor: 'admin@mesaregia.com',
    fechaModificacion: new Date('2024-01-10'),
    modificadoPor: 'admin@mesaregia.com',
    estadoRegistro: 1
  },
  {
    idServicio: 2002,
    codigo: 'SERV-002',
    nombre: 'Decoración Elegante',
    descripcion: 'Decoración premium con arreglos florales y ambientación.',
    idCategoria: 104,
    categoria: 'Ambientación',
    tipoServicio: 'Decoración',
    tarifaBase: 500.00,
    costoInterno: 200.00,
    activo: 1,
    imagenUrl: null,
    fechaRegistro: new Date('2024-01-12'),
    creadoPor: 'admin@mesaregia.com',
    fechaModificacion: new Date('2024-01-12'),
    modificadoPor: 'admin@mesaregia.com',
    estadoRegistro: 1
  },
  {
    idServicio: 2003,
    codigo: 'SERV-003',
    nombre: 'Flete y Logística',
    descripcion: 'Transporte, montaje y desmontaje de eventos.',
    idCategoria: 103,
    categoria: 'Logística',
    tipoServicio: 'Flete',
    tarifaBase: 300.00,
    costoInterno: 150.00,
    activo: 1,
    imagenUrl: './assets/images/catalogo/servicios/flete-logistica.jpg',
    fechaRegistro: new Date('2024-01-14'),
    creadoPor: 'admin@mesaregia.com',
    fechaModificacion: new Date('2024-01-14'),
    modificadoPor: 'admin@mesaregia.com',
    estadoRegistro: 1
  },
  {
    idServicio: 2004,
    codigo: 'SERV-004',
    nombre: 'Meseros Profesionales',
    descripcion: 'Personal capacitado para servicio de mesa y atención al cliente.',
    idCategoria: 102,
    categoria: 'Servicio de Personal',
    tipoServicio: 'Meseros',
    tarifaBase: 0.00,
    costoInterno: 0.00,
    activo: 1,
    imagenUrl: null,
    fechaRegistro: new Date('2024-01-16'),
    creadoPor: 'admin@mesaregia.com',
    fechaModificacion: new Date('2024-01-16'),
    modificadoPor: 'admin@mesaregia.com',
    estadoRegistro: 1
  },
  {
    idServicio: 2005,
    codigo: 'SERV-005',
    nombre: 'Montaje Especial',
    descripcion: 'Servicio de montaje para eventos de gran escala.',
    idCategoria: 102,
    categoria: 'Servicio de Personal',
    tipoServicio: 'Banquete',
    tarifaBase: 400.00,
    costoInterno: 180.00,
    activo: 0,
    imagenUrl: null,
    fechaRegistro: new Date('2023-12-15'),
    creadoPor: 'admin@mesaregia.com',
    fechaModificacion: new Date('2024-02-05'),
    modificadoPor: 'admin@mesaregia.com',
    estadoRegistro: 1
  }
];

/**
 * Paquetes Mock
 * Incluye escenarios: con productos y servicios, solo productos, solo servicios, inactivo, con componentes inactivos, precio diferente al total
 */
export const PAQUETES_MOCK = [
  {
    idPaquete: 3001,
    codigo: 'PAQT-001',
    nombre: 'Paquete Corporativo',
    descripcion: 'Paquete completo para eventos corporativos.',
    precio: 2500.00,
    activo: 1,
    fechaRegistro: new Date('2024-01-20'),
    creadoPor: 'admin@mesaregia.com',
    fechaModificacion: new Date('2024-01-20'),
    modificadoPor: 'admin@mesaregia.com',
    estadoRegistro: 1,
    detalleProductos: [
      {
        idDetallePaqueteProducto: 4001,
        idPaquete: 3001,
        idProducto: 1001,
        cantidad: 10,
        precioUnitario: 45.00,
        subtotal: 450.00
      },
      {
        idDetallePaqueteProducto: 4002,
        idPaquete: 3001,
        idProducto: 1002,
        cantidad: 2,
        precioUnitario: 125.00,
        subtotal: 250.00
      },
      {
        idDetallePaqueteProducto: 4003,
        idPaquete: 3001,
        idProducto: 1005,
        cantidad: 5,
        precioUnitario: 35.00,
        subtotal: 175.00
      }
    ],
    detalleServicios: [
      {
        idDetallePaqueteServicio: 5001,
        idPaquete: 3001,
        idServicio: 2001,
        cantidad: 1,
        tarifa: 850.00,
        subtotal: 850.00
      },
      {
        idDetallePaqueteServicio: 5002,
        idPaquete: 3001,
        idServicio: 2002,
        cantidad: 1,
        tarifa: 500.00,
        subtotal: 500.00
      },
      {
        idDetallePaqueteServicio: 5003,
        idPaquete: 3001,
        idServicio: 2003,
        cantidad: 1,
        tarifa: 300.00,
        subtotal: 300.00
      }
    ]
  },
  {
    idPaquete: 3002,
    codigo: 'PAQT-002',
    nombre: 'Paquete Solo Productos',
    descripcion: 'Paquete con solo mobiliario y textiles.',
    precio: 750.00,
    activo: 1,
    fechaRegistro: new Date('2024-01-25'),
    creadoPor: 'admin@mesaregia.com',
    fechaModificacion: new Date('2024-01-25'),
    modificadoPor: 'admin@mesaregia.com',
    estadoRegistro: 1,
    detalleProductos: [
      {
        idDetallePaqueteProducto: 4004,
        idPaquete: 3002,
        idProducto: 1001,
        cantidad: 15,
        precioUnitario: 45.00,
        subtotal: 675.00
      }
    ],
    detalleServicios: []
  },
  {
    idPaquete: 3003,
    codigo: 'PAQT-003',
    nombre: 'Paquete Solo Servicios',
    descripcion: 'Paquete con servicios de decoración y personal.',
    precio: 800.00,
    activo: 1,
    fechaRegistro: new Date('2024-02-01'),
    creadoPor: 'admin@mesaregia.com',
    fechaModificacion: new Date('2024-02-01'),
    modificadoPor: 'admin@mesaregia.com',
    estadoRegistro: 1,
    detalleProductos: [],
    detalleServicios: [
      {
        idDetallePaqueteServicio: 5004,
        idPaquete: 3003,
        idServicio: 2002,
        cantidad: 1,
        tarifa: 500.00,
        subtotal: 500.00
      },
      {
        idDetallePaqueteServicio: 5005,
        idPaquete: 3003,
        idServicio: 2003,
        cantidad: 1,
        tarifa: 300.00,
        subtotal: 300.00
      }
    ]
  },
  {
    idPaquete: 3004,
    codigo: 'PAQT-004',
    nombre: 'Paquete con Componente Inactivo',
    descripcion: 'Paquete que contiene un producto inactivo (copas).',
    precio: 3500.00,
    activo: 1,
    fechaRegistro: new Date('2024-01-22'),
    creadoPor: 'admin@mesaregia.com',
    fechaModificacion: new Date('2024-02-10'),
    modificadoPor: 'admin@mesaregia.com',
    estadoRegistro: 1,
    detalleProductos: [
      {
        idDetallePaqueteProducto: 4005,
        idPaquete: 3004,
        idProducto: 1004, // Producto INACTIVO
        cantidad: 2,
        precioUnitario: 75.00,
        subtotal: 150.00
      }
    ],
    detalleServicios: [
      {
        idDetallePaqueteServicio: 5006,
        idPaquete: 3004,
        idServicio: 2001,
        cantidad: 3,
        tarifa: 850.00,
        subtotal: 2550.00
      }
    ]
  },
  {
    idPaquete: 3005,
    codigo: 'PAQT-005',
    nombre: 'Paquete Inactivo',
    descripcion: 'Paquete desactivado temporalmente.',
    precio: 1200.00,
    activo: 0,
    fechaRegistro: new Date('2023-12-10'),
    creadoPor: 'admin@mesaregia.com',
    fechaModificacion: new Date('2024-02-15'),
    modificadoPor: 'admin@mesaregia.com',
    estadoRegistro: 1,
    detalleProductos: [
      {
        idDetallePaqueteProducto: 4006,
        idPaquete: 3005,
        idProducto: 1001,
        cantidad: 5,
        precioUnitario: 45.00,
        subtotal: 225.00
      }
    ],
    detalleServicios: [
      {
        idDetallePaqueteServicio: 5007,
        idPaquete: 3005,
        idServicio: 2002,
        cantidad: 1,
        tarifa: 500.00,
        subtotal: 500.00
      }
    ]
  }
];

/**
 * Listas de precios Mock
 */
export const LISTAS_PRECIOS_MOCK = [
  {
    idListaPrecio: 6001,
    nombre: 'Lista General',
    descripcion: 'Lista general de precios vigente.',
    vigenciaInicio: '2026-01-01',
    vigenciaFin: '2026-12-31',
    activo: 1,
    fechaRegistro: new Date('2026-01-01'),
    creadoPor: 'admin@mesaregia.com',
    fechaModificacion: new Date('2026-01-01'),
    modificadoPor: 'admin@mesaregia.com',
    estadoRegistro: 1
  },
  {
    idListaPrecio: 6002,
    nombre: 'Lista Temporada',
    descripcion: 'Lista temporal de referencia.',
    vigenciaInicio: '2026-06-01',
    vigenciaFin: '2026-08-31',
    activo: 0,
    fechaRegistro: new Date('2026-05-15'),
    creadoPor: 'admin@mesaregia.com',
    fechaModificacion: new Date('2026-08-31'),
    modificadoPor: 'admin@mesaregia.com',
    estadoRegistro: 1
  }
];

/**
 * Función auxiliar para crear copias profundas de los mocks
 * Evita mutaciones accidentales de los datos
 */
export function clonarDatos(datos) {
  return JSON.parse(JSON.stringify(datos));
}

/**
 * Función para obtener un producto por ID
 */
export function obtenerProductoPorId(id) {
  const producto = PRODUCTOS_MOCK.find(p => p.idProducto === id);
  return producto ? clonarDatos(producto) : null;
}

/**
 * Función para obtener un servicio por ID
 */
export function obtenerServicioPorId(id) {
  const servicio = SERVICIOS_MOCK.find(s => s.idServicio === id);
  return servicio ? clonarDatos(servicio) : null;
}

/**
 * Función para obtener un paquete por ID
 */
export function obtenerPaquetePorId(id) {
  const paquete = PAQUETES_MOCK.find(p => p.idPaquete === id);
  return paquete ? clonarDatos(paquete) : null;
}

/**
 * Función para validar duplicado de código
 */
export function existeCodigoProducto(
  codigo,
  excluyendoId = null
) {
  const codigoNormalizado =
    String(codigo || '')
      .trim()
      .toUpperCase();

  return PRODUCTOS_MOCK.some(producto =>
    String(producto.codigo || '')
      .trim()
      .toUpperCase() === codigoNormalizado &&
    (
      excluyendoId === null ||
      producto.idProducto !== Number(excluyendoId)
    )
  );
}

export function existeCodigoServicio(
  codigo,
  excluyendoId = null
) {
  const codigoNormalizado =
    String(codigo || '')
      .trim()
      .toUpperCase();

  return SERVICIOS_MOCK.some(servicio =>
    String(servicio.codigo || '')
      .trim()
      .toUpperCase() === codigoNormalizado &&
    (
      excluyendoId === null ||
      servicio.idServicio !== Number(excluyendoId)
    )
  );
}

export function existeCodigoPaquete(
  codigo,
  excluyendoId = null
) {
  const codigoNormalizado =
    String(codigo || '')
      .trim()
      .toUpperCase();

  return PAQUETES_MOCK.some(paquete =>
    String(paquete.codigo || '')
      .trim()
      .toUpperCase() === codigoNormalizado &&
    (
      excluyendoId === null ||
      paquete.idPaquete !== Number(excluyendoId)
    )
  );
}

/**
 * Simular latencia de red
 */
export async function simularLatencia(ms = 300) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
