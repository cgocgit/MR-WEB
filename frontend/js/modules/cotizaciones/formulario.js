import {
  createCotizacion
} from '../../api/cotizaciones.service.js';

import {
  createProspecto,
  getClienteProspecto,
  listClientesProspectos
} from '../../api/clientes.service.js';

import {
  TIPOS_MEDIO_CONTACTO
} from '../../api/clientes.constants.js';

import {
  getSession
} from '../../shared/auth-guard.js';

import {
  hasPermission
} from '../../shared/permissions.js';

import {
  PERMISOS_COTIZACIONES
} from '../../api/cotizaciones.constants.js';

import {
  escaparHtml,
  obtenerIniciales
} from './cotizaciones-ui.js';

import {
  openModal
} from '../../components/modal.js';

import {
  showNotification
} from '../../components/notification.js';

const el = id =>
  document.getElementById(id);

let clienteSeleccionado = null;
let secuenciaBusqueda = 0;
let temporizadorBusqueda = null;
let guardando = false;

function tieneGestionCotizaciones() {
  return hasPermission(
    getSession(),
    PERMISOS_COTIZACIONES.GESTIONAR
  );
}

function puedeRegistrarProspecto() {
  return hasPermission(
    getSession(),
    'clientes.registrar'
  );
}

function nombreRegistro(registro) {
  return [
    registro?.nombres,
    registro?.apellidos
  ]
    .filter(Boolean)
    .join(' ')
    .trim() || 'Sin nombre';
}

function contactoPorTipo(
  registro,
  tipos
) {
  const permitidos =
    new Set(tipos);

  return (
    registro?.contactos?.find(
      contacto =>
        permitidos.has(
          contacto.tipoMedioContacto
        )
    )?.medioContacto ||
    ''
  );
}

function correoRegistro(registro) {
  return contactoPorTipo(
    registro,
    [
      TIPOS_MEDIO_CONTACTO.EMAIL
    ]
  );
}

function telefonoRegistro(registro) {
  return contactoPorTipo(
    registro,
    [
      TIPOS_MEDIO_CONTACTO.CELULAR,
      TIPOS_MEDIO_CONTACTO.TELEFONO
    ]
  );
}

function normalizarTexto(valor) {
  return String(valor || '')
    .trim()
    .toLocaleLowerCase('es-MX');
}

function normalizarTelefono(valor) {
  return String(valor || '')
    .replace(/\D/g, '');
}

function correoValido(correo) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    .test(
      String(correo || '').trim()
    );
}

function limpiarResultadosBusqueda() {
  const resultados =
    el('resultadosClienteProspecto');

  const empty =
    el(
      'resultadosClienteProspectoEmpty'
    );

  if (resultados) {
    resultados.innerHTML = '';
  }

  if (empty) {
    empty.hidden = false;

    empty.innerHTML = `
      <strong>
        Busca un cliente o prospecto.
      </strong>

      <p>
        Los resultados existentes aparecerán aquí.
      </p>
    `;
  }
}

function renderResultadosBusqueda(items) {
  const resultados =
    el('resultadosClienteProspecto');

  const empty =
    el(
      'resultadosClienteProspectoEmpty'
    );

  if (!resultados || !empty) {
    return;
  }

  if (!items.length) {
    resultados.innerHTML = '';

    empty.hidden = false;

    empty.innerHTML = `
      <strong>
        No se encontraron coincidencias.
      </strong>

      <p>
        Verifica la búsqueda o registra un Prospecto
        si cuentas con permiso.
      </p>
    `;

    return;
  }

  empty.hidden = true;

  resultados.innerHTML =
    items
      .map(registro => {
        const correo =
          correoRegistro(registro);

        const telefono =
          telefonoRegistro(registro);

        return `
          <article
            class="cotizaciones-card"
          >
            <div
              class="cotizaciones-card-body"
            >
              <div
                class="cotizaciones-toolbar"
              >
                <div>
                  <strong>
                    ${escaparHtml(
                      nombreRegistro(registro)
                    )}
                  </strong>

                  <p
                    class="cotizaciones-subtitle"
                  >
                    ${escaparHtml(
                      registro.estado ||
                      'Registro'
                    )}

                    ${
                      correo
                        ? ` · ${escaparHtml(correo)}`
                        : ''
                    }

                    ${
                      telefono
                        ? ` · ${escaparHtml(telefono)}`
                        : ''
                    }
                  </p>
                </div>

                <button
                  type="button"
                  class="
                    cotizaciones-btn
                    cotizaciones-btn--secondary
                  "
                  data-seleccionar-cliente="${
                    Number(registro.id)
                  }"
                >
                  Seleccionar
                </button>
              </div>
            </div>
          </article>
        `;
      })
      .join('');
}

