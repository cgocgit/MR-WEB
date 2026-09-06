import {
  cancelarOrden,
  getOrden,
  revisarOrdenVentas
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
  obtenerClaseEstadoOrden,
  obtenerEtiquetaEstadoOrden,
  obtenerIdOrdenHash,
  valorDisponible
} from './ordenes-ui.js';

let ordenActual = null;

const el =
  id =>
    document.getElementById(id);

function mostrarError(
  titulo,
  mensaje
) {
  const estado =
    el(
      'ordenRevisionEstado'
    );

  estado.className =
    'ordenes-state ordenes-state--error';

  estado.innerHTML = `
    <strong>
      ${escaparHtml(titulo)}
    </strong>

    <p>
      ${escaparHtml(mensaje)}
    </p>
  `;

  estado.hidden = false;

  el(
    'ordenRevisionContenido'
  ).hidden = true;
}

function renderOrden(
  orden
) {
  el(
    'ordenRevisionTitulo'
  ).textContent =
    `Revisión de ${orden.folio}`;

  el(
    'revisionResumen'
  ).innerHTML = `
    <div class="ordenes-summary-item">
      <span>Orden</span>
      <strong>
        ${escaparHtml(
          orden.folio
        )}
      </strong>
    </div>

    <div class="ordenes-summary-item">
      <span>Estado</span>
      <strong>
        ${crearBadge(
          obtenerEtiquetaEstadoOrden(
            orden.estadoOrden
          ),
          obtenerClaseEstadoOrden(
            orden.estadoOrden
          )
        )}
      </strong>
    </div>

    <div class="ordenes-summary-item">
      <span>Cotización</span>
      <strong>
        ${escaparHtml(
          valorDisponible(
            orden.cotizacionOrigen
              ?.folio
          )
        )}
      </strong>
    </div>

    <div class="ordenes-summary-item">
      <span>Versión confirmada</span>
      <strong>
        ${escaparHtml(
          valorDisponible(
            orden.cotizacionOrigen
              ?.versionConfirmada
          )
        )}
      </strong>
    </div>

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
            orden.domicilioEvento,
            'No informado'
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

  const detalle =
    orden.detalleComprometido ||
    {};

  const items = [];

  (
    detalle.productos || []
  ).forEach(
    item => {
      items.push({
        tipo:
          'Producto rentado',

        nombre:
          item.nombre,

        cantidad:
          item.cantidad,

        origen:
          'Concepto directo'
      });
    }
  );

  (
    detalle.servicios || []
  ).forEach(
    item => {
      items.push({
        tipo:
          'Servicio',

        nombre:
          item.nombre,

        cantidad:
          item.cantidad,

        origen:
          'Concepto directo'
      });
    }
  );

  (
    detalle.paquetes || []
  ).forEach(
    paquete => {
      items.push({
        tipo:
          'Paquete',

        nombre:
          paquete.nombre,

        cantidad:
          paquete.cantidad,

        origen:
          'Cotización confirmada'
      });

      (
        paquete
          .composicion
          ?.productos ||
        []
      ).forEach(
        item => {
          items.push({
            tipo:
              'Producto incluido',

            nombre:
              item.nombre,

            cantidad:
              item.cantidad,

            origen:
              paquete.nombre
          });
        }
      );

      (
        paquete
          .composicion
          ?.servicios ||
        []
      ).forEach(
        item => {
          items.push({
            tipo:
              'Servicio incluido',

            nombre:
              item.nombre,

            cantidad:
              item.cantidad,

            origen:
              paquete.nombre
          });
        }
      );
    }
  );

  el(
    'revisionDetalleComprometido'
  ).innerHTML =
    items.length
      ? `
        <div
          class="ordenes-table-wrapper"
        >
          <table
            class="ordenes-table"
          >
            <thead>
              <tr>
                <th>Tipo</th>
                <th>Concepto</th>
                <th>Cantidad</th>
                <th>Origen</th>
              </tr>
            </thead>

            <tbody>
              ${items
                .map(
                  item => `
                    <tr>
                      <td>
                        ${escaparHtml(
                          item.tipo
                        )}
                      </td>

                      <td>
                        ${escaparHtml(
                          valorDisponible(
                            item.nombre
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

                      <td>
                        ${escaparHtml(
                          valorDisponible(
                            item.origen
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
      `
      : `
        <div
          class="ordenes-empty"
        >
          <strong>
            Sin detalle comprometido disponible.
          </strong>
        </div>
      `;

  el(
    'revisionReserva'
  ).innerHTML = `
    <div class="ordenes-summary-item">
      <span>Estado de reserva</span>
      <strong>
        ${escaparHtml(
          valorDisponible(
            orden
              .inventarioRelacionado
              ?.estadoResumen
          )
        )}
      </strong>
    </div>

    <div class="ordenes-summary-item">
      <span>Referencia de pago</span>
      <strong>
        ${escaparHtml(
          valorDisponible(
            orden.cotizacionOrigen
              ?.referenciaPago
          )
        )}
      </strong>
    </div>
  `;

  el(
    'ordenRevisionEstado'
  ).hidden = true;

  el(
    'ordenRevisionContenido'
  ).hidden = false;

  el(
    'btnCancelarRevision'
  ).hidden =
    !hasPermission(
      getSession(),
      PERMISOS_ORDENES.CANCELAR
    ) ||
    orden.cancelable !== true;
}

function registrarEventos() {
  el(
    'btnVolverDetalleOrden'
  )?.addEventListener(
    'click',
    () => {
      location.hash =
        `#/ordenes/detalle?id=${
          ordenActual.id
        }`;
    }
  );

  el(
    'btnConfirmarRevision'
  )?.addEventListener(
    'click',
    async event => {
      const boton =
        event.currentTarget;

      boton.disabled = true;
      boton.textContent =
        'Confirmando...';

      try {
        const actualizada =
          await revisarOrdenVentas(
            ordenActual.id
          );

        showNotification(
          'Revisión confirmada. La Orden quedó pendiente de programación.'
        );

        location.hash =
          `#/ordenes/detalle?id=${
            actualizada.id
          }`;
      } catch (error) {
        showNotification(
          error?.message ||
          'No fue posible confirmar la revisión.'
        );

        boton.disabled =
          false;

        boton.textContent =
          'Reintentar';
      }
    }
  );

  el(
    'btnCancelarRevision'
  )?.addEventListener(
    'click',
    () => {
      abrirModalCancelacion({
        orden:
          ordenActual,

        onConfirmar:
          async motivo => {
            const cancelada =
              await cancelarOrden(
                ordenActual.id,
                motivo
              );

            showNotification(
              'La Orden fue cancelada correctamente.'
            );

            location.hash =
              `#/ordenes/detalle?id=${
                cancelada.id
              }`;
          }
      });
    }
  );
}

export async function init() {
  const id =
    obtenerIdOrdenHash();

  if (!id) {
    mostrarError(
      'Orden no encontrada',
      'No se indicó una Orden válida.'
    );

    return;
  }

  registrarEventos();

  try {
    ordenActual =
      await getOrden(id);

    if (
      ordenActual.estadoOrden !==
      ESTADOS_ORDEN
        .EN_REVISION_VENTAS
    ) {
      mostrarError(
        'Estado no válido para revisión',
        'La Orden ya no se encuentra en revisión de Ventas.'
      );

      return;
    }

    renderOrden(
      ordenActual
    );
  } catch (error) {
    mostrarError(
      'No fue posible consultar la Orden',
      error?.message ||
      'Ocurrió un error inesperado.'
    );
  }
}