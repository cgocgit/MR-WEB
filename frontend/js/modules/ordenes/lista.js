import {
  cancelarOrden,
  listOrdenes
} from '../../api/ordenes.service.js';

import {
  ESTADO_ORDEN_LABELS,
  ESTADOS_ORDEN,
  PERMISOS_ORDENES,
  TIPO_COMPROMISO_ORDEN_LABELS
} from '../../api/ordenes.constants.js';

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
  abrirModalCancelacion
} from './cancelacion-modal.js';

import {
  crearBadge,
  escaparHtml,
  formatearFechaHora,
  normalizarEstadoVisible,
  obtenerClaseEstadoLogistico,
  obtenerClaseEstadoOrden,
  obtenerClaseEstadoReserva,
  obtenerEtiquetaEstadoOrden,
  obtenerEtiquetaTipoCompromiso,
  valorDisponible
} from './ordenes-ui.js';

const CONTEXTO_KEY =
  'mr_ordenes_lista_contexto';

const TAMANIO_PAGINA = 10;

let paginaActual = 1;
let resultados = [];
let restaurarScroll = 0;

const el =
  id =>
    document.getElementById(id);

function esModoAsignadas() {
  const query =
    new URLSearchParams(
      (
        location.hash.split('?')[1] ||
        ''
      )
    );

  return (
    query.get('modo') ===
    'asignadas'
  );
}

function puedeRevisar() {
  return hasPermission(
    getSession(),
    PERMISOS_ORDENES.REVISAR
  );
}

function puedeCancelar() {
  return hasPermission(
    getSession(),
    PERMISOS_ORDENES.CANCELAR
  );
}

function filtrosActuales() {
  return {
    busqueda:
      el('filtroOrdenBusqueda')
        ?.value?.trim() || '',

    estadoOrden:
      el('filtroOrdenEstado')
        ?.value || '',

    fechaEvento:
      el('filtroOrdenFecha')
        ?.value || '',

    tipoCompromiso:
      el('filtroOrdenTipo')
        ?.value || '',

    estadoReserva:
      el('filtroOrdenReserva')
        ?.value || '',

    estadoLogistico:
      el('filtroOrdenLogistica')
        ?.value || ''
  };
}

function guardarContexto() {
  sessionStorage.setItem(
    CONTEXTO_KEY,
    JSON.stringify({
      filtros:
        filtrosActuales(),

      pagina:
        paginaActual,

      ordenamiento:
        el(
          'ordenesOrdenamiento'
        )?.value ||
        'EVENTO_ASC',

      scrollY:
        window.scrollY,

      hashLista:
        location.hash
    })
  );
}

function restaurarContexto() {
  try {
    const contexto =
      JSON.parse(
        sessionStorage.getItem(
          CONTEXTO_KEY
        ) || 'null'
      );

    if (!contexto) {
      return;
    }

    const filtros =
      contexto.filtros || {};

    const mapa = {
      filtroOrdenBusqueda:
        filtros.busqueda,

      filtroOrdenEstado:
        filtros.estadoOrden,

      filtroOrdenFecha:
        filtros.fechaEvento,

      filtroOrdenTipo:
        filtros.tipoCompromiso,

      filtroOrdenReserva:
        filtros.estadoReserva,

      filtroOrdenLogistica:
        filtros.estadoLogistico
    };

    Object.entries(
      mapa
    ).forEach(
      ([id, valor]) => {
        const control =
          el(id);

        if (
          control &&
          valor !== undefined
        ) {
          control.value =
            valor || '';
        }
      }
    );

    paginaActual =
      Number(
        contexto.pagina
      ) || 1;

    const ordenamiento =
      el(
        'ordenesOrdenamiento'
      );

    if (ordenamiento) {
      ordenamiento.value =
        contexto.ordenamiento ||
        'EVENTO_ASC';
    }

    restaurarScroll =
      Number(
        contexto.scrollY
      ) || 0;
  } catch (_error) {
    sessionStorage.removeItem(
      CONTEXTO_KEY
    );
  }
}

function hayFiltrosActivos() {
  const filtros =
    filtrosActuales();

  return Object.values(
    filtros
  ).some(
    valor =>
      String(
        valor ?? ''
      ).trim() !== ''
  );
}

