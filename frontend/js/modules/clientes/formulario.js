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

import {
  showNotification
} from '../../components/notification.js';

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

function createOption(
  value,
  label
) {
  const option =
    document.createElement('option');

  option.value = value;
  option.textContent = label;

  return option;
}

function configureContactoInput(
  input,
  tipo
) {
  input.type = 'text';
  input.inputMode = 'text';
  input.removeAttribute('autocomplete');

  switch (tipo) {
    case TIPOS_MEDIO_CONTACTO.EMAIL:
      input.type = 'email';
      input.inputMode = 'email';
      input.autocomplete = 'email';
      input.placeholder =
        'correo@dominio.com';
      break;

    case TIPOS_MEDIO_CONTACTO.CELULAR:
      input.type = 'tel';
      input.inputMode = 'tel';
      input.autocomplete = 'tel';
      input.placeholder =
        'Número celular';
      break;

    case TIPOS_MEDIO_CONTACTO.TELEFONO:
      input.type = 'tel';
      input.inputMode = 'tel';
      input.autocomplete = 'tel';
      input.placeholder =
        'Número telefónico';
      break;

    default:
      input.placeholder =
        'Medio de contacto';
  }
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

  const tipoWrapper =
    document.createElement('label');

  tipoWrapper.textContent =
    'Tipo de contacto';

  const select =
    document.createElement('select');

  select.dataset.field =
    'tipoMedioContacto';

  Object.values(
    TIPOS_MEDIO_CONTACTO
  ).forEach(tipo => {
    select.appendChild(
      createOption(
        tipo,
        TIPO_MEDIO_CONTACTO_LABELS[
          tipo
        ]
      )
    );
  });

  if (
    contacto.tipoMedioContacto
  ) {
    select.value =
      contacto.tipoMedioContacto;
  }

  tipoWrapper.appendChild(
    select
  );

  const medioWrapper =
    document.createElement('label');

  medioWrapper.textContent =
    'Medio de contacto';

  const input =
    document.createElement('input');

  input.dataset.field =
    'medioContacto';

  input.value =
    contacto.medioContacto || '';

  configureContactoInput(
    input,
    select.value
  );

  select.addEventListener(
    'change',
    () => {
      configureContactoInput(
        input,
        select.value
      );
    }
  );

  medioWrapper.appendChild(
    input
  );

  const removeButton =
    document.createElement('button');

  removeButton.type = 'button';

  removeButton.textContent =
    'Eliminar';

  removeButton.setAttribute(
    'aria-label',
    'Eliminar medio de contacto'
  );

  removeButton.addEventListener(
    'click',
    () => row.remove()
  );

  row.append(
    tipoWrapper,
    medioWrapper,
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
    .map(row => {
      const tipo =
        row.querySelector(
          '[data-field="tipoMedioContacto"]'
        );

      const medio =
        row.querySelector(
          '[data-field="medioContacto"]'
        );

      return {
        tipoMedioContacto:
          tipo?.value || '',

        medioContacto:
          medio?.value.trim() || ''
      };
    })
    .filter(contacto =>
      contacto.medioContacto.length > 0
    );
}

function getElements() {
  return {
    page:
      document.getElementById(
        'cliente-form-page'
      ),

    form:
      document.getElementById(
        'cliente-form'
      ),

    title:
      document.getElementById(
        'cliente-form-title'
      ),

    description:
      document.getElementById(
        'cliente-form-description'
      ),

    errors:
      document.getElementById(
        'cliente-form-errors'
      ),

    nombres:
      document.getElementById(
        'nombres'
      ),

    apellidos:
      document.getElementById(
        'apellidos'
      ),

    evento:
      document.getElementById(
        'evento'
      ),

    contactos:
      document.getElementById(
        'contactos-container'
      ),

    agregarContacto:
      document.getElementById(
        'agregar-contacto'
      ),

    cancelar:
      document.getElementById(
        'cancelar'
      ),

    guardar:
      document.getElementById(
        'guardar'
      )
  };
}

function clearErrors(
  elements
) {
  elements.errors.replaceChildren();
  elements.errors.hidden = true;
}

function showErrors(
  elements,
  errors
) {
  elements.errors.replaceChildren();

  if (
    !Array.isArray(errors) ||
    errors.length === 0
  ) {
    elements.errors.hidden = true;
    return;
  }

  const title =
    document.createElement('strong');

  title.textContent =
    'Revisa la información capturada.';

  const list =
    document.createElement('ul');

  errors.forEach(message => {
    const item =
      document.createElement('li');

    item.textContent = message;

    list.appendChild(item);
  });

  elements.errors.append(
    title,
    list
  );

  elements.errors.hidden = false;
}

function validateEmail(
  value
) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    .test(value);
}

function validatePhone(
  value
) {
  const normalized =
    value.replace(
      /[\s()+.-]/g,
      ''
    );

  return /^\d{7,15}$/
    .test(normalized);
}

function validateContactos(
  contactos
) {
  const errors = [];

  contactos.forEach(
    (contacto, index) => {
      const number =
        index + 1;

      if (
        contacto.tipoMedioContacto ===
          TIPOS_MEDIO_CONTACTO.EMAIL &&
        !validateEmail(
          contacto.medioContacto
        )
      ) {
        errors.push(
          `El contacto ${number} debe contener un e-mail válido.`
        );
      }

      if (
        (
          contacto.tipoMedioContacto ===
            TIPOS_MEDIO_CONTACTO.TELEFONO ||
          contacto.tipoMedioContacto ===
            TIPOS_MEDIO_CONTACTO.CELULAR
        ) &&
        !validatePhone(
          contacto.medioContacto
        )
      ) {
        errors.push(
          `El contacto ${number} debe contener un número telefónico válido.`
        );
      }
    }
  );

  return errors;
}