function renderClienteSeleccionado() {
  const contenedor =
    el('clienteSeleccionado');

  const contenido =
    el(
      'clienteSeleccionadoContenido'
    );

  const resultados =
    el('clienteBusquedaResultados');

  if (
    !contenedor ||
    !contenido
  ) {
    return;
  }

  if (!clienteSeleccionado) {
    contenedor.hidden = true;

    contenido.innerHTML = '';

    if (resultados) {
      resultados.hidden = false;
    }

    return;
  }

  const nombre =
    nombreRegistro(
      clienteSeleccionado
    );

  const correo =
    correoRegistro(
      clienteSeleccionado
    );

  const telefono =
    telefonoRegistro(
      clienteSeleccionado
    );

  contenido.innerHTML = `
    <div
      class="cotizaciones-toolbar"
    >
      <div
        class="cotizaciones-toolbar-group"
      >
        <span
          class="
            cotizaciones-badge
            cotizaciones-badge--selected
          "
        >
          ${escaparHtml(
            obtenerIniciales(nombre)
          )}
        </span>

        <div>
          <strong>
            ${escaparHtml(nombre)}
          </strong>

          <p
            class="cotizaciones-subtitle"
          >
            ${escaparHtml(
              clienteSeleccionado.estado ||
              'Registro'
            )}

            ${
              correo
                ? ` · ${escaparHtml(correo)}`
                : ''
            }

            ${
              telefono
                ? ` · ${escaparHtml(telefono)}`
                : ''
            }
          </p>
        </div>
      </div>
    </div>
  `;

  contenedor.hidden = false;

  if (resultados) {
    resultados.hidden = true;
  }
}

async function seleccionarCliente(id) {
  try {
    clienteSeleccionado =
      await getClienteProspecto(id);

    renderClienteSeleccionado();
  } catch (error) {
    showNotification(
      error?.message ||
      'No fue posible seleccionar el cliente o prospecto.',
      {
        type: 'error'
      }
    );
  }
}

function quitarClienteSeleccionado() {
  clienteSeleccionado = null;

  renderClienteSeleccionado();

  const buscador =
    el('buscarClienteProspecto');

  if (buscador) {
    buscador.value = '';
    buscador.focus();
  }

  limpiarResultadosBusqueda();
}

async function buscarClienteProspecto() {
  const secuencia =
    ++secuenciaBusqueda;

  const texto =
    String(
      el(
        'buscarClienteProspecto'
      )?.value || ''
    ).trim();

  if (texto.length < 2) {
    limpiarResultadosBusqueda();
    return;
  }

  try {
    const respuesta =
      await listClientesProspectos(
        {
          busqueda: texto
        },
        {
          pagina: 1,
          tamanio: 8
        }
      );

    if (
      secuencia !==
      secuenciaBusqueda
    ) {
      return;
    }

    renderResultadosBusqueda(
      respuesta.items || []
    );
  } catch (error) {
    if (
      secuencia !==
      secuenciaBusqueda
    ) {
      return;
    }

    showNotification(
      error?.message ||
      'No fue posible buscar clientes o prospectos.',
      {
        type: 'error'
      }
    );
  }
}

function programarBusqueda() {
  clearTimeout(
    temporizadorBusqueda
  );

  temporizadorBusqueda =
    setTimeout(
      buscarClienteProspecto,
      250
    );
}

async function buscarCoincidenciaExacta(
  correo,
  telefono
) {
  const correoBuscado =
    normalizarTexto(correo);

  const telefonoBuscado =
    normalizarTelefono(telefono);

  const respuesta =
    await listClientesProspectos(
      {},
      {
        pagina: 1,
        tamanio: 100
      }
    );

  return (
    respuesta.items || []
  ).find(registro => {
    const correoExistente =
      normalizarTexto(
        correoRegistro(registro)
      );

    const telefonoExistente =
      normalizarTelefono(
        telefonoRegistro(registro)
      );

    return (
      (
        correoBuscado &&
        correoExistente ===
          correoBuscado
      ) ||
      (
        telefonoBuscado &&
        telefonoExistente ===
          telefonoBuscado
      )
    );
  }) || null;
}

