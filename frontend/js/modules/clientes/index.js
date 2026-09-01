import {
  listClientesProspectos
} from '../../api/clientes.service.js';

import {
  getSession
} from '../../shared/auth-guard.js';

import {
  hasPermission
} from '../../shared/permissions.js';

import {
  getContactoPrincipal,
  getEstadoLabel,
  getTipoContactoLabel
} from './clientes.utils.js';

function createCell(
  value = '—'
) {
  const cell =
    document.createElement('td');

  cell.textContent =
    value || '—';

  return cell;
}

function createLink(
  text,
  href
) {
  const link =
    document.createElement('a');

  link.textContent = text;
  link.href = href;

  return link;
}

function createActions(
  registro,
  session
) {
  const container =
    document.createElement('div');

  container.style.display = 'flex';
  container.style.gap = '8px';

  /*
   * Consultar detalle.
   */
  container.appendChild(
    createLink(
      'Ver',
      `#/clientes/detalle?id=${encodeURIComponent(
        registro.id
      )}`
    )
  );

  /*
   * Modificar únicamente cuando exista
   * el permiso efectivo.
   */
  if (
    hasPermission(
      session,
      'clientes.modificar'
    )
  ) {
    container.appendChild(
      createLink(
        'Editar',
        `#/clientes/formulario?id=${encodeURIComponent(
          registro.id
        )}`
      )
    );
  }

  /*
   * La clasificación solamente aplica
   * a Prospectos y requiere permiso.
   */
  if (
    registro.estado === 'PROSPECTO' &&
    hasPermission(
      session,
      'clientes.clasificar'
    )
  ) {
    container.appendChild(
      createLink(
        'Revisar y clasificar',
        `#/clientes/revision?id=${encodeURIComponent(
          registro.id
        )}`
      )
    );
  }

  return container;
}

function createTable(
  registros,
  session
) {
  const table =
    document.createElement('table');

  table.style.width = '100%';
  table.style.borderCollapse =
    'collapse';

  const thead =
    document.createElement('thead');

  const headerRow =
    document.createElement('tr');

  [
    'Nombres',
    'Apellidos',
    'Contacto',
    'Evento',
    'Estado',
    'Acciones'
  ].forEach(label => {
    const th =
      document.createElement('th');

    th.textContent = label;

    headerRow.appendChild(th);
  });

  thead.appendChild(
    headerRow
  );

  table.appendChild(thead);

  const tbody =
    document.createElement('tbody');

  registros.forEach(
    registro => {
      const row =
        document.createElement('tr');

      row.appendChild(
        createCell(
          registro.nombres
        )
      );

      row.appendChild(
        createCell(
          registro.apellidos
        )
      );

      const contacto =
        getContactoPrincipal(
          registro
        );

      const contactoText =
        contacto
          ? `${getTipoContactoLabel(
              contacto.tipoMedioContacto
            )}: ${contacto.medioContacto}`
          : 'Sin contacto';

      row.appendChild(
        createCell(
          contactoText
        )
      );

      row.appendChild(
        createCell(
          registro.evento ||
          'No registrado'
        )
      );

      row.appendChild(
        createCell(
          getEstadoLabel(
            registro.estado
          )
        )
      );

      const actionsCell =
        document.createElement('td');

      actionsCell.appendChild(
        createActions(
          registro,
          session
        )
      );

      row.appendChild(
        actionsCell
      );

      tbody.appendChild(row);
    }
  );

  table.appendChild(tbody);

  return table;
}

export async function init(
  container
) {
  const card =
    typeof container === 'string'
      ? document.getElementById(
          container
        )
      : container;

  if (!card) {
    return;
  }

  const session =
    getSession();

  if (
    !hasPermission(
      session,
      'clientes.consultar'
    )
  ) {
    card.textContent =
      'Acceso denegado.';

    return;
  }

  card.textContent =
    'Cargando clientes y prospectos...';

  try {
    const result =
      await listClientesProspectos(
        {},
        {
          pagina: 1,
          tamanio: 10
        }
      );

    card.replaceChildren();

    if (
      hasPermission(
        session,
        'clientes.registrar'
      )
    ) {
      const toolbar =
        document.createElement('div');

      toolbar.style.marginBottom =
        '12px';

      toolbar.appendChild(
        createLink(
          'Nuevo prospecto',
          '#/clientes/formulario'
        )
      );

      card.appendChild(toolbar);
    }

    if (
      !Array.isArray(
        result.items
      ) ||
      result.items.length === 0
    ) {
      const empty =
        document.createElement('p');

      empty.textContent =
        'No hay clientes o prospectos registrados.';

      card.appendChild(empty);

      return;
    }

    card.appendChild(
      createTable(
        result.items,
        session
      )
    );

  } catch (error) {
    console.error(
      'Error al cargar clientes y prospectos:',
      error
    );

    card.textContent =
      'No fue posible cargar clientes y prospectos.';
  }
}

export default {
  init
};