function ordenarResultados() {
  const criterio =
    el(
      'ordenesOrdenamiento'
    )?.value ||
    'EVENTO_ASC';

  const fechaEvento =
    orden =>
      String(
        orden.fechaHoraEvento ||
        orden.fechaEntrega ||
        ''
      );

  const actualizacion =
    orden =>
      String(
        orden.fechaUltimaActualizacion ||
        ''
      );

  resultados.sort(
    (a, b) => {
      switch (criterio) {
        case 'EVENTO_DESC':
          return fechaEvento(b)
            .localeCompare(
              fechaEvento(a)
            );

        case 'ACTUALIZACION_DESC':
          return actualizacion(b)
            .localeCompare(
              actualizacion(a)
            );

        case 'FOLIO_ASC':
          return String(
            a.folio || ''
          ).localeCompare(
            String(
              b.folio || ''
            ),
            'es-MX'
          );

        case 'EVENTO_ASC':
        default:
          return fechaEvento(a)
            .localeCompare(
              fechaEvento(b)
            );
      }
    }
  );
}

function llenarSelects() {
  const estado =
    el('filtroOrdenEstado');

  if (estado) {
    estado.innerHTML = `
      <option value="">
        Todos los estados
      </option>

      ${Object.values(
        ESTADOS_ORDEN
      )
        .map(
          valor => `
            <option
              value="${valor}"
            >
              ${escaparHtml(
                ESTADO_ORDEN_LABELS[
                  valor
                ]
              )}
            </option>
          `
        )
        .join('')}
    `;
  }

  const tipo =
    el('filtroOrdenTipo');

  if (tipo) {
    tipo.innerHTML = `
      <option value="">
        Todos
      </option>

      ${Object.entries(
        TIPO_COMPROMISO_ORDEN_LABELS
      )
        .map(
          ([valor, etiqueta]) => `
            <option
              value="${valor}"
            >
              ${escaparHtml(
                etiqueta
              )}
            </option>
          `
        )
        .join('')}
    `;
  }
}

function mostrarCarga() {
  const estado =
    el('ordenesListaEstado');

  const contenido =
    el('ordenesListaContenido');

  estado.className =
    'ordenes-state ordenes-state--loading';

  estado.innerHTML = `
    <strong>
      Cargando Órdenes de servicio...
    </strong>
    <p>
      Consultando información de seguimiento.
    </p>
  `;

  estado.hidden = false;
  contenido.hidden = true;
}

function mostrarError(
  mensaje
) {
  const estado =
    el('ordenesListaEstado');

  const contenido =
    el('ordenesListaContenido');

  estado.className =
    'ordenes-state ordenes-state--error';

  estado.innerHTML = `
    <strong>
      No fue posible consultar las Órdenes.
    </strong>

    <p>
      ${escaparHtml(mensaje)}
    </p>

    <button
      type="button"
      class="
        ordenes-btn
        ordenes-btn--secondary
      "
      data-reintentar-lista
    >
      Reintentar
    </button>
  `;

  estado.hidden = false;
  contenido.hidden = true;
}

function mostrarContenido() {
  el(
    'ordenesListaEstado'
  ).hidden = true;

  el(
    'ordenesListaContenido'
  ).hidden = false;
}

function accionesHtml(
  orden
) {
  const acciones = [];

  if (
    puedeRevisar() &&
    orden.estadoOrden ===
      ESTADOS_ORDEN
        .EN_REVISION_VENTAS
  ) {
    acciones.push(`
      <button
        type="button"
        data-revisar-orden="${orden.id}"
      >
        Revisar
      </button>
    `);
  }

  if (
    puedeCancelar() &&
    orden.cancelable === true
  ) {
    acciones.push(`
      <button
        type="button"
        class="ordenes-menu-danger"
        data-cancelar-orden="${orden.id}"
      >
        Cancelar
      </button>
    `);
  }

  if (!acciones.length) {
    return '';
  }

  return `
    <details
      class="ordenes-menu"
    >
      <summary
        aria-label="Más acciones"
        title="Más acciones"
      >
        ⋮
      </summary>

      <div
        class="ordenes-menu-panel"
      >
        ${acciones.join('')}
      </div>
    </details>
  `;
}

