import {
  clasificarProspecto,
  getClienteProspecto,
  getCotizacionesByClienteProspecto
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
  getNombreCompleto,
  getTipoContactoLabel
} from './clientes.utils.js';

import {
  showLoader,
  hideLoader
} from '../../components/loader.js';

import {
  showNotification
} from '../../components/notification.js';

const state = {
  registro: null,
  cotizaciones: [],
  estadoDestino: null,
  processing: false
};

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

function createCard(title) {
  const section =
    createElement('section');

  section.className =
  'card clientes-review-section';

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

  row.appendChild(
    strong
  );

  row.appendChild(
    document.createTextNode(
      value ||
      'No registrado'
    )
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

function createInformationSection(
  registro
) {
  const card =
    createCard(
      'Información del prospecto'
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
      'Estado actual',
      getEstadoLabel(
        registro.estado
      )
    )
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

      item.textContent =
        `${getTipoContactoLabel(
          contacto.tipoMedioContacto
        )}: ${contacto.medioContacto}`;

      list.appendChild(
        item
      );
    }
  );

  card.appendChild(list);

  return card;
}

function createWarningsSection(
  registro
) {
  const warnings = [];

  if (!registro.nombres) {
    warnings.push(
      'Los nombres no se encuentran registrados.'
    );
  }

  if (!registro.apellidos) {
    warnings.push(
      'Los apellidos no se encuentran registrados.'
    );
  }

  if (
    !Array.isArray(
      registro.contactos
    ) ||
    registro.contactos.length === 0
  ) {
    warnings.push(
      'No existen medios de contacto registrados.'
    );
  }

  if (!registro.evento) {
    warnings.push(
      'El evento no se encuentra registrado.'
    );
  }

  if (warnings.length === 0) {
    return null;
  }

  const card =
    createCard(
      'Información faltante'
    );

  card.appendChild(
    createElement(
      'p',
      'La siguiente información no está disponible. Esto no bloquea la clasificación en esta iteración.'
    )
  );

  const list =
    createElement('ul');

  warnings.forEach(
    warning => {
      list.appendChild(
        createElement(
          'li',
          warning
        )
      );
    }
  );

  card.appendChild(list);

  return card;
}

function createCotizacion(
  cotizacion
) {
  const item =
    createElement('article');

  item.className =
    'card';

  item.style.marginTop =
    '8px';

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

  return item;
}

function createCotizacionesSection(
  cotizaciones,
  canViewCotizaciones
) {
  const card =
    createCard(
      'Cotizaciones asociadas'
    );

  if (!canViewCotizaciones) {
    card.appendChild(
      createElement(
        'p',
        'No dispone de permiso para consultar las cotizaciones asociadas.'
      )
    );

    return card;
  }

  if (
    !Array.isArray(cotizaciones) ||
    cotizaciones.length === 0
  ) {
    card.appendChild(
      createElement(
        'p',
        'No existen cotizaciones asociadas.'
      )
    );

    return card;
  }

  card.appendChild(
    createField(
      'Total',
      String(
        cotizaciones.length
      )
    )
  );

  cotizaciones.forEach(
    cotizacion => {
      card.appendChild(
        createCotizacion(
          cotizacion
        )
      );
    }
  );

  return card;
}

function createDecisionButton(
  text,
  estadoDestino
) {
  const button =
    createElement(
      'button',
      text
    );

  button.type =
    'button';

  button.addEventListener(
    'click',
    () => {
      openConfirmation(
        estadoDestino
      );
    }
  );

  return button;
}

function createDecisionSection(
  registro
) {
  const card =
    createCard(
      'Decisión'
    );

  /*
   * Solo Prospecto puede cambiar
   * de estado en esta iteración.
   */
  if (
    registro.estado !==
    ESTADOS_CLIENTE_PROSPECTO.PROSPECTO
  ) {
    card.appendChild(
      createElement(
        'p',
        'Este registro ya fue revisado y no puede cambiar de estado mediante esta pantalla.'
      )
    );

    card.appendChild(
      createLink(
        'Volver al detalle',
        `#/clientes/detalle?id=${encodeURIComponent(
          registro.id
        )}`
      )
    );

    return card;
  }

  card.appendChild(
    createElement(
      'p',
      'Selecciona el resultado de la revisión.'
    )
  );

  const actions =
    createElement('div');

  actions.style.display =
    'flex';

  actions.style.flexWrap =
    'wrap';

  actions.style.gap =
    '8px';

  actions.style.marginTop =
    '12px';

  actions.appendChild(
    createDecisionButton(
      'Clasificar como cliente',
      ESTADOS_CLIENTE_PROSPECTO.CLIENTE
    )
  );

  actions.appendChild(
    createDecisionButton(
      'Continuar como prospecto revisado',
      ESTADOS_CLIENTE_PROSPECTO
        .PROSPECTO_REVISADO
    )
  );

  actions.appendChild(
    createLink(
      'Cancelar',
      `#/clientes/detalle?id=${encodeURIComponent(
        registro.id
      )}`
    )
  );

  card.appendChild(
    actions
  );

  return card;
}

