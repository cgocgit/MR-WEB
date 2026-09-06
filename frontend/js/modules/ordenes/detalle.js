import {
  cancelarOrden,
  getOrden
} from '../../api/ordenes.service.js';

import {
  ESTADOS_ORDEN,
  PERMISOS_ORDENES
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
  obtenerIdOrdenHash,
  valorDisponible
} from './ordenes-ui.js';

const CONTEXTO_KEY =
  'mr_ordenes_lista_contexto';

let ordenActual = null;

const el =
  id =>
    document.getElementById(id);

function permiso(
  codigo
) {
  return hasPermission(
    getSession(),
    codigo
  );
}

function volverListado() {
  try {
    const contexto =
      JSON.parse(
        sessionStorage.getItem(
          CONTEXTO_KEY
        ) || 'null'
      );

    location.hash =
      contexto?.hashLista ||
      '#/ordenes';
  } catch (_error) {
    location.hash =
      '#/ordenes';
  }
}

function mostrarError(
  mensaje
) {
  const estado =
    el(
      'ordenDetalleEstado'
    );

  estado.innerHTML = `
    <strong>
      No fue posible consultar la Orden.
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
      data-reintentar-detalle
    >
      Reintentar
    </button>
  `;

  estado.className =
    'ordenes-state ordenes-state--error';

  estado.hidden = false;

  el(
    'ordenDetalleContenido'
  ).hidden = true;

  estado
    .querySelector(
      '[data-reintentar-detalle]'
    )
    ?.addEventListener(
      'click',
      cargarDetalle
    );
}

function mostrarContenido() {
  el(
    'ordenDetalleEstado'
  ).hidden = true;

  el(
    'ordenDetalleContenido'
  ).hidden = false;
}

function renderResumen(
  orden
) {
  el(
    'ordenDetalleTitulo'
  ).textContent =
    orden.folio;

  el(
    'ordenEstadoEncabezado'
  ).innerHTML =
    crearBadge(
      obtenerEtiquetaEstadoOrden(
        orden.estadoOrden
      ),
      obtenerClaseEstadoOrden(
        orden.estadoOrden
      )
    );

  el(
    'ordenResumenAtencion'
  ).innerHTML = `
    <div class="ordenes-summary-item">
      <span>Cliente</span>
      <strong>
        ${escaparHtml(
          valorDisponible(
            orden.cliente
          )
        )}
      </strong>
    </div>

    <div class="ordenes-summary-item">
      <span>Contacto</span>
      <strong>
        ${escaparHtml(
          valorDisponible(
            orden.contactoEvento
          )
        )}
      </strong>
    </div>

    <div class="ordenes-summary-item">
      <span>Fecha y hora</span>
      <strong>
        ${escaparHtml(
          formatearFechaHora(
            orden.fechaHoraEvento ||
            orden.fechaEntrega
          )
        )}
      </strong>
    </div>

    <div class="ordenes-summary-item">
      <span>Domicilio</span>
      <strong>
        ${escaparHtml(
          valorDisponible(
            orden.domicilioEvento ||
            orden.direccionEntrega
          )
        )}
      </strong>
    </div>

    <div class="ordenes-summary-item">
      <span>Tipo de compromiso</span>
      <strong>
        ${escaparHtml(
          obtenerEtiquetaTipoCompromiso(
            orden.tipoCompromiso
          )
        )}
      </strong>
    </div>

    <div class="ordenes-summary-item">
      <span>Generación</span>
      <strong>
        ${escaparHtml(
          formatearFechaHora(
            orden.fechaGeneracion
          )
        )}
      </strong>
    </div>

    <div
      class="
        ordenes-summary-item
        ordenes-summary-item--wide
      "
    >
      <span>Observaciones</span>
      <strong>
        ${escaparHtml(
          valorDisponible(
            orden.observaciones
          )
        )}
      </strong>
    </div>
  `;
}

