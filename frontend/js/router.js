import {
  requireAuth,
  getSession
} from './shared/auth-guard.js';

import {
  hasAnyRole,
  hasPermission
} from './shared/permissions.js';

const routes = {
  '': 'pages/auth/login.html',
  '#/login': 'pages/auth/login.html',

  '#/dashboard':
    'pages/dashboard/dashboard.html',

  // Clientes y prospectos
  '#/clientes':
    'pages/clientes/lista.html',

  '#/clientes/formulario':
    'pages/clientes/formulario.html',

  '#/clientes/detalle':
    'pages/clientes/detalle.html',

  '#/clientes/revision':
    'pages/clientes/revision.html',

  // Catálogo
  '#/catalogo':
    'pages/catalogo/productos.html',

  '#/catalogo/productos':
    'pages/catalogo/productos.html',

  '#/catalogo/productos/formulario':
    'pages/catalogo/producto-formulario.html',

  '#/catalogo/productos/detalle':
    'pages/catalogo/producto-detalle.html',

  '#/catalogo/servicios':
    'pages/catalogo/servicios.html',

  '#/catalogo/servicios/formulario':
    'pages/catalogo/servicio-formulario.html',

  '#/catalogo/servicios/detalle':
    'pages/catalogo/servicio-detalle.html',

  '#/catalogo/paquetes':
    'pages/catalogo/paquetes.html',

  '#/catalogo/paquetes/formulario':
    'pages/catalogo/paquete-formulario.html',

  '#/catalogo/paquetes/detalle':
    'pages/catalogo/paquete-detalle.html',

    '#/catalogo/precios':
    'pages/catalogo/precios.html',

  '#/catalogo/precios/formulario':
    'pages/catalogo/precio-formulario.html',

  '#/catalogo/precios/detalle':
    'pages/catalogo/precio-detalle.html',

  '#/catalogo/configuracion':
    'pages/catalogo/configuracion.html',

  // Inventario
  '#/inventario':
    'pages/inventario/inicio.html',

  '#/inventario/existencias':
    'pages/inventario/existencias.html',

  '#/inventario/existencias/detalle':
    'pages/inventario/existencia-detalle.html',

  '#/inventario/movimientos':
    'pages/inventario/movimientos.html',

  '#/inventario/registro-entrada':
    'pages/inventario/registro-entrada.html',

  '#/inventario/registro-salida':
    'pages/inventario/registro-salida.html',

  '#/inventario/registro-retorno':
    'pages/inventario/registro-retorno.html',

  '#/inventario/alertas':
    'pages/inventario/alertas.html',

  '#/inventario/limites':
  'pages/inventario/limites.html',

  '#/inventario/disponibilidad-futura':
    'pages/inventario/disponibilidad-futura.html',

  '#/inventario/cortes-fisicos':
    'pages/inventario/cortes-fisicos.html',

  '#/inventario/cortes-fisicos/detalle':
    'pages/inventario/corte-fisico-detalle.html',

    '#/inventario/ajuste-autorizado':
    'pages/inventario/ajuste-autorizado.html',

  '#/inventario/reservas':
    'pages/inventario/reservas.html',

  // Cotizaciones
  '#/cotizaciones':
    'pages/cotizaciones/lista.html',

  '#/cotizaciones/nueva':
    'pages/cotizaciones/formulario.html',

  // Alias temporal de compatibilidad.
  '#/cotizaciones/formulario':
    'pages/cotizaciones/formulario.html',

  '#/cotizaciones/detalle':
    'pages/cotizaciones/detalle.html',

  '#/cotizaciones/version':
    'pages/cotizaciones/version.html',

  '#/cotizaciones/confirmar':
    'pages/cotizaciones/confirmacion.html',

  '#/cotizaciones/pdf':
    'pages/cotizaciones/pdf.html',

  // Órdenes
  '#/ordenes':
    'pages/ordenes/lista.html',

  '#/ordenes/detalle':
    'pages/ordenes/detalle.html',

  '#/ordenes/revision':
    'pages/ordenes/revision.html',

  // Logística
  '#/logistica':
    'pages/logistica/inicio.html',

  '#/logistica/programacion':
    'pages/logistica/programacion.html',

  '#/logistica/programacion/formulario':
    'pages/logistica/programacion-formulario.html',

  '#/logistica/consulta':
    'pages/logistica/consulta.html',

  '#/logistica/rutas':
    'pages/logistica/rutas.html',

  '#/logistica/rutas/detalle':
    'pages/logistica/ruta-detalle.html',

  '#/logistica/orden/detalle':
    'pages/logistica/orden-detalle.html',

  '#/logistica/asignadas':
    'pages/logistica/asignadas.html',

  '#/logistica/ejecucion':
    'pages/logistica/ejecucion.html',

  '#/logistica/traslado':
    'pages/logistica/traslado.html',

  '#/logistica/incidencias':
    'pages/logistica/incidencias.html',

  '#/logistica/tolerancias':
    'pages/logistica/tolerancias.html',

    // Pagos
  '#/pagos':
    'pages/pagos/inicio.html',

  '#/pagos/consulta':
    'pages/pagos/consulta.html',

  '#/pagos/nuevo':
    'pages/pagos/registro.html',

  '#/pagos/cuenta':
    'pages/pagos/detalle.html',

  '#/pagos/compensar':
    'pages/pagos/compensacion.html',

  '#/pagos/alertas':
    'pages/pagos/alertas.html',

  // Reportes
  '#/reportes':
    'pages/reportes/reportes.html',

  // Administración
  '#/administracion':
    'pages/administracion/usuarios.html',

  '#/administracion/usuarios':
    'pages/administracion/usuarios.html',

  '#/administracion/roles':
    'pages/administracion/roles.html',

  '#/administracion/usuario-formulario':
    'pages/administracion/usuario-formulario.html',

  '#/administracion/usuario-detalle':
    'pages/administracion/usuario-detalle.html',

  '#/administracion/permisos':
    'pages/administracion/permisos.html',

  '#/administracion/matriz-acceso':
    'pages/administracion/matriz-acceso.html',

  '#/administracion/bitacora':
    'pages/administracion/bitacora.html',

  '#/administracion/configuracion':
    'pages/administracion/configuracion.html',

  '#/administracion/intercambio-csv':
    'pages/administracion/intercambio-csv.html',

  '#/administracion/documentacion-tecnica':
    'pages/administracion/documentacion-tecnica.html'
};

