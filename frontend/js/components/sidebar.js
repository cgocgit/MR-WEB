export function renderSidebar(container, session){
  const hasSession = session && session.user;
  const roles = hasSession ? session.user.roles : [];
  // Hide sidebar when there is no authenticated session
  if(!hasSession){ container.style.display = 'none'; container.innerHTML = ''; return }
  container.style.display = '';

  // Define menu items by capability; only include those allowed by roles
  const allItems = [
    {key:'dashboard',href:'#/dashboard',label:'Panel',roles:['ADMIN','USER','TECH','SUPERVISOR','DIRECCION','INVENTARIO']},
    {key:'clientes',href:'#/clientes',label:'Clientes',roles:['ADMIN','USER','SUPERVISOR','ADMINISTRATIVO','DIRECCION']},
    {key:'catalogo',href:'#/catalogo',label:'Catálogo',roles:['ADMIN','USER','INVENTARIO','SUPERVISOR','ADMINISTRATIVO','DIRECCION']},
    {key:'inventario',href:'#/inventario',label:'Inventario',roles:['ADMIN','INVENTARIO','SUPERVISOR','USER','ADMINISTRATIVO','DIRECCION']},
    {key:'cotizaciones',href:'#/cotizaciones',label:'Cotizaciones',roles:['ADMIN','USER','SUPERVISOR','ADMINISTRATIVO','DIRECCION']},
    {key:'ordenes',href:'#/ordenes',label:'Órdenes',roles:['ADMIN','USER','SUPERVISOR','TECH','INVENTARIO','ADMINISTRATIVO','DIRECCION']},
    {key:'logistica',href:'#/logistica',label:'Logística',roles:['ADMIN','TECH','SUPERVISOR','USER','ADMINISTRATIVO','DIRECCION']},
    {key:'pagos',href:'#/pagos',label:'Pagos',roles:['ADMIN','USER','SUPERVISOR','ADMINISTRATIVO','DIRECCION']},
    {key:'reportes',href:'#/reportes',label:'Reportes',roles:['ADMIN','SUPERVISOR','INVENTARIO','ADMINISTRATIVO','DIRECCION']},
    {key:'administracion',href:'#/administracion',label:'Administración',roles:['ADMIN']}
  ];

  const items = allItems.filter(it => it.roles.some(r => roles.includes(r)));
  container.innerHTML = `<div class="container"><div style="display:flex;justify-content:flex-end;margin-bottom:8px"><button id="sidebarCollapse" aria-label="Ocultar menú" title="Ocultar menú" style="background:transparent;border:none;cursor:pointer">«</button></div><ul style="list-style:none;display:flex;flex-direction:column;gap:8px"></ul></div>`;
  const ul = container.querySelector('ul');
  items.forEach(it=>{
    const li = document.createElement('li');
    // Render Administration with a sub-menu for its internal pages
    if(it.key === 'administracion'){
      const wrapper = document.createElement('div');
      wrapper.style.display = 'flex';
      wrapper.style.flexDirection = 'column';
      const a = document.createElement('a');
      a.href = it.href;
      a.textContent = it.label;
      a.setAttribute('tabindex','0');
      a.setAttribute('role','link');
      a.setAttribute('aria-label', it.label);
      wrapper.appendChild(a);
      const sub = document.createElement('ul');
      sub.style.listStyle = 'none';
      sub.style.paddingLeft = '12px';
      sub.style.marginTop = '6px';
      sub.innerHTML = `
        <li><a href="#/administracion/usuarios">Usuarios</a></li>
        <li><a href="#/administracion/roles">Roles</a></li>
        <li><a href="#/administracion/permisos">Permisos</a></li>
      `;
      wrapper.appendChild(sub);
      li.appendChild(wrapper);
      ul.appendChild(li);
      return;
    }
    const a = document.createElement('a');
    a.href = it.href;
    a.textContent = it.label;
    a.setAttribute('tabindex','0');
    a.setAttribute('role','link');
    a.setAttribute('aria-label', it.label);
    li.appendChild(a);
    ul.appendChild(li);
  });
  // keyboard handler for Enter on anchors without focusable default
  ul.addEventListener('keydown', (e)=>{
    if(e.key === 'Enter' && e.target && e.target.getAttribute && e.target.getAttribute('role') === 'link'){
      e.target.click();
    }
  });

  // collapse button behaviour
  const collapse = container.querySelector('#sidebarCollapse');
  if(collapse){
    collapse.addEventListener('click', ()=>{
      document.documentElement.classList.add('sidebar-collapsed');
      // focus content so keyboard users can continue
      const main = document.querySelector('main#content'); if(main) main.focus();
      // notify layout to adjust main content
      window.dispatchEvent(new Event('sidebar:changed'));
    });
  }

  // auto-collapse on small screens when a link is clicked
  ul.addEventListener('click', (e)=>{
    const a = e.target && (e.target.closest && e.target.closest('a')) || null;
    if(!a) return;
    if(window.innerWidth <= 720) document.documentElement.classList.add('sidebar-collapsed');
    // notify layout to adjust main content
    window.dispatchEvent(new Event('sidebar:changed'));
  });
}