function renderCotizacion(
  orden
) {
  const contenedor =
    el(
      'ordenCotizacionOrigen'
    );

  const seccion =
    contenedor?.closest(
      '.ordenes-card'
    );

  const puedeConsultarOrigen =
    permiso(
      PERMISOS_ORDENES
        .ORIGEN_COTIZACION_CONSULTAR
    );

  if (seccion) {
    seccion.hidden =
      !puedeConsultarOrigen;
  }

  const boton =
    el(
      'btnConsultarCotizacion'
    );

  if (
    !puedeConsultarOrigen
  ) {
    if (boton) {
      boton.hidden = true;
    }

    return;
  }

  const origen =
    orden.cotizacionOrigen ||
    {};

  contenedor.innerHTML = `
    <div class="ordenes-summary-item">
      <span>Cotización</span>
      <strong>
        ${escaparHtml(
          valorDisponible(
            origen.folio
          )
        )}
      </strong>
    </div>

    <div class="ordenes-summary-item">
      <span>Versión confirmada</span>
      <strong>
        ${escaparHtml(
          valorDisponible(
            origen.versionConfirmada
          )
        )}
      </strong>
    </div>

    <div class="ordenes-summary-item">
      <span>Fecha de confirmación</span>
      <strong>
        ${escaparHtml(
          formatearFechaHora(
            origen.fechaConfirmacion
          )
        )}
      </strong>
    </div>

    <div class="ordenes-summary-item">
      <span>Referencia de pago</span>
      <strong>
        ${escaparHtml(
          valorDisponible(
            origen.referenciaPago
          )
        )}
      </strong>
    </div>
  `;

  boton.hidden =
    !permiso(
      'cotizaciones.consultar'
    ) ||
    !origen.idCotizacion;

  if (!boton.hidden) {
    boton.dataset.id =
      origen.idCotizacion;
  }
}

function renderDetalleComprometido(
  orden
) {
  const detalle =
    orden.detalleComprometido ||
    {};

  const grupos = [
    [
      'Productos rentados',
      detalle.productos || []
    ],
    [
      'Servicios',
      detalle.servicios || []
    ],
    [
      'Paquetes',
      detalle.paquetes || []
    ]
  ];

  const contenido =
    grupos
      .filter(
        ([, items]) =>
          items.length > 0
      )
      .map(
        ([titulo, items]) => `
          <section
            class="ordenes-detail-group"
          >
            <h3>
              ${escaparHtml(titulo)}
            </h3>

            <div
              class="ordenes-table-wrapper"
            >
              <table
                class="ordenes-table"
              >
                <thead>
                  <tr>
                    <th>Concepto</th>
                    <th>Cantidad</th>
                  </tr>
                </thead>

                <tbody>
                  ${items
                    .map(
                      item => `
                        <tr>
                          <td>
                            ${escaparHtml(
                              valorDisponible(
                                item.nombre ||
                                item.descripcion
                              )
                            )}
                          </td>

                          <td>
                            ${escaparHtml(
                              valorDisponible(
                                item.cantidad
                              )
                            )}
                          </td>
                        </tr>
                      `
                    )
                    .join('')}
                </tbody>
              </table>
            </div>
          </section>
        `
      )
      .join('');

  el(
    'ordenDetalleComprometido'
  ).innerHTML =
    contenido ||
    `
      <div class="ordenes-empty">
        <strong>
          Sin detalle disponible.
        </strong>
      </div>
    `;
}

