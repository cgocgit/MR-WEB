import {
  listarProductosInventariables,
  consultarDisponibilidadFutura
} from '../../api/inventario.service.js';

import {
  hasPermission
} from '../../shared/permissions.js';

import {
  escapeHtml
} from '../../shared/formatters.js';

const ROOT_ID = 'disponibilidad-futura-root';
const PERMISO_CONSULTAR = 'inventario.disponibilidad.consultar';
const PERMISO_VER_RESERVAS = 'inventario.reservas.consultar';

let consecutivoConsulta = 0;

function obtenerRoot() {
  return document.getElementById(ROOT_ID);
}

function obtenerParametroProducto() {
  const query = new URLSearchParams(window.location.hash.split('?')[1] || '');
  const idProducto = Number(query.get('idProducto'));

  return Number.isInteger(idProducto) && idProducto > 0
    ? idProducto
    : null;
}

function mostrarMensaje(root, mensaje, tipo = 'info') {
  const contenedor = root.querySelector('[data-role="mensaje"]');

  if (!contenedor) {
    return;
  }

  contenedor.hidden = false;
  contenedor.className = `inventario-message inventario-message-${tipo}`;
  contenedor.textContent = mensaje;
}

function ocultarMensaje(root) {
  const contenedor = root.querySelector('[data-role="mensaje"]');

  if (!contenedor) {
    return;
  }

  contenedor.hidden = true;
  contenedor.textContent = '';
}

function limpiarResultado(root) {
  const resultado = root.querySelector('[data-role="resultado"]');
  const reservas = root.querySelector('[data-role="reservas"]');

  if (resultado) {
    resultado.hidden = true;
    resultado.innerHTML = '';
  }

  if (reservas) {
    reservas.hidden = true;
    reservas.innerHTML = '';
  }
}

function renderizarProductos(productos, productoSeleccionado) {
  const opciones = productos.map(producto => `
    <option
      value="${producto.idProducto}"
      ${producto.idProducto === productoSeleccionado ? 'selected' : ''}
    >
      ${escapeHtml(producto.codigo)} - ${escapeHtml(producto.nombre)}
    </option>
  `).join('');

  return `
    <option value="">Seleccione un producto</option>
    ${opciones}
  `;
}

function renderizarFormulario(productos, productoSeleccionado) {
  return `
    <form
      class="inventario-form"
      data-role="formulario"
      novalidate
    >
      <div
        class="inventario-form-grid inventario-form-grid-four"
      >
        <div class="form-field">
          <label for="idProducto">Producto</label>
          <select
            id="idProducto"
            name="idProducto"
            required
          >
            ${renderizarProductos(productos, productoSeleccionado)}
          </select>
        </div>

        <div class="form-field">
          <label for="cantidad">Cantidad solicitada</label>
          <input
            id="cantidad"
            name="cantidad"
            type="number"
            min="1"
            step="1"
            inputmode="numeric"
            required
          >
        </div>

        <div class="form-field">
          <label for="fechaInicio">Fecha de entrega o inicio</label>
          <input
            id="fechaInicio"
            name="fechaInicio"
            type="date"
            required
          >
        </div>

        <div class="form-field">
          <label for="fechaFin">Fecha de recolección o fin</label>
          <input
            id="fechaFin"
            name="fechaFin"
            type="date"
            required
          >
        </div>
      </div>

      <div class="inventario-form-actions">
        <button type="submit">
          Consultar disponibilidad
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
      data-role="resultado"
      hidden
      aria-live="polite"
    ></div>

    <div
      data-role="reservas"
      hidden
    ></div>
  `;
}

function renderizarResultado(resultado) {
  const disponible = resultado.disponible === true;
  const claseEstado = disponible
    ? 'inventario-resultado-disponible'
    : 'inventario-resultado-no-disponible';

  const textoEstado = disponible
    ? 'Disponible'
    : 'No disponible';

  return `
    <section class="inventario-result-card ${claseEstado}">
      <div class="inventario-result-state">
        <span class="inventario-result-label">Resultado</span>
        <strong>${textoEstado}</strong>
      </div>

      <div class="inventario-result-value">
        <span>Cantidad registrada</span>
        <strong>${resultado.cantidadRegistrada}</strong>
      </div>

      <div class="inventario-result-value">
        <span>Cantidad comprometida</span>
        <strong>${resultado.cantidadComprometida}</strong>
      </div>

      <div class="inventario-result-value">
        <span>Disponible para el periodo</span>
        <strong>${resultado.cantidadDisponiblePeriodo}</strong>
      </div>

      <div class="inventario-result-value">
        <span>Cantidad solicitada</span>
        <strong>${resultado.cantidadSolicitada}</strong>
      </div>
    </section>
  `;
}

