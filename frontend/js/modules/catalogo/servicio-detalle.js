/**
 * Módulo: Catálogo - Detalle de Servicio
 * Funcionalidad: Mostrar detalles de un servicio
 */

import {
  obtenerServicio,
  cambiarEstadoServicio
} from '../../api/catalogo.service.js';

import {
  ESTADO_REGISTRO,
  PERMISOS_CATALOGO,
  MENSAJES
} from '../../api/catalogo.constants.js';

import { getSession, requireAuth } from '../../shared/auth-guard.js';
import { hasPermission } from '../../shared/permissions.js';
import { showNotification } from '../../components/notification.js';
import { showLoader, hideLoader } from '../../components/loader.js';

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
    // Contenedores
    detalleContent: document.getElementById('detalle-content'),
    estadoCargando: document.getElementById('estado-cargando'),
    estadoError: document.getElementById('estado-error'),
    estadoAcceso: document.getElementById('estado-acceso'),

    // Encabezado
    servicioNombre: document.getElementById('servicio-nombre'),
    servicioCodigo: document.getElementById('servicio-codigo'),
    servicioImagen: document.getElementById('servicio-imagen'),
    servicioTipo: document.getElementById('servicio-tipo'),
    servicioTarifa: document.getElementById('servicio-tarifa'),
    servicioEstado: document.getElementById('servicio-estado'),

    // Descripción
    servicioDescripcion: document.getElementById('servicio-descripcion'),

    // Auditoría
    seccionAuditoria: document.getElementById('seccion-auditoria'),
    servicioRegistro: document.getElementById('servicio-registro'),
    servicioModificacion: document.getElementById('servicio-modificacion'),

    // Botones
    btnVolver: document.getElementById('btn-volver'),
    btnEditar: document.getElementById('btn-editar'),
    btnEstado: document.getElementById('btn-estado'),

    // Mensajes
    errorMensaje: document.getElementById('error-mensaje')
  };
}

// ============================================================================
// UTILIDADES
// ============================================================================

function obtenerIdServicio() {
  const queryString = location.hash.split('?')[1] || '';
  return new URLSearchParams(queryString).get('id');
}