function filaHtml(
  orden
) {
  return `
    <tr>
      <td>
        <button
          class="ordenes-link-button"
          type="button"
          data-ver-orden="${orden.id}"
        >
          ${escaparHtml(
            orden.folio
          )}
        </button>
      </td>

      <td>
        ${crearBadge(
          obtenerEtiquetaEstadoOrden(
            orden.estadoOrden
          ),
          obtenerClaseEstadoOrden(
            orden.estadoOrden
          )
        )}
      </td>

      <td>
        ${crearBadge(
          valorDisponible(
            orden
              .inventarioRelacionado
              ?.estadoResumen
          ),
          obtenerClaseEstadoReserva(
            orden
              .inventarioRelacionado
              ?.estadoResumen
          )
        )}
      </td>

      <td>
        ${crearBadge(
          normalizarEstadoVisible(
            valorDisponible(
              orden
                .logisticaRelacionada
                ?.estadoLogistico
            )
          ),
          obtenerClaseEstadoLogistico(
            orden
              .logisticaRelacionada
              ?.estadoLogistico
          )
        )}
      </td>

      <td>
        <strong>
          ${escaparHtml(
            valorDisponible(
              orden.cliente
            )
          )}
        </strong>
        <small>
          ${escaparHtml(
            valorDisponible(
              orden.contactoEvento
            )
          )}
        </small>
      </td>

      <td>
      ${escaparHtml(
        formatearFechaHora(
          orden.fechaHoraEvento ||
          orden.fechaEntrega
        )
      )}
    </td>

    <td>
      ${escaparHtml(
        valorDisponible(
          orden.domicilioEvento ||
          orden.direccionEntrega
        )
      )}
    </td>

    <td>
      ${escaparHtml(
        obtenerEtiquetaTipoCompromiso(
          orden.tipoCompromiso
        )
      )}
    </td>

      <td>
        ${escaparHtml(
          valorDisponible(
            orden.cotizacionOrigen
              ?.folio
          )
        )}
        <small>
          ${escaparHtml(
            valorDisponible(
              orden.cotizacionOrigen
                ?.versionConfirmada
            )
          )}
        </small>
      </td>

      <td>
        ${escaparHtml(
          formatearFechaHora(
            orden
              .fechaUltimaActualizacion
          )
        )}
      </td>

      <td>
        <div
          class="ordenes-row-actions"
        >
          <button
            type="button"
            class="
              ordenes-btn
              ordenes-btn--secondary
              ordenes-btn--small
            "
            data-ver-orden="${orden.id}"
          >
            Ver detalle
          </button>

          ${accionesHtml(
            orden
          )}
        </div>
      </td>
    </tr>
  `;
}

function tarjetaHtml(
  orden
) {
  return `
    <article
      class="ordenes-mobile-card"
    >
      <div
        class="ordenes-mobile-card-header"
      >
        <strong>
          ${escaparHtml(
            orden.folio
          )}
        </strong>

        ${crearBadge(
          obtenerEtiquetaEstadoOrden(
            orden.estadoOrden
          ),
          obtenerClaseEstadoOrden(
            orden.estadoOrden
          )
        )}
      </div>

      <h3>
        ${escaparHtml(
          valorDisponible(
            orden.cliente
          )
        )}
      </h3>

      <p>
        ${escaparHtml(
          formatearFechaHora(
            orden.fechaHoraEvento ||
            orden.fechaEntrega
          )
        )}
      </p>

      <div
        class="ordenes-status-group"
      >
        <div>
          <span>Reserva</span>
          ${crearBadge(
            valorDisponible(
              orden
                .inventarioRelacionado
                ?.estadoResumen
            ),
            obtenerClaseEstadoReserva(
              orden
                .inventarioRelacionado
                ?.estadoResumen
            )
          )}
        </div>

        <div>
          <span>Logística</span>
          ${crearBadge(
            normalizarEstadoVisible(
              valorDisponible(
                orden
                  .logisticaRelacionada
                  ?.estadoLogistico
              )
            ),
            obtenerClaseEstadoLogistico(
              orden
                .logisticaRelacionada
                ?.estadoLogistico
            )
          )}
        </div>
      </div>

      <div
        class="ordenes-mobile-actions"
      >
        <button
          type="button"
          class="
            ordenes-btn
            ordenes-btn--primary
          "
          data-ver-orden="${orden.id}"
        >
          Ver detalle
        </button>

        ${accionesHtml(
          orden
        )}
      </div>
    </article>
  `;
}

function renderPaginacion() {
  const total =
    resultados.length;

  const totalPaginas =
    Math.max(
      1,
      Math.ceil(
        total /
        TAMANIO_PAGINA
      )
    );

  if (
    paginaActual >
    totalPaginas
  ) {
    paginaActual =
      totalPaginas;
  }

  el(
    'ordenesPaginacionInfo'
  ).textContent =
    total === 0
      ? 'Sin resultados'
      : `Página ${paginaActual} de ${totalPaginas}`;

  el(
    'btnOrdenesAnterior'
  ).disabled =
    paginaActual <= 1;

  el(
    'btnOrdenesSiguiente'
  ).disabled =
    paginaActual >=
      totalPaginas ||
    total === 0;
}

