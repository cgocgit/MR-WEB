import {
  obtenerCorteFisico,
  guardarAvanceCorteFisico,
  concluirCorteFisico,
  cancelarCorteFisico,
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
  'corte-fisico-detalle-root';

const PERMISO_CONSULTAR =
  'inventario.cortes.consultar';

const PERMISO_GESTIONAR =
  'inventario.cortes.gestionar';

let corteActual = null;

const cantidadesInvalidas =
  new Set();

function obtenerRoot() {
  return document.getElementById(
    ROOT_ID
  );
}

function obtenerIdCorte() {
  const query =
    new URLSearchParams(
      window.location.hash
        .split('?')[1] || ''
    );

  const idCorte =
    Number(query.get('id'));

  return (
    Number.isInteger(idCorte) &&
    idCorte > 0
  )
    ? idCorte
    : null;
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

function calcularEstadoRenglon(
  item
) {
  if (item.cantidadFisica === null) {
    return 'Pendiente de conteo';
  }

  return item.cantidadFisica ===
    item.cantidadRegistrada
    ? 'Sin diferencia'
    : 'Con diferencia';
}

function recalcularCorteLocal() {
  corteActual.detalle =
    corteActual.detalle.map(item => {
      const diferencia =
        item.cantidadFisica === null
          ? null
          : Number(
              item.cantidadFisica
            ) -
            Number(
              item.cantidadRegistrada
            );

      return {
        ...item,
        diferencia,
        estadoRenglon:
          calcularEstadoRenglon(item)
      };
    });

  corteActual.resumen =
    corteActual.detalle.reduce(
      (resumen, item) => {
        resumen.productosIncluidos += 1;

        if (
          item.cantidadFisica === null
        ) {
          resumen.productosPendientes += 1;

          return resumen;
        }

        resumen.productosContados += 1;

        if (item.diferencia === 0) {
          resumen.productosSinDiferencia += 1;

          return resumen;
        }

        resumen.productosConDiferencia += 1;

        if (item.diferencia < 0) {
          resumen.unidadesFaltantes +=
            Math.abs(
              item.diferencia
            );
        }

        if (item.diferencia > 0) {
          resumen.unidadesSobrantes +=
            item.diferencia;
        }

        return resumen;
      },
      {
        productosIncluidos: 0,
        productosContados: 0,
        productosPendientes: 0,
        productosSinDiferencia: 0,
        productosConDiferencia: 0,
        unidadesFaltantes: 0,
        unidadesSobrantes: 0
      }
    );
}

function puedeGestionarCorte(
  session
) {
  return (
    corteActual?.estado ===
      ESTADOS_CORTE_FISICO.EN_CAPTURA &&
    hasPermission(
      session,
      PERMISO_GESTIONAR
    )
  );
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

  contenedor.textContent =
    mensaje;
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

function renderizarDatosGenerales(
  editable
) {
  return `
    <section class="inventario-form">
      <h2>Datos generales</h2>

      <div
        class="
          inventario-form-grid
          inventario-form-grid-four
        "
      >
        <div class="form-field">
          <label>Folio de corte</label>
          <input
            type="text"
            value="${escapeHtml(corteActual.folio)}"
            readonly
          >
        </div>

        <div class="form-field">
          <label>Almacén</label>
          <input
            type="text"
            value="${escapeHtml(corteActual.almacen)}"
            readonly
          >
        </div>

        <div class="form-field">
          <label>Estado</label>
          <input
            type="text"
            value="${escapeHtml(corteActual.estado)}"
            readonly
          >
        </div>

        <div class="form-field">
          <label>Responsable</label>
          <input
            type="text"
            value="${escapeHtml(corteActual.responsable)}"
            readonly
          >
        </div>

        <div class="form-field">
          <label>Fecha y hora de inicio</label>
          <input
            type="text"
            value="${escapeHtml(
              formatearFechaHora(
                corteActual.fechaInicio
              )
            )}"
            readonly
          >
        </div>

        <div class="form-field">
          <label>
            Fecha y hora de conclusión
          </label>
          <input
            type="text"
            value="${escapeHtml(
              formatearFechaHora(
                corteActual.fechaConclusion
              )
            )}"
            readonly
          >
        </div>

        <div class="form-field">
          <label for="corte-observaciones">
            Observaciones generales
          </label>

          <textarea
            id="corte-observaciones"
            rows="3"
            data-role="observaciones"
            ${editable ? '' : 'readonly'}
          >${escapeHtml(
            corteActual.observaciones
          )}</textarea>
        </div>
      </div>
    </section>
  `;
}

function renderizarResumen() {
  const resumen =
    corteActual.resumen;

  return `
    <section class="inventario-result-card">
      <div class="inventario-result-value">
        <span>Productos incluidos</span>
        <strong>
          ${resumen.productosIncluidos}
        </strong>
      </div>

      <div class="inventario-result-value">
        <span>Productos contados</span>
        <strong>
          ${resumen.productosContados}
        </strong>
      </div>

      <div class="inventario-result-value">
        <span>Productos pendientes</span>
        <strong>
          ${resumen.productosPendientes}
        </strong>
      </div>

      <div class="inventario-result-value">
        <span>Sin diferencia</span>
        <strong>
          ${resumen.productosSinDiferencia}
        </strong>
      </div>

      <div class="inventario-result-value">
        <span>Con diferencia</span>
        <strong>
          ${resumen.productosConDiferencia}
        </strong>
      </div>

      <div class="inventario-result-value">
        <span>Unidades faltantes</span>
        <strong>
          ${resumen.unidadesFaltantes}
        </strong>
      </div>

      <div class="inventario-result-value">
        <span>Unidades sobrantes</span>
        <strong>
          ${resumen.unidadesSobrantes}
        </strong>
      </div>
    </section>
  `;
}

function obtenerFiltrosDetalle(root) {
  const formulario =
    root.querySelector(
      '[data-role="filtros-detalle"]'
    );

  if (!formulario) {
    return {
      texto: '',
      soloDiferencias: false
    };
  }

  const datos =
    new FormData(formulario);

  return {
    texto:
      String(
        datos.get('producto') || ''
      )
        .trim()
        .toLowerCase(),

    soloDiferencias:
      datos.get('soloDiferencias') ===
      'si'
  };
}

function filtrarDetalle(root) {
  const filtros =
    obtenerFiltrosDetalle(root);

  return corteActual.detalle.filter(
    item => {
      const coincideTexto =
        !filtros.texto ||
        item.codigo
          .toLowerCase()
          .includes(
            filtros.texto
          ) ||
        item.producto
          .toLowerCase()
          .includes(
            filtros.texto
          );

      const coincideDiferencia =
        !filtros.soloDiferencias ||
        (
          item.diferencia !== null &&
          item.diferencia !== 0
        );

      return (
        coincideTexto &&
        coincideDiferencia
      );
    }
  );
}

function renderizarCantidadFisica(
  item,
  editable
) {
  if (!editable) {
    return item.cantidadFisica === null
      ? 'Pendiente'
      : String(
          item.cantidadFisica
        );
  }

  return `
    <input
      type="number"
      min="0"
      step="1"
      inputmode="numeric"
      data-action="cantidad-fisica"
      data-producto="${item.idProducto}"
      value="${
        item.cantidadFisica === null
          ? ''
          : item.cantidadFisica
      }"
      aria-label="Cantidad física de ${escapeHtml(
        item.producto
      )}"
    >
  `;
}

function renderizarDiferencia(
  item
) {
  return item.diferencia === null
    ? '—'
    : String(item.diferencia);
}

function renderizarTablaDetalle(
  root,
  editable
) {
  const detalle =
    filtrarDetalle(root);

  if (!detalle.length) {
    return `
      <section class="inventario-list card">
        <h2>Conteo de productos</h2>

        <p>
          No existen productos que coincidan
          con los filtros indicados.
        </p>
      </section>
    `;
  }

  const filas = detalle.map(item => `
    <tr data-producto="${item.idProducto}">
      <td>
        ${escapeHtml(item.codigo)}
      </td>

      <td>
        ${escapeHtml(item.producto)}
      </td>

      <td>
        ${escapeHtml(
          item.unidadMedida
        )}
      </td>

      <td>
        ${item.cantidadRegistrada}
      </td>

      <td>
        ${renderizarCantidadFisica(
          item,
          editable
        )}
      </td>

      <td data-field="diferencia">
        ${renderizarDiferencia(item)}
      </td>

      <td data-field="estado-renglon">
        ${escapeHtml(
          item.estadoRenglon
        )}
      </td>
    </tr>
  `).join('');

  return `
    <section class="inventario-list card">
      <h2>Conteo de productos</h2>

      <div class="table-responsive">
        <table>
          <thead>
            <tr>
              <th>Código</th>
              <th>Producto</th>
              <th>Unidad de medida</th>
              <th>Cantidad registrada</th>
              <th>Cantidad física</th>
              <th>Diferencia</th>
              <th>Estado</th>
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

function renderizarAcciones(
  editable
) {
  return `
    <div class="inventario-form-actions">
      ${
        editable
          ? `
            <button
              type="button"
              data-action="guardar"
            >
              Guardar avance
            </button>

            <button
              type="button"
              data-action="concluir"
            >
              Concluir corte
            </button>

            <button
              type="button"
              class="button-secondary"
              data-action="cancelar"
            >
              Cancelar corte
            </button>
          `
          : ''
      }

      <a
        class="button button-secondary"
        href="#/inventario/cortes-fisicos"
      >
        Volver a cortes
      </a>
    </div>
  `;
}

function renderizarPantalla(
  root,
  session
) {
  recalcularCorteLocal();

  const editable =
    puedeGestionarCorte(session);

  root.innerHTML = `
    <header class="inventario-page-header">
      <div>
        <h1>
          Detalle y captura de corte físico
        </h1>

        <p class="inventario-page-description">
          Registra el conteo físico de cada
          producto y compara automáticamente
          la cantidad física contra la
          registrada en Inventario.
        </p>
      </div>
    </header>

    ${renderizarDatosGenerales(
      editable
    )}

    <form
      class="inventario-form"
      data-role="filtros-detalle"
      novalidate
    >
      <div
        class="
          inventario-form-grid
          inventario-form-grid-four
        "
      >
        <div class="form-field">
          <label for="detalle-producto">
            Código o nombre de producto
          </label>

          <input
            id="detalle-producto"
            name="producto"
            type="search"
            autocomplete="off"
          >
        </div>

        <div class="form-field">
          <label for="detalle-diferencias">
            Diferencias
          </label>

          <select
            id="detalle-diferencias"
            name="soloDiferencias"
          >
            <option value="">
              Todos los productos
            </option>

            <option value="si">
              Solo productos con diferencia
            </option>
          </select>
        </div>
      </div>

      <div class="inventario-form-actions">
        <button type="submit">
          Buscar
        </button>

        <button
          type="button"
          class="button-secondary"
          data-action="limpiar-filtros"
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

    <div data-role="resumen">
      ${renderizarResumen()}
    </div>

    <div data-role="detalle">
      ${renderizarTablaDetalle(
        root,
        editable
      )}
    </div>

    ${renderizarAcciones(
      editable
    )}
  `;
}

function actualizarResumenDom(root) {
  const contenedor =
    root.querySelector(
      '[data-role="resumen"]'
    );

  if (contenedor) {
    contenedor.innerHTML =
      renderizarResumen();
  }
}

function actualizarFilaDom(
  root,
  item
) {
  const fila =
    root.querySelector(
      `tr[data-producto="${item.idProducto}"]`
    );

  if (!fila) {
    return;
  }

  const diferencia =
    fila.querySelector(
      '[data-field="diferencia"]'
    );

  const estado =
    fila.querySelector(
      '[data-field="estado-renglon"]'
    );

  if (diferencia) {
    diferencia.textContent =
      renderizarDiferencia(item);
  }

  if (estado) {
    estado.textContent =
      item.estadoRenglon;
  }
}

function actualizarCantidadLocal(
  root,
  input
) {
  const idProducto =
    Number(input.dataset.producto);

  const item =
    corteActual.detalle.find(
      producto =>
        producto.idProducto ===
        idProducto
    );

  if (!item) {
    return;
  }

  const texto =
    input.value.trim();

  if (texto === '') {
    cantidadesInvalidas.delete(
      idProducto
    );

    input.removeAttribute(
      'aria-invalid'
    );

    item.cantidadFisica = null;

    ocultarMensaje(root);

    recalcularCorteLocal();

    actualizarFilaDom(
      root,
      item
    );

    actualizarResumenDom(root);

    return;
  }

  const cantidad =
    Number(texto);

  if (
    !Number.isInteger(cantidad) ||
    cantidad < 0
  ) {
    cantidadesInvalidas.add(
      idProducto
    );

    input.setAttribute(
      'aria-invalid',
      'true'
    );

    mostrarMensaje(
      root,
      'La cantidad física debe ser un número entero igual o mayor que cero.',
      'error'
    );

    return;
  }

  cantidadesInvalidas.delete(
    idProducto
  );

  input.removeAttribute(
    'aria-invalid'
  );

  item.cantidadFisica =
    cantidad;

  ocultarMensaje(root);

  recalcularCorteLocal();

  const actualizado =
    corteActual.detalle.find(
      producto =>
        producto.idProducto ===
        idProducto
    );

  actualizarFilaDom(
    root,
    actualizado
  );

  actualizarResumenDom(root);
}

function obtenerConteos() {
  return corteActual.detalle.map(
    item => ({
      idProducto: item.idProducto,
      cantidadFisica:
        item.cantidadFisica
    })
  );
}

function bloquearAcciones(
  root,
  bloqueado
) {
  [
    'guardar',
    'concluir',
    'cancelar'
  ].forEach(accion => {
    const boton =
      root.querySelector(
        `[data-action="${accion}"]`
      );

    if (boton) {
      boton.disabled =
        bloqueado;
    }
  });
}

async function guardarAvance(
  root,
  session
) {
  ocultarMensaje(root);

  if (
    cantidadesInvalidas.size > 0
  ) {
    mostrarMensaje(
      root,
      'Corrija las cantidades físicas inválidas antes de guardar.',
      'error'
    );

    return;
  }

  bloquearAcciones(
    root,
    true
  );

  try {
    corteActual =
      await guardarAvanceCorteFisico({
        idCorte:
          corteActual.idCorte,
        observaciones:
          corteActual.observaciones,
        conteos:
          obtenerConteos()
      });

    cantidadesInvalidas.clear();

    showNotification(
      'El avance del corte se guardó correctamente.',
      {
        type: 'success'
      }
    );

    renderizarPantalla(
      root,
      session
    );
  } catch (error) {
    mostrarMensaje(
      root,
      error?.message ||
        'No fue posible guardar el avance del corte.',
      'error'
    );
  } finally {
    bloquearAcciones(
      root,
      false
    );
  }
}

async function concluir(
  root,
  session
) {
  ocultarMensaje(root);

  if (
    cantidadesInvalidas.size > 0
  ) {
    mostrarMensaje(
      root,
      'Corrija las cantidades físicas inválidas antes de concluir.',
      'error'
    );

    return;
  }

  recalcularCorteLocal();

  if (
    corteActual.resumen
      .productosPendientes > 0
  ) {
    mostrarMensaje(
      root,
      'No se puede concluir el corte mientras existan productos pendientes de conteo.',
      'error'
    );

    return;
  }

  const confirmar =
    window.confirm(
      '¿Desea concluir el corte físico? Después de concluirlo no podrá modificarse.'
    );

  if (!confirmar) {
    return;
  }

  bloquearAcciones(
    root,
    true
  );

  try {
    corteActual =
      await concluirCorteFisico({
        idCorte:
          corteActual.idCorte,
        observaciones:
          corteActual.observaciones,
        conteos:
          obtenerConteos()
      });

    cantidadesInvalidas.clear();

    showNotification(
      corteActual.estado ===
        ESTADOS_CORTE_FISICO
          .DIFERENCIAS_PENDIENTES
        ? 'El corte se concluyó con diferencias pendientes.'
        : 'El corte se concluyó sin diferencias.',
      {
        type: 'success'
      }
    );

    renderizarPantalla(
      root,
      session
    );
  } catch (error) {
    mostrarMensaje(
      root,
      error?.message ||
        'No fue posible concluir el corte físico.',
      'error'
    );
  } finally {
    bloquearAcciones(
      root,
      false
    );
  }
}

async function cancelar(
  root
) {
  const confirmar =
    window.confirm(
      '¿Desea cancelar este corte físico? El avance capturado se descartará.'
    );

  if (!confirmar) {
    return;
  }

  bloquearAcciones(
    root,
    true
  );

  try {
    await cancelarCorteFisico(
      corteActual.idCorte
    );

    showNotification(
      'El corte físico fue cancelado.',
      {
        type: 'success'
      }
    );

    location.hash =
      '#/inventario/cortes-fisicos';
  } catch (error) {
    mostrarMensaje(
      root,
      error?.message ||
        'No fue posible cancelar el corte físico.',
      'error'
    );

    bloquearAcciones(
      root,
      false
    );
  }
}

function actualizarTablaPorFiltros(
  root,
  session
) {
  const contenedor =
    root.querySelector(
      '[data-role="detalle"]'
    );

  if (!contenedor) {
    return;
  }

  contenedor.innerHTML =
    renderizarTablaDetalle(
      root,
      puedeGestionarCorte(
        session
      )
    );
}

function configurarEventos(
  root,
  session
) {
  root.addEventListener(
    'submit',
    event => {
      if (
        !event.target.matches(
          '[data-role="filtros-detalle"]'
        )
      ) {
        return;
      }

      event.preventDefault();

      actualizarTablaPorFiltros(
        root,
        session
      );
    }
  );

  root.addEventListener(
    'input',
    event => {
      const cantidad =
        event.target.closest(
          '[data-action="cantidad-fisica"]'
        );

      if (cantidad) {
        actualizarCantidadLocal(
          root,
          cantidad
        );

        return;
      }

      if (
        event.target.matches(
          '[data-role="observaciones"]'
        )
      ) {
        corteActual.observaciones =
          event.target.value;
      }
    }
  );

  root.addEventListener(
    'click',
    event => {
      const boton =
        event.target.closest(
          '[data-action]'
        );

      if (!boton) {
        return;
      }

      const accion =
        boton.dataset.action;

      if (
        accion ===
        'limpiar-filtros'
      ) {
        const formulario =
          root.querySelector(
            '[data-role="filtros-detalle"]'
          );

        formulario.reset();

        actualizarTablaPorFiltros(
          root,
          session
        );

        return;
      }

      if (
        accion === 'guardar'
      ) {
        guardarAvance(
          root,
          session
        );

        return;
      }

      if (
        accion === 'concluir'
      ) {
        concluir(
          root,
          session
        );

        return;
      }

      if (
        accion === 'cancelar'
      ) {
        cancelar(root);
      }
    }
  );
}

export async function initCorteFisicoDetalle() {
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
        este corte físico.
      </div>
    `;

    return;
  }

  const idCorte =
    obtenerIdCorte();

  if (!idCorte) {
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
        No se indicó un corte físico válido.
      </div>
    `;

    return;
  }

  try {
    corteActual =
      await obtenerCorteFisico(
        idCorte
      );

    cantidadesInvalidas.clear();

    recalcularCorteLocal();

    renderizarPantalla(
      root,
      session
    );

    configurarEventos(
      root,
      session
    );
  } catch (error) {
    root.innerHTML = `
      <div
        class="
          inventario-state
          inventario-state-error
        "
      >
        ${escapeHtml(
          error?.message ||
          'No fue posible cargar el corte físico.'
        )}
      </div>
    `;
  } finally {
    root.setAttribute(
      'aria-busy',
      'false'
    );
  }
}