/**
 * Comprueba si la sesión posee al menos uno
 * de los permisos indicados.
 *
 * Se utiliza para rutas de Logística que
 * admiten distintos perfiles funcionales.
 */
function hasAnyPermission(
  permissions = []
) {
  const session = getSession();

  return permissions.some(
    permission =>
      hasPermission(
        session,
        permission
      )
  );
}

/**
 * Permisos requeridos por ruta.
 *
 * El valor puede ser:
 * - un string para un permiso fijo;
 * - una función para resolver el permiso
 *   según el contexto de navegación.
 */
const routePermissions = {
  '#/dashboard':
    'dashboard.consultar',

  // Clientes y prospectos
  '#/clientes':
    'clientes.consultar',

  '#/clientes/formulario':
    ({ query }) =>
      query.get('id')
        ? 'clientes.modificar'
        : 'clientes.registrar',

  '#/clientes/detalle':
    'clientes.consultar',

  '#/clientes/revision':
    'clientes.clasificar',

  // Catálogo
  '#/catalogo':
    'catalogo.consultar',

  '#/catalogo/productos':
    'catalogo.consultar',

  '#/catalogo/productos/formulario':
    ({ query }) =>
      query.get('id')
        ? 'catalogo.productos.modificar'
        : 'catalogo.productos.registrar',

  '#/catalogo/productos/detalle':
    'catalogo.consultar',

  '#/catalogo/servicios':
    'catalogo.consultar',

  '#/catalogo/servicios/formulario':
    ({ query }) =>
      query.get('id')
        ? 'catalogo.servicios.modificar'
        : 'catalogo.servicios.registrar',

  '#/catalogo/servicios/detalle':
    'catalogo.consultar',

  '#/catalogo/paquetes':
    'catalogo.consultar',

  '#/catalogo/paquetes/formulario':
    ({ query }) =>
      query.get('id')
        ? 'catalogo.paquetes.modificar'
        : 'catalogo.paquetes.registrar',

      '#/catalogo/paquetes/detalle':
    'catalogo.consultar',

  '#/catalogo/precios':
    'catalogo.consultar',

  '#/catalogo/precios/formulario':
    'catalogo.precios.gestionar',

  '#/catalogo/precios/detalle':
    'catalogo.consultar',

  '#/catalogo/configuracion':
    'catalogo.auxiliares.gestionar',

  // Inventario
  '#/inventario':
    'inventario.consultar',

  '#/inventario/existencias':
    'inventario.consultar',

  '#/inventario/existencias/detalle':
  ({ query }) => {
    const idProducto =
      Number(
        query.get(
          'idProducto'
        )
      );

    const idOrden =
      Number(
        query.get(
          'idOrden'
        )
      );

    const accesoTecnico =
      Number.isInteger(
        idProducto
      ) &&
      idProducto > 0 &&
      Number.isInteger(
        idOrden
      ) &&
      idOrden > 0 &&
      hasAnyRole(
        getSession(),
        ['TECH']
      );

    return accesoTecnico
      ? null
      : 'inventario.consultar';
  },

  '#/inventario/movimientos':
  'inventario.movimientos.consultar',

  '#/inventario/registro-entrada':
    'inventario.gestionar',

  '#/inventario/registro-salida':
    'inventario.gestionar',

  '#/inventario/registro-retorno':
  () =>
    hasAnyRole(
      getSession(),
      ['DIRECCION']
    )
      ? 'inventario.consultar'
      : 'inventario.gestionar',

  '#/inventario/alertas':
    'inventario.alertas.consultar',

  '#/inventario/limites':
  'inventario.gestionar',

  '#/inventario/disponibilidad-futura':
    'inventario.disponibilidad.consultar',

  '#/inventario/cortes-fisicos':
    'inventario.cortes.consultar',

  '#/inventario/cortes-fisicos/detalle':
    'inventario.cortes.consultar',
  
  '#/inventario/ajuste-autorizado':
    'inventario.gestionar',

  '#/inventario/reservas':
    'inventario.reservas.consultar',

  '#/inventario/limites':
    'inventario.gestionar',

  '#/inventario/disponibilidad-futura':
    'inventario.disponibilidad.consultar',
  
  // Cotizaciones
  '#/cotizaciones':
    'cotizaciones.consultar',

  '#/cotizaciones/nueva':
    'cotizaciones.gestionar',

  '#/cotizaciones/formulario':
    'cotizaciones.gestionar',

  '#/cotizaciones/detalle':
    'cotizaciones.consultar',

  '#/cotizaciones/version':
    ({ query }) =>
      query.get('modo') === 'consulta'
        ? 'cotizaciones.consultar'
        : 'cotizaciones.gestionar',

  '#/cotizaciones/confirmar':
    'cotizaciones.gestionar',

  '#/cotizaciones/pdf':
    'cotizaciones.consultar',

  // Órdenes
  '#/ordenes':
    ({ query }) =>
      query.get('modo') ===
        'asignadas'
        ? 'ordenes.asignadas'
        : hasPermission(
            getSession(),
            'ordenes.consultar'
          )
          ? 'ordenes.consultar'
          : 'ordenes.asignadas',

  '#/ordenes/detalle':
    () =>
      hasPermission(
        getSession(),
        'ordenes.detalle.consultar'
      )
        ? null
        : 'ordenes.asignadas',

  '#/ordenes/revision':
    'ordenes.revisar',

  // Logística
  '#/logistica':
    () =>
      hasAnyPermission([
        'logistica.consultar',
        'logistica.gestionar',
        'logistica.asignadas',
        'logistica.proceso.gestion',
        'logistica.traslado',
        'logistica.tolerancias.gestionar'
      ])
        ? null
        : 'logistica.consultar',

  '#/logistica/programacion':
    () =>
      hasAnyPermission([
        'logistica.consultar',
        'logistica.gestionar'
      ])
        ? null
        : 'logistica.consultar',

  '#/logistica/programacion/formulario':
    'logistica.gestionar',

  '#/logistica/consulta':
    'logistica.consultar',

  '#/logistica/rutas':
    () =>
      hasAnyPermission([
        'logistica.consultar',
        'logistica.gestionar'
      ])
        ? null
        : 'logistica.consultar',

  '#/logistica/rutas/detalle':
    () =>
      hasAnyPermission([
        'logistica.consultar',
        'logistica.gestionar',
        'logistica.asignadas',
        'logistica.traslado'
      ])
        ? null
        : 'logistica.consultar',

  '#/logistica/orden/detalle':
    () =>
      hasAnyPermission([
        'logistica.consultar',
        'logistica.gestionar',
        'logistica.asignadas',
        'logistica.proceso.gestion',
        'logistica.traslado'
      ])
        ? null
        : 'logistica.consultar',

  '#/logistica/asignadas':
    'logistica.asignadas',

  '#/logistica/ejecucion':
    () =>
      hasAnyPermission([
        'logistica.proceso.gestion',
        'logistica.gestionar'
      ])
        ? null
        : 'logistica.proceso.gestion',

  '#/logistica/traslado':
    () =>
      hasAnyPermission([
        'logistica.traslado',
        'logistica.gestionar'
      ])
        ? null
        : 'logistica.traslado',

  '#/logistica/incidencias':
    () =>
      hasAnyPermission([
        'logistica.consultar',
        'logistica.gestionar',
        'logistica.asignadas',
        'logistica.proceso.gestion',
        'logistica.traslado'
      ])
        ? null
        : 'logistica.consultar',

  '#/logistica/tolerancias':
    'logistica.tolerancias.gestionar',

    // Pagos
  '#/pagos':
    'pagos.consultar',

  '#/pagos/consulta':
    'pagos.consultar',

  '#/pagos/nuevo':
    'pagos.gestionar',

  '#/pagos/cuenta':
    'pagos.consultar',

  '#/pagos/compensar':
    'pagos.gestionar',

  '#/pagos/alertas':
    'pagos.alertas.consultar',

  // Reportes
  '#/reportes':
    'reportes.consultar',

  // Administración
  '#/administracion':
    'administracion.consultar',

  '#/administracion/usuarios':
    'usuarios.consultar',

  '#/administracion/usuario-formulario':
    'usuarios.consultar',

  '#/administracion/usuario-detalle':
    'usuarios.consultar',

  '#/administracion/roles':
    'roles.consultar',

  '#/administracion/permisos':
    'permisos.consultar',

  '#/administracion/matriz-acceso':
    'matriz.consultar',

  '#/administracion/bitacora':
    'auditoria.consultar',

  '#/administracion/configuracion':
    'configuracion.consultar',

  '#/administracion/intercambio-csv':
    'intercambio.validar',

  '#/administracion/documentacion-tecnica':
    'documentacion.tecnica.consultar'
};

