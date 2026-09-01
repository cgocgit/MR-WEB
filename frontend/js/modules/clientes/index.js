import {
  listClientesProspectos
} from '../../api/clientes.service.js';

import {
  DEFAULT_PAGE_SIZE,
  ESTADOS_CLIENTE_PROSPECTO
} from '../../api/clientes.constants.js';

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

const state = {
  filtros: {
    busqueda: '',
    estado: '',
    evento: '',
    tipoMedioContacto: '',
    conCotizaciones: ''
  },

  pagina: 1,
  tamanio: DEFAULT_PAGE_SIZE,

  totalPaginas: 1,
  totalRegistros: 0
};

function getElements() {
  return {
    busqueda:
      document.getElementById(
        'clientes-busqueda'
      ),

    estado:
      document.getElementById(
        'clientes-estado'
      ),

    tipoContacto:
      document.getElementById(
        'clientes-tipo-contacto'
      ),

    cotizaciones:
      document.getElementById(
        'clientes-cotizaciones'
      ),

    evento:
      document.getElementById(
        'clientes-evento'
      ),

    buscar:
      document.getElementById(
        'clientes-buscar'
      ),

    limpiar:
      document.getElementById(
        'clientes-limpiar-filtros'
      ),

    resumen:
      document.getElementById(
        'clientes-resumen'
      ),

    actions:
      document.getElementById(
        'clientes-actions'
      ),

    content:
      document.getElementById(
        'clientes-content'
      ),

    pagination:
      document.getElementById(
        'clientes-pagination'
      )
  };
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

function createCell(
  value = '—'
) {
  const cell =
    document.createElement('td');

  cell.textContent =
    value || '—';

  return cell;
}

function createStatusBadge(
  estado
) {
  const badge =
    document.createElement('span');

  badge.textContent =
    getEstadoLabel(estado);

  badge.className =
  'clientes-status';

  badge.dataset.estado =
    estado;

  return badge;
}

function createActions(
  registro,
  session
) {
  const container =
    document.createElement('div');

    container.className =
    'clientes-row-actions';

  if (
    hasPermission(
      session,
      'clientes.consultar'
    )
  ) {
    container.appendChild(
      createLink(
        'Ver',
        `#/clientes/detalle?id=${encodeURIComponent(
          registro.id
        )}`
      )
    );
  }

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

  if (
    registro.estado ===
      ESTADOS_CLIENTE_PROSPECTO.PROSPECTO &&
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
  const wrapper =
    document.createElement('div');

  wrapper.className =
  'clientes-table-wrapper';

  const table =
    document.createElement('table');

  table.className =
  'clientes-table';

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

    th.textContent =
      label;

    headerRow.appendChild(
      th
    );
  });

  thead.appendChild(
    headerRow
  );

  table.appendChild(
    thead
  );

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

      const estadoCell =
        document.createElement('td');

      estadoCell.appendChild(
        createStatusBadge(
          registro.estado
        )
      );

      row.appendChild(
        estadoCell
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

      tbody.appendChild(
        row
      );
    }
  );

  table.appendChild(
    tbody
  );

  wrapper.appendChild(
    table
  );

  return wrapper;
}

function renderLoading(
  elements
) {
  elements.content.setAttribute(
    'aria-busy',
    'true'
  );

  elements.content.textContent =
    'Cargando clientes y prospectos...';
}

function renderError(
  elements
) {
  elements.content.setAttribute(
    'aria-busy',
    'false'
  );

  elements.content.textContent =
    'No fue posible cargar clientes y prospectos.';
}

function renderEmpty(
  elements
) {
  elements.content.setAttribute(
    'aria-busy',
    'false'
  );

  elements.content.replaceChildren();

  const message =
    document.createElement('p');

  const hasFilters =
    Object.values(
      state.filtros
    ).some(
      value =>
        value !== '' &&
        value !== null
    );

  message.textContent =
    hasFilters
      ? 'No existen coincidencias para los filtros aplicados.'
      : 'No existen clientes o prospectos registrados.';

  elements.content.appendChild(
    message
  );
}

function renderResumen(
  elements
) {
  const from =
    state.totalRegistros === 0
      ? 0
      : (
          (state.pagina - 1) *
          state.tamanio
        ) + 1;

  const to =
    Math.min(
      state.pagina *
      state.tamanio,
      state.totalRegistros
    );

  elements.resumen.textContent =
    state.totalRegistros === 0
      ? '0 registros'
      : `Mostrando ${from}-${to} de ${state.totalRegistros}`;
}

