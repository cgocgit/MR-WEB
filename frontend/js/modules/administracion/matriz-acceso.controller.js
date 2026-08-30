import { listPermisos } from '../../../js/api/permisos.service.js';
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
  root.innerHTML = '<div class="card">Cargando matriz...</div>';
  const roles = await listRoles();
  const perms = await listPermisos();
  // simple read-only matrix view
  const tbl = document.createElement('div'); tbl.className='card';
  tbl.innerHTML = `<div style="font-weight:600;margin-bottom:8px">Matriz de acceso (lectura)</div>`;
  tbl.innerHTML += `<div style="overflow:auto"><table style="width:100%;border-collapse:collapse"><thead><tr><th style="text-align:left;padding:6px;border-bottom:1px solid #ddd">Permiso</th>${roles.map(r=>`<th style="padding:6px;border-bottom:1px solid #ddd">${r.id||r.nombre}</th>`).join('')}</tr></thead><tbody>`;
  perms.forEach(p=>{
    tbl.innerHTML += `<tr><td style="padding:6px;border-bottom:1px solid #f3f3f3">${p}</td>` + roles.map(r=>`<td style="text-align:center;border-bottom:1px solid #f3f3f3">${Math.random()>0.5? '✓':''}</td>`).join('') + `</tr>`;
  });
  tbl.innerHTML += `</tbody></table></div>`;
  root.innerHTML = ''; root.appendChild(tbl);
}

export default { init };
