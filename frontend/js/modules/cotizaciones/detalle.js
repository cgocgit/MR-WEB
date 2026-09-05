import {
  getCotizacion,
  createCotizacionVersion,
  deleteCotizacionVersion,
  selectCotizacionVersion,
  rejectCotizacion,
  cancelCotizacion
} from '../../api/cotizaciones.service.js';

import {
  getClienteProspecto
} from '../../api/clientes.service.js';

import {
  obtenerConfiguracionListaPrecio
} from '../../api/listas-precios.service.js';

import {
  getSession
} from '../../shared/auth-guard.js';

import {
  hasPermission
} from '../../shared/permissions.js';

import {
  ESTADOS_COTIZACION_GENERAL,
  ESTADOS_TERMINALES_COTIZACION,
  ESTADOS_VERSION_COTIZACION,
  PERMISOS_COTIZACIONES
} from '../../api/cotizaciones.constants.js';

import {
  construirFolioCotizacion,
  construirFolioVersion,
  crearBadge,
  escaparHtml,
  formatearFechaHora,
  formatearMoneda,
  obtenerClaseDisponibilidad,
  obtenerClaseEstadoGeneral,
  obtenerClaseEstadoVersion,
  obtenerEtiquetaDisponibilidad,
  obtenerEtiquetaEstadoGeneral,
  obtenerEtiquetaEstadoVersion
} from './cotizaciones-ui.js';

import {
  openModal
} from '../../components/modal.js';

import {
  showNotification
} from '../../components/notification.js';

const el = id => document.getElementById(id);

let cotizacion = null;
let clienteProspecto = null;
let listasPorId = new Map();
let seleccionComparacion = new Set();

function obtenerParametrosHash() {
  const [, queryString = ''] =
    String(location.hash || '').split('?');

  return new URLSearchParams(queryString);
}

function obtenerIdCotizacion() {
  const valor = Number(
    obtenerParametrosHash().get('id')
  );

  return Number.isInteger(valor) && valor > 0
    ? valor
    : null;
}

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

  const nombre = [
    registro.nombres,
    registro.apellidos
  ]
    .filter(Boolean)
    .join(' ')
    .trim();

  return nombre || 'No disponible';
}

function listaNombre(idListaPrecio) {
  return (
    listasPorId.get(Number(idListaPrecio))?.nombre ||
    `Lista ${idListaPrecio ?? 'no disponible'}`
  );
}

function mostrarEstadoCarga(
  mensaje,
  detalle = ''
) {
  const estado =
    el('detalleCotizacionEstado');

  const contenido =
    el('detalleCotizacionContenido');

  if (!estado || !contenido) {
    return;
  }

  estado.className =
    'cotizaciones-loading';

  estado.innerHTML = `
    <strong>
      ${escaparHtml(mensaje)}
    </strong>

    ${
      detalle
        ? `<p>${escaparHtml(detalle)}</p>`
        : ''
    }
  `;

  estado.hidden = false;
  contenido.hidden = true;
}

