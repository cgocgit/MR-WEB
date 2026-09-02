import {
  listarCortesFisicos,
  crearCorteFisico,
  ESTADOS_CORTE_FISICO
} from '../../api/inventario-cortes.service.js';

import {
  getSession
} from '../../shared/auth-guard.js';

import {
  hasPermission
} from '../../shared/permissions.js';

import {
  escapeHtml
} from '../../shared/formatters.js';

import {
  showNotification
} from '../../components/notification.js';

const ROOT_ID =
  'cortes-fisicos-root';

const PERMISO_CONSULTAR =
  'inventario.cortes.consultar';

const PERMISO_GESTIONAR =
  'inventario.cortes.gestionar';

function obtenerRoot() {
  return document.getElementById(
    ROOT_ID
  );
}

function formatearFechaHora(valor) {
  if (!valor) {
    return '—';
  }

  return new Intl.DateTimeFormat(
    'es-MX',
    {
      dateStyle: 'short',
      timeStyle: 'short'
    }
  ).format(new Date(valor));
}

function mostrarMensaje(
  root,
  mensaje,
  tipo = 'info'
) {
  const contenedor =
    root.querySelector(
      '[data-role="mensaje"]'
    );

  if (!contenedor) {
    return;
  }

  contenedor.hidden = false;
  contenedor.className =
    `inventario-message inventario-message-${tipo}`;

  contenedor.textContent = mensaje;
}

function ocultarMensaje(root) {
  const contenedor =
    root.querySelector(
      '[data-role="mensaje"]'
    );

  if (!contenedor) {
    return;
  }

  contenedor.hidden = true;
  contenedor.textContent = '';
}

function obtenerFiltros(root) {
  const formulario =
    root.querySelector(
      '[data-role="filtros"]'
    );

  const datos =
    new FormData(formulario);

  return {
    folio:
      String(
        datos.get('folio') || ''
      ).trim(),
    estado:
      String(
        datos.get('estado') || ''
      ),
    fechaDesde:
      String(
        datos.get('fechaDesde') || ''
      ),
    fechaHasta:
      String(
        datos.get('fechaHasta') || ''
      )
  };
}

function validarFiltros(filtros) {
  if (
    filtros.fechaDesde &&
    filtros.fechaHasta &&
    filtros.fechaHasta <
      filtros.fechaDesde
  ) {
    return (
      'La fecha final del periodo no puede ' +
      'ser anterior a la fecha inicial.'
    );
  }

  return null;
}

function renderizarAcciones(
  corte,
  puedeGestionar
) {
  const ruta =
    `#/inventario/cortes-fisicos/detalle?id=${corte.idCorte}`;

  const verDetalle = `
    <a
      class="button button-secondary"
      href="${ruta}"
    >
      Ver detalle
    </a>
  `;

  if (
    !puedeGestionar ||
    corte.estado !==
      ESTADOS_CORTE_FISICO.EN_CAPTURA
  ) {
    return verDetalle;
  }

  return `
    ${verDetalle}

    <a
      class="button"
      href="${ruta}"
    >
      Continuar
    </a>
  `;
}

function renderizarTabla(
  cortes,
  puedeGestionar
) {
  if (!cortes.length) {
    return `
      <section class="inventario-list card">
        <h2>Resultados</h2>
        <p>
          No existen cortes físicos que
          coincidan con los filtros indicados.
        </p>
      </section>
    `;
  }

  const filas = cortes.map(corte => `
    <tr>
      <td>
        ${escapeHtml(corte.folio)}
      </td>

      <td>
        ${escapeHtml(
          formatearFechaHora(
            corte.fechaInicio
          )
        )}
      </td>

      <td>
        ${escapeHtml(
          corte.responsable
        )}
      </td>

      <td>
        ${corte.productosContados}
        /
        ${corte.productosIncluidos}
      </td>

      <td>
        ${corte.diferenciasDetectadas}
      </td>

      <td>
        ${escapeHtml(corte.estado)}
      </td>

      <td>
        <div class="inventario-form-actions">
          ${renderizarAcciones(
            corte,
            puedeGestionar
          )}
        </div>
      </td>
    </tr>
  `).join('');

  return `
    <section class="inventario-list card">
      <h2>Resultados</h2>

      <div class="table-responsive">
        <table>
          <thead>
            <tr>
              <th>Folio</th>
              <th>Fecha y hora de inicio</th>
              <th>Responsable</th>
              <th>Productos contados</th>
              <th>Diferencias detectadas</th>
              <th>Estado</th>
              <th>Acción</th>
            </tr>
          </thead>

          <tbody>
            ${filas}
          </tbody>
        </table>
      </div>
    </section>
  `;
}

