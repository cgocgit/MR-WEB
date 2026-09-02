export const ROLE_PERMISSIONS = {
  ADMIN: [
    'dashboard.consultar',

    'administracion.consultar',
    'usuarios.consultar',
    'usuarios.registrar',
    'usuarios.modificar',
    'usuarios.desactivar',
    'usuarios.password.restablecer',
    'usuarios.rol.asignar',
    'roles.consultar',
    'permisos.consultar',
    'permisos.modificar',
    'matriz.consultar',
    'auditoria.consultar',
    'configuracion.consultar',
    'configuracion.modificar',
    'intercambio.validar',
    'intercambio.importar',
    'intercambio.exportar',
    'documentacion.tecnica.consultar',

    // Clientes y prospectos:
    // el Administrador puede consultar y buscar registros.
    // Los permisos de registrar, modificar o clasificar
    // requieren asignación explícita.
    'clientes.consultar',
    'clientes.buscar',

    // Catálogo - permisos granulares
    'catalogo.consultar',
    'catalogo.productos.registrar',
    'catalogo.productos.modificar',
    'catalogo.productos.desactivar',
    'catalogo.servicios.registrar',
    'catalogo.servicios.modificar',
    'catalogo.servicios.desactivar',
    'catalogo.paquetes.registrar',
    'catalogo.paquetes.modificar',
    'catalogo.paquetes.desactivar',
    'catalogo.auxiliares.gestionar',
    'catalogo.precios.gestionar',

    //Inventario
    'inventario.consultar',
    'inventario.gestionar',
    'inventario.cortes.consultar',

    'cotizaciones.consultar',

    'ordenes.consultar',

    'logistica.consultar',

    'pagos.consultar',

    'reportes.consultar',

    'alertas.consultar'
  ],

  INVENTARIO: [
    'dashboard.consultar',

    // Catálogo - permisos granulares para Responsable de Inventario
    'catalogo.consultar',
    'catalogo.productos.registrar',
    'catalogo.productos.modificar',
    'catalogo.productos.desactivar',
    'catalogo.servicios.registrar',
    'catalogo.servicios.modificar',
    'catalogo.servicios.desactivar',
    'catalogo.paquetes.registrar',
    'catalogo.paquetes.modificar',
    'catalogo.paquetes.desactivar',
    'catalogo.auxiliares.gestionar',
    'catalogo.precios.gestionar',

    'inventario.consultar',
    'inventario.gestionar',
    'inventario.cortes.consultar',
    'inventario.cortes.gestionar',
    'inventario.disponibilidad.consultar',
    'inventario.reservas.consultar',

    'ordenes.consultar',

    'logistica.consultar',

    'reportes.consultar',

    'alertas.consultar'
  ],

  USER: [
    'dashboard.consultar',

    // USER representa actualmente al perfil mock
    // de Ventas / Ejecutivo de ventas.
    'clientes.consultar',
    'clientes.buscar',
    'clientes.registrar',
    'clientes.modificar',

    'catalogo.consultar',

    'inventario.consultar',
    'inventario.disponibilidad.consultar',

    'cotizaciones.consultar',
    'cotizaciones.gestionar',

    'ordenes.consultar',
    'ordenes.gestionar',

    'logistica.consultar',

    'reportes.consultar',

    'alertas.consultar'
  ],

  ADMINISTRATIVO: [
    'dashboard.consultar',

    'clientes.consultar',
    'clientes.buscar',
    'clientes.registrar',
    'clientes.modificar',

    'catalogo.consultar',

    'inventario.consultar',
    'inventario.disponibilidad.consultar',
    'inventario.reservas.consultar',

    'cotizaciones.consultar',
    'cotizaciones.gestionar',

    'ordenes.consultar',
    'ordenes.gestionar',

    'logistica.consultar',

    'pagos.consultar',
    'pagos.gestionar',

    'reportes.consultar',

    'alertas.consultar'
  ],

  TECH: [
    'dashboard.consultar',

    'catalogo.consultar',

    'inventario.consultar',

    'ordenes.consultar',
    'ordenes.asignadas',

    'logistica.consultar',
    'logistica.ejecutar',
    'logistica.asignadas',

    'alertas.consultar',
    'alertas.asignadas'
  ],

  SUPERVISOR: [
    'dashboard.consultar',

    // Asignación mock provisional para ejercitar
    // la revisión y clasificación.
    'clientes.consultar',
    'clientes.buscar',
    'clientes.clasificar',

    'catalogo.consultar',

    'inventario.consultar',
    'inventario.cortes.consultar',
    'inventario.disponibilidad.consultar',
    'inventario.reservas.consultar',

    'cotizaciones.consultar',

    'ordenes.consultar',

    'logistica.consultar',
    'logistica.gestionar',

    'pagos.consultar',

    'reportes.consultar',

    'alertas.consultar'
  ],

  DIRECCION: [
    'dashboard.consultar',

    'catalogo.consultar',

    'inventario.consultar',

    'cotizaciones.consultar',

    'ordenes.consultar',

    'logistica.consultar',

    'pagos.consultar',

    'reportes.consultar',

    'alertas.consultar'
  ]
};

