import {
  ROLE_PERMISSIONS,
  getPermissionsForRoles
} from '../shared/permissions.js';

const PERMISSION_METADATA = {
  'dashboard.consultar': {
    modulo: 'Panel principal',
    accion: 'Consultar'
  },

  'administracion.consultar': {
    modulo: 'Administración',
    accion: 'Consultar'
  },

  'usuarios.consultar': {
    modulo: 'Administración',
    accion: 'Consultar'
  },

  'usuarios.registrar': {
    modulo: 'Administración',
    accion: 'Registrar'
  },

  'usuarios.modificar': {
    modulo: 'Administración',
    accion: 'Modificar'
  },

  'usuarios.desactivar': {
    modulo: 'Administración',
    accion: 'Desactivar'
  },

  'usuarios.password.restablecer': {
    modulo: 'Administración',
    accion: 'Restablecer contraseña'
  },

  'usuarios.rol.asignar': {
    modulo: 'Administración',
    accion: 'Asignar rol'
  },

  'roles.consultar': {
    modulo: 'Administración',
    accion: 'Consultar'
  },

  'permisos.consultar': {
    modulo: 'Administración',
    accion: 'Consultar'
  },

  'permisos.modificar': {
    modulo: 'Administración',
    accion: 'Modificar'
  },

  'matriz.consultar': {
    modulo: 'Administración',
    accion: 'Consultar'
  },

  'auditoria.consultar': {
    modulo: 'Administración',
    accion: 'Consultar'
  },

  'configuracion.consultar': {
    modulo: 'Administración',
    accion: 'Consultar'
  },

  'configuracion.modificar': {
    modulo: 'Administración',
    accion: 'Modificar'
  },

  'intercambio.validar': {
    modulo: 'Administración',
    accion: 'Validar'
  },

  'intercambio.importar': {
    modulo: 'Administración',
    accion: 'Importar'
  },

  'intercambio.exportar': {
    modulo: 'Administración',
    accion: 'Exportar'
  },

  'documentacion.tecnica.consultar': {
    modulo: 'Administración',
    accion: 'Consultar'
  },

  'clientes.consultar': {
    modulo: 'Clientes y prospectos',
    accion: 'Consultar'
  },

  'clientes.gestionar': {
    modulo: 'Clientes y prospectos',
    accion: 'Administrar'
  },

  'catalogo.consultar': {
    modulo: 'Catálogo',
    accion: 'Consultar'
  },

  'catalogo.productos.registrar': {
    modulo: 'Catálogo',
    accion: 'Registrar productos'
  },

  'catalogo.productos.modificar': {
    modulo: 'Catálogo',
    accion: 'Modificar productos'
  },

  'catalogo.productos.desactivar': {
    modulo: 'Catálogo',
    accion: 'Activar o desactivar productos'
  },

  'catalogo.servicios.registrar': {
    modulo: 'Catálogo',
    accion: 'Registrar servicios'
  },

  'catalogo.servicios.modificar': {
    modulo: 'Catálogo',
    accion: 'Modificar servicios'
  },

  'catalogo.servicios.desactivar': {
    modulo: 'Catálogo',
    accion: 'Activar o desactivar servicios'
  },

  'catalogo.paquetes.registrar': {
    modulo: 'Catálogo',
    accion: 'Registrar paquetes'
  },

  'catalogo.paquetes.modificar': {
    modulo: 'Catálogo',
    accion: 'Modificar paquetes'
  },

  'catalogo.paquetes.desactivar': {
    modulo: 'Catálogo',
    accion: 'Activar o desactivar paquetes'
  },

  'catalogo.auxiliares.gestionar': {
    modulo: 'Catálogo',
    accion: 'Gestionar catálogos auxiliares'
  },

  
  'catalogo.abc.gestionar': {
    modulo: 'Catálogo',
    accion: 'Gestionar altas, bajas y cambios'
  },

  'catalogo.precios.gestionar': {
    modulo: 'Catálogo',
    accion: 'Gestionar listas de precios'
  },

  'catalogo.costos.consultar': {
    modulo: 'Catálogo',
    accion: 'Consultar costos internos'
  },

  'catalogo.gestionar': {
    modulo: 'Catálogo',
    accion: 'Administrar'
  },

  'inventario.consultar': {
    modulo: 'Inventario',
    accion: 'Consultar'
  },

  'inventario.gestionar': {
    modulo: 'Inventario',
    accion: 'Administrar'
  },

  'inventario.disponibilidad.consultar': {
    modulo: 'Inventario',
    accion: 'Consultar disponibilidad futura'
  },

  'inventario.reservas.consultar': {
    modulo: 'Inventario',
    accion: 'Consultar reservas por Orden'
  },

  'cotizaciones.consultar': {
    modulo: 'Cotizaciones',
    accion: 'Consultar'
  },

  'cotizaciones.gestionar': {
    modulo: 'Cotizaciones',
    accion: 'Administrar'
  },

  'ordenes.consultar': {
    modulo: 'Órdenes de servicio',
    accion: 'Consultar'
  },

  'ordenes.gestionar': {
    modulo: 'Órdenes de servicio',
    accion: 'Administrar'
  },

  'ordenes.asignadas': {
    modulo: 'Órdenes de servicio',
    accion: 'Consultar'
  },

  'logistica.consultar': {
    modulo: 'Logística operativa',
    accion: 'Consultar'
  },

  'logistica.gestionar': {
    modulo: 'Logística operativa',
    accion: 'Administrar'
  },

  'logistica.ejecutar': {
    modulo: 'Logística operativa',
    accion: 'Ejecutar'
  },

  'logistica.asignadas': {
    modulo: 'Logística operativa',
    accion: 'Ejecutar'
  },

  'pagos.consultar': {
    modulo: 'Pagos manuales',
    accion: 'Consultar'
  },

  'pagos.gestionar': {
    modulo: 'Pagos manuales',
    accion: 'Administrar'
  },

  'reportes.consultar': {
    modulo: 'Reportes',
    accion: 'Consultar'
  },

  'alertas.consultar': {
    modulo: 'Alertas',
    accion: 'Consultar'
  },

  'alertas.asignadas': {
    modulo: 'Alertas',
    accion: 'Consultar'
  }
};

const PERMISSION_SCOPE = {
  TECH: {
    'ordenes.consultar': 'Órdenes asignadas',
    'ordenes.asignadas': 'Órdenes asignadas',

    'logistica.ejecutar': 'Órdenes asignadas',
    'logistica.asignadas': 'Órdenes asignadas',

    'alertas.consultar': 'Asignadas',
    'alertas.asignadas': 'Asignadas'
  }
};

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Mock permisos service
export async function listPermisos() {
  await delay(80);

  return [
    ...new Set(
      Object.values(ROLE_PERMISSIONS)
        .flat()
    )
  ].sort();
}

export async function permisosPorRol(rol) {
  await delay(60);

  return getPermissionsForRoles([rol]);
}

export async function detallePermisosPorRol(rol) {
  await delay(60);

  const permisos =
    getPermissionsForRoles([rol]);

  return permisos.map(codigo => {
    const metadata =
      PERMISSION_METADATA[codigo] || {};

    const alcance =
      PERMISSION_SCOPE[rol]?.[codigo] ||
      'General';

    return {
      codigo,
      modulo:
        metadata.modulo ||
        'Sin clasificar',
      accion:
        metadata.accion ||
        'Consultar',
      alcance,
      estado: 'Permitido'
    };
  });
}

export default {
  listPermisos,
  permisosPorRol,
  detallePermisosPorRol
};