function renderizarPantalla(
  root,
  puedeGestionar
) {
  root.innerHTML = `
    <header class="inventario-page-header">
      <div>
        <h1>
          Cortes físicos de Inventario
        </h1>

        <p class="inventario-page-description">
          Consulta los cortes físicos existentes
          e inicia un nuevo conteo en el
          Almacén Central.
        </p>
      </div>

      ${
        puedeGestionar
          ? `
            <button
              type="button"
              data-action="nuevo-corte"
            >
              Nuevo corte físico
            </button>
          `
          : ''
      }
    </header>

    <form
      class="inventario-form"
      data-role="filtros"
      novalidate
    >
      <div
        class="
          inventario-form-grid
          inventario-form-grid-four
        "
      >
        <div class="form-field">
          <label for="corte-folio">
            Folio
          </label>

          <input
            id="corte-folio"
            name="folio"
            type="search"
            autocomplete="off"
            placeholder="Ej. CF-2026-0001"
          >
        </div>

        <div class="form-field">
          <label for="corte-estado">
            Estado
          </label>

          <select
            id="corte-estado"
            name="estado"
          >
            <option value="">
              Todos
            </option>

            <option
              value="${ESTADOS_CORTE_FISICO.EN_CAPTURA}"
            >
              En captura
            </option>

            <option
              value="${ESTADOS_CORTE_FISICO.DIFERENCIAS_PENDIENTES}"
            >
              Con diferencias pendientes
            </option>

            <option
              value="${ESTADOS_CORTE_FISICO.CONCLUIDO}"
            >
              Concluido
            </option>
          </select>
        </div>

        <div class="form-field">
          <label for="corte-fecha-desde">
            Periodo desde
          </label>

          <input
            id="corte-fecha-desde"
            name="fechaDesde"
            type="date"
          >
        </div>

        <div class="form-field">
          <label for="corte-fecha-hasta">
            Periodo hasta
          </label>

          <input
            id="corte-fecha-hasta"
            name="fechaHasta"
            type="date"
          >
        </div>
      </div>

      <div class="inventario-form-actions">
        <button type="submit">
          Buscar
        </button>

        <button
          type="button"
          class="button-secondary"
          data-action="limpiar"
        >
          Limpiar
        </button>
      </div>
    </form>

    <div
      class="inventario-message"
      data-role="mensaje"
      hidden
      aria-live="polite"
    ></div>

    <div
      data-role="resultados"
      aria-live="polite"
    ></div>
  `;
}

async function cargarCortes(
  root,
  puedeGestionar
) {
  const filtros =
    obtenerFiltros(root);

  const error =
    validarFiltros(filtros);

  ocultarMensaje(root);

  if (error) {
    mostrarMensaje(
      root,
      error,
      'error'
    );

    return;
  }

  const resultados =
    root.querySelector(
      '[data-role="resultados"]'
    );

  resultados.innerHTML = `
    <section class="inventario-list card">
      <p>Consultando cortes físicos...</p>
    </section>
  `;

  try {
    const cortes =
      await listarCortesFisicos(
        filtros
      );

    resultados.innerHTML =
      renderizarTabla(
        cortes,
        puedeGestionar
      );
  } catch (errorConsulta) {
    resultados.innerHTML = '';

    mostrarMensaje(
      root,
      errorConsulta?.message ||
        'No fue posible consultar los cortes físicos.',
      'error'
    );
  }
}

async function iniciarNuevoCorte(
  root,
  boton
) {
  ocultarMensaje(root);

  boton.disabled = true;
  boton.textContent =
    'Creando corte...';

  try {
    const corte =
      await crearCorteFisico();

    showNotification(
      `Se creó el corte ${corte.folio}.`,
      {
        type: 'success'
      }
    );

    location.hash =
      `#/inventario/cortes-fisicos/detalle?id=${corte.idCorte}`;
  } catch (error) {
    mostrarMensaje(
      root,
      error?.message ||
        'No fue posible iniciar el corte físico.',
      'error'
    );

    boton.disabled = false;
    boton.textContent =
      'Nuevo corte físico';
  }
}

function configurarEventos(
  root,
  puedeGestionar
) {
  root.addEventListener(
    'submit',
    event => {
      if (
        !event.target.matches(
          '[data-role="filtros"]'
        )
      ) {
        return;
      }

      event.preventDefault();

      cargarCortes(
        root,
        puedeGestionar
      );
    }
  );

  root.addEventListener(
    'click',
    event => {
      const limpiar =
        event.target.closest(
          '[data-action="limpiar"]'
        );

      if (limpiar) {
        const formulario =
          root.querySelector(
            '[data-role="filtros"]'
          );

        formulario.reset();

        ocultarMensaje(root);

        cargarCortes(
          root,
          puedeGestionar
        );

        return;
      }

      const nuevo =
        event.target.closest(
          '[data-action="nuevo-corte"]'
        );

      if (
        nuevo &&
        puedeGestionar
      ) {
        iniciarNuevoCorte(
          root,
          nuevo
        );
      }
    }
  );
}

export async function initCortesFisicos() {
  const root =
    obtenerRoot();

  if (!root) {
    return;
  }

  const session =
    getSession();

  if (
    !hasPermission(
      session,
      PERMISO_CONSULTAR
    )
  ) {
    root.setAttribute(
      'aria-busy',
      'false'
    );

    root.innerHTML = `
      <div
        class="
          inventario-state
          inventario-state-error
        "
      >
        No tiene permisos para consultar
        los cortes físicos de Inventario.
      </div>
    `;

    return;
  }

  const puedeGestionar =
    hasPermission(
      session,
      PERMISO_GESTIONAR
    );

  renderizarPantalla(
    root,
    puedeGestionar
  );

  configurarEventos(
    root,
    puedeGestionar
  );

  await cargarCortes(
    root,
    puedeGestionar
  );

  root.setAttribute(
    'aria-busy',
    'false'
  );
}