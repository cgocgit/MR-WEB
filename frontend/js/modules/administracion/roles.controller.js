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
    (
      session &&
      session.user &&
      session.user.roles &&
      session.user.roles.includes('ADMIN')
    );

  if (!autorizado) {
    root.innerHTML = '<div class="card">Acceso denegado</div>';
    return;
  }

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

export default {
  init
};