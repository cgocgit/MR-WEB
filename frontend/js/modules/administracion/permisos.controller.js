import { listPermisos, permisosPorRol, updatePermisosPorRol } from '../../../js/api/permisos.service.js';
import { getSession } from '../../../js/shared/auth-guard.js';
import { hasPermission } from '../../../js/shared/permissions.js';

export async function init(containerId){
  const root = document.getElementById(containerId);
  if(!root) return;
  const session = getSession();
  if(!hasPermission(session,'administracion.consultar') && !(session && session.user && session.user.roles.includes('ADMIN'))){
    root.innerHTML = '<div class="card">Acceso denegado</div>'; return;
  }
  root.innerHTML = '<div class="card">Cargando permisos...</div>';
  // check if a role is requested via hash query
  const params = new URLSearchParams(location.hash.split('?')[1] || '');
  const rol = params.get('rol');
  const perms = await listPermisos();
  if(!rol){
    root.innerHTML = '<div class="card"><div style="font-weight:600;margin-bottom:8px">Permisos disponibles</div><ul style="list-style:none;padding:0">' + perms.map(p=>`<li style="padding:6px 0;border-bottom:1px solid #eee">${p}</li>`).join('') + '</ul></div>';
    return;
  }

  // show permissions for the requested role with checkboxes
  const assigned = await permisosPorRol(rol);
  const assignedSet = new Set(assigned || []);
  const html = `
    <div class="card">
      <div style="font-weight:600;margin-bottom:8px">Permisos para rol: ${rol}</div>
      <div style="margin-bottom:8px">Marque los permisos que desea asignar al rol y presione Guardar.</div>
      <form id="role-perms-form">
        <div style="display:flex;flex-direction:column;gap:6px;max-height:320px;overflow:auto">${perms.map(p=>`<label style="padding:6px;border-bottom:1px solid #eee"><input type="checkbox" name="perm" value="${p}" ${assignedSet.has(p)? 'checked':''}> ${p}</label>`).join('')}</div>
        <div style="margin-top:8px"><button type="submit">Guardar</button> <a href="#/administracion/roles" style="margin-left:8px">Volver a Roles</a></div>
      </form>
      <div id="role-save-result"></div>
    </div>
  `;
  root.innerHTML = html;

  const form = document.getElementById('role-perms-form');
  form.addEventListener('submit', async (ev)=>{
    ev.preventDefault();
    const values = Array.from(form.querySelectorAll('input[name="perm"]:checked')).map(i=>i.value);
    const res = await updatePermisosPorRol(rol, values);
    const resultEl = document.getElementById('role-save-result');
    if(res && res.success){
      resultEl.innerHTML = `<div class="card">Permisos guardados. Auditoría: ${res.audit.id}</div>`;
    }else{
      resultEl.innerHTML = `<div class="card">Error guardando permisos</div>`;
    }
  });
}

export default { init };