function createPageButton(
  label,
  disabled,
  onClick
) {
  const button =
    document.createElement('button');

  button.type = 'button';
  button.textContent =
    label;

  button.disabled =
    disabled;

  button.addEventListener(
    'click',
    onClick
  );

  return button;
}

function renderPagination(
  elements
) {
  elements.pagination
    .replaceChildren();

  if (
    state.totalRegistros === 0
  ) {
    return;
  }

  const previous =
    createPageButton(
      'Anterior',
      state.pagina <= 1,
      () => {
        if (state.pagina <= 1) {
          return;
        }

        state.pagina -= 1;

        loadData(
          elements
        );
      }
    );

  const pageInfo =
    document.createElement('span');

  pageInfo.textContent =
    `Página ${state.pagina} de ${state.totalPaginas}`;

  const next =
    createPageButton(
      'Siguiente',
      state.pagina >=
        state.totalPaginas,
      () => {
        if (
          state.pagina >=
          state.totalPaginas
        ) {
          return;
        }

        state.pagina += 1;

        loadData(
          elements
        );
      }
    );

  elements.pagination.append(
    previous,
    pageInfo,
    next
  );
}

function renderModuleActions(
  elements,
  session
) {
  elements.actions
    .replaceChildren();

  if (
    !hasPermission(
      session,
      'clientes.registrar'
    )
  ) {
    return;
  }

  elements.actions.appendChild(
    createLink(
      'Nuevo prospecto',
      '#/clientes/formulario'
    )
  );
}

function readFilters(
  elements
) {
  state.filtros = {
    busqueda:
      elements.busqueda
        .value.trim(),

    estado:
      elements.estado.value,

    evento:
      elements.evento
        .value.trim(),

    tipoMedioContacto:
      elements.tipoContacto
        .value,

    conCotizaciones:
      elements.cotizaciones
        .value
  };
}

function resetFilters(
  elements
) {
  elements.busqueda.value =
    '';

  elements.estado.value =
    '';

  elements.tipoContacto.value =
    '';

  elements.cotizaciones.value =
    '';

  elements.evento.value =
    '';

  state.filtros = {
    busqueda: '',
    estado: '',
    evento: '',
    tipoMedioContacto: '',
    conCotizaciones: ''
  };

  state.pagina = 1;
}

async function loadData(
  elements
) {
  renderLoading(
    elements
  );

  try {
    const result =
      await listClientesProspectos(
        state.filtros,
        {
          pagina:
            state.pagina,

          tamanio:
            state.tamanio
        }
      );

    state.pagina =
      result.pagina;

    state.totalPaginas =
      result.totalPaginas;

    state.totalRegistros =
      result.totalRegistros;

    renderResumen(
      elements
    );

    renderPagination(
      elements
    );

    if (
      !Array.isArray(
        result.items
      ) ||
      result.items.length === 0
    ) {
      renderEmpty(
        elements
      );

      return;
    }

    const session =
      getSession();

    elements.content
      .replaceChildren(
        createTable(
          result.items,
          session
        )
      );

    elements.content.setAttribute(
      'aria-busy',
      'false'
    );

  } catch (error) {
    console.error(
      'Error al cargar clientes y prospectos:',
      error
    );

    state.totalRegistros = 0;
    state.totalPaginas = 1;

    renderResumen(
      elements
    );

    elements.pagination
      .replaceChildren();

    renderError(
      elements
    );
  }
}

function bindEvents(
  elements
) {
  elements.buscar.addEventListener(
    'click',
    () => {
      readFilters(
        elements
      );

      state.pagina = 1;

      loadData(
        elements
      );
    }
  );

  elements.limpiar.addEventListener(
    'click',
    () => {
      resetFilters(
        elements
      );

      loadData(
        elements
      );
    }
  );

  elements.busqueda.addEventListener(
    'keydown',
    event => {
      if (
        event.key !== 'Enter'
      ) {
        return;
      }

      event.preventDefault();

      readFilters(
        elements
      );

      state.pagina = 1;

      loadData(
        elements
      );
    }
  );
}

export async function init() {
  const elements =
    getElements();

  if (
    !elements.content
  ) {
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
    elements.content.textContent =
      'Acceso denegado.';

    return;
  }

  renderModuleActions(
    elements,
    session
  );

  /*
   * Si el usuario no tiene permiso
   * de búsqueda, se oculta la zona
   * de búsqueda y filtros.
   */
  if (
    !hasPermission(
      session,
      'clientes.buscar'
    )
  ) {
    const toolbar =
      document.getElementById(
        'clientes-toolbar'
      );

    if (toolbar) {
      toolbar.hidden =
        true;
    }
  }

  bindEvents(
    elements
  );

  await loadData(
    elements
  );
}

export default {
  init
};