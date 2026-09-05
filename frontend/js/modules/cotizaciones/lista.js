import {
  searchCotizaciones
} from '../../api/cotizaciones.service.js';

import {
  getClienteProspecto,
  listClientesProspectos
} from '../../api/clientes.service.js';

import {
  getSession
} from '../../shared/auth-guard.js';

import {
  hasPermission
} from '../../shared/permissions.js';

import {
  DISPONIBILIDAD_COTIZACION,
  ESTADOS_COTIZACION_GENERAL,
  PERMISOS_COTIZACIONES
} from '../../api/cotizaciones.constants.js';

import {
  construirFolioCotizacion,
  crearBadge,
  escaparHtml,
  formatearFechaHora,
  formatearMoneda,
  obtenerClaseEstadoGeneral,
  obtenerEtiquetaEstadoGeneral
} from './cotizaciones-ui.js';

import {
  showNotification
} from '../../components/notification.js';

const el =
  id =>
    document.getElementById(id);

const TAMANIO_PAGINA = 10;

let paginaActual = 1;
let resultadosActuales = [];
let clientesPorId = new Map();
let secuenciaCarga = 0;

function tieneGestion() {
  return hasPermission(
    getSession(),
    PERMISOS_COTIZACIONES.GESTIONAR
  );
}

function nombreCliente(registro) {
  if (!registro) {
    return 'No disponible';
  }

  return [
    registro.nombres,
    registro.apellidos
  ]
    .filter(Boolean)
    .join(' ')
    .trim() ||
    'No disponible';
}

function obtenerVersionElegida(
  cotizacion
) {
  if (
    !cotizacion
      ?.idVersionElegida
  ) {
    return null;
  }

  return (
    cotizacion.versiones?.find(
      version =>
        Number(
          version.idVersion
        ) ===
        Number(
          cotizacion
            .idVersionElegida
        )
    ) || null
  );
}

function obtenerFiltros() {
  return {
    folio:
      String(
        el('filtroFolio')
          ?.value ||
        ''
      ).trim(),

    cliente:
      String(
        el('filtroCliente')
          ?.value ||
        ''
      ).trim(),

    estadoGeneral:
      String(
        el('filtroEstado')
          ?.value ||
        ''
      ).trim(),

    fechaEvento:
      String(
        el('filtroFechaEvento')
          ?.value ||
        ''
      ).trim(),

    vendedor:
      String(
        el('filtroVendedor')
          ?.value ||
        ''
      ).trim(),

    disponibilidad:
      String(
        el('filtroDisponibilidad')
          ?.value ||
        ''
      ).trim()
  };
}

