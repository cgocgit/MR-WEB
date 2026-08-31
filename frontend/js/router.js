import {
  requireAuth,
  getSession
} from './shared/auth-guard.js';

import {
  hasPermission
} from './shared/permissions.js';

const routes = {
  '': 'pages/auth/login.html',
  '#/login': 'pages/auth/login.html',
  '#/dashboard': 'pages/dashboard/dashboard.html',
  '#/clientes': 'pages/clientes/lista.html',
  '#/catalogo': 'pages/catalogo/productos.html',
  '#/catalogo/productos': 'pages/catalogo/productos.html',
  '#/catalogo/servicios': 'pages/catalogo/servicios.html',
  '#/catalogo/paquetes': 'pages/catalogo/paquetes.html',
  '#/catalogo/precios': 'pages/catalogo/precios.html',
  '#/inventario': 'pages/inventario/existencias.html',
  '#/inventario/existencias': 'pages/inventario/existencias.html',
  '#/inventario/movimientos': 'pages/inventario/movimientos.html',
  '#/inventario/alertas': 'pages/inventario/alertas.html',
  '#/cotizaciones': 'pages/cotizaciones/lista.html',
  '#/cotizaciones/formulario': 'pages/cotizaciones/formulario.html',
  '#/ordenes': 'pages/ordenes/lista.html',
  '#/ordenes/detalle': 'pages/ordenes/detalle.html',
  '#/logistica': 'pages/logistica/asignadas.html',
  '#/logistica/asignadas': 'pages/logistica/asignadas.html',
  '#/logistica/ejecucion': 'pages/logistica/ejecucion.html',
  '#/pagos': 'pages/pagos/lista.html',
  '#/pagos/registro': 'pages/pagos/registro.html',
  '#/reportes': 'pages/reportes/reportes.html',
  '#/administracion': 'pages/administracion/usuarios.html',
  '#/administracion/usuarios': 'pages/administracion/usuarios.html',
  '#/administracion/roles': 'pages/administracion/roles.html',
  '#/administracion/usuario-formulario': 'pages/administracion/usuario-formulario.html',
  '#/administracion/usuario-detalle': 'pages/administracion/usuario-detalle.html',
  '#/administracion/permisos': 'pages/administracion/permisos.html',
  '#/administracion/matriz-acceso': 'pages/administracion/matriz-acceso.html',
  '#/administracion/bitacora': 'pages/administracion/bitacora.html',
  '#/administracion/configuracion': 'pages/administracion/configuracion.html',
  '#/administracion/intercambio-csv': 'pages/administracion/intercambio-csv.html',
  '#/administracion/documentacion-tecnica': 'pages/administracion/documentacion-tecnica.html'
};

// map routes to allowed roles (uses existing role names in the app)
const routePermissions = {
  '#/dashboard':
    'dashboard.consultar',

  '#/clientes':
    'clientes.consultar',

  '#/catalogo':
    'catalogo.consultar',

  '#/catalogo/productos':
  'catalogo.consultar',

  '#/catalogo/servicios':
    'catalogo.consultar',

  '#/catalogo/paquetes':
    'catalogo.consultar',

  '#/catalogo/precios':
    'catalogo.consultar',

  '#/inventario':
    'inventario.consultar',

  '#/inventario/movimientos':
  'inventario.gestionar',

  '#/inventario/existencias':
  'inventario.consultar',

  '#/inventario/movimientos':
    'inventario.consultar',

  '#/inventario/alertas':
    'alertas.consultar',

  '#/cotizaciones':
    'cotizaciones.consultar',
  
  '#/cotizaciones/formulario':
  'cotizaciones.gestionar',

  '#/ordenes':
    'ordenes.consultar',

  '#/ordenes/detalle':
  'ordenes.consultar',

  '#/logistica':
    'logistica.consultar',

  '#/logistica/ejecucion':
  'logistica.ejecutar',

  '#/logistica/asignadas':
    'logistica.consultar',
  
  '#/logistica/ejecucion':
  'logistica.ejecutar',

  '#/pagos':
    'pagos.consultar',

  '#/pagos/registro':
  'pagos.gestionar',

  '#/pagos/registro':
  'pagos.gestionar',

  '#/reportes':
    'reportes.consultar',

  '#/administracion':
    'administracion.consultar',

  '#/administracion/usuarios':
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
    'documentacion.tecnica.consultar',

  '#/administracion/usuario-formulario':
  'usuarios.consultar',

  '#/administracion/usuario-detalle':
  'usuarios.consultar'

};

export async function loadRoute(container) {
  const rawHash = location.hash || '';
  // strip query string from hash (e.g. '#/dashboard?tour=1' -> '#/dashboard')
  const hash = rawHash.split('?')[0];
  const path = routes[hash] || 'pages/auth/login.html';
  // protect routes (allow login page)
  if(hash !== '' && hash !== '#/login'){
    if(!requireAuth()) return;
  
    const requiredPermission = routePermissions[hash];

    if (requiredPermission) {
      const session = getSession();

      if (
        !hasPermission(
          session,
          requiredPermission
        )
      ) {
        container.innerHTML = `
          <div class="card">
            Acceso denegado:
            no dispone de permisos para
            ver esta página.
          </div>
        `;

        return;
      }
    }
  }
  try{
    const res = await fetch(path);
    if(!res.ok){ container.innerHTML = '<div class="card">Página no encontrada</div>'; return }
    const html = await res.text();
    // inject HTML
    container.innerHTML = html;
    // Execute any script tags present in the fetched HTML so inline modules run
    const scripts = Array.from(container.querySelectorAll('script'));
    for(const oldScript of scripts){
      const newScript = document.createElement('script');
      if(oldScript.src){
        newScript.src = oldScript.src;
      }
      if(oldScript.type){ newScript.type = oldScript.type }
      if(oldScript.textContent) newScript.textContent = oldScript.textContent;
      // replace to execute
      oldScript.parentNode.replaceChild(newScript, oldScript);
    }
  }catch(e){
    container.innerHTML = `<div class="card">Error cargando la vista</div>`;
  }
}

export function initRouter(container){
  const handler = ()=> loadRoute(container);
  window.addEventListener('hashchange', handler);
  handler();
}
