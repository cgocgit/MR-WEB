import { listDocumentos } from '../../../js/api/documentacion.service.js';
import { getSession } from '../../../js/shared/auth-guard.js';
import { hasPermission } from '../../../js/shared/permissions.js';

export async function init(containerId){
  const root = document.getElementById(containerId);
  if(!root) return;
  const session = getSession();
  if(!hasPermission(session,'administracion.consultar') && !(session && session.user && session.user.roles.includes('ADMIN'))){
    root.innerHTML = '<div class="card">Acceso denegado</div>'; return;
  }
  root.innerHTML = '<div class="card">Cargando documentos...</div>';
  const docs = await listDocumentos();
  const el = document.createElement('div'); el.className='card';
  el.innerHTML = `<div style="font-weight:600;margin-bottom:8px">Documentación técnica</div>${docs.map(d=>`<div style="padding:6px 0;border-bottom:1px solid #eee"><a href="${d.url}">${d.nombre}</a> — ${d.version} — ${d.fecha}</div>`).join('')}`;
  root.innerHTML = ''; root.appendChild(el);
}

export default { init };