async function altaRapidaProspecto() {
  if (
    !puedeRegistrarProspecto()
  ) {
    showNotification(
      'No cuenta con permiso para registrar Prospectos.',
      {
        type: 'error'
      }
    );

    return;
  }

  const respuesta =
    await openModal({
      title:
        'Alta rápida de Prospecto',

      body: `
        <div
          class="cotizaciones-grid"
        >
          <div
            class="cotizaciones-field"
          >
            <label
              for="altaProspectoNombre"
            >
              Nombre *
            </label>

            <input
              id="altaProspectoNombre"
              type="text"
              autocomplete="name"
            >
          </div>

          <div
            class="cotizaciones-field"
          >
            <label
              for="altaProspectoCorreo"
            >
              Correo *
            </label>

            <input
              id="altaProspectoCorreo"
              type="email"
              autocomplete="email"
            >
          </div>

          <div
            class="cotizaciones-field"
          >
            <label
              for="altaProspectoTelefono"
            >
              Teléfono *
            </label>

            <input
              id="altaProspectoTelefono"
              type="tel"
              autocomplete="tel"
            >
          </div>
        </div>
      `,

      confirmText:
        'Guardar prospecto',

      cancelText:
        'Cancelar'
    });

  if (!respuesta.confirmed) {
    return;
  }

  const nombre =
    String(
      respuesta.values
        ?.altaProspectoNombre ||
      ''
    ).trim();

  const correo =
    String(
      respuesta.values
        ?.altaProspectoCorreo ||
      ''
    ).trim();

  const telefono =
    String(
      respuesta.values
        ?.altaProspectoTelefono ||
      ''
    ).trim();

  if (
    !nombre ||
    !correo ||
    !telefono
  ) {
    showNotification(
      'Nombre, correo y teléfono son obligatorios.',
      {
        type: 'error'
      }
    );

    return;
  }

  if (!correoValido(correo)) {
    showNotification(
      'El correo no tiene un formato válido.',
      {
        type: 'error'
      }
    );

    return;
  }

  try {
    const coincidencia =
      await buscarCoincidenciaExacta(
        correo,
        telefono
      );

    if (coincidencia) {
      clienteSeleccionado =
        coincidencia;

      renderClienteSeleccionado();

      showNotification(
        'Ya existe un cliente o prospecto con el mismo correo o teléfono. Se seleccionó el registro existente.',
        {
          type: 'info',
          timeout: 5000
        }
      );

      return;
    }

    clienteSeleccionado =
      await createProspecto({
        nombres: nombre,
        apellidos: '',
        evento: '',

        contactos: [
          {
            tipoMedioContacto:
              TIPOS_MEDIO_CONTACTO.EMAIL,

            medioContacto:
              correo
          },

          {
            tipoMedioContacto:
              TIPOS_MEDIO_CONTACTO.CELULAR,

            medioContacto:
              telefono
          }
        ]
      });

    renderClienteSeleccionado();

    showNotification(
      'Prospecto registrado y seleccionado correctamente.',
      {
        type: 'success'
      }
    );
  } catch (error) {
    showNotification(
      error?.message ||
      'No fue posible registrar el Prospecto.',
      {
        type: 'error'
      }
    );
  }
}

function validarFormulario() {
  if (!clienteSeleccionado) {
    showNotification(
      'Selecciona un Cliente o Prospecto.',
      {
        type: 'error'
      }
    );

    return false;
  }

  const fechaEvento =
    String(
      el(
        'fechaEventoCotizacion'
      )?.value || ''
    ).trim();

  const horaEvento =
    String(
      el(
        'horaEventoCotizacion'
      )?.value || ''
    ).trim();

  const porcentaje =
    Number(
      el(
        'porcentajeConfirmacion'
      )?.value
    );

  if (!fechaEvento) {
    showNotification(
      'La fecha del servicio es obligatoria.',
      {
        type: 'error'
      }
    );

    return false;
  }

  if (!horaEvento) {
    showNotification(
      'La hora del servicio es obligatoria.',
      {
        type: 'error'
      }
    );

    return false;
  }

  if (
    !Number.isFinite(porcentaje) ||
    porcentaje < 0 ||
    porcentaje > 100
  ) {
    showNotification(
      'El porcentaje de confirmación debe estar entre 0 y 100.',
      {
        type: 'error'
      }
    );

    return false;
  }

  return true;
}

