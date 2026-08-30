// Mock usuarios service
export async function listUsuarios(){
  await new Promise(r=>setTimeout(r,120));
  return [
    {id:1,nombre:'Administrador',ident:'admin@local',rol:'ADMIN',activo:true,creado:'2026-01-01',ultimo:'2026-08-28'},
    {id:2,nombre:'Juan Perez',ident:'juan@cliente',rol:'USER',activo:true,creado:'2026-02-12',ultimo:'2026-08-20'}
  ];
}

// Search with filters and pagination (mock)
export async function searchUsuarios({q, rol, activo, sortField='nombre', sortDir='asc', page=1, size=10} = {}){
  await new Promise(r=>setTimeout(r,120));
  // create a larger mock dataset for demo
  const base = [];
  const roles = ['ADMIN','INVENTARIO','USER','ADMINISTRATIVO','TECH','SUPERVISOR','DIRECCION'];
  for(let i=1;i<=48;i++){
    base.push({
      id:i,
      nombre: `Usuario ${i}`,
      ident: `user${i}@local`,
      rol: roles[i % roles.length],
      activo: (i%5)!==0,
      creado: '2026-03-01',
      ultimo: '2026-08-15'
    });
  }

  let items = base.slice();
  if(q){ const qq = String(q).toLowerCase(); items = items.filter(u=> (u.nombre||'').toLowerCase().includes(qq) || (u.ident||'').toLowerCase().includes(qq)); }
  if(rol){ items = items.filter(u=> String(u.rol) === String(rol)); }
  if(typeof activo !== 'undefined' && activo !== null){ const a = (String(activo) === 'true' || activo === true); items = items.filter(u=> u.activo === a); }

  // sorting
  items.sort((a,b)=>{
    const av = (a[sortField] || '').toString().toLowerCase();
    const bv = (b[sortField] || '').toString().toLowerCase();
    if(av < bv) return sortDir === 'asc' ? -1 : 1;
    if(av > bv) return sortDir === 'asc' ? 1 : -1;
    return 0;
  });

  const total = items.length;
  const start = (page-1)*size;
  const paged = items.slice(start, start+size);
  return { items: paged, total, page, size };
}

export async function getUsuario(id){
  await new Promise(r=>setTimeout(r,80));
  return {id, nombre:'Usuario '+id, ident:`user${id}@local`, rol: id===1? 'ADMIN':'USER', activo:true, creado:'2026-03-01', ultimo:'2026-08-15', permisos:['clientes.*'], version: 'v1'};
}

export async function createUsuario(payload){
  await new Promise(r=>setTimeout(r,120));
  // Basic client-side validation simulation: name, ident, rol, activo
  const errors = {};
  if(!payload.nombre || String(payload.nombre).trim() === '') errors.nombre = 'El nombre es obligatorio';
  if(!payload.ident || String(payload.ident).trim() === '') errors.ident = 'El identificador es obligatorio';
  if(!payload.rol || String(payload.rol).trim() === '') errors.rol = 'El rol es obligatorio';
  if(typeof payload.activo === 'undefined') errors.activo = 'El estado es obligatorio';
  if(Object.keys(errors).length) return { success:false, status:422, errors };

  // Simulate uniqueness conflict for known idents
  const existing = ['admin@local','juan@cliente'];
  if(existing.includes(String(payload.ident).toLowerCase())){
    return { success:false, status:409, message: 'Identificador duplicado' };
  }

  // Simulate creation with role assignment and audit record
  const user = Object.assign({id: Date.now(), creado: new Date().toISOString()}, payload);
  const audit = { id: Date.now(), tipo:'CREATE_USER', administrador: 'system', usuario: user.ident, rol: payload.rol || null, fecha: new Date().toISOString(), resultado:'OK' };
  return { success:true, user, audit };
}

export async function updateUsuario(id,payload){
  await new Promise(r=>setTimeout(r,120));
  const user = Object.assign({id}, payload);
  const audit = { id: Date.now(), tipo:'UPDATE_USER', administrador: 'system', usuario: payload.ident || id, fecha: new Date().toISOString(), resultado:'OK' };
  return { user, audit };
}

export async function toggleUsuarioActivo(id,activo){
  await new Promise(r=>setTimeout(r,80));
  return {id, activo};
}

export async function changeUserRole(id, newRole, reason, observedVersion){
  // Simulate transactional role change: returns role previous and new, audit and sessions invalidated flag
  await new Promise(r=>setTimeout(r,160));
  // simulate fetching current role/version from backend
  const current = { rol: id === 1 ? 'ADMIN' : 'USER', version: 'v1' };
  // concurrency simulation: if observedVersion provided and not equal, return conflict
  if(observedVersion && observedVersion !== current.version){ return { success:false, error:'conflict' } }
  const previous = current.rol;
  if(previous === newRole) return { success:false, error:'same_role' };
  // Last-admin protection: do not allow removing ADMIN from the last admin (mock: id===1)
  if(previous === 'ADMIN' && newRole !== 'ADMIN' && id === 1) return { success:false, error:'last_admin' };
  const audit = { id: Date.now(), tipo:'CHANGE_ROLE', administrador:'system', usuario:id, rolAnterior:previous, rolNuevo:newRole, motivo: reason, fecha:new Date().toISOString(), resultado:'OK' };
  // simulate sessions invalidated and return new version
  return { success:true, audit, sessionsInvalidated: true, newVersion: 'v2' };
}

export async function getRoleHistory(id){
  await new Promise(r=>setTimeout(r,100));
  return [ {id:1,usuario:id,rolAnterior:'USER',rolNuevo:'ADMIN',administrador:'admin',motivo:'Necesario',fecha:'2026-07-01',resultado:'OK'} ];
}

export default { listUsuarios, getUsuario, createUsuario, updateUsuario, toggleUsuarioActivo, changeUserRole, getRoleHistory };
