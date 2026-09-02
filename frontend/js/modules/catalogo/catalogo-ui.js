import { getSession } from '../../shared/auth-guard.js';
import { hasPermission } from '../../shared/permissions.js';
import { PERMISOS_CATALOGO } from '../../api/catalogo.constants.js';

export function renderNavegacionCatalogo() {
  const contenedor = document.querySelector('.catalogo-container');

  if (!contenedor) return;

  if (contenedor.querySelector('.catalogo-module-nav')) {
    return;
  }

  const session = getSession();
  const hash = location.hash.split('?')[0];

  const opciones = [
    {
      texto: 'Productos',
      ruta: '#/catalogo/productos',
      activo:
        hash === '#/catalogo' ||
        hash.startsWith('#/catalogo/productos')
    },
    {
      texto: 'Servicios',
      ruta: '#/catalogo/servicios',
      activo: hash.startsWith('#/catalogo/servicios')
    },
    {
      texto: 'Paquetes',
      ruta: '#/catalogo/paquetes',
      activo: hash.startsWith('#/catalogo/paquetes')
    },
    {
      texto: 'Precios',
      ruta: '#/catalogo/precios',
      activo: hash.startsWith('#/catalogo/precios')
    }
  ];

  if (
    hasPermission(
      session,
      PERMISOS_CATALOGO.AUXILIARES_GESTIONAR
    )
  ) {
    opciones.push({
      texto: 'Configuración',
      ruta: '#/catalogo/configuracion',
      activo: hash.startsWith('#/catalogo/configuracion')
    });
  }

  const nav = document.createElement('nav');

  nav.className = 'catalogo-tabs catalogo-module-nav';
  nav.setAttribute(
    'aria-label',
    'Navegación del catálogo'
  );

  nav.innerHTML = opciones
    .map(opcion => `
      <a
        href="${opcion.ruta}"
        ${opcion.activo ? 'aria-current="page"' : ''}
      >
        ${opcion.texto}
      </a>
    `)
    .join('');

  const encabezado =
    contenedor.querySelector('.catalogo-header');

  if (encabezado) {
    encabezado.insertAdjacentElement(
      'afterend',
      nav
    );
  } else {
    contenedor.prepend(nav);
  }
}