function renderResultados() {
  const total =
    resultados.length;

  const inicio =
    (
      paginaActual - 1
    ) *
    TAMANIO_PAGINA;

  const pagina =
    resultados.slice(
      inicio,
      inicio +
      TAMANIO_PAGINA
    );

  el(
    'ordenesResultadosConteo'
  ).textContent =
    `${total} ${
      total === 1
        ? 'Orden'
        : 'Órdenes'
    }`;

  el(
    'ordenesBody'
  ).innerHTML =
    pagina
      .map(filaHtml)
      .join('');

  el(
    'ordenesMobile'
  ).innerHTML =
    pagina
      .map(tarjetaHtml)
      .join('');

  const empty =
    el(
      'ordenesEmpty'
    );

  empty.hidden =
    total > 0;

  if (total === 0) {
    empty.innerHTML =
      hayFiltrosActivos()
        ? `
          <strong>
            Sin resultados para los filtros aplicados.
          </strong>

          <p>
            Ajusta o limpia los filtros para consultar otros registros.
          </p>
        `
        : `
          <strong>
            Sin Órdenes registradas.
          </strong>

          <p>
            No existen Órdenes de servicio disponibles para consulta.
          </p>
        `;
  }

  renderPaginacion();
}

async function cargar({
  reiniciarPagina = false
} = {}) {
  if (
    reiniciarPagina
  ) {
    paginaActual = 1;
  }

  mostrarCarga();

  try {
    resultados =
      await listOrdenes(
        filtrosActuales(),
        {
          soloAsignadas:
            esModoAsignadas()
        }
      );

    ordenarResultados();

    renderResultados();
    mostrarContenido();

    if (
      restaurarScroll > 0
    ) {
      requestAnimationFrame(
        () => {
          window.scrollTo(
            0,
            restaurarScroll
          );

          restaurarScroll = 0;
        }
      );
    }
  } catch (error) {
    mostrarError(
      error?.message ||
      'Ocurrió un error inesperado.'
    );
  }
}

function limpiarFiltros() {
  [
    'filtroOrdenBusqueda',
    'filtroOrdenEstado',
    'filtroOrdenFecha',
    'filtroOrdenTipo',
    'filtroOrdenReserva',
    'filtroOrdenLogistica'
  ].forEach(
    id => {
      const control =
        el(id);

      if (control) {
        control.value = '';
      }
    }
  );

  cargar({
    reiniciarPagina: true
  });
}

async function abrirCancelacion(
  idOrden
) {
  const orden =
    resultados.find(
      item =>
        Number(item.id) ===
        Number(idOrden)
    );

  if (!orden) {
    return;
  }

  abrirModalCancelacion({
    orden,

    onConfirmar:
      async motivo => {
        await cancelarOrden(
          idOrden,
          motivo
        );

        showNotification(
          'La Orden fue cancelada correctamente.'
        );

        await cargar();
      }
  });
}

function registrarEventos() {
  el(
    'ordenesFiltrosForm'
  )?.addEventListener(
    'submit',
    event => {
      event.preventDefault();

      cargar({
        reiniciarPagina: true
      });
    }
  );

  el(
    'btnLimpiarOrdenes'
  )?.addEventListener(
    'click',
    limpiarFiltros
  );

  el(
    'btnOrdenesAnterior'
  )?.addEventListener(
    'click',
    () => {
      if (
        paginaActual > 1
      ) {
        paginaActual -= 1;
        renderResultados();
      }
    }
  );

  el(
    'btnOrdenesSiguiente'
  )?.addEventListener(
    'click',
    () => {
      paginaActual += 1;
      renderResultados();
    }
  );

  el(
    'ordenesOrdenamiento'
  )?.addEventListener(
    'change',
    () => {
      paginaActual = 1;

      ordenarResultados();

      renderResultados();
    }
  );
  
  document.addEventListener(
    'click',
    event => {
      const ver =
        event.target.closest(
          '[data-ver-orden]'
        );

      if (ver) {
        guardarContexto();

        location.hash =
          `#/ordenes/detalle?id=${
            ver.dataset.verOrden
          }`;

        return;
      }

      const revisar =
        event.target.closest(
          '[data-revisar-orden]'
        );

      if (revisar) {
        guardarContexto();

        location.hash =
          `#/ordenes/revision?id=${
            revisar.dataset
              .revisarOrden
          }`;

        return;
      }

      const cancelar =
        event.target.closest(
          '[data-cancelar-orden]'
        );

      if (cancelar) {
        abrirCancelacion(
          cancelar.dataset
            .cancelarOrden
        );

        return;
      }

      const reintentar =
        event.target.closest(
          '[data-reintentar-lista]'
        );

      if (reintentar) {
        cargar();
      }
    }
  );
}

export async function init() {
  llenarSelects();
  restaurarContexto();

  const titulo =
    el('ordenesListaTitulo');

  const subtitulo =
    el('ordenesListaSubtitulo');

  if (
    esModoAsignadas()
  ) {
    titulo.textContent =
      'Mis Órdenes asignadas';

    subtitulo.textContent =
      'Consulta exclusivamente las Órdenes asignadas a tu operación.';
  }

  registrarEventos();
  await cargar();
}