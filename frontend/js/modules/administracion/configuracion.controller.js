import { listReglas } from '../../../js/api/configuracion.service.js';
import { getSession } from '../../../js/shared/auth-guard.js';
import { hasPermission } from '../../../js/shared/permissions.js';

export async function init(containerId){
  const root = document.getElementById(containerId);
  if(!root) return;
  const session = getSession();
  if(!hasPermission(session,'administracion.consultar') && !(session && session.user && session.user.roles.includes('ADMIN'))){
    root.innerHTML = '<div class="card">Acceso denegado</div>'; return;
  }
  root.innerHTML = '<div class="card">Cargando configuración...</div>';
  const regs = await listReglas();
  const el = document.createElement('div'); el.className='card';
  el.innerHTML = `<div style="font-weight:600;margin-bottom:8px">Reglas configurables</div>${regs.map(r=>`<div style="padding:6px 0;border-bottom:1px solid #eee"><strong>${r.nombre}</strong><div style="font-size:13px;color:#666">${r.valor}</div></div>`).join('')}`;
  root.innerHTML = ''; root.appendChild(el);
}

export default { init };