function renderInventario(
  orden
) {
  const inventario =
    orden.inventarioRelacionado;

  if (
    !inventario ||
    inventario.disponible === false
  ) {
    el(
      'ordenInventarioRelacionado'
    ).innerHTML = `
      <div class="ordenes-empty">
        <strong>
          Datos de Inventario no disponibles.
        </strong>
      </div>
    `;

    el(
      'btnConsultarReserva'
    ).hidden = true;

    return;
  }

  const items =
    inventario.items || [];

  const salidas = [
    ...new Set(
      items
        .map(
          item =>
            item.referenciaSalida
        )
        .filter(Boolean)
    )
  ];

  const retornos = [
    ...new Set(
      items
        .map(
          item =>
            item.referenciaRetorno
        )
        .filter(Boolean)
    )
  ];

  el(
    'ordenInventarioRelacionado'
  ).innerHTML = `
    <div class="ordenes-summary-item">
      <span>Estado de reserva</span>
      <strong>
        ${crearBadge(
          valorDisponible(
            inventario.estadoResumen
          ),
          obtenerClaseEstadoReserva(
            inventario.estadoResumen
          )
        )}
      </strong>
    </div>

    <div class="ordenes-summary-item">
      <span>Periodo</span>
      <strong>
        ${escaparHtml(
          inventario.fechaInicio
            ? `${formatearFechaHora(
                inventario.fechaInicio
              )} — ${formatearFechaHora(
                inventario.fechaFin
              )}`
            : '—'
        )}
      </strong>
    </div>

    <div class="ordenes-summary-item">
      <span>Reservas relacionadas</span>
      <strong>
        ${Number(
          inventario.total || 0
        )}
      </strong>
    </div>

    <div class="ordenes-summary-item">
      <span>Cantidad reservada</span>
      <strong>
        ${Number(
          inventario.cantidadReservada ||
          0
        )}
      </strong>
    </div>

    <div class="ordenes-summary-item">
      <span>Salidas</span>
      <strong>
        ${escaparHtml(
          salidas.length
            ? salidas.join(', ')
            : 'Sin salida registrada'
        )}
      </strong>
    </div>

    <div class="ordenes-summary-item">
      <span>Retornos</span>
      <strong>
        ${escaparHtml(
          retornos.length
            ? retornos.join(', ')
            : 'Sin retorno registrado'
        )}
      </strong>
    </div>
  `;

  el(
    'btnConsultarReserva'
  ).hidden =
    !permiso(
      'inventario.reservas.consultar'
    );
}

function renderLogistica(
  orden
) {
  const logistica =
    orden.logisticaRelacionada;

  if (
    !logistica ||
    logistica.disponible === false
  ) {
    el(
      'ordenLogisticaRelacionada'
    ).innerHTML = `
      <div class="ordenes-empty">
        <strong>
          Datos de Logística no disponibles.
        </strong>
      </div>
    `;

    el(
      'btnConsultarProgramacion'
    ).hidden = true;

    return;
  }

  const horario =
    logistica.fechaInicio
      ? `${formatearFechaHora(
          logistica.fechaInicio
        )} — ${formatearFechaHora(
          logistica.fechaFin
        )}`
      : '—';

  el(
    'ordenLogisticaRelacionada'
  ).innerHTML = `
    <div class="ordenes-summary-item">
      <span>Estado logístico</span>
      <strong>
        ${crearBadge(
          normalizarEstadoVisible(
            valorDisponible(
              logistica.estadoLogistico
            )
          ),
          obtenerClaseEstadoLogistico(
            logistica.estadoLogistico
          )
        )}
      </strong>
    </div>

    <div class="ordenes-summary-item">
      <span>Programación / horario</span>
      <strong>
        ${escaparHtml(
          horario
        )}
      </strong>
    </div>

    <div class="ordenes-summary-item">
      <span>Repartidor / responsable</span>
      <strong>
        ${escaparHtml(
          valorDisponible(
            logistica.responsable
          )
        )}
      </strong>
    </div>

    <div class="ordenes-summary-item">
      <span>Vehículo</span>
      <strong>
        ${escaparHtml(
          valorDisponible(
            logistica.vehiculo
          )
        )}
      </strong>
    </div>

    <div class="ordenes-summary-item">
      <span>Ruta</span>
      <strong>
        ${escaparHtml(
          valorDisponible(
            logistica.ruta
          )
        )}
      </strong>
    </div>

    <div class="ordenes-summary-item">
      <span>Referencia logística</span>
      <strong>
        ${escaparHtml(
          valorDisponible(
            logistica
              .idActividadLogistica ||
            logistica.id
          )
        )}
      </strong>
    </div>
  `;

  el(
    'btnConsultarProgramacion'
  ).hidden =
    !permiso(
      'logistica.consultar'
    );
}