function validatePayload(
  payload
) {
  /*
   * No se establecen como obligatorios
   * nombres, apellidos, contactos o evento
   * porque esa regla todavía no ha sido
   * definida por negocio.
   *
   * Solo validamos consistencia de la
   * información que sí fue capturada.
   */
  return validateContactos(
    payload.contactos
  );
}

function denyAccess(
  page
) {
  page.replaceChildren();

  const message =
    document.createElement('div');

  message.className =
    'card';

  message.textContent =
    'Acceso denegado.';

  page.appendChild(
    message
  );
}

function setProcessing(
  elements,
  processing
) {
  elements.guardar.disabled =
    processing;

  elements.cancelar.disabled =
    processing;

  elements.agregarContacto.disabled =
    processing;

  elements.form
    .querySelectorAll(
      'input, select, button'
    )
    .forEach(control => {
      if (
        control ===
          elements.guardar ||
        control ===
          elements.cancelar ||
        control ===
          elements.agregarContacto
      ) {
        return;
      }

      control.disabled =
        processing;
    });

  elements.guardar.textContent =
    processing
      ? 'Guardando...'
      : 'Guardar';
}

function populateForm(
  elements,
  registro
) {
  elements.nombres.value =
    registro.nombres || '';

  elements.apellidos.value =
    registro.apellidos || '';

  elements.evento.value =
    registro.evento || '';

  elements.contactos
    .replaceChildren();

  const contactos =
    Array.isArray(
      registro.contactos
    )
      ? registro.contactos
      : [];

  contactos.forEach(
    contacto => {
      elements.contactos
        .appendChild(
          createContactoRow(
            contacto
          )
        );
    }
  );

  /*
   * Si el registro no tiene contactos,
   * conservamos una fila vacía para
   * facilitar la captura.
   */
  if (
    contactos.length === 0
  ) {
    elements.contactos
      .appendChild(
        createContactoRow()
      );
  }
}

function getPayload(
  elements
) {
  return {
    nombres:
      elements.nombres
        .value.trim(),

    apellidos:
      elements.apellidos
        .value.trim(),

    contactos:
      collectContactos(
        elements.contactos
      ),

    evento:
      elements.evento
        .value.trim()
  };
}

function getFriendlySaveError(
  error
) {
  switch (error?.code) {
    case 'VERSION_CONFLICT':
      return (
        'El registro fue modificado por otro usuario. ' +
        'Vuelve al detalle y carga nuevamente la información.'
      );

    case 'NOT_FOUND':
      return (
        'El cliente o prospecto ya no existe.'
      );

    default:
      return (
        error?.message ||
        'No fue posible guardar el registro.'
      );
  }
}

export async function init() {
  const elements =
    getElements();

  if (
    !elements.page ||
    !elements.form
  ) {
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
    denyAccess(
      elements.page
    );

    return;
  }

  let version = null;

  elements.agregarContacto
    .addEventListener(
      'click',
      () => {
        elements.contactos
          .appendChild(
            createContactoRow()
          );
      }
    );

  elements.cancelar
    .addEventListener(
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
    elements.title.textContent =
      'Editar cliente o prospecto';

    elements.description.textContent =
      'Actualiza únicamente la información permitida del registro.';

    showLoader();

    try {
      const registro =
        await getClienteProspecto(
          id
        );

      version =
        registro.version;

      populateForm(
        elements,
        registro
      );

    } catch (error) {
      console.error(
        'No fue posible cargar el registro:',
        error
      );

      elements.form.hidden =
        true;

      showNotification(
        'No fue posible cargar el cliente o prospecto.',
        {
          type: 'error'
        }
      );

      return;

    } finally {
      hideLoader();
    }

  } else {
    elements.title.textContent =
      'Nuevo prospecto';

    elements.description.textContent =
      'Captura la información disponible. El registro se guardará inicialmente como Prospecto.';

    elements.contactos
      .appendChild(
        createContactoRow()
      );
  }

  elements.form.addEventListener(
    'submit',
    async event => {
      event.preventDefault();

      clearErrors(
        elements
      );

      const payload =
        getPayload(
          elements
        );

      const validationErrors =
        validatePayload(
          payload
        );

      if (
        validationErrors.length > 0
      ) {
        showErrors(
          elements,
          validationErrors
        );

        return;
      }

      setProcessing(
        elements,
        true
      );

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

        showNotification(
          editing
            ? 'Información actualizada correctamente.'
            : 'Prospecto registrado correctamente.',
          {
            type: 'success'
          }
        );

        location.hash =
          `#/clientes/detalle?id=${encodeURIComponent(
            resultado.id
          )}`;

      } catch (error) {
        console.error(
          'No fue posible guardar el registro:',
          error
        );

        showErrors(
          elements,
          [
            getFriendlySaveError(
              error
            )
          ]
        );

      } finally {
        setProcessing(
          elements,
          false
        );
      }
    }
  );
}

export default {
  init
};