function getConfirmationElements() {
  return {
    dialog:
      document.getElementById(
        'clasificacion-confirmacion'
      ),

    title:
      document.getElementById(
        'clasificacion-confirmacion-title'
      ),

    content:
      document.getElementById(
        'clasificacion-confirmacion-content'
      ),

    cancel:
      document.getElementById(
        'clasificacion-cancelar-confirmacion'
      ),

    confirm:
      document.getElementById(
        'clasificacion-confirmar'
      )
  };
}

function openConfirmation(
  estadoDestino
) {
  const elements =
    getConfirmationElements();

  if (
    !elements.dialog ||
    !state.registro
  ) {
    return;
  }

  state.estadoDestino =
    estadoDestino;

  elements.content
    .replaceChildren();

  const nombre =
    getNombreCompleto(
      state.registro
    ) ||
    'Prospecto sin nombre';

  const isCliente =
    estadoDestino ===
    ESTADOS_CLIENTE_PROSPECTO.CLIENTE;

  elements.title.textContent =
    isCliente
      ? 'Confirmar clasificación como cliente'
      : 'Confirmar como prospecto revisado';

  elements.content.appendChild(
    createField(
      'Prospecto',
      nombre
    )
  );

  elements.content.appendChild(
    createField(
      'Estado actual',
      getEstadoLabel(
        state.registro.estado
      )
    )
  );

  elements.content.appendChild(
    createField(
      'Estado resultante',
      getEstadoLabel(
        estadoDestino
      )
    )
  );

  elements.content.appendChild(
    createElement(
      'p',
      isCliente
        ? 'La clasificación quedará registrada para auditoría.'
        : 'El registro dejará de aparecer como pendiente de primera revisión.'
    )
  );

  elements.confirm.textContent =
    isCliente
      ? 'Confirmar clasificación'
      : 'Confirmar como revisado';

  elements.dialog.showModal();
}

function closeConfirmation() {
  const elements =
    getConfirmationElements();

  if (
    elements.dialog?.open
  ) {
    elements.dialog.close();
  }

  state.estadoDestino =
    null;
}

function createResultSection(
  result
) {
  const card =
    createCard(
      'Resultado de la clasificación'
    );

  card.appendChild(
    createElement(
      'p',
      result.message
    )
  );

  card.appendChild(
    createField(
      'Estado anterior',
      getEstadoLabel(
        result.estadoAnterior
      )
    )
  );

  card.appendChild(
    createField(
      'Estado nuevo',
      getEstadoLabel(
        result.estadoNuevo
      )
    )
  );

  card.appendChild(
    createField(
      'Fecha de operación',
      formatDateTime(
        result.fechaOperacion
      )
    )
  );

  card.appendChild(
    createField(
      'Ejecutado por',
      result.ejecutadoPor
        ?.nombre ||
        'No disponible'
    )
  );

  card.appendChild(
    createField(
      'Referencia de auditoría',
      result.auditReference
    )
  );

  card.appendChild(
    createLink(
      'Volver al detalle',
      `#/clientes/detalle?id=${encodeURIComponent(
        state.registro.id
      )}`
    )
  );

  return card;
}

function getFriendlyError(
  error
) {
  switch (error?.code) {
    case 'VERSION_CONFLICT':
      return (
        'El registro cambió antes de confirmar. ' +
        'Consulta nuevamente la información antes de clasificar.'
      );

    case 'INVALID_STATE':
      return (
        'El registro ya no se encuentra en estado Prospecto.'
      );

    case 'INVALID_DESTINATION':
      return (
        'El estado seleccionado no está permitido.'
      );

    case 'NOT_FOUND':
      return (
        'El prospecto ya no existe.'
      );

    case 'SERVICE_ERROR':
      return (
        'No fue posible realizar la clasificación. El estado original se conserva.'
      );

    default:
      return (
        error?.message ||
        'No fue posible realizar la clasificación.'
      );
  }
}