/**
 * Separa la ruta de sus parámetros.
 *
 * Ejemplo:
 *
 * #/clientes/formulario?id=101
 *
 * retorna:
 * hash  = #/clientes/formulario
 * query = id=101
 */
function parseLocationHash(
  rawHash = ''
) {
  const [
    hash,
    queryString = ''
  ] = rawHash.split('?');

  return {
    hash,
    query:
      new URLSearchParams(
        queryString
      )
  };
}

/**
 * Obtiene el permiso requerido por la ruta.
 */
function resolveRequiredPermission(
  hash,
  query
) {
  const permissionRule =
    routePermissions[hash];

  if (
    typeof permissionRule ===
    'function'
  ) {
    return permissionRule({
      hash,
      query
    });
  }

  return permissionRule || null;
}

/**
 * Muestra mensajes estáticos sin interpolar
 * contenido mediante innerHTML.
 */
function renderMessage(
  container,
  message
) {
  container.replaceChildren();

  const card =
    document.createElement('div');

  card.className = 'card';
  card.textContent = message;

  container.appendChild(card);
}

/**
 * Reactiva los scripts contenidos
 * en las plantillas cargadas por fetch.
 *
 * Se mantiene por compatibilidad con las
 * pantallas actuales del proyecto.
 */
function executeScripts(container) {
  const scripts =
    Array.from(
      container.querySelectorAll(
        'script'
      )
    );

  scripts.forEach(oldScript => {
    const newScript =
      document.createElement(
        'script'
      );

    Array.from(
      oldScript.attributes
    ).forEach(attribute => {
      newScript.setAttribute(
        attribute.name,
        attribute.value
      );
    });

    if (oldScript.textContent) {
      newScript.textContent =
        oldScript.textContent;
    }

    oldScript.replaceWith(
      newScript
    );
  });
}