function mostrarCarga() {
  const estado =
    el(
      'cotizacionesListaEstado'
    );

  const contenido =
    el(
      'cotizacionesListaContenido'
    );

  if (
    !estado ||
    !contenido
  ) {
    return;
  }

  estado.className =
    'cotizaciones-loading';

  estado.innerHTML = `
    <strong>
      Cargando cotizaciones...
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
    el(
      'cotizacionesListaEstado'
    );

  const contenido =
    el(
      'cotizacionesListaContenido'
    );

  if (
    !estado ||
    !contenido
  ) {
    return;
  }

  estado.className =
    'cotizaciones-error';

  estado.innerHTML = `
    <strong>
      No fue posible consultar las cotizaciones.
    </strong>

    <p>
      ${escaparHtml(mensaje)}
    </p>
  `;

  estado.hidden = false;
  contenido.hidden = true;
}

function mostrarContenido() {
  const estado =
    el(
      'cotizacionesListaEstado'
    );

  const contenido =
    el(
      'cotizacionesListaContenido'
    );

  if (estado) {
    estado.hidden = true;
  }

  if (contenido) {
    contenido.hidden = false;
  }
}

async function resolverClientes(
  cotizaciones,
  secuencia
) {
  const ids = [
    ...new Set(
      cotizaciones
        .map(
          item =>
            Number(
              item
                .idClienteProspecto
            )
        )
        .filter(
          id =>
            Number.isInteger(id) &&
            id > 0
        )
    )
  ];

  const faltantes =
    ids.filter(
      id =>
        !clientesPorId.has(id)
    );

  if (!faltantes.length) {
    return;
  }

  const resultados =
    await Promise.allSettled(
      faltantes.map(
        id =>
          getClienteProspecto(id)
      )
    );

  if (
    secuencia !==
    secuenciaCarga
  ) {
    return;
  }

  resultados.forEach(
    (resultado, indice) => {
      if (
        resultado.status ===
        'fulfilled'
      ) {
        clientesPorId.set(
          faltantes[indice],
          resultado.value
        );
      }
    }
  );
}

async function obtenerIdsClienteCoincidentes(
  texto,
  secuencia
) {
  const busqueda =
    String(
      texto ||
      ''
    ).trim();

  if (!busqueda) {
    return null;
  }

  const respuesta =
    await listClientesProspectos(
      {
        busqueda
      },
      {
        pagina: 1,
        tamanio: 100
      }
    );

  if (
    secuencia !==
    secuenciaCarga
  ) {
    return new Set();
  }

  for (
    const registro
    of respuesta.items || []
  ) {
    clientesPorId.set(
      Number(
        registro.id
      ),
      registro
    );
  }

  return new Set(
    (
      respuesta.items ||
      []
    ).map(
      registro =>
        Number(
          registro.id
        )
    )
  );
}

function filtrarPorCliente(
  cotizaciones,
  idsCliente
) {
  if (
    idsCliente === null
  ) {
    return cotizaciones;
  }

  return cotizaciones.filter(
    cotizacion =>
      idsCliente.has(
        Number(
          cotizacion
            .idClienteProspecto
        )
      )
  );
}

function renderContador(
  total
) {
  const nodo =
    el(
      'cotizacionesResultadosConteo'
    );

  if (!nodo) {
    return;
  }

  nodo.textContent =
    `${total} ${
      total === 1
        ? 'cotización'
        : 'cotizaciones'
    }`;
}

function accionesHtml(
  cotizacion
) {
  const idCotizacion =
    Number(
      cotizacion
        .idCotizacion
    );

  const terminal = [
    ESTADOS_COTIZACION_GENERAL
      .CANCELADA,

    ESTADOS_COTIZACION_GENERAL
      .RECHAZADA,

    ESTADOS_COTIZACION_GENERAL
      .VENCIDA
  ].includes(
    cotizacion.estadoGeneral
  );

  const confirmada = [
    ESTADOS_COTIZACION_GENERAL
      .CONFIRMADA,

    ESTADOS_COTIZACION_GENERAL
      .CONFIRMADA_RESERVADA
  ].includes(
    cotizacion.estadoGeneral
  );

  const acciones = [
    `
      <button
        type="button"
        class="
          cotizaciones-btn
          cotizaciones-btn--secondary
        "
        data-ver-cotizacion="${idCotizacion}"
      >
        Ver detalle
      </button>
    `
  ];

  if (
    tieneGestion() &&
    !terminal &&
    !confirmada
  ) {
    acciones.push(`
      <button
        type="button"
        class="
          cotizaciones-btn
          cotizaciones-btn--primary
        "
        data-ver-cotizacion="${idCotizacion}"
      >
        Continuar
      </button>
    `);
  }

  return `
    <div
      class="cotizaciones-table-actions"
    >
      ${acciones.join('')}
    </div>
  `;
}

function filaHtml(
  cotizacion
) {
  const cliente =
    clientesPorId.get(
      Number(
        cotizacion
          .idClienteProspecto
      )
    );

  const elegida =
    obtenerVersionElegida(
      cotizacion
    );

  return `
    <tr>
      <td>
        <strong>
          ${escaparHtml(
            construirFolioCotizacion(
              cotizacion.ejercicio,
              cotizacion.consecutivo
            )
          )}
        </strong>
      </td>

      <td>
        ${escaparHtml(
          nombreCliente(
            cliente
          )
        )}
      </td>

      <td>
        ${escaparHtml(
          cotizacion.evento ||
          '—'
        )}
      </td>

      <td>
        ${escaparHtml(
          formatearFechaHora(
            cotizacion.fechaEvento,
            cotizacion.horaEvento
          )
        )}
      </td>

      <td>
        ${Number(
          cotizacion
            .versiones?.length ||
          0
        )}
      </td>

      <td>
        ${
          elegida
            ? crearBadge(
                `V${
                  Number(
                    elegida
                      .numeroVersion
                  )
                }`,
                'cotizaciones-badge--selected'
              )
            : crearBadge(
                'Sin elegir',
                'cotizaciones-badge--neutral'
              )
        }
      </td>

      <td>
        ${crearBadge(
          obtenerEtiquetaEstadoGeneral(
            cotizacion
              .estadoGeneral
          ),
          obtenerClaseEstadoGeneral(
            cotizacion
              .estadoGeneral
          )
        )}
      </td>

      <td
        class="cotizaciones-money"
      >
        ${
          elegida
            ? escaparHtml(
                formatearMoneda(
                  elegida.total
                )
              )
            : '—'
        }
      </td>

      <td>
        ${accionesHtml(
          cotizacion
        )}
      </td>
    </tr>
  `;
}

function tarjetaHtml(
  cotizacion
) {
  const cliente =
    clientesPorId.get(
      Number(
        cotizacion
          .idClienteProspecto
      )
    );

  const elegida =
    obtenerVersionElegida(
      cotizacion
    );

  return `
    <article
      class="cotizaciones-mobile-card"
    >
      <div
        class="
          cotizaciones-mobile-card-header
        "
      >
        <strong>
          ${escaparHtml(
            construirFolioCotizacion(
              cotizacion.ejercicio,
              cotizacion.consecutivo
            )
          )}
        </strong>

        ${crearBadge(
          obtenerEtiquetaEstadoGeneral(
            cotizacion
              .estadoGeneral
          ),
          obtenerClaseEstadoGeneral(
            cotizacion
              .estadoGeneral
          )
        )}
      </div>

      <div
        class="
          cotizaciones-mobile-card-grid
        "
      >
        <div
          class="
            cotizaciones-mobile-card-field
          "
        >
          <span>
            Cliente / Prospecto
          </span>

          <strong>
            ${escaparHtml(
              nombreCliente(
                cliente
              )
            )}
          </strong>
        </div>

        <div
          class="
            cotizaciones-mobile-card-field
          "
        >
          <span>Evento</span>

          <strong>
            ${escaparHtml(
              cotizacion.evento ||
              '—'
            )}
          </strong>
        </div>

        <div
          class="
            cotizaciones-mobile-card-field
          "
        >
          <span>Fecha y hora</span>

          <strong>
            ${escaparHtml(
              formatearFechaHora(
                cotizacion
                  .fechaEvento,
                cotizacion
                  .horaEvento
              )
            )}
          </strong>
        </div>

        <div
          class="
            cotizaciones-mobile-card-field
          "
        >
          <span>Versiones</span>

          <strong>
            ${Number(
              cotizacion
                .versiones?.length ||
              0
            )}
          </strong>
        </div>

        <div
          class="
            cotizaciones-mobile-card-field
          "
        >
          <span>
            Versión elegida
          </span>

          <strong>
            ${
              elegida
                ? `V${
                    Number(
                      elegida
                        .numeroVersion
                    )
                  }`
                : '—'
            }
          </strong>
        </div>

        <div
          class="
            cotizaciones-mobile-card-field
          "
        >
          <span>
            Total elegido
          </span>

          <strong>
            ${
              elegida
                ? escaparHtml(
                    formatearMoneda(
                      elegida.total
                    )
                  )
                : '—'
            }
          </strong>
        </div>
      </div>

      ${accionesHtml(
        cotizacion
      )}
    </article>
  `;
}

function renderPaginacion(
  total
) {
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

  const info =
    el(
      'cotizacionesPaginacionInfo'
    );

  const anterior =
    el(
      'btnPaginaAnterior'
    );

  const siguiente =
    el(
      'btnPaginaSiguiente'
    );

  if (info) {
    info.textContent =
      total === 0
        ? 'Sin resultados'
        : `Página ${paginaActual} de ${totalPaginas}`;
  }

  if (anterior) {
    anterior.disabled =
      paginaActual <= 1;
  }

  if (siguiente) {
    siguiente.disabled =
      paginaActual >=
        totalPaginas ||
      total === 0;
  }
}

function renderResultados() {
  const tbody =
    el(
      'cotizacionesBody'
    );

  const mobile =
    el(
      'cotizacionesMobile'
    );

  const empty =
    el(
      'cotizacionesEmpty'
    );

  const total =
    resultadosActuales.length;

  const inicio =
    (
      paginaActual - 1
    ) *
    TAMANIO_PAGINA;

  const pagina =
    resultadosActuales.slice(
      inicio,
      inicio +
      TAMANIO_PAGINA
    );

  renderContador(
    total
  );

  renderPaginacion(
    total
  );

  if (empty) {
    empty.hidden =
      total > 0;
  }

  if (tbody) {
    tbody.innerHTML =
      pagina
        .map(filaHtml)
        .join('');
  }

  if (mobile) {
    mobile.innerHTML =
      pagina
        .map(tarjetaHtml)
        .join('');
  }
}

async function cargarCotizaciones(
  {
    reiniciarPagina = false
  } = {}
) {
  const secuencia =
    ++secuenciaCarga;

  if (reiniciarPagina) {
    paginaActual = 1;
  }

  mostrarCarga();

  const filtros =
    obtenerFiltros();

  try {
    const idsCliente =
      await obtenerIdsClienteCoincidentes(
        filtros.cliente,
        secuencia
      );

    if (
      secuencia !==
      secuenciaCarga
    ) {
      return;
    }

    const respuesta =
      await searchCotizaciones(
        {
          folio:
            filtros.folio,

          estadoGeneral:
            filtros
              .estadoGeneral,

          fechaEvento:
            filtros
              .fechaEvento,

          vendedor:
            filtros.vendedor,

          disponibilidad:
            filtros
              .disponibilidad
        },
        {
          pagina: 1,
          tamanio: 100
        }
      );

    if (
      secuencia !==
      secuenciaCarga
    ) {
      return;
    }

    const items =
      filtrarPorCliente(
        respuesta.items ||
        [],
        idsCliente
      );

    await resolverClientes(
      items,
      secuencia
    );

    if (
      secuencia !==
      secuenciaCarga
    ) {
      return;
    }

    resultadosActuales =
      items;

    renderResultados();
    mostrarContenido();
  } catch (error) {
    if (
      secuencia !==
      secuenciaCarga
    ) {
      return;
    }

    mostrarError(
      error?.message ||
      'Ocurrió un error inesperado.'
    );
  }
}

function limpiarFiltros() {
  [
    'filtroFolio',
    'filtroCliente',
    'filtroEstado',
    'filtroFechaEvento',
    'filtroVendedor',
    'filtroDisponibilidad'
  ].forEach(
    id => {
      const control =
        el(id);

      if (control) {
        control.value = '';
      }
    }
  );

  cargarCotizaciones({
    reiniciarPagina: true
  });
}

function registrarEventos() {
  const btnNueva =
    el(
      'btnNuevaCotizacion'
    );

  if (btnNueva) {
    btnNueva.hidden =
      !tieneGestion();

    btnNueva.addEventListener(
      'click',
      () => {
        location.hash =
          '#/cotizaciones/nueva';
      }
    );
  }

  el(
    'btnBuscarCotizaciones'
  )?.addEventListener(
    'click',
    () =>
      cargarCotizaciones({
        reiniciarPagina: true
      })
  );

  el(
    'btnLimpiarFiltros'
  )?.addEventListener(
    'click',
    limpiarFiltros
  );

  el(
    'cotizacionesFiltrosForm'
  )?.addEventListener(
    'submit',
    event => {
      event.preventDefault();

      cargarCotizaciones({
        reiniciarPagina: true
      });
    }
  );

  el(
    'btnPaginaAnterior'
  )?.addEventListener(
    'click',
    () => {
      if (
        paginaActual <= 1
      ) {
        return;
      }

      paginaActual -= 1;

      renderResultados();
    }
  );

  el(
    'btnPaginaSiguiente'
  )?.addEventListener(
    'click',
    () => {
      const totalPaginas =
        Math.max(
          1,
          Math.ceil(
            resultadosActuales
              .length /
            TAMANIO_PAGINA
          )
        );

      if (
        paginaActual >=
        totalPaginas
      ) {
        return;
      }

      paginaActual += 1;

      renderResultados();
    }
  );

  el(
    'cotizacionesListaContenido'
  )?.addEventListener(
    'click',
    event => {
      const boton =
        event.target.closest(
          '[data-ver-cotizacion]'
        );

      if (!boton) {
        return;
      }

      const idCotizacion =
        Number(
          boton.dataset
            .verCotizacion
        );

      if (
        !Number.isInteger(
          idCotizacion
        ) ||
        idCotizacion <= 0
      ) {
        showNotification(
          'La cotización seleccionada no es válida.',
          {
            type: 'error'
          }
        );

        return;
      }

      location.hash =
        `#/cotizaciones/detalle?id=${idCotizacion}`;
    }
  );
}

