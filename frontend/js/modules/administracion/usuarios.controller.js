import { listUsuarios, toggleUsuarioActivo, searchUsuarios } from '../../../js/api/usuarios.service.js';
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
  root.innerHTML = '<div class="card">Cargando usuarios...</div>';
  try{
    const roles = await listRoles();
    // parse filters from URL
    const params = new URLSearchParams(location.hash.split('?')[1] || '');
    const q = params.get('q') || '';
    const rol = params.get('rol') || '';
    const activo = params.has('activo') ? params.get('activo') : '';
    const page = parseInt(params.get('page') || '1',10) || 1;
    const size = parseInt(params.get('size') || '10',10) || 10;

    const canCreate = (session && session.user && session.user.roles && session.user.roles.includes('ADMIN')) || hasPermission(session,'usuarios.crear');

    const container = document.createElement('div');
    container.className = 'card';
    container.innerHTML = `
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px">
        <div style="font-weight:600">Usuarios</div>
        ${canCreate? '<div><a href="#/administracion/usuario-formulario?'+params.toString()+'">Nuevo usuario</a></div>':''}
      </div>
      <div style="display:flex;gap:8px;margin-bottom:8px;align-items:center">
        <input id="filter-q" placeholder="Buscar por nombre o identificador" style="flex:1;padding:6px" value="${q}">
        <select id="filter-rol"><option value="">Todos los roles</option>${roles.map(r=>`<option value="${r.id}" ${r.id===rol? 'selected':''}>${r.nombre}</option>`).join('')}</select>
        <select id="filter-activo"><option value="">Todos</option><option value="true" ${activo==='true' ? 'selected':''}>Activo</option><option value="false" ${activo==='false' ? 'selected':''}>Inactivo</option></select>
        <button id="filter-search">Buscar</button>
        <button id="filter-clear">Limpiar</button>
      </div>
      <div id="users-list">Cargando...</div>
      <div id="users-pager" style="margin-top:8px"></div>
    `;

    root.innerHTML = '';
    root.appendChild(container);

    async function load(pageToLoad = page){
      const fq = document.getElementById('filter-q').value;
      const frol = document.getElementById('filter-rol').value;
      const fact = document.getElementById('filter-activo').value;
      const res = await searchUsuarios({ q: fq, rol: frol, activo: fact === '' ? null : fact, page: pageToLoad, size });
      const listEl = document.getElementById('users-list');
      if(!res || !res.items || res.items.length === 0){ listEl.innerHTML = '<div>No se encontraron usuarios con los criterios seleccionados</div>'; document.getElementById('users-pager').innerHTML=''; return }
      const rowsHtml = res.items.map(u=>`<div style="display:flex;justify-content:space-between;padding:6px 0;border-bottom:1px solid #eee"><div><strong>${u.nombre}</strong><div style="font-size:12px;color:#666">${u.ident} — ${u.rol}</div></div><div><a href="#/administracion/usuario-detalle?id=${u.id}&${new URLSearchParams({q:fq,rol:frol,activo:fact,page:pageToLoad,size}).toString()}">Ver</a> | <a href="#/administracion/usuario-formulario?id=${u.id}&${new URLSearchParams({q:fq,rol:frol,activo:fact,page:pageToLoad,size}).toString()}">Editar</a> | <button data-id="${u.id}" class="toggle-usr">${u.activo? 'Desactivar':'Activar'}</button></div></div>`).join('');
      listEl.innerHTML = rowsHtml;

      // pagination
      const pager = document.getElementById('users-pager');
      const total = res.total; const per = res.size; const current = res.page;
      const totalPages = Math.ceil(total / per) || 1;
      let pagerHtml = `<div style="display:flex;gap:6px;align-items:center">`;
      if(current > 1) pagerHtml += `<button data-page="${current-1}" class="pager-btn">Anterior</button>`;
      pagerHtml += `<span> Página ${current} de ${totalPages} — ${total} resultados </span>`;
      if(current < totalPages) pagerHtml += `<button data-page="${current+1}" class="pager-btn">Siguiente</button>`;
      pagerHtml += `</div>`;
      pager.innerHTML = pagerHtml;

      // attach toggle handlers
      listEl.querySelectorAll('.toggle-usr').forEach(btn=> btn.addEventListener('click', async (e)=>{
        const id = e.target.getAttribute('data-id');
        e.target.disabled = true; e.target.textContent = 'Procesando...';
        await toggleUsuarioActivo(id, false);
        await load(current);
      }));

      // attach pager
      pager.querySelectorAll('.pager-btn').forEach(b=> b.addEventListener('click', (e)=>{
        const p = parseInt(e.target.getAttribute('data-page'),10);
        updateUrlAndLoad(p);
      }));
    }

    function updateUrlAndLoad(p){
      const fq = document.getElementById('filter-q').value;
      const frol = document.getElementById('filter-rol').value;
      const fact = document.getElementById('filter-activo').value;
      const sp = new URLSearchParams({ q: fq, rol: frol, activo: fact, page: p, size });
      location.hash = '#/administracion/usuarios?' + sp.toString();
      load(p);
    }

    document.getElementById('filter-search').addEventListener('click', ()=> updateUrlAndLoad(1));
    document.getElementById('filter-clear').addEventListener('click', ()=>{
      document.getElementById('filter-q').value=''; document.getElementById('filter-rol').value=''; document.getElementById('filter-activo').value=''; updateUrlAndLoad(1);
    });

    // initial load
    load(page);

  }catch(e){ root.innerHTML = '<div class="card">Error cargando usuarios</div>' }
}

export default { init };
