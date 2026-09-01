/**
 * Módulo: Catálogo - Detalle de Servicio
 * Funcionalidad: Mostrar detalles de un servicio
 */

import {
  obtenerServicio,
  cambiarEstadoServicio,
  listarCategoriasServicio,
  listarPaquetes
} from '../../api/catalogo.service.js';

import {
  PERMISOS_CATALOGO,
  MENSAJES,
  RUTAS_IMAGENES
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

// ============================================================================
// ESTADO DEL MÓDULO
// ============================================================================

let servicioActual = null;

// ============================================================================
// REFERENCIAS AL DOM
// ============================================================================

function obtenerElementos() {
  return {
    detalleContent:
      document.getElementById('detalle-content'),

    estadoCargando:
      document.getElementById('estado-cargando'),

    estadoError:
      document.getElementById('estado-error'),

    estadoAcceso:
      document.getElementById('estado-acceso'),

    servicioNombre:
      document.getElementById('servicio-nombre'),

    servicioCodigo:
      document.getElementById('servicio-codigo'),

    servicioImagen:
      document.getElementById('servicio-imagen'),

    servicioCategoria:
      document.getElementById('servicio-categoria'),

    servicioTipo:
      document.getElementById('servicio-tipo'),

    servicioTarifa:
      document.getElementById('servicio-tarifa'),

    servicioEstado:
      document.getElementById('servicio-estado'),

    servicioDescripcion:
      document.getElementById('servicio-descripcion'),

    paquetesLista:
      document.getElementById('paquetes-lista'),

    seccionAuditoria:
      document.getElementById('seccion-auditoria'),

    servicioRegistro:
      document.getElementById('servicio-registro'),

    servicioModificacion:
      document.getElementById(
        'servicio-modificacion'
      ),

    btnVolver:
      document.getElementById('btn-volver'),

    btnEditar:
      document.getElementById('btn-editar'),

    btnEstado:
      document.getElementById('btn-estado'),

    errorMensaje:
      document.getElementById('error-mensaje')
  };
}

// ============================================================================
// UTILIDADES
// ============================================================================

function obtenerIdServicio() {
  const queryString =
    location.hash.split('?')[1] || '';

  return new URLSearchParams(
    queryString
  ).get('id');
}

function formatearFecha(fecha) {
  if (!fecha) {
    return '—';
  }

  return new Date(fecha).toLocaleString(
    'es-MX',
    {
      dateStyle: 'short',
      timeStyle: 'short'
    }
  );
}

function formatoMoneda(valor) {
  return Number(valor || 0).toLocaleString(
    'es-MX',
    {
      style: 'currency',
      currency: 'MXN'
    }
  );
}

// ============================================================================
// CARGA DE SERVICIO
// ============================================================================

async function cargarServicio(id) {
  const elementos = obtenerElementos();

  try {
    elementos.estadoCargando.style.display =
      'flex';

    elementos.detalleContent.style.display =
      'none';

    elementos.estadoError.style.display =
      'none';

    servicioActual =
      await obtenerServicio(id);

    const [
      categorias,
      resultadoPaquetes
    ] = await Promise.all([
      listarCategoriasServicio(),

      listarPaquetes({
        skip: 0,
        limit: 100
      })
    ]);

    elementos.servicioNombre.textContent =
      servicioActual.nombre;

    elementos.servicioCodigo.textContent =
      servicioActual.codigo;

    elementos.servicioImagen.src =
      servicioActual.imagenUrl ||
      RUTAS_IMAGENES.PLACEHOLDER_SERVICIO;

    elementos.servicioImagen.alt =
      `Imagen de ${servicioActual.nombre}`;

    elementos.servicioImagen.onerror = () => {
      elementos.servicioImagen.onerror = null;

      elementos.servicioImagen.src =
        RUTAS_IMAGENES.PLACEHOLDER_SERVICIO;
    };

    elementos.servicioCategoria.textContent =
      categorias.find(
        categoria =>
          categoria.id ===
          servicioActual.idCategoria
      )?.nombre || '—';

    elementos.servicioTipo.textContent =
      servicioActual.tipoServicio || '—';

    elementos.servicioTarifa.textContent =
      formatoMoneda(
        servicioActual.tarifaBase
      );

    elementos.servicioEstado.textContent =
      servicioActual.activo
        ? 'Activo'
        : 'Inactivo';

    elementos.servicioEstado.className =
      servicioActual.activo
        ? 'catalogo-detail-meta-value estado-activo'
        : 'catalogo-detail-meta-value estado-inactivo';

    elementos.servicioDescripcion.textContent =
      servicioActual.descripcion ||
      'Sin descripción';

    const paquetesActivos =
      resultadoPaquetes.items.filter(
        paquete =>
          paquete.activo === 1 &&
          paquete.detalleServicios?.some(
            detalle =>
              detalle.idServicio ===
              servicioActual.idServicio
          )
      );

    elementos.paquetesLista.innerHTML =
      paquetesActivos.length > 0
        ? paquetesActivos
            .map(
              paquete => `
                <a
                  href="#/catalogo/paquetes/detalle?id=${paquete.idPaquete}"
                >
                  ${paquete.codigo} - ${paquete.nombre}
                </a>
              `
            )
            .join('<br>')
        : '<p>No participa en paquetes activos.</p>';

    const session = getSession();

    const esGestor =
      hasPermission(
        session,
        PERMISOS_CATALOGO.SERVICIOS_MODIFICAR
      ) ||
      hasPermission(
        session,
        PERMISOS_CATALOGO.SERVICIOS_DESACTIVAR
      );

    if (esGestor) {
      elementos.seccionAuditoria.style.display =
        'block';

      elementos.servicioRegistro.textContent =
        `${servicioActual.creadoPor || 'Sistema'} • ` +
        `${formatearFecha(
          servicioActual.fechaRegistro
        )}`;

      elementos.servicioModificacion.textContent =
        `${servicioActual.modificadoPor || 'Sistema'} • ` +
        `${formatearFecha(
          servicioActual.fechaModificacion
        )}`;
    } else {
      elementos.seccionAuditoria.style.display =
        'none';
    }

    elementos.btnEditar.style.display =
      hasPermission(
        session,
        PERMISOS_CATALOGO.SERVICIOS_MODIFICAR
      )
        ? 'inline-block'
        : 'none';

    elementos.btnEstado.style.display =
      hasPermission(
        session,
        PERMISOS_CATALOGO.SERVICIOS_DESACTIVAR
      )
        ? 'inline-block'
        : 'none';

    elementos.btnEstado.textContent =
      servicioActual.activo
        ? 'Desactivar'
        : 'Activar';

    elementos.estadoCargando.style.display =
      'none';

    elementos.detalleContent.style.display =
      'block';

  } catch (error) {
    console.error(
      'Error cargando servicio:',
      error
    );

    elementos.estadoCargando.style.display =
      'none';

    elementos.detalleContent.style.display =
      'none';

    elementos.estadoError.style.display =
      'flex';

    elementos.errorMensaje.textContent =
      error.message || 'Error desconocido';
  }
}

// ============================================================================
// CAMBIO DE ESTADO
// ============================================================================

async function manejarCambioEstado() {
  const nuevoEstado =
    !Boolean(servicioActual.activo);

  const confirmar =
    window.confirm(
      nuevoEstado
        ? '¿Activar este servicio?'
        : '¿Desactivar este servicio?'
    );

  if (!confirmar) {
    return;
  }

  try {
    showLoader();

    await cambiarEstadoServicio(
      servicioActual.idServicio,
      nuevoEstado
    );

    showNotification(
      nuevoEstado
        ? MENSAJES.SERVICIO_ACTIVADO
        : MENSAJES.SERVICIO_DESACTIVADO,
      { type: 'success' }
    );

    await cargarServicio(
      servicioActual.idServicio
    );

  } catch (error) {
    console.error(
      'Error cambiando estado:',
      error
    );

    showNotification(
      error.message ||
        'No fue posible cambiar el estado del servicio.',
      { type: 'error' }
    );

  } finally {
    hideLoader();
  }
}

// ============================================================================
// INICIALIZACIÓN
// ============================================================================

export async function init() {
  if (!requireAuth()) {
    return;
  }

  renderNavegacionCatalogo();

  const session = getSession();

  if (
    !hasPermission(
      session,
      PERMISOS_CATALOGO.CONSULTAR
    )
  ) {
    const {
      estadoAcceso,
      detalleContent
    } = obtenerElementos();

    estadoAcceso.style.display = 'flex';
    detalleContent.style.display = 'none';

    return;
  }

  const idServicio =
    obtenerIdServicio();

  if (!idServicio) {
    showNotification(
      'ID de servicio no especificado',
      { type: 'error' }
    );

    window.location.hash =
      '#/catalogo/servicios';

    return;
  }

  await cargarServicio(idServicio);

  const {
    btnVolver,
    btnEditar,
    btnEstado
  } = obtenerElementos();

  btnVolver?.addEventListener(
    'click',
    () => {
      window.location.hash =
        '#/catalogo/servicios';
    }
  );

  btnEditar?.addEventListener(
    'click',
    () => {
      window.location.hash =
        `#/catalogo/servicios/formulario?id=${servicioActual.idServicio}`;
    }
  );

  btnEstado?.addEventListener(
    'click',
    manejarCambioEstado
  );
}