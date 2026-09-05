import {
  escaparHtml,
  formatearFechaHora,
  obtenerEtiquetaEstadoOrden,
  valorDisponible
} from './ordenes-ui.js';

function obtenerHost() {
  let host =
    document.getElementById(
      'ordenesModalHost'
    );

  if (!host) {
    host =
      document.createElement(
        'div'
      );

    host.id =
      'ordenesModalHost';

    document.body.appendChild(
      host
    );
  }

  return host;
}

export function abrirModalCancelacion({
  orden,
  onConfirmar
}) {
  const host =
    obtenerHost();

  host.innerHTML = `
    <div
      class="ordenes-modal-backdrop"
      role="presentation"
    >
      <section
        class="ordenes-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="ordenesCancelarTitulo"
      >
        <header
          class="ordenes-modal-header"
        >
          <div>
            <h2
              id="ordenesCancelarTitulo"
            >
              Cancelar Orden
            </h2>

            <p
              class="ordenes-subtitle"
            >
              Esta acción requiere confirmación explícita.
            </p>
          </div>

          <button
            type="button"
            class="ordenes-modal-close"
            data-cerrar-modal
            aria-label="Cerrar"
          >
            ×
          </button>
        </header>

        <div
          class="ordenes-modal-body"
        >
          <div
            class="ordenes-summary-grid"
          >
            <div
              class="ordenes-summary-item"
            >
              <span>Orden</span>
              <strong>
                ${escaparHtml(
                  orden.folio
                )}
              </strong>
            </div>

            <div
              class="ordenes-summary-item"
            >
              <span>Cliente</span>
              <strong>
                ${escaparHtml(
                  valorDisponible(
                    orden.cliente
                  )
                )}
              </strong>
            </div>

            <div
              class="ordenes-summary-item"
            >
              <span>
                Fecha del evento
              </span>
              <strong>
                ${escaparHtml(
                  formatearFechaHora(
                    orden.fechaHoraEvento ||
                    orden.fechaEntrega
                  )
                )}
              </strong>
            </div>

            <div
              class="ordenes-summary-item"
            >
              <span>
                Estado actual
              </span>
              <strong>
                ${escaparHtml(
                  obtenerEtiquetaEstadoOrden(
                    orden.estadoOrden
                  )
                )}
              </strong>
            </div>

            <div
              class="ordenes-summary-item"
            >
              <span>
                Reserva
              </span>
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

            <div
              class="ordenes-summary-item"
            >
              <span>
                Logística
              </span>
              <strong>
                ${escaparHtml(
                  valorDisponible(
                    orden
                      .logisticaRelacionada
                      ?.estadoLogistico
                  )
                )}
              </strong>
            </div>
          </div>

          <div
            class="
              ordenes-alert
              ordenes-alert--danger
            "
          >
            <strong>
              Impacto de la cancelación
            </strong>

            <p>
              Se solicitará a Inventario atender la
              liberación de la reserva relacionada y
              a Logística atender la cancelación de
              la programación o ejecución asociada.
            </p>
          </div>

          <div
            class="ordenes-field"
          >
            <label
              for="ordenesMotivoCancelacion"
            >
              Motivo de cancelación *
            </label>

            <textarea
              id="ordenesMotivoCancelacion"
              rows="4"
              maxlength="500"
              placeholder="Indica el motivo de la cancelación"
            ></textarea>

            <p
              id="ordenesCancelacionError"
              class="ordenes-field-error"
              hidden
            ></p>
          </div>

          <label
            class="ordenes-confirm-check"
          >
            <input
              id="ordenesConfirmarCancelacion"
              type="checkbox"
            >

            <span>
              Confirmo que deseo cancelar esta Orden.
            </span>
          </label>
        </div>

        <footer
          class="ordenes-modal-footer"
        >
          <button
            type="button"
            class="
              ordenes-btn
              ordenes-btn--secondary
            "
            data-cerrar-modal
          >
            Conservar Orden
          </button>

          <button
            id="btnConfirmarCancelacionOrden"
            type="button"
            class="
              ordenes-btn
              ordenes-btn--danger
            "
            disabled
          >
            Cancelar Orden
          </button>
        </footer>
      </section>
    </div>
  `;

  const motivo =
    host.querySelector(
      '#ordenesMotivoCancelacion'
    );

  const confirmacion =
    host.querySelector(
      '#ordenesConfirmarCancelacion'
    );

  const confirmar =
    host.querySelector(
      '#btnConfirmarCancelacionOrden'
    );

  const error =
    host.querySelector(
      '#ordenesCancelacionError'
    );

  function validar() {
    const valido =
      String(
        motivo?.value ?? ''
      ).trim().length > 0 &&
      confirmacion?.checked ===
        true;

    confirmar.disabled =
      !valido;
  }

  function cerrar() {
    host.innerHTML = '';
  }

  host
    .querySelectorAll(
      '[data-cerrar-modal]'
    )
    .forEach(
      boton => {
        boton.addEventListener(
          'click',
          cerrar
        );
      }
    );

  motivo?.addEventListener(
    'input',
    validar
  );

  confirmacion?.addEventListener(
    'change',
    validar
  );

  confirmar?.addEventListener(
    'click',
    async () => {
      const texto =
        String(
          motivo.value
        ).trim();

      if (
        !texto ||
        !confirmacion.checked
      ) {
        validar();
        return;
      }

      confirmar.disabled = true;
      confirmar.textContent =
        'Procesando...';

      error.hidden = true;

      try {
        await onConfirmar(
          texto
        );

        cerrar();
      } catch (ex) {
        error.textContent =
          ex?.message ||
          'No fue posible cancelar la Orden.';

        error.hidden = false;

        confirmar.disabled =
          false;

        confirmar.textContent =
          'Cancelar Orden';
      }
    }
  );

  motivo?.focus();
}