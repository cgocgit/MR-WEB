import {
  confirmCotizacion,
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
    Boolean(
      versionElegida
    );

  const fechaHoraValida =
    Boolean(
      cotizacion.fechaEvento &&
      cotizacion.horaEvento
    );

  const pagoConfirmado =
    cotizacion
      .confirmacionPago
      ?.confirmada === true;

  const disponible =
    versionElegida
      ?.disponibilidadGlobal ===
    'DISPONIBLE';

  const reservaConfirmada =
    cotizacion
      .reservaInventario
      ?.confirmada === true;

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

  setHtml(
    'condicionPorcentaje',
    crearBadge(
      pagoConfirmado
        ? 'Confirmado por Pagos'
        : 'Pendiente de Pagos',

      pagoConfirmado
        ? 'cotizaciones-badge--success'
        : 'cotizaciones-badge--warning'
    )
  );

  setHtml(
    'condicionDisponibilidad',
    crearBadge(
      disponible &&
      reservaConfirmada
        ? 'Disponible / Reservada'
        : disponible
          ? 'Disponible'
          : 'No disponible',

      disponible &&
      reservaConfirmada
        ? 'cotizaciones-badge--success'
        : disponible
          ? 'cotizaciones-badge--warning'
          : 'cotizaciones-badge--danger'
    )
  );
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

  const reserva =
    cotizacion
      .reservaInventario;

  if (
    reserva?.confirmada ===
    true
  ) {
    contenedor.className =
      'cotizaciones-info';

    contenedor.innerHTML = `
      <div
        class="cotizaciones-info-content"
      >
        <strong>
          Reserva confirmada por Inventario.
        </strong>

        <p>
          Referencia:
          ${escaparHtml(
            reserva.referenciaReserva ||
            reserva.idReserva ||
            'registrada'
          )}
        </p>
      </div>
    `;

    return;
  }

  contenedor.className =
    'cotizaciones-info cotizaciones-info--warning';

  contenedor.innerHTML = `
    <div
      class="cotizaciones-info-content"
    >
      <strong>
        Pendiente de confirmación de reserva.
      </strong>

      <p>
        Cotizaciones no genera la reserva.
        Espera la confirmación proveniente de Inventario.
      </p>
    </div>
  `;
}

function puedeConfirmar() {
  return (
    cotizacion?.estadoGeneral ===
      ESTADOS_COTIZACION_GENERAL
        .EN_SEGUIMIENTO &&

    Boolean(
      versionElegida
    ) &&

    Boolean(
      cotizacion.fechaEvento
    ) &&

    Boolean(
      cotizacion.horaEvento
    ) &&

    cotizacion
      .confirmacionPago
      ?.confirmada === true &&

    versionElegida
      ?.disponibilidadGlobal ===
      'DISPONIBLE' &&

    cotizacion
      .reservaInventario
      ?.confirmada === true
  );
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

    return false;
  }

  if (!versionElegida) {
    showNotification(
      'Debe existir una versión elegida.',
      {
        type: 'error'
      }
    );

    return false;
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

    return false;
  }

  if (
    cotizacion
      .confirmacionPago
      ?.confirmada !== true
  ) {
    showNotification(
      'Aún no se ha recibido la confirmación desde Pagos.',
      {
        type: 'error'
      }
    );

    return false;
  }

  if (
    versionElegida
      .disponibilidadGlobal !==
    'DISPONIBLE'
  ) {
    showNotification(
      'La versión elegida no cuenta con disponibilidad suficiente.',
      {
        type: 'error'
      }
    );

    return false;
  }

  if (
    cotizacion
      .reservaInventario
      ?.confirmada !== true
  ) {
    showNotification(
      'Aún no se ha recibido la confirmación de reserva desde Inventario.',
      {
        type: 'error'
      }
    );

    return false;
  }

  showNotification(
    'Las condiciones de confirmación están completas.',
    {
      type: 'success'
    }
  );

  return true;
}

function registrarEventos() {
  el(
  'btnValidarConfirmacion'
)?.addEventListener(
  'click',
  () => {
    const valida =
      validarCondicionesConocidas();

    const ejecutar =
      el(
        'btnEjecutarConfirmacion'
      );

    if (ejecutar) {
      ejecutar.disabled =
        !valida;
    }
  }
);

el(
  'btnEjecutarConfirmacion'
)?.addEventListener(
  'click',
  async () => {
    if (
      !validarCondicionesConocidas()
    ) {
      return;
    }

    const boton =
      el(
        'btnEjecutarConfirmacion'
      );

    if (boton) {
      boton.disabled = true;
    }

    try {
      cotizacion =
        await confirmCotizacion(
          cotizacion.idCotizacion
        );

      showNotification(
        'Cotización Confirmada-Reservada correctamente.',
        {
          type: 'success'
        }
      );

      location.hash =
        `#/cotizaciones/detalle?id=${
          Number(
            cotizacion.idCotizacion
          )
        }`;
    } catch (error) {
      /*
       * Se registra el error.
       * Cotizaciones no realiza
       * compensaciones sobre otros módulos.
       */
      console.error(
        '[Cotizaciones] Error durante la confirmación:',
        error
      );

      showNotification(
        error?.message ||
        'No fue posible confirmar la cotización.',
        {
          type: 'error'
        }
      );

      if (boton) {
        boton.disabled =
          !puedeConfirmar();
      }
    }
  }
);

  el(
  'btnValidarConfirmacion'
)?.addEventListener(
  'click',
  () => {
    const valida =
      validarCondicionesConocidas();

    const ejecutar =
      el(
        'btnEjecutarConfirmacion'
      );

    if (ejecutar) {
      ejecutar.disabled =
        !valida;
    }
  }
);

el(
  'btnEjecutarConfirmacion'
)?.addEventListener(
  'click',
  async () => {
    if (
      !validarCondicionesConocidas()
    ) {
      return;
    }

    const boton =
      el(
        'btnEjecutarConfirmacion'
      );

    if (boton) {
      boton.disabled = true;
    }

    try {
      cotizacion =
        await confirmCotizacion(
          cotizacion.idCotizacion
        );

      showNotification(
        'Cotización Confirmada-Reservada correctamente.',
        {
          type: 'success'
        }
      );

      location.hash =
        `#/cotizaciones/detalle?id=${
          Number(
            cotizacion.idCotizacion
          )
        }`;
    } catch (error) {
      /*
       * Se registra el error.
       * Cotizaciones no realiza
       * compensaciones sobre otros módulos.
       */
      console.error(
        '[Cotizaciones] Error durante la confirmación:',
        error
      );

      showNotification(
        error?.message ||
        'No fue posible confirmar la cotización.',
        {
          type: 'error'
        }
      );

      if (boton) {
        boton.disabled =
          !puedeConfirmar();
      }
    }
  }
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
    const yaConfirmada = [
      ESTADOS_COTIZACION_GENERAL
        .CONFIRMADA,

      ESTADOS_COTIZACION_GENERAL
        .CONFIRMADA_RESERVADA
    ].includes(
      cotizacion.estadoGeneral
    );

    ejecutar.disabled =
      yaConfirmada ||
      !puedeConfirmar();

    if (yaConfirmada) {
      ejecutar.textContent =
        'Confirmada-Reservada';
    }
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