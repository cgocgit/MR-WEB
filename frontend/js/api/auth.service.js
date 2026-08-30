import { request } from './client.js';

export async function login(username, password){
  // Mocked implementation: acepta cualquier contraseña, devuelve rol según usuario
  await new Promise(r=>setTimeout(r,300));
  const uname = (username||'').toString().toLowerCase();
  let role = 'USER';
  if(uname === 'admin') role = 'ADMIN';
  else if(uname === 'inventario') role = 'INVENTARIO';
  else if(uname === 'tech' || uname === 'tecnico') role = 'TECH';
  else if(uname === 'supervisor') role = 'SUPERVISOR';
  else if(uname === 'administrativo') role = 'ADMINISTRATIVO';
  else if(uname === 'direccion' || uname === 'direccion') role = 'DIRECCION';
  else if(uname === 'ventas' || uname === 'vendedor') role = 'USER';

  const user = {id: Date.now(), username, name: username==='admin'? 'Administrador' : username, roles: [role]};
  // derive permissions from role (minimal mock)
  // Permissions are explicit — ADMIN can consult and manage configuration/users and catalogue,
  // but must NOT perform day-to-day operational actions (cotizaciones/ordenes creation,
  // inventory movements, logistic phases registration, manual payments, etc.)
  const rolePermissions = {
    'ADMIN': [
      // User management
      'usuarios.*', 'roles.*',
      // Consultations across modules
      'clientes.consultar', 'cotizaciones.consultar', 'ordenes.consultar', 'pagos.consultar', 'reportes.consultar', 'alertas.consultar',
      // Catalogue management (allowed)
      'catalogo.*',
      // Inventory: consult only
      'inventario.consultar', 'inventario.disponibilidad', 'inventario.movimientos.consultar',
      // Logistics progress consult only
      'logistica.consultar'
      ,
      // administration visibility
      'administracion.consultar'
    ],
    'INVENTARIO': [
      'catalogo.consultar','catalogo.gestionar','productos.*','paquetes.*','abc.*',
      'inventario.*','inventario.consultar','inventario.disponibilidad','inventario.movimientos.*',
      'ordenes.consultar','reportes.consultar','alertas.consultar'
    ],
    // USER = Ventas / Ejecutivo de ventas
    'USER': [
      'clientes.*','prospectos.*',
      'catalogo.consultar','catalogo.precios','catalogo.disponibilidad',
      'cotizaciones.gestionar','cotizaciones.consultar',
      'ordenes.crear','ordenes.consultar','ordenes.consultar_mis',
      'alertas.consultar','inventario.consultar','reportes.consultar'
    ],
    // Personal administrativo
    'ADMINISTRATIVO': [
      'clientes.*',
      'cotizaciones.gestionar','cotizaciones.consultar',
      'ordenes.gestionar','ordenes.asignar','ordenes.consultar',
      'catalogo.consultar','inventario.consultar',
      'pagos.registrar','pagos.consultar',
      'reportes.consultar','alertas.consultar'
    ],
    'TECH': [
      'catalogo.consultar','inventario.consultar',
      'ordenes.asignadas','ordenes.consultar',
      'logistica.registrar','logistica.ejecucion','logistica.evidencia','logistica.consultar',
      'alertas.consultar'
    ],
    'SUPERVISOR': [
      'clientes.consultar','catalogo.consultar','inventario.consultar','cotizaciones.consultar','ordenes.consultar','pagos.consultar',
      'logistica.*','reportes.consultar','alertas.consultar'
    ],
    // Dirección / gerencia — solo consulta y panel ejecutivo
    'DIRECCION': [
      'dashboard.consultar','catalogo.consultar','inventario.consultar','cotizaciones.consultar','ordenes.consultar','pagos.consultar','alertas.consultar','reportes.*'
    ]
  };
  const permissions = rolePermissions[role] || [];
  const token = btoa(username + ':' + Date.now());
  const session = {user, token, permissions};
  localStorage.setItem('mr_session', JSON.stringify(session));
  return session;
}

export function logout(){
  localStorage.removeItem('mr_session');
}
