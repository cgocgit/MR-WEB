import {
  getCotizacion,
  getCotizacionVersion
} from '../../api/cotizaciones.service.js';

import {
  getClienteProspecto
} from '../../api/clientes.service.js';

import {
  ESTADOS_COTIZACION_GENERAL
} from '../../api/cotizaciones.constants.js';

import {
  construirFolioCotizacion,
  crearBadge,
  escaparHtml,
  formatearFechaHora,
  formatearMoneda,
  obtenerClaseDisponibilidad,
  obtenerClaseEstadoGeneral,
  obtenerEtiquetaDisponibilidad,
  obtenerEtiquetaEstadoGeneral
} from './cotizaciones-ui.js';

import {
  showNotification
} from '../../components/notification.js';

const el = id =>
  document.getElementById(id);

let cotizacion = null;
let versionElegida = null;
let clienteProspecto = null;

function obtenerParametrosHash() {
  const [
    ,
    queryString = ''
  ] =
    String(
      location.hash || ''
    ).split('?');

  return new URLSearchParams(
    queryString
  );
}

function obtenerIdCotizacion() {
  const valor =
    Number(
      obtenerParametrosHash()
        .get('id')
    );

  return (
    Number.isInteger(valor) &&
    valor > 0
  )
    ? valor
    : null;
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

function mostrarError(mensaje) {
  const estado =
    el(
      'confirmacionEstadoCarga'
    );

  const contenido =
    el(
      'confirmacionContenido'
    );

  if (!estado || !contenido) {
    return;
  }

  estado.className =
    'cotizaciones-error';

  estado.innerHTML = `
    <strong>
      No fue posible preparar la confirmación.
    </strong>

    <p>
      ${escaparHtml(mensaje)}
    </p>
  `;

  estado.hidden = false;
  contenido.hidden = true;
}

function setTexto(id, valor) {
  const nodo = el(id);

  if (nodo) {
    nodo.textContent = valor;
  }
}

function setHtml(id, valor) {
  const nodo = el(id);

  if (nodo) {
    nodo.innerHTML = valor;
  }
}

function renderResumen() {
  const folio =
    construirFolioCotizacion(
      cotizacion.ejercicio,
      cotizacion.consecutivo
    );

  const breadcrumb =
    el(
      'confirmacionBreadcrumbCotizacion'
    );

  if (breadcrumb) {
    breadcrumb.textContent =
      folio;

    breadcrumb.href =
      `#/cotizaciones/detalle?id=${
        Number(
          cotizacion.idCotizacion
        )
      }`;
  }

  setTexto(
    'confirmacionTitulo',
    `Confirmar cotización ${folio}`
  );

  setTexto(
    'confirmacionFolio',
    folio
  );

  setTexto(
    'confirmacionCliente',
    nombreCliente(
      clienteProspecto
    )
  );

  setTexto(
    'confirmacionVersionElegida',
    versionElegida
      ? `V${
          Number(
            versionElegida.numeroVersion
          )
        }`
      : 'Sin elegir'
  );

  setTexto(
    'confirmacionFechaHora',
    formatearFechaHora(
      cotizacion.fechaEvento,
      cotizacion.horaEvento
    )
  );

  setTexto(
    'confirmacionTotal',
    versionElegida
      ? formatearMoneda(
          versionElegida.total
        )
      : '—'
  );

  setTexto(
    'confirmacionPorcentajeRequerido',
    `${
      Number(
        cotizacion
          .porcentajeConfirmacion ||
        0
      )
    }%`
  );

  setHtml(
    'confirmacionEstadoGeneral',
    crearBadge(
      obtenerEtiquetaEstadoGeneral(
        cotizacion.estadoGeneral
      ),
      obtenerClaseEstadoGeneral(
        cotizacion.estadoGeneral
      )
    )
  );

  setTexto(
    'confirmacionResponsable',
    cotizacion.responsable?.nombre ||
    'No disponible'
  );
}

function renderCondiciones() {
  const existeVersion =
    Boolean(versionElegida);

  const fechaHoraValida =
    Boolean(
      cotizacion.fechaEvento &&
      cotizacion.horaEvento
    );

  setHtml(
    'condicionVersionElegida',
    crearBadge(
      existeVersion
        ? 'Cumplida'
        : 'Pendiente',

      existeVersion
        ? 'cotizaciones-badge--success'
        : 'cotizaciones-badge--danger'
    )
  );

  setHtml(
    'condicionFechaHora',
    crearBadge(
      fechaHoraValida
        ? 'Cumplida'
        : 'Pendiente',

      fechaHoraValida
        ? 'cotizaciones-badge--success'
        : 'cotizaciones-badge--danger'
    )
  );

  /*
   * No se infiere un pago.
   * El contrato de Pagos aún no
   * proporciona la validación requerida.
   */
  setHtml(
    'condicionPorcentaje',
    crearBadge(
      'Pendiente de validación de pago',
      'cotizaciones-badge--warning'
    )
  );

  if (
    versionElegida
      ?.disponibilidadGlobal
  ) {
    setHtml(
      'condicionDisponibilidad',
      crearBadge(
        obtenerEtiquetaDisponibilidad(
          versionElegida
            .disponibilidadGlobal
        ),
        obtenerClaseDisponibilidad(
          versionElegida
            .disponibilidadGlobal
        )
      )
    );
  } else {
    setHtml(
      'condicionDisponibilidad',
      crearBadge(
        'Sin consultar',
        'cotizaciones-badge--neutral'
      )
    );
  }
}

function renderDetalle() {
  const detalle =
    Array.isArray(
      versionElegida?.detalle
    )
      ? versionElegida.detalle
      : [];

  const tbody =
    el(
      'confirmacionDetalleBody'
    );

  const mobile =
    el(
      'confirmacionDetalleMobile'
    );

  if (tbody) {
    tbody.innerHTML =
      detalle
        .map(item => `
          <tr>
            <td>
              ${escaparHtml(
                item.descripcionHistorica ||
                'Concepto'
              )}
            </td>

            <td>
              ${escaparHtml(
                item.tipoConcepto ||
                '—'
              )}
            </td>

            <td>
              ${Number(
                item.cantidad || 0
              )}
            </td>

            <td
              class="cotizaciones-money"
            >
              ${escaparHtml(
                formatearMoneda(
                  item.precioAplicado
                )
              )}
            </td>

            <td>
              ${
                item.disponibilidad
                  ? crearBadge(
                      obtenerEtiquetaDisponibilidad(
                        item.disponibilidad
                      ),
                      obtenerClaseDisponibilidad(
                        item.disponibilidad
                      )
                    )
                  : crearBadge(
                      'Sin consultar',
                      'cotizaciones-badge--neutral'
                    )
              }
            </td>

            <td
              class="cotizaciones-money"
            >
              ${escaparHtml(
                formatearMoneda(
                  item.subtotal
                )
              )}
            </td>
          </tr>
        `)
        .join('');
  }

  if (mobile) {
    mobile.innerHTML =
      detalle
        .map(item => `
          <article
            class="cotizaciones-mobile-card"
          >
            <div
              class="cotizaciones-mobile-card-header"
            >
              <strong>
                ${escaparHtml(
                  item.descripcionHistorica ||
                  'Concepto'
                )}
              </strong>

              ${
                item.disponibilidad
                  ? crearBadge(
                      obtenerEtiquetaDisponibilidad(
                        item.disponibilidad
                      ),
                      obtenerClaseDisponibilidad(
                        item.disponibilidad
                      )
                    )
                  : ''
              }
            </div>

            <div
              class="cotizaciones-mobile-card-grid"
            >
              <div
                class="cotizaciones-mobile-card-field"
              >
                <span>Tipo</span>

                <strong>
                  ${escaparHtml(
                    item.tipoConcepto ||
                    '—'
                  )}
                </strong>
              </div>

              <div
                class="cotizaciones-mobile-card-field"
              >
                <span>Cantidad</span>

                <strong>
                  ${Number(
                    item.cantidad || 0
                  )}
                </strong>
              </div>

              <div
                class="cotizaciones-mobile-card-field"
              >
                <span>Precio</span>

                <strong>
                  ${escaparHtml(
                    formatearMoneda(
                      item.precioAplicado
                    )
                  )}
                </strong>
              </div>

              <div
                class="cotizaciones-mobile-card-field"
              >
                <span>Subtotal</span>

                <strong>
                  ${escaparHtml(
                    formatearMoneda(
                      item.subtotal
                    )
                  )}
                </strong>
              </div>
            </div>
          </article>
        `)
        .join('');
  }
}

function renderEstadoInventario() {
  const contenedor =
    el(
      'confirmacionInventarioEstado'
    );

  if (!contenedor) {
    return;
  }

  contenedor.className =
    'cotizaciones-info cotizaciones-info--warning';

  contenedor.innerHTML = `
    <div
      class="cotizaciones-info-content"
    >
      <strong>
        Integración de reserva pendiente.
      </strong>

      <p>
        La operación de Inventario requiere
        fechaInicio y fechaFin. No se generará
        una reserva con un periodo inferido.
      </p>
    </div>
  `;
}

function validarCondicionesConocidas() {
  if (
    cotizacion.estadoGeneral !==
    ESTADOS_COTIZACION_GENERAL
      .EN_SEGUIMIENTO
  ) {
    showNotification(
      'La cotización no se encuentra En seguimiento.',
      {
        type: 'error'
      }
    );

    return;
  }

  if (!versionElegida) {
    showNotification(
      'Debe existir una versión elegida.',
      {
        type: 'error'
      }
    );

    return;
  }

  if (
    !cotizacion.fechaEvento ||
    !cotizacion.horaEvento
  ) {
    showNotification(
      'La fecha y hora del evento son obligatorias.',
      {
        type: 'error'
      }
    );

    return;
  }

  showNotification(
    'Las condiciones locales son correctas. Permanecen pendientes la validación del pago y el contrato de reserva con Inventario.',
    {
      type: 'info',
      timeout: 6000
    }
  );
}

function registrarEventos() {
  el(
    'btnVolverConfirmacion'
  )?.addEventListener(
    'click',
    () => {
      if (!cotizacion) {
        location.hash =
          '#/cotizaciones';

        return;
      }

      location.hash =
        `#/cotizaciones/detalle?id=${
          Number(
            cotizacion.idCotizacion
          )
        }`;
    }
  );

  el(
    'btnValidarConfirmacion'
  )?.addEventListener(
    'click',
    validarCondicionesConocidas
  );

  /*
   * Se mantiene deshabilitado hasta
   * cerrar contrato con Pagos e Inventario.
   */
  el(
    'btnEjecutarConfirmacion'
  )?.addEventListener(
    'click',
    () => {
      showNotification(
        'La confirmación final todavía no está habilitada.',
        {
          type: 'info'
        }
      );
    }
  );
}

async function inicializar() {
  const idCotizacion =
    obtenerIdCotizacion();

  if (!idCotizacion) {
    mostrarError(
      'El identificador de la cotización no es válido.'
    );

    return;
  }

  try {
    cotizacion =
      await getCotizacion(
        idCotizacion
      );

    if (
      cotizacion
        .idVersionElegida
    ) {
      versionElegida =
        await getCotizacionVersion(
          idCotizacion,
          cotizacion
            .idVersionElegida
        );
    }

    clienteProspecto =
      await getClienteProspecto(
        cotizacion
          .idClienteProspecto
      ).catch(
        () => null
      );

    renderResumen();
    renderCondiciones();
    renderDetalle();
    renderEstadoInventario();

    const ejecutar =
      el(
        'btnEjecutarConfirmacion'
      );

    if (ejecutar) {
      ejecutar.disabled = true;
    }

    el(
      'confirmacionEstadoCarga'
    ).hidden = true;

    el(
      'confirmacionContenido'
    ).hidden = false;
  } catch (error) {
    mostrarError(
      error?.message ||
      'Ocurrió un error inesperado.'
    );
  }
}

export function init() {
  cotizacion = null;
  versionElegida = null;
  clienteProspecto = null;

  registrarEventos();
  inicializar();
}