async function confirmClassification(
  content
) {
  if (
    state.processing ||
    !state.registro ||
    !state.estadoDestino
  ) {
    return;
  }

  state.processing = true;

  const elements =
    getConfirmationElements();

  elements.confirm.disabled =
    true;

  elements.cancel.disabled =
    true;

  showLoader();

  try {
    /*
     * Requisito de la especificación:
     * volver a consultar el registro
     * inmediatamente antes de confirmar.
     */
    const current =
      await getClienteProspecto(
        state.registro.id
      );

    /*
     * Se conserva la versión que el usuario
     * revisó inicialmente. clasificarProspecto
     * detectará el conflicto si cambió.
     */
    if (
      current.version !==
      state.registro.version
    ) {
      const error =
        new Error(
          'El registro cambió antes de confirmar.'
        );

      error.code =
        'VERSION_CONFLICT';

      throw error;
    }

    if (
      current.estado !==
      ESTADOS_CLIENTE_PROSPECTO.PROSPECTO
    ) {
      const error =
        new Error(
          'El registro ya no se encuentra en estado Prospecto.'
        );

      error.code =
        'INVALID_STATE';

      throw error;
    }

    const result =
      await clasificarProspecto(
        state.registro.id,
        state.estadoDestino,
        state.registro.version
      );

    closeConfirmation();

    state.registro = {
      ...state.registro,
      estado:
        result.estadoNuevo,
      version:
        result.version,
      fechaActualizacion:
        result.fechaOperacion
    };

    content.replaceChildren(
      createResultSection(
        result
      )
    );

    content.setAttribute(
      'aria-busy',
      'false'
    );

    showNotification(
      result.message,
      {
        type: 'success'
      }
    );

  } catch (error) {
    console.error(
      'Error al clasificar prospecto:',
      error
    );

    closeConfirmation();

    showNotification(
      getFriendlyError(
        error
      ),
      {
        type: 'error',
        timeout: 5000
      }
    );

    /*
     * El estado original permanece
     * en pantalla. No actualizamos
     * state.registro ante error.
     */

  } finally {
    state.processing = false;

    elements.confirm.disabled =
      false;

    elements.cancel.disabled =
      false;

    hideLoader();
  }
}

function renderError(
  content,
  error
) {
  content.replaceChildren();

  const card =
    createCard(
      'No fue posible cargar la revisión'
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

function bindConfirmationEvents(
  content
) {
  const elements =
    getConfirmationElements();

  elements.cancel
    ?.addEventListener(
      'click',
      closeConfirmation
    );

  elements.confirm
    ?.addEventListener(
      'click',
      () => {
        confirmClassification(
          content
        );
      }
    );

  elements.dialog
    ?.addEventListener(
      'cancel',
      event => {
        event.preventDefault();

        if (!state.processing) {
          closeConfirmation();
        }
      }
    );
}

export async function init() {
  const content =
    document.getElementById(
      'cliente-revision-content'
    );

  if (!content) {
    return;
  }

  const session =
    getSession();

  if (
    !hasPermission(
      session,
      'clientes.clasificar'
    )
  ) {
    content.textContent =
      'Acceso denegado.';

    content.setAttribute(
      'aria-busy',
      'false'
    );

    return;
  }

  const id =
    getRouteId();

  if (!id) {
    content.textContent =
      'No se indicó el prospecto que desea revisar.';

    content.setAttribute(
      'aria-busy',
      'false'
    );

    return;
  }

  bindConfirmationEvents(
    content
  );

  const canViewCotizaciones =
    hasPermission(
      session,
      'cotizaciones.consultar'
    );

  showLoader();

  try {
    const [
      registro,
      cotizaciones
    ] = await Promise.all([
      getClienteProspecto(id),

      canViewCotizaciones
        ? getCotizacionesByClienteProspecto(
            id
          )
        : Promise.resolve([])
    ]);

    state.registro =
      registro;

    state.cotizaciones =
      cotizaciones;

    content.replaceChildren();

    content.appendChild(
      createInformationSection(
        registro
      )
    );

    content.appendChild(
      createContactosSection(
        registro.contactos
      )
    );

    const warnings =
      createWarningsSection(
        registro
      );

    if (warnings) {
      content.appendChild(
        warnings
      );
    }

    content.appendChild(
      createCotizacionesSection(
        cotizaciones,
        canViewCotizaciones
      )
    );

    content.appendChild(
      createDecisionSection(
        registro
      )
    );

    content.setAttribute(
      'aria-busy',
      'false'
    );

  } catch (error) {
    console.error(
      'No fue posible cargar la revisión:',
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