function inicializarFiltros() {
  const estado =
    el(
      'filtroEstado'
    );

  if (estado) {
    estado.innerHTML = `
      <option value="">
        Todos los estados
      </option>

      <option
        value="${ESTADOS_COTIZACION_GENERAL.BORRADOR}"
      >
        Borrador
      </option>

      <option
        value="${ESTADOS_COTIZACION_GENERAL.EN_SEGUIMIENTO}"
      >
        En seguimiento
      </option>

      <option
        value="${ESTADOS_COTIZACION_GENERAL.CONFIRMADA_RESERVADA}"
      >
        Confirmada-Reservada
      </option>

      <option
        value="${ESTADOS_COTIZACION_GENERAL.CANCELADA}"
      >
        Cancelada
      </option>

      <option
        value="${ESTADOS_COTIZACION_GENERAL.RECHAZADA}"
      >
        Rechazada
      </option>

      <option
        value="${ESTADOS_COTIZACION_GENERAL.VENCIDA}"
      >
        Vencida
      </option>
    `;
  }

  const disponibilidad =
    el(
      'filtroDisponibilidad'
    );

  if (disponibilidad) {
    disponibilidad.innerHTML = `
      <option value="">
        Todas
      </option>

      <option
        value="${DISPONIBILIDAD_COTIZACION.DISPONIBLE}"
      >
        Disponible
      </option>

      <option
        value="${DISPONIBILIDAD_COTIZACION.INCOMPLETO}"
      >
        No disponible / Incompleto
      </option>
    `;
  }
}

export function init() {
  paginaActual = 1;
  resultadosActuales = [];
  clientesPorId = new Map();

  /*
   * Invalida cualquier consulta iniciada
   * por una instancia anterior de la vista.
   */
  secuenciaCarga += 1;

  inicializarFiltros();
  registrarEventos();
  cargarCotizaciones();
}