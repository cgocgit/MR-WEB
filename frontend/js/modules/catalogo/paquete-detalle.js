/**
 * Módulo: Catálogo - Detalle de Paquete
 * Funcionalidad: Mostrar detalles de un paquete y sus componentes
 */

import {
  obtenerPaquete,
  cambiarEstadoPaquete
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

// ============================================================================
// ESTADO DEL MÓDULO
// ============================================================================

let paqueteActual = null;

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
    paqueteNombre: document.getElementById('paquete-nombre'),
    paqueteCodigo: document.getElementById('paquete-codigo'),
    paquetePrecio: document.getElementById('paquete-precio'),
    paqueteTotal: document.getElementById('paquete-total'),
    paqueteEstado: document.getElementById('paquete-estado'),

    // Descripción
    paqueteDescripcion: document.getElementById('paquete-descripcion'),

    // Tablas
    tablaProductos: document.getElementById('tabla-productos'),
    tablaServicios: document.getElementById('tabla-servicios'),
    advertenciaInactivos: document.getElementById('advertencia-inactivos'),

    // Resumen
    resumenTotalProductos: document.getElementById('resumen-total-productos'),
    resumenTotalServicios: document.getElementById('resumen-total-servicios'),
    resumenTotalComponentes: document.getElementById('resumen-total-componentes'),
    resumenSubtotal: document.getElementById('resumen-subtotal'),
    resumenPrecioRegistrado: document.getElementById('resumen-precio-registrado'),
    resumenDiferencia: document.getElementById('resumen-diferencia'),

    // Auditoría
    seccionAuditoria: document.getElementById('seccion-auditoria'),
    paqueteRegistro: document.getElementById('paquete-registro'),
    paqueteModificacion: document.getElementById('paquete-modificacion'),

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

function obtenerIdPaquete() {
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
// CARGA DE PAQUETE
// ============================================================================

async function cargarPaquete(id) {
  const {
    detalleContent,
    estadoCargando,
    estadoError,
    paqueteNombre,
    paqueteCodigo,
    paquetePrecio,
    paqueteTotal,
    paqueteEstado,
    paqueteDescripcion,
    tablaProductos,
    tablaServicios,
    advertenciaInactivos,
    resumenTotalProductos,
    resumenTotalServicios,
    resumenTotalComponentes,
    resumenSubtotal,
    resumenPrecioRegistrado,
    resumenDiferencia,
    seccionAuditoria,
    paqueteRegistro,
    paqueteModificacion,
    btnEditar,
    btnEstado,
    errorMensaje
  } = obtenerElementos();

  try {
    if (estadoCargando) estadoCargando.style.display = 'flex';
    if (detalleContent) detalleContent.style.display = 'none';
    if (estadoError) estadoError.style.display = 'none';

    paqueteActual = await obtenerPaquete(id);

    // Llenar datos generales
    if (paqueteNombre) paqueteNombre.textContent = paqueteActual.nombre;
    if (paqueteCodigo) paqueteCodigo.textContent = paqueteActual.codigo;

    if (paquetePrecio) paquetePrecio.textContent = `$${paqueteActual.precio.toFixed(2)}`;

    const estadoTexto = paqueteActual.activo ? 'Activo' : 'Inactivo';
    if (paqueteEstado) {
      paqueteEstado.textContent = estadoTexto;
      paqueteEstado.className = paqueteActual.activo ? 'estado-activo' : 'estado-inactivo';
    }

    // Descripción
    if (paqueteDescripcion) {
      paqueteDescripcion.textContent = paqueteActual.descripcion || 'Sin descripción';
    }

    // Renderizar tablas
    renderizarProductos(paqueteActual.detalleProductos || []);
    renderizarServicios(paqueteActual.detalleServicios || []);

    // Verificar componentes inactivos
    const hayInactivos = 
      (paqueteActual.detalleProductos || []).some(p => !p.activo) ||
      (paqueteActual.detalleServicios || []).some(s => !s.activo);

    if (advertenciaInactivos && hayInactivos) {
      advertenciaInactivos.style.display = 'block';
    }

    // Calcular y mostrar resumen
    calcularResumen();

    // Auditoría
    const session = getSession();
    const esGestor = hasPermission(session, PERMISOS_CATALOGO.AUXILIARES_GESTIONAR);

    if (seccionAuditoria && esGestor) {
      seccionAuditoria.style.display = 'block';
      if (paqueteRegistro) {
        paqueteRegistro.textContent = `${paqueteActual.creadoPor || 'Sistema'} • ${formatearFecha(paqueteActual.fechaCreacion)}`;
      }
      if (paqueteModificacion) {
        paqueteModificacion.textContent = `${paqueteActual.modificadoPor || 'Sistema'} • ${formatearFecha(paqueteActual.fechaModificacion)}`;
      }
    }

    // Botones de acción
    const puedeEditar = hasPermission(session, PERMISOS_CATALOGO.PAQUETES_MODIFICAR);
    const puedeCambiarEstado = hasPermission(session, PERMISOS_CATALOGO.PAQUETES_DESACTIVAR);

    if (btnEditar) {
      btnEditar.style.display = puedeEditar ? 'inline-block' : 'none';
    }

    if (btnEstado) {
      btnEstado.style.display = puedeCambiarEstado ? 'inline-block' : 'none';
      btnEstado.textContent = paqueteActual.activo ? '⊘ Desactivar' : '↻ Activar';
    }

    // Mostrar contenido
    if (estadoCargando) estadoCargando.style.display = 'none';
    if (detalleContent) detalleContent.style.display = 'block';

  } catch (error) {
    console.error('Error cargando paquete:', error);

    if (estadoCargando) estadoCargando.style.display = 'none';
    if (estadoError) estadoError.style.display = 'flex';
    if (detalleContent) detalleContent.style.display = 'none';

    if (errorMensaje) {
      errorMensaje.textContent = error.message || 'Error desconocido';
    }
  }
}

// ============================================================================
// RENDERIZADO DE COMPONENTES
// ============================================================================

function renderizarProductos(productos) {
  const { tablaProductos } = obtenerElementos();
  if (!tablaProductos) return;

  const tbody = tablaProductos.querySelector('tbody');
  if (!tbody) return;

  if (productos.length === 0) {
    tbody.innerHTML = '<tr><td colspan="6" style="text-align: center; padding: 2rem;">Sin productos</td></tr>';
    return;
  }

  tbody.innerHTML = productos.map(prod => {
    const estadoClase = prod.activo ? 'estado-activo' : 'estado-inactivo';
    const estadoTexto = prod.activo ? 'Activo' : 'Inactivo';

    return `
      <tr>
        <td>${prod.codigo}</td>
        <td>${prod.nombre}</td>
        <td>${prod.cantidad}</td>
        <td>$${prod.precioUnitario.toFixed(2)}</td>
        <td>$${prod.subtotal.toFixed(2)}</td>
        <td><span class="catalogo-badge ${estadoClase}">${estadoTexto}</span></td>
      </tr>
    `;
  }).join('');
}

function renderizarServicios(servicios) {
  const { tablaServicios } = obtenerElementos();
  if (!tablaServicios) return;

  const tbody = tablaServicios.querySelector('tbody');
  if (!tbody) return;

  if (servicios.length === 0) {
    tbody.innerHTML = '<tr><td colspan="6" style="text-align: center; padding: 2rem;">Sin servicios</td></tr>';
    return;
  }

  tbody.innerHTML = servicios.map(serv => {
    const estadoClase = serv.activo ? 'estado-activo' : 'estado-inactivo';
    const estadoTexto = serv.activo ? 'Activo' : 'Inactivo';

    return `
      <tr>
        <td>${serv.codigo}</td>
        <td>${serv.nombre}</td>
        <td>${serv.cantidad}</td>
        <td>$${serv.precioUnitario.toFixed(2)}</td>
        <td>$${serv.subtotal.toFixed(2)}</td>
        <td><span class="catalogo-badge ${estadoClase}">${estadoTexto}</span></td>
      </tr>
    `;
  }).join('');
}

// ============================================================================
// CÁLCULO DE RESUMEN
// ============================================================================

function calcularResumen() {
  const {
    resumenTotalProductos,
    resumenTotalServicios,
    resumenTotalComponentes,
    resumenSubtotal,
    resumenPrecioRegistrado,
    resumenDiferencia
  } = obtenerElementos();

  const productos = paqueteActual.detalleProductos || [];
  const servicios = paqueteActual.detalleServicios || [];

  const totalProductos = productos.length;
  const totalServicios = servicios.length;
  const totalComponentes = totalProductos + totalServicios;

  const subtotal = [
    ...productos.map(p => p.subtotal || 0),
    ...servicios.map(s => s.subtotal || 0)
  ].reduce((a, b) => a + b, 0);

  const precioRegistrado = paqueteActual.precio || 0;
  const diferencia = precioRegistrado - subtotal;

  if (resumenTotalProductos) resumenTotalProductos.textContent = totalProductos;
  if (resumenTotalServicios) resumenTotalServicios.textContent = totalServicios;
  if (resumenTotalComponentes) resumenTotalComponentes.textContent = totalComponentes;
  if (resumenSubtotal) resumenSubtotal.textContent = `$${subtotal.toFixed(2)}`;
  if (resumenPrecioRegistrado) resumenPrecioRegistrado.textContent = `$${precioRegistrado.toFixed(2)}`;
  if (resumenDiferencia) {
    resumenDiferencia.textContent = `$${Math.abs(diferencia).toFixed(2)}`;
    if (resumenDiferencia.parentElement) {
      resumenDiferencia.parentElement.className = diferencia >= 0 ? 'ganancia' : 'perdida';
    }
  }
}

// ============================================================================
// MANEJO DE EVENTOS
// ============================================================================

async function manejarCambioEstado() {
  try {
    showLoader();

    const nuevoEstado = !paqueteActual.activo;
    await cambiarEstadoPaquete(paqueteActual.id, nuevoEstado);

    showNotification(
      nuevoEstado
        ? MENSAJES.PAQUETE_ACTIVADO
        : MENSAJES.PAQUETE_DESACTIVADO,
      { type: 'success', timeout: 2000 }
    );

    // Recargar paquete
    await cargarPaquete(paqueteActual.id);

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

  const session = getSession();
  const idPaquete = obtenerIdPaquete();

  // Verificar permiso de consulta
  if (!hasPermission(session, PERMISOS_CATALOGO.CONSULTAR)) {
    const { estadoAcceso, detalleContent } = obtenerElementos();
    if (estadoAcceso) estadoAcceso.style.display = 'flex';
    if (detalleContent) detalleContent.style.display = 'none';
    return;
  }

  if (!idPaquete) {
    showNotification('ID de paquete no especificado', { type: 'error' });
    setTimeout(() => {
      window.location.hash = '#/catalogo/paquetes';
    }, 2000);
    return;
  }

  // Cargar paquete
  await cargarPaquete(idPaquete);

  // Configurar event listeners
  const { btnVolver, btnEditar, btnEstado } = obtenerElementos();

  if (btnVolver) {
    btnVolver.addEventListener('click', () => {
      window.location.hash = '#/catalogo/paquetes';
    });
  }

  if (btnEditar) {
    btnEditar.addEventListener('click', () => {
      window.location.hash = `#/catalogo/paquetes/formulario?id=${paqueteActual.id}`;
    });
  }

  if (btnEstado) {
    btnEstado.addEventListener('click', manejarCambioEstado);
  }
}
