import { validarArchivo, procesarImportacion, exportar } from '../../../js/api/intercambio.service.js';
import { getSession } from '../../../js/shared/auth-guard.js';
import { hasPermission } from '../../../js/shared/permissions.js';

export async function init(containerId){
  const root = document.getElementById(containerId);
  if(!root) return;
  const session = getSession();
  if(!hasPermission(session,'administracion.consultar') && !(session && session.user && session.user.roles.includes('ADMIN'))){
    root.innerHTML = '<div class="card">Acceso denegado</div>'; return;
  }
  root.innerHTML = `<div class="card"><div style="font-weight:600;margin-bottom:8px">Intercambio CSV</div>
    <div><label>Tipo: <select id="csv-type"><option value="usuarios">Usuarios</option><option value="roles">Roles</option></select></label></div>
    <div style="margin-top:8px"><input type="file" id="csv-file"></div>
    <div style="margin-top:8px"><button id="validate">Validar</button> <button id="import">Importar</button> <button id="export">Exportar</button></div>
    <div id="csv-result" style="margin-top:8px"></div>
  </div>`;
  root.querySelector('#validate').addEventListener('click', async ()=>{
    const t = root.querySelector('#csv-type').value;
    const r = await validarArchivo({tipo:t});
    root.querySelector('#csv-result').textContent = JSON.stringify(r);
  });
  root.querySelector('#import').addEventListener('click', async ()=>{
    const r = await procesarImportacion(null);
    root.querySelector('#csv-result').textContent = JSON.stringify(r);
  });
  root.querySelector('#export').addEventListener('click', async ()=>{
    const t = root.querySelector('#csv-type').value;
    const r = await exportar(t);
    root.querySelector('#csv-result').innerHTML = `<a href="${r.url}">Descargar</a>`;
  });
}

export default { init };