async function crearCotizacion() {
  if (
    guardando ||
    !validarFormulario()
  ) {
    return;
  }

  guardando = true;

  const boton =
    el('btnCrearCotizacion');

  if (boton) {
    boton.disabled = true;
  }

  try {
    const cotizacion =
      await createCotizacion({
        idClienteProspecto:
          Number(
            clienteSeleccionado.id
          ),

        evento:
          clienteSeleccionado.evento ||
          '',

        fechaEvento:
          el(
            'fechaEventoCotizacion'
          ).value,

        horaEvento:
          el(
            'horaEventoCotizacion'
          ).value,

        porcentajeConfirmacion:
          Number(
            el(
              'porcentajeConfirmacion'
            ).value
          )
      });

    const versionInicial =
      cotizacion.versiones?.find(
        version =>
          Number(
            version.numeroVersion
          ) === 1
      );

    if (!versionInicial) {
      throw new Error(
        'No fue posible identificar la versión V1 creada.'
      );
    }

    showNotification(
      'Cotización creada correctamente.',
      {
        type: 'success'
      }
    );

    location.hash =
      `#/cotizaciones/version` +
      `?idCotizacion=${
        Number(
          cotizacion.idCotizacion
        )
      }` +
      `&idVersion=${
        Number(
          versionInicial.idVersion
        )
      }`;
  } catch (error) {
    showNotification(
      error?.message ||
      'No fue posible crear la cotización.',
      {
        type: 'error'
      }
    );
  } finally {
    guardando = false;

    if (boton) {
      boton.disabled = false;
    }
  }
}

function volverCotizaciones() {
  location.hash =
    '#/cotizaciones';
}

function registrarEventos() {
  el(
    'btnCancelarNuevaCotizacion'
  )?.addEventListener(
    'click',
    volverCotizaciones
  );

  document
    .querySelector(
      '[data-volver-cotizaciones]'
    )
    ?.addEventListener(
      'click',
      volverCotizaciones
    );

  el(
    'buscarClienteProspecto'
  )?.addEventListener(
    'input',
    programarBusqueda
  );

  el(
    'resultadosClienteProspecto'
  )?.addEventListener(
    'click',
    event => {
      const boton =
        event.target.closest(
          '[data-seleccionar-cliente]'
        );

      if (!boton) {
        return;
      }

      seleccionarCliente(
        Number(
          boton.dataset
            .seleccionarCliente
        )
      );
    }
  );

  el(
    'btnQuitarCliente'
  )?.addEventListener(
    'click',
    quitarClienteSeleccionado
  );

  const btnAlta =
    el(
      'btnAltaRapidaProspecto'
    );

  if (btnAlta) {
    btnAlta.hidden =
      !puedeRegistrarProspecto();

    btnAlta.addEventListener(
      'click',
      altaRapidaProspecto
    );
  }

  el(
    'nuevaCotizacionForm'
  )?.addEventListener(
    'submit',
    event => {
      event.preventDefault();
      crearCotizacion();
    }
  );
}

export function init() {
  /*
   * Cada apertura de Nueva Cotización
   * comienza con contexto independiente.
   */
  clienteSeleccionado = null;
  guardando = false;

  clearTimeout(
    temporizadorBusqueda
  );

  temporizadorBusqueda = null;

  /*
   * Invalida búsquedas pendientes de una
   * instancia anterior de la pantalla.
   */
  secuenciaBusqueda += 1;

  if (
    !tieneGestionCotizaciones()
  ) {
    showNotification(
      'No cuenta con permiso para crear cotizaciones.',
      {
        type: 'error'
      }
    );

    location.hash =
      '#/cotizaciones';

    return;
  }

  renderClienteSeleccionado();
  limpiarResultadosBusqueda();
  registrarEventos();
}