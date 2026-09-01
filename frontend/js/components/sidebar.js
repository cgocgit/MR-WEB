import {
  hasPermission
} from '../shared/permissions.js';

const MOBILE_LAYOUT_QUERY =
  '(max-width: 900px), ' +
  '(hover: none) and (pointer: coarse)';

function isMobileLayout() {
  return window.matchMedia(
    MOBILE_LAYOUT_QUERY
  ).matches;
}

function closeSidebar() {
  const root =
    document.documentElement;

  if (isMobileLayout()) {
    root.classList.remove(
      'sidebar-open'
    );
  } else {
    root.classList.add(
      'sidebar-collapsed'
    );
  }

  const toggle =
    document.getElementById(
      'sidebarToggle'
    );

  if (toggle) {
    toggle.setAttribute(
      'aria-expanded',
      'false'
    );

    toggle.setAttribute(
      'aria-label',
      'Abrir menú de navegación'
    );
  }

  window.dispatchEvent(
    new Event('sidebar:changed')
  );
}

export function renderSidebar(container, session){
  const hasSession = session && session.user;
  
  // Hide sidebar when there is no authenticated session
  if(!hasSession){ container.style.display = 'none'; container.innerHTML = ''; return }
  container.style.display = '';

  // Define menu items by capability; only include those allowed by roles
  const allItems = [
  {
    key: 'dashboard',
    href: '#/dashboard',
    label: 'Panel',
    permission: 'dashboard.consultar'
  },
  {
    key: 'clientes',
    href: '#/clientes',
    label: 'Clientes y prospectos',
    permission: 'clientes.consultar'
  },
  {
    key: 'catalogo',
    href: '#/catalogo',
    label: 'Catálogo',
    permission: 'catalogo.consultar'
  },
  {
    key: 'inventario',
    href: '#/inventario',
    label: 'Inventario',
    permission: 'inventario.consultar'
  },
  {
    key: 'cotizaciones',
    href: '#/cotizaciones',
    label: 'Cotizaciones',
    permission: 'cotizaciones.consultar'
  },
  {
    key: 'ordenes',
    href: '#/ordenes',
    label: 'Órdenes',
    permission: 'ordenes.consultar'
  },
  {
    key: 'logistica',
    href: '#/logistica',
    label: 'Logística',
    permission: 'logistica.consultar'
  },
  {
    key: 'pagos',
    href: '#/pagos',
    label: 'Pagos',
    permission: 'pagos.consultar'
  },
  {
    key: 'reportes',
    href: '#/reportes',
    label: 'Reportes',
    permission: 'reportes.consultar'
  },
  {
    key: 'administracion',
    href: '#/administracion',
    label: 'Administración',
    permission: 'administracion.consultar'
  }
];

  const items = allItems.filter(
    item =>
      hasPermission(
        session,
        item.permission
      )
  );

  container.innerHTML = `
    <div class="sidebar-shell">
      <div class="sidebar-header">
        <button
          id="sidebarCollapse"
          class="sidebar-collapse"
          type="button"
          aria-label="Cerrar menú"
          title="Cerrar menú"
        >
          <span
            class="desktop-sidebar-icon"
            aria-hidden="true"
          >
            «
          </span>

          <span
            class="mobile-sidebar-icon"
            aria-hidden="true"
          >
            ×
          </span>
        </button>
      </div>

      <ul
        class="sidebar-menu"
        aria-label="Opciones principales"
      ></ul>
    </div>
  `;

  const ul = container.querySelector('ul');
  items.forEach(it=>{
    const li = document.createElement('li');
    // Render Administration with a sub-menu for its internal pages
    if(it.key === 'administracion'){
      const wrapper = document.createElement('div');
      wrapper.className = 'sidebar-admin-group';
      const a = document.createElement('a');
      a.href = it.href;
      a.textContent = it.label;
      a.setAttribute('tabindex','0');
      a.setAttribute('role','link');
      a.setAttribute('aria-label', it.label);
      wrapper.appendChild(a);
      const sub = document.createElement('ul');
      sub.className = 'sidebar-submenu';
      const adminItems = [
        {
          href: '#/administracion/usuarios',
          label: 'Usuarios',
          permission: 'usuarios.consultar'
        },
        {
          href: '#/administracion/roles',
          label: 'Roles',
          permission: 'roles.consultar'
        },
        {
          href: '#/administracion/permisos',
          label: 'Permisos',
          permission: 'permisos.consultar'
        },
        {
          href: '#/administracion/matriz-acceso',
          label: 'Matriz de acceso',
          permission: 'matriz.consultar'
        },
        {
          href: '#/administracion/bitacora',
          label: 'Bitácora',
          permission: 'auditoria.consultar'
        },
        {
          href: '#/administracion/configuracion',
          label: 'Configuración',
          permission: 'configuracion.consultar'
        },
        {
          href: '#/administracion/intercambio-csv',
          label: 'Intercambio CSV',
          permission: 'intercambio.validar'
        },
        {
          href: '#/administracion/documentacion-tecnica',
          label: 'Documentación técnica',
          permission: 'documentacion.tecnica.consultar'
        }
      ];

      sub.innerHTML = adminItems
        .filter(item =>
          hasPermission(
            session,
            item.permission
          )
        )
        .map(item => `
          <li>
            <a href="${item.href}">
              ${item.label}
            </a>
          </li>
        `)
        .join('');
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
    collapse.addEventListener(
      'click',
      () => {
        closeSidebar();

        const main =
          document.querySelector(
            'main#content'
          );

        if (
          main &&
          !isMobileLayout()
        ) {
          main.focus();
        }
      }
    );
  }

  // auto-collapse on small screens when a link is clicked
  ul.addEventListener('click', (e)=>{
    const a = e.target && (e.target.closest && e.target.closest('a')) || null;
    if(!a) return;
    if (isMobileLayout()) {
      document.documentElement
        .classList
        .remove('sidebar-open');

      const toggle =
        document.getElementById(
          'sidebarToggle'
        );

      if (toggle) {
        toggle.setAttribute(
          'aria-expanded',
          'false'
        );

        toggle.setAttribute(
          'aria-label',
          'Abrir menú de navegación'
        );
      }
    }
    // notify layout to adjust main content
    window.dispatchEvent(new Event('sidebar:changed'));
  });
}