/**
 * Carga y autoriza la ruta solicitada.
 */
export async function loadRoute(
  container
) {
  if (!container) {
    return;
  }

  const rawHash =
    location.hash || '';

  const {
    hash,
    query
  } = parseLocationHash(
    rawHash
  );

  const path = routes[hash];

  /*
   * Una ruta inexistente ya no se
   * transforma silenciosamente en login.
   */
  if (!path) {
    renderMessage(
      container,
      'Página no encontrada.'
    );

    return;
  }

  const isPublicRoute =
    hash === '' ||
    hash === '#/login';

  if (!isPublicRoute) {
    if (!requireAuth()) {
      return;
    }

    const requiredPermission =
      resolveRequiredPermission(
        hash,
        query
      );

    if (requiredPermission) {
      const session =
        getSession();

      if (
        !hasPermission(
          session,
          requiredPermission
        )
      ) {
        renderMessage(
          container,
          'Acceso denegado: no dispone de permisos para ver esta página.'
        );

        return;
      }
    }
  }

  try {
    const response =
      await fetch(path);

    if (!response.ok) {
      renderMessage(
        container,
        'Página no encontrada.'
      );

      return;
    }

    const html =
      await response.text();

    /*
     * El uso de innerHTML aquí es deliberado:
     * el contenido proviene exclusivamente
     * de plantillas HTML estáticas controladas
     * por el propio frontend.
     *
     * Los datos procedentes de servicios no
     * deben introducirse de esta manera.
     */
    container.innerHTML = html;

    executeScripts(container);

  } catch (error) {
    console.error(
      'No fue posible cargar la vista.',
      error
    );

    renderMessage(
      container,
      'Error cargando la vista.'
    );
  }
}

/**
 * Inicializa el enrutador SPA.
 */
export function initRouter(
  container
) {
  const handler =
    () => loadRoute(container);

  window.addEventListener(
    'hashchange',
    handler
  );

  handler();
}