import {
  getClienteProspecto,
  getCotizacionesByClienteProspecto,
  getAuditoriaByClienteProspecto
} from '../../api/clientes.service.js';

import {
  ESTADOS_CLIENTE_PROSPECTO
} from '../../api/clientes.constants.js';

import {
  getSession
} from '../../shared/auth-guard.js';

import {
  hasPermission
} from '../../shared/permissions.js';

import {
  formatCurrency,
  formatDate,
  formatDateTime,
  getEstadoLabel,
  getTipoContactoLabel
} from './clientes.utils.js';

import {
  showLoader,
  hideLoader
} from '../../components/loader.js';

function getRouteId() {
  const queryString =
    location.hash.split('?')[1] || '';

  return new URLSearchParams(
    queryString
  ).get('id');
}

function createElement(
  tagName,
  text = ''
) {
  const element =
    document.createElement(tagName);

  if (text) {
    element.textContent = text;
  }

  return element;
}

function createCard(
  title
) {
  const section =
    createElement('section');

  section.className = 'card clientes-detail-section';

  const heading =
    createElement(
      'h2',
      title
    );

  section.appendChild(
    heading
  );

  return section;
}

function createField(
  label,
  value
) {
  const row =
    createElement('p');

  const strong =
    createElement(
      'strong',
      `${label}: `
    );

  const text =
    document.createTextNode(
      value ||
      'No registrado'
    );

  row.append(
    strong,
    text
  );

  return row;
}

function createLink(
  text,
  href
) {
  const link =
    createElement(
      'a',
      text
    );

  link.href = href;

  return link;
}