/**
 * Devuelve únicamente strings válidos de un arreglo.
 *
 * @param {*} value
 * @returns {string[]}
 */
function normalizeStringArray(value) {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.filter(
    item =>
      typeof item === 'string' &&
      item.trim().length > 0
  );
}

/**
 * Obtiene la unión de permisos correspondientes
 * a uno o más roles.
 *
 * Utilizado actualmente por auth.service.js
 * para construir la sesión mock.
 *
 * @param {string[]} roles
 * @returns {string[]}
 */
export function getPermissionsForRoles(roles = []) {
  const normalizedRoles =
    normalizeStringArray(roles);

  return [
    ...new Set(
      normalizedRoles.flatMap(
        role => ROLE_PERMISSIONS[role] || []
      )
    )
  ];
}

/**
 * Conservado por compatibilidad con módulos existentes.
 *
 * Los módulos nuevos deben preferir autorización
 * mediante permisos efectivos.
 *
 * @param {Object|null} session
 * @param {string[]} allowedRoles
 * @returns {boolean}
 */
export function hasAnyRole(
  session,
  allowedRoles = []
) {
  if (!session?.user) {
    return false;
  }

  const roles =
    normalizeStringArray(session.user.roles);

  const normalizedAllowedRoles =
    normalizeStringArray(allowedRoles);

  return normalizedAllowedRoles.some(
    role => roles.includes(role)
  );
}

/**
 * Comprueba un permiso efectivo de la sesión.
 *
 * También admite comodines por dominio:
 * clientes.* autoriza clientes.consultar,
 * clientes.modificar, etc.
 *
 * @param {Object|null} session
 * @param {string} permission
 * @returns {boolean}
 */
export function hasPermission(
  session,
  permission
) {
  if (
    !session ||
    typeof permission !== 'string'
  ) {
    return false;
  }

  const normalizedPermission =
    permission.trim();

  if (!normalizedPermission) {
    return false;
  }

  const permissions =
    normalizeStringArray(
      session.permissions
    );

  if (
    permissions.includes(
      normalizedPermission
    )
  ) {
    return true;
  }

  const separatorIndex =
    normalizedPermission.indexOf('.');

  if (separatorIndex <= 0) {
    return false;
  }

  const namespace =
    normalizedPermission.slice(
      0,
      separatorIndex
    );

  return permissions.includes(
    `${namespace}.*`
  );
}

/**
 * Determina si la sesión posee al menos
 * uno de los permisos indicados.
 *
 * @param {Object|null} session
 * @param {string[]} permissions
 * @returns {boolean}
 */
export function hasAnyPermission(
  session,
  permissions = []
) {
  return normalizeStringArray(
    permissions
  ).some(
    permission =>
      hasPermission(
        session,
        permission
      )
  );
}