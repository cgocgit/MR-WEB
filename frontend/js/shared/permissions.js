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

    'clientes.consultar',

    'catalogo.consultar',
    'catalogo.gestionar',

    'inventario.consultar',

    'cotizaciones.consultar',

    'ordenes.consultar',

    'logistica.consultar',

    'pagos.consultar',

    'reportes.consultar',

    'alertas.consultar'
  ],

  INVENTARIO: [
    'dashboard.consultar',

    'catalogo.consultar',
    'catalogo.gestionar',

    'inventario.consultar',
    'inventario.gestionar',

    'ordenes.consultar',

    'logistica.consultar',

    'reportes.consultar',

    'alertas.consultar'
  ],

  USER: [
    'dashboard.consultar',

    'clientes.consultar',
    'clientes.gestionar',

    'catalogo.consultar',

    'inventario.consultar',

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
    'clientes.gestionar',

    'catalogo.consultar',

    'inventario.consultar',

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

    'clientes.consultar',

    'catalogo.consultar',

    'inventario.consultar',

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

export function getPermissionsForRoles(roles = []) {
  return [
    ...new Set(
      roles.flatMap(
        role => ROLE_PERMISSIONS[role] || []
      )
    )
  ];
}

export function hasAnyRole(session, allowedRoles){
  if(!session || !session.user) return false;
  const roles = session.user.roles || [];
  return allowedRoles.some(r=> roles.includes(r));
}

export function hasPermission(session, permission) {
  if (!session) return false;

  if (typeof permission !== 'string') {
    console.warn(
      'hasPermission esperaba un permiso string:',
      permission
    );

    return false;
  }

  const perms = session.permissions || [];

  if (perms.includes(permission)) {
    return true;
  }

  const parts = permission.split('.');

  const wildcard =
    parts[0] + '.*';

  return perms.includes(wildcard);
}