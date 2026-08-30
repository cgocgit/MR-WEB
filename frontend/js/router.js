import { requireAuth, requireRole, getSession } from './shared/auth-guard.js';

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
  '#/administracion': ['ADMIN'],
  '#/administracion/usuarios': ['ADMIN'],
  '#/administracion/roles': ['ADMIN'],
  '#/administracion/usuario-formulario': ['ADMIN'],
  '#/administracion/usuario-detalle': ['ADMIN'],
  '#/administracion/permisos': ['ADMIN'],
  '#/administracion/matriz-acceso': ['ADMIN'],
  '#/administracion/bitacora': ['ADMIN'],
  '#/administracion/configuracion': ['ADMIN'],
  '#/administracion/intercambio-csv': ['ADMIN'],
  '#/administracion/documentacion-tecnica': ['ADMIN'],
  '#/clientes': ['ADMIN','USER','SUPERVISOR','ADMINISTRATIVO','DIRECCION'],
  '#/catalogo': ['ADMIN','USER','INVENTARIO','SUPERVISOR','ADMINISTRATIVO','DIRECCION'],
  '#/inventario': ['ADMIN','INVENTARIO','SUPERVISOR','USER','ADMINISTRATIVO','DIRECCION'],
  '#/inventario/movimientos': ['INVENTARIO'],
  '#/inventario/alertas': ['INVENTARIO','ADMIN','SUPERVISOR','ADMINISTRATIVO','DIRECCION'],
  '#/cotizaciones': ['ADMIN','USER','SUPERVISOR','ADMINISTRATIVO','DIRECCION'],
  '#/cotizaciones/formulario': ['USER','ADMINISTRATIVO'],
  '#/ordenes': ['ADMIN','USER','SUPERVISOR','TECH','INVENTARIO','ADMINISTRATIVO','DIRECCION'],
  '#/ordenes/detalle': ['ADMIN','USER','SUPERVISOR','TECH','INVENTARIO','ADMINISTRATIVO','DIRECCION'],
  '#/logistica': ['ADMIN','TECH','SUPERVISOR','USER','ADMINISTRATIVO','DIRECCION'],
  '#/logistica/asignadas': ['TECH','SUPERVISOR'],
  '#/logistica/ejecucion': ['TECH','SUPERVISOR'],
  '#/pagos': ['ADMIN','USER','SUPERVISOR','ADMINISTRATIVO','DIRECCION'],
  '#/pagos/registro': ['ADMINISTRATIVO'],
  '#/reportes': ['ADMIN','SUPERVISOR','INVENTARIO','ADMINISTRATIVO','DIRECCION']
};

export async function loadRoute(container) {
  const rawHash = location.hash || '';
  // strip query string from hash (e.g. '#/dashboard?tour=1' -> '#/dashboard')
  const hash = rawHash.split('?')[0];
  const path = routes[hash] || 'pages/auth/login.html';
  // protect routes (allow login page)
  if(hash !== '' && hash !== '#/login'){
    if(!requireAuth()) return;
    const allowed = routePermissions[hash];
    if(allowed){
      // if user has none of the allowed roles, show access denied
      if(!requireRole(allowed)){
        container.innerHTML = '<div class="card">Acceso denegado: no dispone de permisos para ver esta página.</div>';
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