function mostrarError(mensaje) {
  const estado =
    el('detalleCotizacionEstado');

  const contenido =
    el('detalleCotizacionContenido');

  if (!estado || !contenido) {
    return;
  }

  estado.className =
    'cotizaciones-error';

  estado.innerHTML = `
    <strong>
      No fue posible cargar la cotización.
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
    el('detalleCotizacionEstado');

  const contenido =
    el('detalleCotizacionContenido');

  if (estado) {
    estado.hidden = true;
  }

  if (contenido) {
    contenido.hidden = false;
  }
}

function renderEncabezado() {
  const folio =
    construirFolioCotizacion(
      cotizacion.ejercicio,
      cotizacion.consecutivo
    );

  const titulo =
    el('cotizacionDetalleTitulo');

  if (titulo) {
    titulo.textContent =
      `Cotización ${folio}`;
  }

  const gestion =
    tieneGestion();

  const terminal =
    ESTADOS_TERMINALES_COTIZACION.includes(
      cotizacion.estadoGeneral
    );

  const nuevaVersion =
    el('btnNuevaVersion');

  const rechazar =
    el('btnRechazarCotizacion');

  const cancelar =
    el('btnCancelarCotizacion');

  const confirmar =
    el('btnConfirmarCotizacion');

  if (nuevaVersion) {
    nuevaVersion.hidden =
      !gestion ||
      terminal;
  }

  if (rechazar) {
    rechazar.hidden =
      !gestion ||
      terminal ||
      cotizacion.estadoGeneral ===
        ESTADOS_COTIZACION_GENERAL.CONFIRMADA;
  }

  if (cancelar) {
    cancelar.hidden =
      !gestion ||
      terminal;
  }

  if (confirmar) {
    confirmar.hidden =
      !gestion ||
      cotizacion.estadoGeneral !==
        ESTADOS_COTIZACION_GENERAL
          .EN_SEGUIMIENTO ||
      !cotizacion.idVersionElegida;
  }
}

function renderResumen() {
  const versionElegida =
    cotizacion.versiones.find(
      version =>
        Number(version.idVersion) ===
        Number(
          cotizacion.idVersionElegida
        )
    ) || null;

  const asignar = (
    id,
    valor,
    comoHtml = false
  ) => {
    const nodo = el(id);

    if (!nodo) {
      return;
    }

    if (comoHtml) {
      nodo.innerHTML = valor;
    } else {
      nodo.textContent = valor;
    }
  };

  asignar(
    'resumenCliente',
    nombreCliente(clienteProspecto)
  );

  asignar(
    'resumenEvento',
    cotizacion.evento ||
      'No disponible'
  );

  asignar(
    'resumenFechaHora',
    formatearFechaHora(
      cotizacion.fechaEvento,
      cotizacion.horaEvento
    )
  );

  asignar(
    'resumenEstadoGeneral',
    crearBadge(
      obtenerEtiquetaEstadoGeneral(
        cotizacion.estadoGeneral
      ),
      obtenerClaseEstadoGeneral(
        cotizacion.estadoGeneral
      )
    ),
    true
  );

  asignar(
    'resumenResponsable',
    cotizacion.responsable?.nombre ||
      'No disponible'
  );

  asignar(
    'resumenPorcentajeConfirmacion',
    `${Number(
      cotizacion
        .porcentajeConfirmacion ||
      0
    )}%`
  );

  asignar(
    'resumenVersionElegida',
    versionElegida
      ? crearBadge(
          `V${versionElegida.numeroVersion}`,
          'cotizaciones-badge--selected'
        )
      : crearBadge(
          'Sin elegir',
          'cotizaciones-badge--neutral'
        ),
    true
  );

  asignar(
    'resumenDisponibilidad',
    versionElegida
      ?.disponibilidadGlobal
      ? crearBadge(
          obtenerEtiquetaDisponibilidad(
            versionElegida
              .disponibilidadGlobal
          ),
          obtenerClaseDisponibilidad(
            versionElegida
              .disponibilidadGlobal
          )
        )
      : crearBadge(
          'Sin consultar',
          'cotizaciones-badge--neutral'
        ),
    true
  );

  asignar(
    'resumenTotalElegido',
    versionElegida
      ? formatearMoneda(
          versionElegida.total
        )
      : '—'
  );
}

function puedeElegirVersion(
  version
) {
  return (
    tieneGestion() &&
    version.estadoVersion ===
      ESTADOS_VERSION_COTIZACION
        .ENVIADA &&
    cotizacion.estadoGeneral !==
      ESTADOS_COTIZACION_GENERAL
        .CONFIRMADA &&
    !ESTADOS_TERMINALES_COTIZACION
      .includes(
        cotizacion.estadoGeneral
      )
  );
}

function accionesVersionHtml(
  version
) {
  const gestion =
    tieneGestion();

  const idVersion =
    Number(version.idVersion);

  const esBorrador =
    version.estadoVersion ===
    ESTADOS_VERSION_COTIZACION
      .BORRADOR;

  const acciones = [];

  if (
    esBorrador &&
    gestion
  ) {
    acciones.push(`
      <button
        type="button"
        class="
          cotizaciones-btn
          cotizaciones-btn--secondary
        "
        data-accion-version="editar"
        data-id-version="${idVersion}"
      >
        Editar
      </button>
    `);

    acciones.push(`
      <button
        type="button"
        class="
          cotizaciones-btn
          cotizaciones-btn--danger
        "
        data-accion-version="eliminar"
        data-id-version="${idVersion}"
      >
        Eliminar
      </button>
    `);
  } else {
    acciones.push(`
      <button
        type="button"
        class="
          cotizaciones-btn
          cotizaciones-btn--secondary
        "
        data-accion-version="ver"
        data-id-version="${idVersion}"
      >
        Ver
      </button>
    `);
  }

  if (
    !version.elegida &&
    puedeElegirVersion(version)
  ) {
    acciones.push(`
      <button
        type="button"
        class="
          cotizaciones-btn
          cotizaciones-btn--secondary
        "
        data-accion-version="elegir"
        data-id-version="${idVersion}"
      >
        Elegir
      </button>
    `);
  }

  acciones.push(`
    <button
      type="button"
      class="
        cotizaciones-btn
        cotizaciones-btn--secondary
      "
      data-accion-version="pdf"
      data-id-version="${idVersion}"
    >
      PDF
    </button>
  `);

  return `
    <div
      class="cotizaciones-table-actions"
    >
      ${acciones.join('')}
    </div>
  `;
}

function renderVersiones() {
  const versiones =
    Array.isArray(
      cotizacion.versiones
    )
      ? cotizacion.versiones
      : [];

  const tbody =
    el('versionesCotizacionBody');

  const mobile =
    el('versionesCotizacionMobile');

  const empty =
    el('versionesCotizacionEmpty');

  const cantidad =
    el('cantidadVersiones');

  if (cantidad) {
    cantidad.textContent =
      `${versiones.length} ` +
      `${
        versiones.length === 1
          ? 'versión'
          : 'versiones'
      }`;
  }

  if (empty) {
    empty.hidden =
      versiones.length > 0;
  }

  if (tbody) {
    tbody.innerHTML =
      versiones
        .map(version => {
          const seleccionada =
            seleccionComparacion.has(
              Number(
                version.idVersion
              )
            );

          return `
            <tr
              class="${
                version.elegida
                  ? 'cotizaciones-row--selected'
                  : ''
              }"
            >
              <td>
                <label>
                  <input
                    type="checkbox"
                    data-comparar-version="${
                      Number(
                        version.idVersion
                      )
                    }"
                    ${
                      seleccionada
                        ? 'checked'
                        : ''
                    }
                  >

                  V${
                    Number(
                      version
                        .numeroVersion
                    )
                  }
                </label>
              </td>

              <td>
                ${escaparHtml(
                  construirFolioVersion(
                    cotizacion
                      .ejercicio,
                    cotizacion
                      .consecutivo,
                    version
                      .numeroVersion
                  )
                )}
              </td>

              <td>
                ${crearBadge(
                  obtenerEtiquetaEstadoVersion(
                    version
                      .estadoVersion
                  ),
                  obtenerClaseEstadoVersion(
                    version
                      .estadoVersion
                  )
                )}
              </td>

              <td>
                ${escaparHtml(
                  listaNombre(
                    version.idListaPrecio
                  )
                )}
              </td>

              <td
                class="cotizaciones-money"
              >
                ${escaparHtml(
                  formatearMoneda(
                    version.total
                  )
                )}
              </td>

              <td>
                ${
                  version
                    .disponibilidadGlobal
                    ? crearBadge(
                        obtenerEtiquetaDisponibilidad(
                          version
                            .disponibilidadGlobal
                        ),
                        obtenerClaseDisponibilidad(
                          version
                            .disponibilidadGlobal
                        )
                      )
                    : crearBadge(
                        'Sin consultar',
                        'cotizaciones-badge--neutral'
                      )
                }
              </td>

              <td>
                ${
                  version.elegida
                    ? crearBadge(
                        'Sí',
                        'cotizaciones-badge--success'
                      )
                    : crearBadge(
                        'No',
                        'cotizaciones-badge--neutral'
                      )
                }
              </td>

              <td>
                ${accionesVersionHtml(
                  version
                )}
              </td>
            </tr>
          `;
        })
        .join('');
  }

  if (mobile) {
    mobile.innerHTML =
      versiones
        .map(version => `
          <article
            class="cotizaciones-mobile-card"
          >
            <div
              class="
                cotizaciones-mobile-card-header
              "
            >
              <label>
                <input
                  type="checkbox"
                  data-comparar-version="${
                    Number(
                      version.idVersion
                    )
                  }"
                  ${
                    seleccionComparacion.has(
                      Number(
                        version.idVersion
                      )
                    )
                      ? 'checked'
                      : ''
                  }
                >

                <strong>
                  V${
                    Number(
                      version
                        .numeroVersion
                    )
                  }
                </strong>
              </label>

              ${
                version.elegida
                  ? crearBadge(
                      'Elegida',
                      'cotizaciones-badge--selected'
                    )
                  : ''
              }
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
                <span>Folio</span>

                <strong>
                  ${escaparHtml(
                    construirFolioVersion(
                      cotizacion
                        .ejercicio,
                      cotizacion
                        .consecutivo,
                      version
                        .numeroVersion
                    )
                  )}
                </strong>
              </div>

              <div
                class="
                  cotizaciones-mobile-card-field
                "
              >
                <span>Estado</span>

                <strong>
                  ${escaparHtml(
                    obtenerEtiquetaEstadoVersion(
                      version
                        .estadoVersion
                    )
                  )}
                </strong>
              </div>

              <div
                class="
                  cotizaciones-mobile-card-field
                "
              >
                <span>
                  Lista de Precios
                </span>

                <strong>
                  ${escaparHtml(
                    listaNombre(
                      version
                        .idListaPrecio
                    )
                  )}
                </strong>
              </div>

              <div
                class="
                  cotizaciones-mobile-card-field
                "
              >
                <span>Total</span>

                <strong>
                  ${escaparHtml(
                    formatearMoneda(
                      version.total
                    )
                  )}
                </strong>
              </div>
            </div>

            ${accionesVersionHtml(
              version
            )}
          </article>
        `)
        .join('');
  }

  actualizarBotonComparacion();
}

function renderComparacion() {
  const resultado =
    el(
      'comparacionVersionesResultado'
    );

  const empty =
    el(
      'comparacionVersionesEmpty'
    );

  if (!resultado || !empty) {
    return;
  }

  const versiones =
    cotizacion.versiones.filter(
      version =>
        seleccionComparacion.has(
          Number(version.idVersion)
        )
    );

  if (versiones.length < 2) {
    resultado.hidden = true;
    resultado.innerHTML = '';
    empty.hidden = false;
    return;
  }

  const conceptoTexto =
    version => {
      const detalle =
        Array.isArray(
          version.detalle
        )
          ? version.detalle
          : [];

      if (!detalle.length) {
        return 'Sin conceptos';
      }

      return detalle
        .map(
          item =>
            `${
              escaparHtml(
                item
                  .descripcionHistorica ||
                'Concepto'
              )
            } × ${
              Number(
                item.cantidad || 0
              )
            }`
        )
        .join('<br>');
    };

  resultado.innerHTML = `
    <table
      class="cotizaciones-table"
    >
      <thead>
        <tr>
          <th scope="col">
            Concepto
          </th>

          ${versiones
            .map(
              version => `
                <th scope="col">
                  V${
                    Number(
                      version
                        .numeroVersion
                    )
                  }

                  ${
                    version.elegida
                      ? ' · Elegida'
                      : ''
                  }
                </th>
              `
            )
            .join('')}
        </tr>
      </thead>

      <tbody>
        <tr>
          <th scope="row">
            Lista de Precios
          </th>

          ${versiones
            .map(
              version => `
                <td>
                  ${escaparHtml(
                    listaNombre(
                      version
                        .idListaPrecio
                    )
                  )}
                </td>
              `
            )
            .join('')}
        </tr>

        <tr>
          <th scope="row">
            Conceptos y cantidades
          </th>

          ${versiones
            .map(
              version => `
                <td>
                  ${conceptoTexto(
                    version
                  )}
                </td>
              `
            )
            .join('')}
        </tr>

        <tr>
          <th scope="row">
            Disponibilidad
          </th>

          ${versiones
            .map(
              version => `
                <td>
                  ${escaparHtml(
                    version
                      .disponibilidadGlobal
                      ? obtenerEtiquetaDisponibilidad(
                          version
                            .disponibilidadGlobal
                        )
                      : 'Sin consultar'
                  )}
                </td>
              `
            )
            .join('')}
        </tr>

        <tr>
          <th scope="row">
            Total
          </th>

          ${versiones
            .map(
              version => `
                <td
                  class="
                    cotizaciones-money
                  "
                >
                  ${escaparHtml(
                    formatearMoneda(
                      version.total
                    )
                  )}
                </td>
              `
            )
            .join('')}
        </tr>
      </tbody>
    </table>
  `;

  resultado.hidden = false;
  empty.hidden = true;
}

function renderHistorial() {
  const contenedor =
    el('historialCotizacion');

  const empty =
    el('historialCotizacionEmpty');

  const historial =
    Array.isArray(
      cotizacion.historial
    )
      ? [
          ...cotizacion.historial
        ]
      : [];

  historial.sort(
    (a, b) =>
      new Date(b.fechaHora) -
      new Date(a.fechaHora)
  );

  if (!contenedor || !empty) {
    return;
  }

  if (!historial.length) {
    contenedor.innerHTML = '';
    empty.hidden = false;
    return;
  }

  empty.hidden = true;

  contenedor.innerHTML =
    historial
      .map(item => `
        <article
          class="cotizaciones-info"
        >
          <div
            class="
              cotizaciones-info-content
            "
          >
            <strong>
              ${escaparHtml(
                item.descripcion ||
                'Movimiento'
              )}
            </strong>

            <p>
              ${escaparHtml(
                item.usuario ||
                'Usuario'
              )}
              ·
              ${escaparHtml(
                formatearFechaHora(
                  item.fechaHora
                )
              )}
            </p>
          </div>
        </article>
      `)
      .join('');
}

function actualizarBotonComparacion() {
  const boton =
    el('btnCompararVersiones');

  if (boton) {
    boton.disabled =
      seleccionComparacion.size < 2;
  }
}

async function cargarListas() {
  const ids = [
    ...new Set(
      cotizacion.versiones
        .map(
          version =>
            Number(
              version
                .idListaPrecio
            )
        )
        .filter(
          id =>
            Number.isInteger(id) &&
            id > 0
        )
    )
  ];

  const resultados =
    await Promise.allSettled(
      ids.map(
        id =>
          obtenerConfiguracionListaPrecio(
            id
          )
      )
    );

  listasPorId = new Map();

  resultados.forEach(
    (resultado, indice) => {
      if (
        resultado.status ===
        'fulfilled'
      ) {
        listasPorId.set(
          ids[indice],
          resultado.value
        );
      }
    }
  );
}

async function recargar() {
  const idCotizacion =
    obtenerIdCotizacion();

  if (!idCotizacion) {
    mostrarError(
      'El identificador de la cotización no es válido.'
    );
    return;
  }

  mostrarEstadoCarga(
    'Cargando cotización...',
    'Consultando información y versiones.'
  );

  try {
    cotizacion =
      await getCotizacion(
        idCotizacion
      );

    clienteProspecto =
      await getClienteProspecto(
        cotizacion
          .idClienteProspecto
      ).catch(
        () => null
      );

    await cargarListas();

    renderEncabezado();
    renderResumen();
    renderVersiones();
    renderComparacion();
    renderHistorial();

    mostrarContenido();
  } catch (error) {
    mostrarError(
      error?.message ||
      'Ocurrió un error inesperado.'
    );
  }
}

async function crearNuevaVersion() {
  try {
    const nueva =
      await createCotizacionVersion(
        cotizacion
          .idCotizacion
      );

    location.hash =
      `#/cotizaciones/version?idCotizacion=${
        Number(
          cotizacion
            .idCotizacion
        )
      }` +
      `&idVersion=${
        Number(
          nueva.idVersion
        )
      }`;
  } catch (error) {
    showNotification(
      error?.message ||
      'No fue posible crear la nueva versión.',
      {
        type: 'error'
      }
    );
  }
}

async function eliminarVersion(
  idVersion
) {
  const respuesta =
    await openModal({
      title:
        'Eliminar versión en Borrador',

      body:
        '<p>La versión en Borrador será eliminada. Esta acción no eliminará implícitamente la cotización general.</p>',

      confirmText:
        'Eliminar versión',

      cancelText:
        'Cancelar',

      danger: true
    });

  if (!respuesta.confirmed) {
    return;
  }

  try {
    await deleteCotizacionVersion(
      cotizacion.idCotizacion,
      idVersion
    );

    seleccionComparacion.delete(
      Number(idVersion)
    );

    showNotification(
      'Versión eliminada correctamente.',
      {
        type: 'success'
      }
    );

    await recargar();
  } catch (error) {
    showNotification(
      error?.message ||
      'No fue posible eliminar la versión.',
      {
        type: 'error'
      }
    );
  }
}

async function elegirVersion(
  idVersion
) {
  try {
    await selectCotizacionVersion(
      cotizacion.idCotizacion,
      idVersion
    );

    showNotification(
      'Versión elegida actualizada.',
      {
        type: 'success'
      }
    );

    await recargar();
  } catch (error) {
    showNotification(
      error?.message ||
      'No fue posible elegir la versión.',
      {
        type: 'error'
      }
    );
  }
}

async function solicitarMotivo(
  tipo
) {
  const esRechazo =
    tipo === 'rechazo';

  const campo =
    esRechazo
      ? 'motivoRechazo'
      : 'motivoCancelacion';

  const respuesta =
    await openModal({
      title:
        esRechazo
          ? 'Rechazar cotización'
          : 'Cancelar cotización',

      body: `
        <label for="${campo}">
          Motivo
        </label>

        <textarea
          id="${campo}"
          rows="4"
          required
        ></textarea>
      `,

      confirmText:
        esRechazo
          ? 'Rechazar'
          : 'Cancelar cotización',

      cancelText:
        'Volver',

      danger: true
    });

  if (!respuesta.confirmed) {
    return;
  }

  const motivo =
    String(
      respuesta
        .values?.[campo] ||
      ''
    ).trim();

  if (!motivo) {
    showNotification(
      'El motivo es obligatorio.',
      {
        type: 'error'
      }
    );

    return;
  }

  try {
    if (esRechazo) {
      await rejectCotizacion(
        cotizacion.idCotizacion,
        motivo
      );
    } else {
      await cancelCotizacion(
        cotizacion.idCotizacion,
        motivo
      );
    }

    showNotification(
      esRechazo
        ? 'Cotización rechazada.'
        : 'Cotización cancelada.',
      {
        type: 'success'
      }
    );

    await recargar();
  } catch (error) {
    showNotification(
      error?.message ||
      'No fue posible completar la operación.',
      {
        type: 'error'
      }
    );
  }
}

function navegarVersion(
  idVersion,
  modoConsulta = false
) {
  let destino =
    `#/cotizaciones/version?idCotizacion=${
      Number(
        cotizacion.idCotizacion
      )
    }` +
    `&idVersion=${
      Number(idVersion)
    }`;

  if (modoConsulta) {
    destino +=
      '&modo=consulta';
  }

  location.hash = destino;
}

function registrarEventos() {
  el(
    'btnVolverCotizaciones'
  )?.addEventListener(
    'click',
    () => {
      location.hash =
        '#/cotizaciones';
    }
  );

  el(
    'btnNuevaVersion'
  )?.addEventListener(
    'click',
    crearNuevaVersion
  );

  el(
    'btnRechazarCotizacion'
  )?.addEventListener(
    'click',
    () =>
      solicitarMotivo(
        'rechazo'
      )
  );

  el(
    'btnCancelarCotizacion'
  )?.addEventListener(
    'click',
    () =>
      solicitarMotivo(
        'cancelacion'
      )
  );

  el(
    'btnConfirmarCotizacion'
  )?.addEventListener(
    'click',
    () => {
      location.hash =
        `#/cotizaciones/confirmar?id=${
          Number(
            cotizacion
              .idCotizacion
          )
        }`;
    }
  );

  el(
    'btnCompararVersiones'
  )?.addEventListener(
    'click',
    renderComparacion
  );

  el(
    'detalleCotizacionContenido'
  )?.addEventListener(
    'change',
    event => {
      const checkbox =
        event.target.closest(
          '[data-comparar-version]'
        );

      if (!checkbox) {
        return;
      }

      const idVersion =
        Number(
          checkbox.dataset
            .compararVersion
        );

      if (checkbox.checked) {
        seleccionComparacion.add(
          idVersion
        );
      } else {
        seleccionComparacion.delete(
          idVersion
        );
      }

      document
        .querySelectorAll(
          `[data-comparar-version="${idVersion}"]`
        )
        .forEach(control => {
          control.checked =
            checkbox.checked;
        });

      actualizarBotonComparacion();
    }
  );

  el(
    'detalleCotizacionContenido'
  )?.addEventListener(
    'click',
    event => {
      const boton =
        event.target.closest(
          '[data-accion-version]'
        );

      if (!boton) {
        return;
      }

      const idVersion =
        Number(
          boton.dataset
            .idVersion
        );

      switch (
        boton.dataset
          .accionVersion
      ) {
        case 'editar':
          navegarVersion(
            idVersion,
            false
          );
          break;

        case 'ver':
          navegarVersion(
            idVersion,
            true
          );
          break;

        case 'eliminar':
          eliminarVersion(
            idVersion
          );
          break;

        case 'elegir':
          elegirVersion(
            idVersion
          );
          break;

        case 'pdf':
          location.hash =
            `#/cotizaciones/pdf?idCotizacion=${
              Number(
                cotizacion.idCotizacion
              )
            }` +
            `&idVersion=${
              Number(idVersion)
            }`;
          break;

        default:
          break;
      }
    }
  );
}

export function init() {
  cotizacion = null;
  clienteProspecto = null;

  listasPorId =
    new Map();

  seleccionComparacion =
    new Set();

  registrarEventos();
  recargar();
}