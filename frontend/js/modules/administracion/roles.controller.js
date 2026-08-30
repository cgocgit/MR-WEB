import { listRoles } from '../../../js/api/roles.service.js';
import { searchUsuarios } from '../../../js/api/usuarios.service.js';
import { getSession } from '../../../js/shared/auth-guard.js';
import { hasPermission } from '../../../js/shared/permissions.js';

export async function init(containerId) {
  const root = document.getElementById(containerId);

  if (!root) {
    return;
  }

  const session = getSession();

  const autorizado =
    hasPermission(session, 'administracion.consultar') ||
    session?.user?.roles?.includes('ADMIN');


  if (!autorizado) {
    root.innerHTML = '<div class="card">Acceso denegado</div>';
    return;
  }

  if (containerId === 'admin-permissions-root') {
    await renderPermisosPorRol(root);
    return;
  }

  await renderCatalogoRoles(root); 
}

async function renderPermisosPorRol(root) {
  root.innerHTML =
    '<div class="card">Cargando permisos...</div>';

  try {
    const query =
      location.hash.split('?')[1] || '';

    const params =
      new URLSearchParams(query);

    const rolId =
      params.get('rol');

    if (!rolId) {
      mostrarRolNoDisponible(root);
      return;
    }

    const rol =
      await getRole(rolId);

    if (!rol) {
      mostrarRolNoDisponible(root);
      return;
    }

    const permisos =
      await detallePermisosPorRol(rolId);

    renderDetalleRol(
      root,
      rol,
      permisos
    );

  } catch (error) {
    console.error(
      'Error consultando permisos:',
      error
    );

    root.innerHTML = `
      <div class="card">
        <p>
          No fue posible consultar los permisos.
          Intente nuevamente.
        </p>

        <a href="#/administracion/roles">
          Volver a roles
        </a>
      </div>
    `;
  }
}

async function renderCatalogoRoles(root) {

    root.innerHTML = '<div class="card">Cargando roles...</div>';

  try {
    const roles = await listRoles();

    if (!roles || roles.length === 0) {
      root.innerHTML =
        '<div class="card">No hay roles configurados.</div>';
      return;
    }

    // Obtener la cantidad de usuarios asociados a cada rol
    // utilizando el mismo Mock empleado por la consulta de usuarios.
    const rolesConUsuarios = await Promise.all(
      roles.map(async rol => {
        const resultado = await searchUsuarios({
          rol: rol.id,
          page: 1,
          size: 1
        });

        return {
          ...rol,
          usuariosAsociados: resultado?.total ?? 0
        };
      })
    );

    const card = document.createElement('div');
    card.className = 'card';

    card.innerHTML = `
      <div style="font-weight:600;margin-bottom:12px">
        Roles
      </div>

      <table style="width:100%;border-collapse:collapse">
        <thead>
          <tr>
            <th style="text-align:left;padding:8px;border-bottom:1px solid #eee">
              Código
            </th>
            <th style="text-align:left;padding:8px;border-bottom:1px solid #eee">
              Nombre
            </th>
            <th style="text-align:left;padding:8px;border-bottom:1px solid #eee">
              Descripción
            </th>
            <th style="text-align:center;padding:8px;border-bottom:1px solid #eee">
              Usuarios asociados
            </th>
            <th style="text-align:left;padding:8px;border-bottom:1px solid #eee">
              Acción
            </th>
          </tr>
        </thead>

        <tbody>
          ${rolesConUsuarios.map(rol => `
            <tr>
              <td style="padding:8px;border-bottom:1px solid #eee">
                <strong>${rol.id}</strong>
              </td>

              <td style="padding:8px;border-bottom:1px solid #eee">
                ${rol.nombre}
              </td>

              <td style="padding:8px;border-bottom:1px solid #eee">
                ${rol.desc || ''}
              </td>

              <td
                style="
                  padding:8px;
                  text-align:center;
                  border-bottom:1px solid #eee
                "
              >
                ${rol.usuariosAsociados}
              </td>

              <td style="padding:8px;border-bottom:1px solid #eee">
                <a href="#/administracion/permisos?rol=${encodeURIComponent(rol.id)}">
                  Ver permisos
                </a>
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;

    root.innerHTML = '';
    root.appendChild(card);

  } catch (error) {
    console.error('Error al consultar el catálogo de roles:', error);

    root.innerHTML =
      '<div class="card">No fue posible consultar los roles. Intente nuevamente.</div>';
  }
}

function agruparPermisos(permisos) {
  return permisos.reduce(
    (grupos, permiso) => {

      if (!grupos[permiso.modulo]) {
        grupos[permiso.modulo] = [];
      }

      grupos[permiso.modulo]
        .push(permiso);

      return grupos;

    },
    {}
  );
}

function renderDetalleRol(
  root,
  rol,
  permisos
) {

  if (!permisos.length) {
    root.innerHTML = `
      <div class="card">

        <h2>${rol.nombre}</h2>

        <p>${rol.desc || ''}</p>

        <p>
          El rol no tiene permisos configurados.
        </p>

        <a href="#/administracion/roles">
          Volver a roles
        </a>

      </div>
    `;

    return;
  }

  const grupos =
    agruparPermisos(permisos);

  root.innerHTML = `
    <div class="card">

      <header style="margin-bottom:20px">

        <h2>${rol.nombre}</h2>

        <p>
          <strong>Código:</strong>
          ${rol.id}
        </p>

        <p>
          ${rol.desc || ''}
        </p>

        <p class="text-muted">
          Los permisos se muestran en modo
          consulta mientras no se encuentre
          disponible el servicio backend.
        </p>

      </header>

      ${Object.entries(grupos)
        .map(([modulo, items]) => `

          <section style="margin-bottom:24px">

            <h3>${modulo}</h3>

            <table
              style="
                width:100%;
                border-collapse:collapse
              "
            >

              <thead>
                <tr>
                  <th>Permiso</th>
                  <th>Acción / nivel</th>
                  <th>Alcance</th>
                  <th>Estado</th>
                </tr>
              </thead>

              <tbody>

                ${items.map(item => `

                  <tr>

                    <td>
                      ${item.codigo}
                    </td>

                    <td>
                      ${item.accion}
                    </td>

                    <td>
                      ${item.alcance}
                    </td>

                    <td>
                      ${item.estado}
                    </td>

                  </tr>

                `).join('')}

              </tbody>

            </table>

          </section>

        `).join('')}

      <a href="#/administracion/roles">
        Volver a roles
      </a>

    </div>
  `;
}

export default {
  init
};