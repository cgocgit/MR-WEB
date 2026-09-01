import {
  obtenerPaquete,
  cambiarEstadoPaquete
} from '../../api/catalogo.service.js';

import {
  PERMISOS_CATALOGO,
  MENSAJES
} from '../../api/catalogo.constants.js';

import {
  getSession,
  requireAuth
} from '../../shared/auth-guard.js';

import {
  hasPermission
} from '../../shared/permissions.js';

import {
  showNotification
} from '../../components/notification.js';

import {
  showLoader,
  hideLoader
} from '../../components/loader.js';

import {
  renderNavegacionCatalogo
} from './catalogo-ui.js';

let paqueteActual = null;

function obtenerElementos() {
  return {
    detalleContent:
      document.getElementById(
        'detalle-content'
      ),

    estadoCargando:
      document.getElementById(
        'estado-cargando'
      ),

    estadoError:
      document.getElementById(
        'estado-error'
      ),

    estadoAcceso:
      document.getElementById(
        'estado-acceso'
      ),

    errorMensaje:
      document.getElementById(
        'error-mensaje'
      ),

    paqueteNombre:
      document.getElementById(
        'paquete-nombre'
      ),

    paqueteCodigo:
      document.getElementById(
        'paquete-codigo'
      ),

    paquetePrecio:
      document.getElementById(
        'paquete-precio'
      ),

    paqueteTotal:
      document.getElementById(
        'paquete-total'
      ),

    paqueteEstado:
      document.getElementById(
        'paquete-estado'
      ),

    paqueteDescripcion:
      document.getElementById(
        'paquete-descripcion'
      ),

    tablaProductos:
      document.getElementById(
        'tabla-productos'
      ),

    tablaServicios:
      document.getElementById(
        'tabla-servicios'
      ),

    advertenciaInactivos:
      document.getElementById(
        'advertencia-inactivos'
      ),

    resumenTotalProductos:
      document.getElementById(
        'resumen-total-productos'
      ),

    resumenTotalServicios:
      document.getElementById(
        'resumen-total-servicios'
      ),

    resumenTotalComponentes:
      document.getElementById(
        'resumen-total-componentes'
      ),

    resumenSubtotal:
      document.getElementById(
        'resumen-subtotal'
      ),

    resumenPrecioRegistrado:
      document.getElementById(
        'resumen-precio-registrado'
      ),

    resumenDiferencia:
      document.getElementById(
        'resumen-diferencia'
      ),

    seccionAuditoria:
      document.getElementById(
        'seccion-auditoria'
      ),

    paqueteRegistro:
      document.getElementById(
        'paquete-registro'
      ),

    paqueteModificacion:
      document.getElementById(
        'paquete-modificacion'
      ),

    btnVolver:
      document.getElementById(
        'btn-volver'
      ),

    btnEditar:
      document.getElementById(
        'btn-editar'
      ),

    btnEstado:
      document.getElementById(
        'btn-estado'
      )
  };
}

function obtenerIdPaquete() {
  const queryString =
    location.hash.split('?')[1] || '';

  return new URLSearchParams(
    queryString
  ).get('id');
}

function formatoMoneda(valor) {
  return Number(valor || 0)
    .toLocaleString(
      'es-MX',
      {
        style: 'currency',
        currency: 'MXN'
      }
    );
}

function formatoFecha(fecha) {
  if (!fecha) return '—';

  return new Date(fecha)
    .toLocaleString(
      'es-MX',
      {
        dateStyle: 'short',
        timeStyle: 'short'
      }
    );
}

function renderProductos(productos) {
  const { tablaProductos } =
    obtenerElementos();

  const tbody =
    tablaProductos.querySelector(
      'tbody'
    );

  if (productos.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="6">
          Sin productos
        </td>
      </tr>
    `;

    return;
  }

  tbody.innerHTML =
    productos.map(
      producto => `
        <tr>
          <td>${producto.codigo}</td>
          <td>${producto.nombre}</td>
          <td>${producto.cantidad}</td>

          <td>
            ${formatoMoneda(
              producto.precioUnitario
            )}
          </td>

          <td>
            ${formatoMoneda(
              producto.subtotal
            )}
          </td>

          <td>
            <span class="catalogo-badge ${
              producto.activo === 1
                ? 'estado-activo'
                : 'estado-inactivo'
            }">
              ${producto.activo === 1
                ? 'Activo'
                : 'Inactivo'}
            </span>
          </td>
        </tr>
      `
    ).join('');
}

function renderServicios(servicios) {
  const { tablaServicios } =
    obtenerElementos();

  const tbody =
    tablaServicios.querySelector(
      'tbody'
    );

  if (servicios.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="6">
          Sin servicios
        </td>
      </tr>
    `;

    return;
  }

  tbody.innerHTML =
    servicios.map(
      servicio => `
        <tr>
          <td>${servicio.codigo}</td>
          <td>${servicio.nombre}</td>
          <td>${servicio.cantidad}</td>

          <td>
            ${formatoMoneda(
              servicio.tarifa
            )}
          </td>

          <td>
            ${formatoMoneda(
              servicio.subtotal
            )}
          </td>

          <td>
            <span class="catalogo-badge ${
              servicio.activo === 1
                ? 'estado-activo'
                : 'estado-inactivo'
            }">
              ${servicio.activo === 1
                ? 'Activo'
                : 'Inactivo'}
            </span>
          </td>
        </tr>
      `
    ).join('');
}

