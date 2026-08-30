import { listRoles } from '../../../js/api/roles.service.js';
import { getSession } from '../../../js/shared/auth-guard.js';
import { hasPermission } from '../../../js/shared/permissions.js';

export async function init(containerId){
  const root = document.getElementById(containerId);
  if(!root) return;
  const session = getSession();
  if(!hasPermission(session,'administracion.consultar') && !(session && session.user && session.user.roles.includes('ADMIN'))){
    root.innerHTML = '<div class="card">Acceso denegado</div>'; return;
  }
  root.innerHTML = '<div class="card">Cargando roles...</div>';
  try{
    const roles = await listRoles();
    if(!roles || roles.length === 0){ root.innerHTML = '<div class="card">No hay roles configurados.</div>'; return }
    const list = document.createElement('div');
    list.className = 'card';
    list.innerHTML = `<div style="font-weight:600;margin-bottom:8px">Roles</div>` + roles.map(r=>{
      return `<div style="display:flex;justify-content:space-between;padding:6px 0;border-bottom:1px solid #eee"><div><strong>${r.id}</strong><div style="font-size:12px;color:#666">${r.nombre} — ${r.desc || ''}</div></div><div><a href="#/administracion/permisos?rol=${r.id}">Ver permisos</a></div></div>`;
    }).join('');
    root.innerHTML = '';
    root.appendChild(list);
  }catch(e){ root.innerHTML = '<div class="card">Error cargando roles</div>' }
}

export default { init };
