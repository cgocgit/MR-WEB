import { listEventos } from '../../../js/api/auditoria.service.js';
import { getSession } from '../../../js/shared/auth-guard.js';
import { hasPermission } from '../../../js/shared/permissions.js';

export async function init(containerId){
  const root = document.getElementById(containerId);
  if(!root) return;
  const session = getSession();
  if(!hasPermission(session,'administracion.consultar') && !(session && session.user && session.user.roles.includes('ADMIN'))){
    root.innerHTML = '<div class="card">Acceso denegado</div>'; return;
  }
  root.innerHTML = '<div class="card">Cargando bitácora...</div>';
  const evs = await listEventos();
  const el = document.createElement('div'); el.className='card';
  el.innerHTML = `<div style="font-weight:600;margin-bottom:8px">Bitácora</div>${evs.map(e=>`<div style="padding:6px 0;border-bottom:1px solid #eee"><div style="font-weight:600">${e.fecha} — ${e.usuario}</div><div style="font-size:13px">${e.modulo} • ${e.accion} • ref:${e.registro}</div></div>` ).join('')}`;
  root.innerHTML = ''; root.appendChild(el);
}

export default { init };