function renderizarReservas(reservas) {
  if (!reservas.length) {
    return `
      <section class="inventario-list card">
        <h2>Reservas que afectan el periodo</h2>
        <p>No existen reservas activas para el producto y periodo consultados.</p>
      </section>
    `;
  }

  const filas = reservas.map(reserva => `
    <tr>
      <td>${escapeHtml(reserva.folioOrden)}</td>
      <td>${reserva.cantidadReservada}</td>
      <td>
        ${escapeHtml(reserva.fechaInicio)}
        a
        ${escapeHtml(reserva.fechaFin)}
      </td>
      <td>${escapeHtml(reserva.estado)}</td>
    </tr>
  `).join('');

  return `
    <section class="inventario-list card">
      <h2>Reservas que afectan el periodo</h2>

      <div class="table-responsive">
        <table>
          <thead>
            <tr>
              <th>Folio de Orden</th>
              <th>Cantidad reservada</th>
              <th>Periodo</th>
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

function obtenerDatosFormulario(formulario) {
  const datos = new FormData(formulario);

  return {
    idProducto: Number(datos.get('idProducto')),
    cantidad: Number(datos.get('cantidad')),
    fechaInicio: datos.get('fechaInicio'),
    fechaFin: datos.get('fechaFin')
  };
}

function validarDatos(datos) {
  if (!Number.isInteger(datos.idProducto) || datos.idProducto <= 0) {
    return 'Seleccione un producto.';
  }

  if (!Number.isInteger(datos.cantidad) || datos.cantidad <= 0) {
    return 'La cantidad solicitada debe ser un número entero mayor que cero.';
  }

  if (!datos.fechaInicio || !datos.fechaFin) {
    return 'Capture las fechas de inicio y fin del periodo.';
  }

  if (datos.fechaFin < datos.fechaInicio) {
    return 'La fecha de recolección o fin no puede ser anterior a la fecha de entrega o inicio.';
  }

  return null;
}

async function ejecutarConsulta(root, formulario) {
  const datos = obtenerDatosFormulario(formulario);
  const errorValidacion = validarDatos(datos);

  limpiarResultado(root);
  ocultarMensaje(root);

  if (errorValidacion) {
    mostrarMensaje(root, errorValidacion, 'error');
    return;
  }

  const identificadorConsulta = ++consecutivoConsulta;
  const botonConsultar = formulario.querySelector('[type="submit"]');

  botonConsultar.disabled = true;
  botonConsultar.textContent = 'Consultando...';

  try {
    const resultado = await consultarDisponibilidadFutura(datos);

    if (identificadorConsulta !== consecutivoConsulta) {
      return;
    }

    const contenedorResultado = root.querySelector('[data-role="resultado"]');

    contenedorResultado.innerHTML = renderizarResultado(resultado);
    contenedorResultado.hidden = false;

    if (hasPermission(PERMISO_VER_RESERVAS)) {
      const contenedorReservas = root.querySelector('[data-role="reservas"]');

      contenedorReservas.innerHTML = renderizarReservas(resultado.reservas || []);
      contenedorReservas.hidden = false;
    }
  } catch (error) {
    if (identificadorConsulta !== consecutivoConsulta) {
      return;
    }

    mostrarMensaje(
      root,
      error?.message || 'No fue posible consultar la disponibilidad. Intente nuevamente.',
      'error'
    );
  } finally {
    if (identificadorConsulta === consecutivoConsulta) {
      botonConsultar.disabled = false;
      botonConsultar.textContent = 'Consultar disponibilidad';
    }
  }
}

function configurarEventos(root) {
  const formulario = root.querySelector('[data-role="formulario"]');
  const botonLimpiar = root.querySelector('[data-action="limpiar"]');

  formulario.addEventListener('submit', event => {
    event.preventDefault();
    ejecutarConsulta(root, formulario);
  });

  formulario.addEventListener('input', () => {
    consecutivoConsulta += 1;
    limpiarResultado(root);
    ocultarMensaje(root);
  });

  botonLimpiar.addEventListener('click', () => {
    consecutivoConsulta += 1;
    formulario.reset();
    limpiarResultado(root);
    ocultarMensaje(root);
  });
}

export async function initDisponibilidadFutura() {
  const root = obtenerRoot();

  if (!root) {
    return;
  }

  if (!hasPermission(PERMISO_CONSULTAR)) {
    root.setAttribute('aria-busy', 'false');
    root.innerHTML = `
      <div class="inventario-state inventario-state-error">
        No tiene permisos para consultar disponibilidad futura.
      </div>
    `;
    return;
  }

  try {
    const productos = await listarProductosInventariables();
    const productoSeleccionado = obtenerParametroProducto();

    root.innerHTML = `
      <header class="inventario-page-header">
        <div>
          <h1>Consulta de disponibilidad futura</h1>
          <p class="inventario-page-description">
            Consulta la disponibilidad de un producto para el periodo de un evento.
            Esta consulta no genera reservas.
          </p>
        </div>

        <a
          class="button button-secondary"
          href="#/inventario/existencias"
        >
          Volver a existencias
        </a>
      </header>

      ${renderizarFormulario(productos, productoSeleccionado)}
    `;

    configurarEventos(root);
  } catch (error) {
    root.innerHTML = `
      <div class="inventario-state inventario-state-error">
        ${escapeHtml(
          error?.message ||
          'No fue posible cargar la pantalla de disponibilidad futura.'
        )}
      </div>
    `;
  } finally {
    root.setAttribute('aria-busy', 'false');
  }
}