function renderResumen() {
  const {
    resumenTotalProductos,
    resumenTotalServicios,
    resumenTotalComponentes,
    resumenSubtotal,
    resumenPrecioRegistrado,
    resumenDiferencia
  } = obtenerElementos();

  resumenTotalProductos.textContent =
    paqueteActual.totalProductos;

  resumenTotalServicios.textContent =
    paqueteActual.totalServicios;

  resumenTotalComponentes.textContent =
    paqueteActual.totalComponentes;

  resumenSubtotal.textContent =
    formatoMoneda(
      paqueteActual.totalCalculado
    );

  resumenPrecioRegistrado.textContent =
    formatoMoneda(
      paqueteActual.precio
    );

  resumenDiferencia.textContent =
    formatoMoneda(
      Number(paqueteActual.precio) -
      Number(
        paqueteActual.totalCalculado
      )
    );
}

async function cargarPaquete(id) {
  const elementos =
    obtenerElementos();

  try {
    elementos.estadoCargando.style.display =
      'flex';

    elementos.detalleContent.style.display =
      'none';

    elementos.estadoError.style.display =
      'none';

    paqueteActual =
      await obtenerPaquete(id);

    elementos.paqueteNombre.textContent =
      paqueteActual.nombre;

    elementos.paqueteCodigo.textContent =
      paqueteActual.codigo;

    elementos.paquetePrecio.textContent =
      formatoMoneda(
        paqueteActual.precio
      );

    elementos.paqueteTotal.textContent =
      formatoMoneda(
        paqueteActual.totalCalculado
      );

    elementos.paqueteEstado.textContent =
      paqueteActual.activo
        ? 'Activo'
        : 'Inactivo';

    elementos.paqueteEstado.className =
      paqueteActual.activo
        ? 'catalogo-detail-meta-value estado-activo'
        : 'catalogo-detail-meta-value estado-inactivo';

    elementos.paqueteDescripcion.textContent =
      paqueteActual.descripcion ||
      'Sin descripción';

    renderProductos(
      paqueteActual.detalleProductos
    );

    renderServicios(
      paqueteActual.detalleServicios
    );

    renderResumen();

    elementos.advertenciaInactivos.style.display =
      paqueteActual.tieneComponentesInactivos
        ? 'flex'
        : 'none';

    const session =
      getSession();

    const puedeEditar =
      hasPermission(
        session,
        PERMISOS_CATALOGO.PAQUETES_MODIFICAR
      );

    const puedeEstado =
      hasPermission(
        session,
        PERMISOS_CATALOGO.PAQUETES_DESACTIVAR
      );

    elementos.btnEditar.style.display =
      puedeEditar
        ? 'inline-block'
        : 'none';

    elementos.btnEstado.style.display =
      puedeEstado
        ? 'inline-block'
        : 'none';

    elementos.btnEstado.textContent =
      paqueteActual.activo
        ? 'Desactivar'
        : 'Activar';

    if (
      puedeEditar ||
      puedeEstado
    ) {
      elementos.seccionAuditoria.style.display =
        'block';

      elementos.paqueteRegistro.textContent =
        `${paqueteActual.creadoPor || 'Sistema'} • ` +
        `${formatoFecha(
          paqueteActual.fechaRegistro
        )}`;

      elementos.paqueteModificacion.textContent =
        `${paqueteActual.modificadoPor || 'Sistema'} • ` +
        `${formatoFecha(
          paqueteActual.fechaModificacion
        )}`;
    }

    elementos.estadoCargando.style.display =
      'none';

    elementos.detalleContent.style.display =
      'block';

  } catch (error) {
    elementos.estadoCargando.style.display =
      'none';

    elementos.detalleContent.style.display =
      'none';

    elementos.estadoError.style.display =
      'flex';

    elementos.errorMensaje.textContent =
      error.message ||
      'Error desconocido';
  }
}

async function manejarCambioEstado() {
  const nuevoEstado =
    !Boolean(
      paqueteActual.activo
    );

  const confirmar =
    window.confirm(
      nuevoEstado
        ? '¿Activar este paquete?'
        : '¿Desactivar este paquete?'
    );

  if (!confirmar) return;

  try {
    showLoader();

    await cambiarEstadoPaquete(
      paqueteActual.idPaquete,
      nuevoEstado
    );

    showNotification(
      nuevoEstado
        ? MENSAJES.PAQUETE_ACTIVADO
        : MENSAJES.PAQUETE_DESACTIVADO,
      { type: 'success' }
    );

    await cargarPaquete(
      paqueteActual.idPaquete
    );

  } catch (error) {
    showNotification(
      error.message,
      { type: 'error' }
    );

  } finally {
    hideLoader();
  }
}

export async function init() {
  if (!requireAuth()) return;

  renderNavegacionCatalogo();

  const session =
    getSession();

  if (
    !hasPermission(
      session,
      PERMISOS_CATALOGO.CONSULTAR
    )
  ) {
    obtenerElementos()
      .estadoAcceso
      .style.display =
        'flex';

    return;
  }

  const idPaquete =
    obtenerIdPaquete();

  if (!idPaquete) {
    showNotification(
      'ID de paquete no especificado.',
      { type: 'error' }
    );

    window.location.hash =
      '#/catalogo/paquetes';

    return;
  }

  await cargarPaquete(
    idPaquete
  );

  const {
    btnVolver,
    btnEditar,
    btnEstado
  } = obtenerElementos();

  btnVolver.addEventListener(
    'click',
    () => {
      window.location.hash =
        '#/catalogo/paquetes';
    }
  );

  btnEditar.addEventListener(
    'click',
    () => {
      window.location.hash =
        `#/catalogo/paquetes/formulario?id=${paqueteActual.idPaquete}`;
    }
  );

  btnEstado.addEventListener(
    'click',
    manejarCambioEstado
  );
}