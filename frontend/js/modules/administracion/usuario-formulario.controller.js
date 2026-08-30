import { getUsuario, createUsuario, updateUsuario } from '../../../js/api/usuarios.service.js';
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
  // parse id from query
  const params = new URLSearchParams(location.hash.split('?')[1] || '');
  const id = params.get('id');
  root.innerHTML = '<div class="card">Cargando formulario...</div>';
  const roles = await listRoles();
  if(id){
    const u = await getUsuario(id);
    root.innerHTML = `<div class="card"><div style="margin-bottom:8px"><strong>Editar usuario</strong></div>
      <div>Nombre: <input id="u-name" value="${u.nombre || ''}"><div id="err-u-name" style="color:#c33;font-size:12px;margin-top:4px"></div></div>
      <div>Identificador: <input id="u-ident" value="${u.ident || ''}"><div id="err-u-ident" style="color:#c33;font-size:12px;margin-top:4px"></div></div>
      <div>Rol: <select id="u-role">${roles.map(r=>`<option value="${r.id||r.nombre}" ${u.rol===(r.id||r.nombre)?'selected':''}>${r.nombre||r.id}</option>`).join('')}</select><div id="err-u-role" style="color:#c33;font-size:12px;margin-top:4px"></div></div>
      <div>Estado: <select id="u-activo"><option value="true" ${u.activo? 'selected':''}>Activo</option><option value="false" ${!u.activo? 'selected':''}>Inactivo</option></select><div id="err-u-activo" style="color:#c33;font-size:12px;margin-top:4px"></div></div>
      <div style="margin-top:8px"><div id="role-preview">Vista previa disponible al seleccionar rol</div></div>
      <div style="margin-top:8px"><button id="u-save">Guardar</button></div>
    </div>`;
    const roleSelect = root.querySelector('#u-role');
    async function refreshPreview(){ const rp = await permisosPorRol(roleSelect.value); root.querySelector('#role-preview').innerHTML = `<div style="font-size:13px;color:#333"><strong>Permisos:</strong><ul>${rp.map(p=>`<li>${p}</li>`).join('')}</ul></div>` }
    roleSelect.addEventListener('change', refreshPreview);
    await refreshPreview();
    root.querySelector('#u-save').addEventListener('click', async ()=>{
      // clear previous errors
      ['err-u-name','err-u-ident','err-u-role','err-u-activo'].forEach(id=>{ const el=root.querySelector('#'+id); if(el) el.innerText=''; });
      const payload = { nombre: root.querySelector('#u-name').value, ident: root.querySelector('#u-ident').value, rol: root.querySelector('#u-role').value, activo: String(root.querySelector('#u-activo').value) === 'true' };
      // client validations
      const clientErrors = {};
      if(!payload.nombre || String(payload.nombre).trim()==='') clientErrors.nombre = 'El nombre es obligatorio';
      if(!payload.ident || String(payload.ident).trim()==='') clientErrors.ident = 'El identificador es obligatorio';
      if(!payload.rol || String(payload.rol).trim()==='') clientErrors.rol = 'Seleccione un rol';
      if(typeof payload.activo === 'undefined') clientErrors.activo = 'Seleccione estado activo/inactivo';
      if(Object.keys(clientErrors).length){ Object.entries(clientErrors).forEach(([k,v])=>{ const el = root.querySelector('#err-u-'+k.replace('activo','activo')); if(el) el.innerText = v }); return }
      // role mandatory on active accounts per spec
      if(!payload.rol || String(payload.rol).trim()===''){ showNotification('Seleccione un rol', {type:'info'}); return }
      const preview = await permisosPorRol(payload.rol);
      const body = `<div>Se actualizará el usuario <strong>${payload.ident}</strong> con rol <strong>${payload.rol}</strong>.</div><div style="margin-top:8px"><strong>Permisos asignados:</strong><ul>${preview.map(p=>`<li>${p}</li>`).join('')}</ul></div>`;
      const resp = await openModal({title:'Confirmar actualización', body, confirmText:'Sí, actualizar'});
      if(!resp.confirmed) return;
      try{ showLoader(); const res = await updateUsuario(id,payload); showNotification('Usuario actualizado', {type:'info'}); if(res && res.audit && res.audit.id) showNotification('Audit ID: ' + res.audit.id, {type:'info'}); location.hash = '#/administracion/usuarios'; }
      finally{ hideLoader() }
    });
  } else {
    root.innerHTML = `<div class="card"><div style="margin-bottom:8px"><strong>Nuevo usuario</strong></div>
      <div>Nombre: <input id="u-name" value=""><div id="err-u-name" style="color:#c33;font-size:12px;margin-top:4px"></div></div>
      <div>Identificador: <input id="u-ident" value=""><div id="err-u-ident" style="color:#c33;font-size:12px;margin-top:4px"></div></div>
      <div>Rol: <select id="u-role">${roles.map(r=>`<option value="${r.id||r.nombre}">${r.nombre||r.id}</option>`).join('')}</select><div id="err-u-role" style="color:#c33;font-size:12px;margin-top:4px"></div></div>
      <div>Estado: <select id="u-activo"><option value="true" selected>Activo</option><option value="false">Inactivo</option></select><div id="err-u-activo" style="color:#c33;font-size:12px;margin-top:4px"></div></div>
      <div style="margin-top:8px"><div id="role-preview">Seleccione un rol para ver permisos</div></div>
      <div style="margin-top:8px"><button id="u-create">Crear</button></div>
    </div>`;
    const roleSelect = root.querySelector('#u-role');
    roleSelect.addEventListener('change', async ()=>{ const rp = await permisosPorRol(roleSelect.value); root.querySelector('#role-preview').innerHTML = `<div style="font-size:13px;color:#333"><strong>Permisos:</strong><ul>${rp.map(p=>`<li>${p}</li>`).join('')}</ul></div>` });
    // initial preview
    (async ()=>{ const rp = await permisosPorRol(roleSelect.value); root.querySelector('#role-preview').innerHTML = `<div style="font-size:13px;color:#333"><strong>Permisos:</strong><ul>${rp.map(p=>`<li>${p}</li>`).join('')}</ul></div>` })();
    root.querySelector('#u-create').addEventListener('click', async ()=>{
      // clear previous errors
      ['err-u-name','err-u-ident','err-u-role','err-u-activo'].forEach(id=>{ const el=root.querySelector('#'+id); if(el) el.innerText=''; });
      const payload = { nombre: root.querySelector('#u-name').value, ident: root.querySelector('#u-ident').value, rol: root.querySelector('#u-role').value, activo: String(root.querySelector('#u-activo').value) === 'true' };
      // client validations
      const clientErrors = {};
      if(!payload.nombre || String(payload.nombre).trim()==='') clientErrors.nombre = 'El nombre es obligatorio';
      if(!payload.ident || String(payload.ident).trim()==='') clientErrors.ident = 'El identificador es obligatorio';
      if(!payload.rol || String(payload.rol).trim()==='') clientErrors.rol = 'Seleccione un rol';
      if(typeof payload.activo === 'undefined') clientErrors.activo = 'Seleccione estado activo/inactivo';
      if(Object.keys(clientErrors).length){ Object.entries(clientErrors).forEach(([k,v])=>{ const el = root.querySelector('#err-u-'+k.replace('activo','activo')); if(el) el.innerText = v }); return }
      const preview = await permisosPorRol(payload.rol);
      const body = `<div>Se creará el usuario <strong>${payload.ident}</strong> con rol <strong>${payload.rol}</strong>.</div><div style="margin-top:8px"><strong>Permisos asignados:</strong><ul>${preview.map(p=>`<li>${p}</li>`).join('')}</ul></div>`;
      const resp = await openModal({title:'Confirmar creación', body, confirmText:'Crear usuario'});
      if(!resp.confirmed) return;
      try{
        showLoader(); const res = await createUsuario(payload);
        if(res && res.success){ showNotification('Usuario creado', {type:'info'}); if(res && res.audit && res.audit.id) showNotification('Audit ID: ' + res.audit.id, {type:'info'}); location.hash = '#/administracion/usuarios'; }
        else if(res && res.status === 422){ // field errors
          Object.entries(res.errors||{}).forEach(([k,v])=>{ const el = root.querySelector('#err-u-'+k); if(el) el.innerText = v });
          showNotification('Errores de validación, corrija los campos', {type:'info'});
        } else if(res && res.status === 409){ showNotification(res.message || 'Identificador duplicado', {type:'info'}); }
        else { showNotification('Error creando usuario', {type:'info'}); }
      }finally{ hideLoader() }
    });
  }
}

export default { init };
