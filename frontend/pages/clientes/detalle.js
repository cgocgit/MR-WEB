import {
  getClienteProspecto
} from '../../api/clientes.service.js';

import {
  getSession
} from '../../shared/auth-guard.js';

import {
  hasPermission
} from '../../shared/permissions.js';

import {
  getEstadoLabel,
  getTipoContactoLabel
} from './clientes.utils.js';

function getRouteId() {
  const queryString =
    location.hash.split('?')[1] ||
    '';

  return new URLSearchParams(
    queryString
  ).get('id');
}

function createField(
  label,
  value
) {
  const row =
    document.createElement('p');

  const strong =
    document.createElement('strong');

  strong.textContent =
    `${label}: `;

  row.appendChild(strong);

  row.appendChild(
    document.createTextNode(
      value || '—'
    )
  );

  return row;
}

function createContactos(
  contactos
) {
  const section =
    document.createElement('section');

  const title =
    document.createElement('h2');

  title.textContent = 'Contactos';

  section.appendChild(title);

  if (
    !Array.isArray(contactos) ||
    contactos.length === 0
  ) {
    const empty =
      document.createElement('p');

    empty.textContent =
      'No existen medios de contacto registrados.';

    section.appendChild(empty);

    return section;
  }

  const list =
    document.createElement('ul');

  contactos.forEach(
    contacto => {
      const item =
        document.createElement('li');

      item.textContent =
        `${getTipoContactoLabel(
          contacto.tipoMedioContacto
        )}: ${contacto.medioContacto}`;

      list.appendChild(item);
    }
  );

  section.appendChild(list);

  return section;
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

export async function init() {
  const detalle =
    document.getElementById(
      'detalle'
    );

  if (!detalle) {
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
    detalle.textContent =
      'Acceso denegado.';

    return;
  }

  const id =
    getRouteId();

  if (!id) {
    detalle.textContent =
      'No se indicó el cliente o prospecto.';

    return;
  }

  try {
    const registro =
      await getClienteProspecto(
        id
      );

    detalle.replaceChildren();

    detalle.appendChild(
      createField(
        'Nombres',
        registro.nombres
      )
    );

    detalle.appendChild(
      createField(
        'Apellidos',
        registro.apellidos
      )
    );

    detalle.appendChild(
      createField(
        'Evento',
        registro.evento ||
        'No registrado'
      )
    );

    detalle.appendChild(
      createField(
        'Estado',
        getEstadoLabel(
          registro.estado
        )
      )
    );

    detalle.appendChild(
      createContactos(
        registro.contactos
      )
    );

    const actions =
      document.createElement('div');

    actions.style.display = 'flex';
    actions.style.gap = '8px';
    actions.style.marginTop =
      '16px';

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
        'PROSPECTO' &&
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

    detalle.appendChild(
      actions
    );

  } catch (error) {
    console.error(error);

    detalle.textContent =
      'No fue posible cargar el cliente o prospecto.';
  }
}

export default {
  init
};