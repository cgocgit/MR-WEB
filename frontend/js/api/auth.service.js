import {
  getPermissionsForRoles
} from '../shared/permissions.js';

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
  const permissions = getPermissionsForRoles(user.roles);
    
  const token = btoa(username + ':' + Date.now());
  const session = {user, token, permissions};
  localStorage.setItem('mr_session', JSON.stringify(session));
  return session;
}

export function logout(){
  localStorage.removeItem('mr_session');
}