function renderTrazabilidad(
  orden
) {
  const movimientos =
    orden.trazabilidad ||
    [];

  if (!movimientos.length) {
    el(
      'ordenTrazabilidad'
    ).innerHTML = `
      <div class="ordenes-empty">
        <strong>
          Sin movimientos registrados.
        </strong>
      </div>
    `;

    return;
  }

  el(
    'ordenTrazabilidad'
  ).innerHTML = `
    <div
      class="ordenes-table-wrapper"
    >
      <table
        class="ordenes-table"
      >
        <thead>
          <tr>
            <th>Fecha y hora</th>
            <th>Usuario</th>
            <th>Acción</th>
            <th>Estado</th>
            <th>Comentario</th>
          </tr>
        </thead>

        <tbody>
          ${movimientos
            .map(
              item => `
                <tr>
                  <td>
                    ${escaparHtml(
                      formatearFechaHora(
                        item.fechaHora
                      )
                    )}
                  </td>

                  <td>
                    ${escaparHtml(
                      valorDisponible(
                        item.usuario
                      )
                    )}
                  </td>

                  <td>
                    ${escaparHtml(
                      valorDisponible(
                        item.accion
                      )
                    )}
                  </td>

                  <td>
                    ${escaparHtml(
                      obtenerEtiquetaEstadoOrden(
                        item.estadoNuevo
                      )
                    )}
                  </td>

                  <td>
                    ${escaparHtml(
                      valorDisponible(
                        item.comentario
                      )
                    )}
                  </td>
                </tr>
              `
            )
            .join('')}
        </tbody>
      </table>
    </div>
  `;
}

function configurarAcciones(
  orden
) {
  const revisar =
    el('btnRevisarOrden');

  revisar.hidden =
    !permiso(
      PERMISOS_ORDENES.REVISAR
    ) ||
    orden.estadoOrden !==
      ESTADOS_ORDEN
        .EN_REVISION_VENTAS;

  const cancelar =
    el('btnCancelarOrden');

  cancelar.hidden =
    !permiso(
      PERMISOS_ORDENES.CANCELAR
    ) ||
    orden.cancelable !== true;
}

function registrarEventos() {
  el(
    'btnVolverOrdenes'
  )?.addEventListener(
    'click',
    volverListado
  );

  el(
    'btnRevisarOrden'
  )?.addEventListener(
    'click',
    () => {
      location.hash =
        `#/ordenes/revision?id=${
          ordenActual.id
        }`;
    }
  );

  el(
    'btnCancelarOrden'
  )?.addEventListener(
    'click',
    () => {
      abrirModalCancelacion({
        orden:
          ordenActual,

        onConfirmar:
          async motivo => {
            ordenActual =
              await cancelarOrden(
                ordenActual.id,
                motivo
              );

            showNotification(
              'La Orden fue cancelada correctamente.'
            );

            renderOrden(
              ordenActual
            );
          }
      });
    }
  );

  el(
    'btnConsultarCotizacion'
  )?.addEventListener(
    'click',
    event => {
      const id =
        event.currentTarget
          .dataset.id;

      if (id) {
        location.hash =
          `#/cotizaciones/detalle?id=${id}`;
      }
    }
  );

  el(
    'btnConsultarReserva'
  )?.addEventListener(
    'click',
    () => {
      location.hash =
        '#/inventario/reservas';
    }
  );

  el(
    'btnConsultarProgramacion'
  )?.addEventListener(
    'click',
    () => {
      location.hash =
        '#/logistica';
    }
  );
}

function renderOrden(
  orden
) {
  renderResumen(orden);
  renderCotizacion(orden);
  renderDetalleComprometido(
    orden
  );
  renderInventario(orden);
  renderLogistica(orden);
  renderTrazabilidad(orden);
  configurarAcciones(orden);
  mostrarContenido();
}

async function cargarDetalle() {
  const id =
    obtenerIdOrdenHash();

  if (!id) {
    mostrarError(
      'No se indicó una Orden válida.'
    );

    return;
  }

  el(
    'ordenDetalleEstado'
  ).className =
    'ordenes-state ordenes-state--loading';

  el(
    'ordenDetalleEstado'
  ).innerHTML = `
    <strong>
      Cargando detalle...
    </strong>

    <p>
      Consultando información relacionada.
    </p>
  `;

  el(
    'ordenDetalleEstado'
  ).hidden = false;

  el(
    'ordenDetalleContenido'
  ).hidden = true;

  try {
    ordenActual =
      await getOrden(id);

    renderOrden(
      ordenActual
    );
  } catch (error) {
    mostrarError(
      error?.message ||
      'Ocurrió un error inesperado.'
    );
  }
}

export async function init() {
  registrarEventos();

  await cargarDetalle();
}