function createHeader(
  registro,
  session
) {
  const card =
    createCard(
      'Información general'
    );

  card.appendChild(
    createField(
      'Nombres',
      registro.nombres
    )
  );

  card.appendChild(
    createField(
      'Apellidos',
      registro.apellidos
    )
  );

  card.appendChild(
    createField(
      'Evento',
      registro.evento
    )
  );

  card.appendChild(
    createField(
      'Estado',
      getEstadoLabel(
        registro.estado
      )
    )
  );

  const actions =
  createElement('div');

actions.className =
  'clientes-row-actions';

  actions.appendChild(
    createLink(
      'Volver al listado',
      '#/clientes'
    )
  );

  if (
    hasPermission(
      session,
      'clientes.modificar'
    )
  ) {
    actions.appendChild(
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
    actions.appendChild(
      createLink(
        'Revisar y clasificar',
        `#/clientes/revision?id=${encodeURIComponent(
          registro.id
        )}`
      )
    );
  }

  card.appendChild(
    actions
  );

  return card;
}

function createContactosSection(
  contactos
) {
  const card =
    createCard(
      'Contactos'
    );

  if (
    !Array.isArray(contactos) ||
    contactos.length === 0
  ) {
    card.appendChild(
      createElement(
        'p',
        'No existen medios de contacto registrados.'
      )
    );

    return card;
  }

  const list =
    createElement('ul');

  contactos.forEach(
    contacto => {
      const item =
        createElement('li');

      const tipo =
        getTipoContactoLabel(
          contacto.tipoMedioContacto
        );

      item.textContent =
        `${tipo}: ${contacto.medioContacto}`;

      list.appendChild(
        item
      );
    }
  );

  card.appendChild(
    list
  );

  return card;
}

function createControlSection(
  registro
) {
  const card =
    createCard(
      'Datos de control'
    );

  card.appendChild(
    createField(
      'Fecha de registro',
      formatDateTime(
        registro.fechaCreacion
      )
    )
  );

  card.appendChild(
    createField(
      'Última actualización',
      formatDateTime(
        registro.fechaActualizacion
      )
    )
  );

  return card;
}

function createCotizacionCard(
  cotizacion
) {
  const item =
    createElement('article');

  item.className =
  'card clientes-related-item';

  item.appendChild(
    createField(
      'Folio',
      cotizacion.folio
    )
  );

  item.appendChild(
    createField(
      'Fecha',
      formatDate(
        cotizacion.fecha
      )
    )
  );

  item.appendChild(
    createField(
      'Estado',
      cotizacion.estado
    )
  );

  item.appendChild(
    createField(
      'Vigencia',
      formatDate(
        cotizacion.vigencia
      )
    )
  );

  item.appendChild(
    createField(
      'Importe',
      formatCurrency(
        cotizacion.importe
      )
    )
  );

  /*
   * No se agrega todavía "Ver cotización"
   * porque el router actual no tiene una
   * ruta de detalle de cotización.
   *
   * Evitamos crear un enlace que lleve
   * a una ruta inexistente.
   */

  return item;
}

function createCotizacionesSection(
  cotizaciones,
  canView
) {
  const card =
    createCard(
      'Cotizaciones'
    );

  if (!canView) {
    card.appendChild(
      createElement(
        'p',
        'No dispone de permiso para consultar las cotizaciones asociadas.'
      )
    );

    return card;
  }

  const cantidad =
    Array.isArray(
      cotizaciones
    )
      ? cotizaciones.length
      : 0;

  card.appendChild(
    createField(
      'Total de cotizaciones',
      String(cantidad)
    )
  );

  if (cantidad === 0) {
    card.appendChild(
      createElement(
        'p',
        'No existen cotizaciones asociadas.'
      )
    );

    return card;
  }

  cotizaciones.forEach(
    cotizacion => {
      card.appendChild(
        createCotizacionCard(
          cotizacion
        )
      );
    }
  );

  return card;
}

function createAuditoriaItem(
  auditoria
) {
  const item =
    createElement('article');

  item.className =
  'card clientes-related-item';

  item.appendChild(
    createField(
      'Referencia',
      auditoria.id
    )
  );

  item.appendChild(
    createField(
      'Operación',
      auditoria.operacion
    )
  );

  if (
    auditoria.estadoAnterior
  ) {
    item.appendChild(
      createField(
        'Estado anterior',
        getEstadoLabel(
          auditoria.estadoAnterior
        )
      )
    );
  }

  if (
    auditoria.estadoNuevo
  ) {
    item.appendChild(
      createField(
        'Estado nuevo',
        getEstadoLabel(
          auditoria.estadoNuevo
        )
      )
    );
  }

  item.appendChild(
    createField(
      'Fecha',
      formatDateTime(
        auditoria.fechaOperacion
      )
    )
  );

  item.appendChild(
    createField(
      'Ejecutado por',
      auditoria.ejecutadoPor
        ?.nombre ||
      'No disponible'
    )
  );

  return item;
}

function createAuditoriaSection(
  auditoria,
  canView
) {
  if (!canView) {
    return null;
  }

  const card =
    createCard(
      'Auditoría'
    );

  if (
    !Array.isArray(auditoria) ||
    auditoria.length === 0
  ) {
    card.appendChild(
      createElement(
        'p',
        'No existen operaciones auditadas para este registro.'
      )
    );

    return card;
  }

  const ordered =
    [...auditoria].sort(
      (a, b) =>
        new Date(
          b.fechaOperacion
        ) -
        new Date(
          a.fechaOperacion
        )
    );

  ordered.forEach(
    item => {
      card.appendChild(
        createAuditoriaItem(
          item
        )
      );
    }
  );

  return card;
}

function renderAccessDenied(
  content
) {
  content.replaceChildren();

  const card =
    createCard(
      'Acceso denegado'
    );

  card.appendChild(
    createElement(
      'p',
      'No dispone de permiso para consultar clientes y prospectos.'
    )
  );

  content.appendChild(
    card
  );

  content.setAttribute(
    'aria-busy',
    'false'
  );
}

function renderInvalidId(
  content
) {
  content.replaceChildren();

  const card =
    createCard(
      'Registro no especificado'
    );

  card.appendChild(
    createElement(
      'p',
      'No se indicó el cliente o prospecto que desea consultar.'
    )
  );

  card.appendChild(
    createLink(
      'Volver al listado',
      '#/clientes'
    )
  );

  content.appendChild(
    card
  );

  content.setAttribute(
    'aria-busy',
    'false'
  );
}

function renderError(
  content,
  error
) {
  content.replaceChildren();

  const card =
    createCard(
      'No fue posible cargar el registro'
    );

  const message =
    error?.code === 'NOT_FOUND'
      ? 'El cliente o prospecto solicitado no existe.'
      : 'Ocurrió un error al consultar la información.';

  card.appendChild(
    createElement(
      'p',
      message
    )
  );

  card.appendChild(
    createLink(
      'Volver al listado',
      '#/clientes'
    )
  );

  content.appendChild(
    card
  );

  content.setAttribute(
    'aria-busy',
    'false'
  );
}

export async function init() {
  const content =
    document.getElementById(
      'cliente-detalle-content'
    );

  if (!content) {
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
    renderAccessDenied(
      content
    );

    return;
  }

  const id =
    getRouteId();

  if (!id) {
    renderInvalidId(
      content
    );

    return;
  }

  const canViewCotizaciones =
    hasPermission(
      session,
      'cotizaciones.consultar'
    );

  const canViewAuditoria =
    hasPermission(
      session,
      'auditoria.consultar'
    );

  content.setAttribute(
    'aria-busy',
    'true'
  );

  showLoader();

  try {
    /*
     * Solo consultamos información
     * adicional cuando el usuario
     * posee el permiso correspondiente.
     */
    const [
      registro,
      cotizaciones,
      auditoria
    ] = await Promise.all([
      getClienteProspecto(id),

      canViewCotizaciones
        ? getCotizacionesByClienteProspecto(
            id
          )
        : Promise.resolve([]),

      canViewAuditoria
        ? getAuditoriaByClienteProspecto(
            id
          )
        : Promise.resolve([])
    ]);

    content.replaceChildren();

    content.appendChild(
      createHeader(
        registro,
        session
      )
    );

    content.appendChild(
      createContactosSection(
        registro.contactos
      )
    );

    content.appendChild(
      createControlSection(
        registro
      )
    );

    content.appendChild(
      createCotizacionesSection(
        cotizaciones,
        canViewCotizaciones
      )
    );

    const auditoriaSection =
      createAuditoriaSection(
        auditoria,
        canViewAuditoria
      );

    if (auditoriaSection) {
      content.appendChild(
        auditoriaSection
      );
    }

    content.setAttribute(
      'aria-busy',
      'false'
    );

  } catch (error) {
    console.error(
      'No fue posible cargar el detalle:',
      error
    );

    renderError(
      content,
      error
    );

  } finally {
    hideLoader();
  }
}

export default {
  init
};