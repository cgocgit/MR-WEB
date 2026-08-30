import { getUsuario, changeUserRole, getRoleHistory } from '../../../js/api/usuarios.service.js';
import { getSession } from '../../../js/shared/auth-guard.js';
import { hasPermission } from '../../../js/shared/permissions.js';
import { listRoles } from '../../../js/api/roles.service.js';
import { permisosPorRol } from '../../../js/api/permisos.service.js';
import { openModal } from '../../../js/components/modal.js';
import { showNotification } from '../../../js/components/notification.js';
import { validateRequired } from '../../../js/shared/form-validation.js';
import { showLoader, hideLoader } from '../../../js/components/loader.js';

export async function init(containerId){
  const root = document.getElementById(containerId);
  if(!root) return;
  const session = getSession();
  if(!hasPermission(session,'administracion.consultar') && !(session && session.user && session.user.roles.includes('ADMIN'))){
    root.innerHTML = '<div class="card">Acceso denegado</div>'; return;
  }
  const params = new URLSearchParams(location.hash.split('?')[1] || '');
  const id = params.get('id');
  if(!id){ root.innerHTML = '<div class="card">Usuario no especificado</div>'; return }
  root.innerHTML = '<div class="card">Cargando detalle...</div>';
  const u = await getUsuario(id);
  root.innerHTML = `<div class="card"><h3>${u.nombre}</h3>
    <div>Identificador: ${u.ident}</div>
    <div>Rol: <strong id="current-role">${u.rol}</strong></div>
    <div>Activo: ${u.activo}</div>
    <div>Creado: ${u.creado}</div>
    <div>Último acceso: ${u.ultimo}</div>
    <div style="margin-top:8px"><a href="#/administracion/usuario-formulario?id=${u.id}">Editar</a> • <button id="change-role-btn">Cambiar rol</button></div>
    <div style="margin-top:8px" id="role-history"></div>
  </div>`;
  // load history
  const hist = await getRoleHistory(u.id);
  const histEl = document.getElementById('role-history');
  if(hist && hist.length){ histEl.innerHTML = '<div style="font-weight:600;margin-top:8px">Historial de roles</div>' + hist.map(h=>`<div style="padding:6px 0;border-bottom:1px solid #eee">${h.fecha} — ${h.administrador} — ${h.rolAnterior} → ${h.rolNuevo} — ${h.motivo}</div>`).join('') }

  // change role flow
  const changeBtn = document.getElementById('change-role-btn');
  changeBtn.addEventListener('click', async ()=>{
    // authorization check
    if(!hasPermission(getSession(),'usuarios.rol.asignar')){ showNotification('No autorizado para asignar roles', {type:'info'}); return }
    const roles = await listRoles();
    const selectHtml = `<select id="new-role">${roles.map(r=>`<option value="${r.id||r.nombre}" ${u.rol===(r.id||r.nombre)?'selected':''}>${r.nombre||r.id}</option>`).join('')}</select>`;
    const body = `<div>Usuario: <strong>${u.ident}</strong></div><div style="margin-top:8px">Rol actual: <strong>${u.rol}</strong></div><div style="margin-top:8px">Nuevo rol: ${selectHtml}</div><div style="margin-top:8px">Motivo: <textarea id="role-reason" rows="3" style="width:100%"></textarea></div>`;
    // Single confirmation modal: reads selection and reason once
    const modal = await openModal({title:'Cambiar rol', body, confirmText:'Confirmar cambio', cancelText:'Cancelar', danger:true});
    if(!modal.confirmed) return;
    // Prefer values returned by modal; fallback to DOM lookup
    const chosen = (modal.values && (modal.values['new-role'] || modal.values['new_role'])) || (document.getElementById('new-role') && document.getElementById('new-role').value);
    const reason = (modal.values && (modal.values['role-reason'] || modal.values['role_reason'] || modal.values['roleReason'])) || (document.getElementById('role-reason') && document.getElementById('role-reason').value);
    if(!reason || String(reason).trim()===''){ showNotification('Motivo es obligatorio', {type:'info'}); return }
    // perform change with loader and concurrency support
    try{
      showLoader(); changeBtn.disabled = true;
      const observedVersion = u.version || 'v1';
      const res = await changeUserRole(u.id, chosen, reason, observedVersion);
      if(res && res.success){
        showNotification('Rol actualizado', {type:'info'});
        // show audit id and session invalidation info
        if(res.audit && res.audit.id) showNotification('Audit ID: ' + res.audit.id, {type:'info'});
        if(res.sessionsInvalidated) showNotification('Las sesiones anteriores fueron invalidadas', {type:'info'});
        // reload detail
        location.reload();
      } else if(res && res.error==='same_role'){
        showNotification('El usuario ya tiene ese rol', {type:'info'});
      } else if(res && res.error==='last_admin'){
        showNotification('Operación inválida: no es posible retirar el último Administrador activo', {type:'info'});
      } else if(res && res.error==='conflict'){
        showNotification('Conflicto: el usuario fue modificado por otra sesión. Recargando datos...', {type:'info'});
        location.reload();
      } else {
        showNotification('Error actualizando rol', {type:'info'});
      }
    }finally{ hideLoader(); changeBtn.disabled = false }
  });
}

export default { init };