function formatearFecha(fecha) {
  if (!fecha) return '—';
  const d = new Date(fecha);
  return d.toLocaleString('es-MX', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

// ============================================================================
// CARGA DE SERVICIO
// ============================================================================

async function cargarServicio(id) {
  const {
    detalleContent,
    estadoCargando,
    estadoError,
    servicioNombre,
    servicioCodigo,
    servicioImagen,
    servicioTipo,
    servicioTarifa,
    servicioEstado,
    servicioDescripcion,
    seccionAuditoria,
    servicioRegistro,
    servicioModificacion,
    btnEditar,
    btnEstado,
    errorMensaje
  } = obtenerElementos();

  try {
    if (estadoCargando) estadoCargando.style.display = 'flex';
    if (detalleContent) detalleContent.style.display = 'none';
    if (estadoError) estadoError.style.display = 'none';

    servicioActual = await obtenerServicio(id);

    // Llenar datos
    if (servicioNombre) servicioNombre.textContent = servicioActual.nombre;
    if (servicioCodigo) servicioCodigo.textContent = servicioActual.codigo;

    // Imagen
    if (servicioImagen && servicioActual.urlImagen) {
      servicioImagen.src = servicioActual.urlImagen;
      servicioImagen.style.display = 'block';
    }

    // Metadata
    if (servicioTipo) servicioTipo.textContent = servicioActual.tipoServicio || '—';
    if (servicioTarifa) servicioTarifa.textContent = `$${servicioActual.tarifaBase.toFixed(2)}`;

    const estadoTexto = servicioActual.activo ? 'Activo' : 'Inactivo';
    if (servicioEstado) {
      servicioEstado.textContent = estadoTexto;
      servicioEstado.className = servicioActual.activo ? 'estado-activo' : 'estado-inactivo';
    }

    // Descripción
    if (servicioDescripcion) {
      servicioDescripcion.textContent = servicioActual.descripcion || 'Sin descripción';
    }

    // Auditoría
    const session = getSession();
    const esGestor = hasPermission(session, PERMISOS_CATALOGO.AUXILIARES_GESTIONAR);

    if (seccionAuditoria && esGestor) {
      seccionAuditoria.style.display = 'block';
      if (servicioRegistro) {
        servicioRegistro.textContent = `${servicioActual.creadoPor || 'Sistema'} • ${formatearFecha(servicioActual.fechaCreacion)}`;
      }
      if (servicioModificacion) {
        servicioModificacion.textContent = `${servicioActual.modificadoPor || 'Sistema'} • ${formatearFecha(servicioActual.fechaModificacion)}`;
      }
    }

    // Botones de acción
    const puedeEditar = hasPermission(session, PERMISOS_CATALOGO.SERVICIOS_MODIFICAR);
    const puedeCambiarEstado = hasPermission(session, PERMISOS_CATALOGO.SERVICIOS_DESACTIVAR);

    if (btnEditar) {
      btnEditar.style.display = puedeEditar ? 'inline-block' : 'none';
    }

    if (btnEstado) {
      btnEstado.style.display = puedeCambiarEstado ? 'inline-block' : 'none';
      btnEstado.textContent = servicioActual.activo ? '⊘ Desactivar' : '↻ Activar';
    }

    // Mostrar contenido
    if (estadoCargando) estadoCargando.style.display = 'none';
    if (detalleContent) detalleContent.style.display = 'block';

  } catch (error) {
    console.error('Error cargando servicio:', error);

    if (estadoCargando) estadoCargando.style.display = 'none';
    if (estadoError) estadoError.style.display = 'flex';
    if (detalleContent) detalleContent.style.display = 'none';

    if (errorMensaje) {
      errorMensaje.textContent = error.message || 'Error desconocido';
    }
  }
}

// ============================================================================
// MANEJO DE EVENTOS
// ============================================================================

async function manejarCambioEstado() {
  try {
    showLoader();

    const nuevoEstado = !servicioActual.activo;
    await cambiarEstadoServicio(servicioActual.id, nuevoEstado);

    showNotification(
      nuevoEstado
        ? MENSAJES.SERVICIO_ACTIVADO
        : MENSAJES.SERVICIO_DESACTIVADO,
      { type: 'success', timeout: 2000 }
    );

    // Recargar servicio
    await cargarServicio(servicioActual.id);

  } catch (error) {
    console.error('Error cambiando estado:', error);
    showNotification(error.message, { type: 'error' });
  } finally {
    hideLoader();
  }
}

// ============================================================================
// INICIALIZACIÓN
// ============================================================================

export async function init() {
  // Validar autenticación y permisos
  if (!requireAuth()) return;

  renderNavegacionCatalogo();

  const session = getSession();
  const idServicio = obtenerIdServicio();

  // Verificar permiso de consulta
  if (!hasPermission(session, PERMISOS_CATALOGO.CONSULTAR)) {
    const { estadoAcceso, detalleContent } = obtenerElementos();
    if (estadoAcceso) estadoAcceso.style.display = 'flex';
    if (detalleContent) detalleContent.style.display = 'none';
    return;
  }

  if (!idServicio) {
    showNotification('ID de servicio no especificado', { type: 'error' });
    setTimeout(() => {
      window.location.hash = '#/catalogo/servicios';
    }, 2000);
    return;
  }

  // Cargar servicio
  await cargarServicio(idServicio);

  // Configurar event listeners
  const { btnVolver, btnEditar, btnEstado } = obtenerElementos();

  if (btnVolver) {
    btnVolver.addEventListener('click', () => {
      window.location.hash = '#/catalogo/servicios';
    });
  }

  if (btnEditar) {
    btnEditar.addEventListener('click', () => {
      window.location.hash = `#/catalogo/servicios/formulario?id=${servicioActual.id}`;
    });
  }

  if (btnEstado) {
    btnEstado.addEventListener('click', manejarCambioEstado);
  }
}
