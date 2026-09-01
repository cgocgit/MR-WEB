import {
  createProspecto,
  getClienteProspecto,
  updateClienteProspecto
} from '../../api/clientes.service.js';

import {
  TIPOS_MEDIO_CONTACTO,
  TIPO_MEDIO_CONTACTO_LABELS
} from '../../api/clientes.constants.js';

import {
  getSession
} from '../../shared/auth-guard.js';

import {
  hasPermission
} from '../../shared/permissions.js';

function getRouteId() {
  const queryString =
    location.hash.split('?')[1] ||
    '';

  return new URLSearchParams(
    queryString
  ).get('id');
}

function createContactoRow(
  contacto = {}
) {
  const row =
    document.createElement('div');

  row.dataset.contactoRow =
    'true';

  row.style.display = 'grid';
  row.style.gridTemplateColumns =
    '180px 1fr auto';

  row.style.gap = '8px';
  row.style.marginBottom = '8px';

  const select =
    document.createElement('select');

  select.dataset.field =
    'tipoMedioContacto';

  Object.values(
    TIPOS_MEDIO_CONTACTO
  ).forEach(tipo => {
    const option =
      document.createElement(
        'option'
      );

    option.value = tipo;

    option.textContent =
      TIPO_MEDIO_CONTACTO_LABELS[
        tipo
      ];

    select.appendChild(option);
  });

  if (
    contacto.tipoMedioContacto
  ) {
    select.value =
      contacto.tipoMedioContacto;
  }

  const input =
    document.createElement('input');

  input.type = 'text';

  input.dataset.field =
    'medioContacto';

  input.placeholder =
    'Medio de contacto';

  input.value =
    contacto.medioContacto || '';

  const removeButton =
    document.createElement('button');

  removeButton.type = 'button';
  removeButton.textContent =
    'Eliminar';

  removeButton.addEventListener(
    'click',
    () => row.remove()
  );

  row.append(
    select,
    input,
    removeButton
  );

  return row;
}

function collectContactos(
  container
) {
  return Array.from(
    container.querySelectorAll(
      '[data-contacto-row]'
    )
  )
    .map(row => ({
      tipoMedioContacto:
        row.querySelector(
          '[data-field="tipoMedioContacto"]'
        ).value,

      medioContacto:
        row.querySelector(
          '[data-field="medioContacto"]'
        ).value.trim()
    }))
    .filter(
      contacto =>
        contacto.medioContacto
          .length > 0
    );
}

function denyAccess(page) {
  page.replaceChildren();

  const message =
    document.createElement('div');

  message.className = 'card';

  message.textContent =
    'Acceso denegado.';

  page.appendChild(message);
}

export async function init() {
  const page =
    document.getElementById(
      'cliente-form-page'
    );

  const form =
    document.getElementById(
      'cliente-form'
    );

  if (!page || !form) {
    return;
  }

  const id =
    getRouteId();

  const editing =
    Boolean(id);

  const session =
    getSession();

  const requiredPermission =
    editing
      ? 'clientes.modificar'
      : 'clientes.registrar';

  if (
    !hasPermission(
      session,
      requiredPermission
    )
  ) {
    denyAccess(page);

    return;
  }

  const title =
    document.getElementById(
      'cliente-form-title'
    );

  const nombres =
    document.getElementById(
      'nombres'
    );

  const apellidos =
    document.getElementById(
      'apellidos'
    );

  const evento =
    document.getElementById(
      'evento'
    );

  const contactosContainer =
    document.getElementById(
      'contactos-container'
    );

  const agregarContacto =
    document.getElementById(
      'agregar-contacto'
    );

  const cancelar =
    document.getElementById(
      'cancelar'
    );

  const guardar =
    document.getElementById(
      'guardar'
    );

  let version = null;

  agregarContacto.addEventListener(
    'click',
    () => {
      contactosContainer.appendChild(
        createContactoRow()
      );
    }
  );

  cancelar.addEventListener(
    'click',
    () => {
      location.hash =
        editing
          ? `#/clientes/detalle?id=${encodeURIComponent(
              id
            )}`
          : '#/clientes';
    }
  );

  if (editing) {
    title.textContent =
      'Editar cliente o prospecto';

    try {
      const registro =
        await getClienteProspecto(
          id
        );

      nombres.value =
        registro.nombres || '';

      apellidos.value =
        registro.apellidos || '';

      evento.value =
        registro.evento || '';

      version =
        registro.version;

      registro.contactos.forEach(
        contacto => {
          contactosContainer
            .appendChild(
              createContactoRow(
                contacto
              )
            );
        }
      );

    } catch (error) {
      console.error(error);

      page.textContent =
        'No fue posible cargar el registro.';

      return;
    }

  } else {
    title.textContent =
      'Nuevo prospecto';

    contactosContainer.appendChild(
      createContactoRow()
    );
  }

  form.addEventListener(
    'submit',
    async event => {
      event.preventDefault();

      guardar.disabled = true;

      const payload = {
        nombres:
          nombres.value.trim(),

        apellidos:
          apellidos.value.trim(),

        contactos:
          collectContactos(
            contactosContainer
          ),

        evento:
          evento.value.trim()
      };

      try {
        const resultado =
          editing
            ? await updateClienteProspecto(
                id,
                payload,
                version
              )
            : await createProspecto(
                payload
              );

        location.hash =
          `#/clientes/detalle?id=${encodeURIComponent(
            resultado.id
          )}`;

      } catch (error) {
        console.error(error);

        guardar.disabled = false;

        window.alert(
          error.message ||
          'No fue posible guardar el registro.'
        );
      }
    }
  );
}

export default {
  init
};