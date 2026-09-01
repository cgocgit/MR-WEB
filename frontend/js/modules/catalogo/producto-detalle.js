/**
 * Módulo: Catálogo - Detalle de Producto
 * Funcionalidad: Mostrar detalles de un producto
 */

import {
  obtenerProducto,
  cambiarEstadoProducto
} from '../../api/catalogo.service.js';

import {
  ESTADO_REGISTRO,
  CATEGORIAS_PRODUCTO,
  TIPOS_PRODUCTO,
  COLORES,
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

let productoActual = null;

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
    productoNombre: document.getElementById('producto-nombre'),
    productoCodigo: document.getElementById('producto-codigo'),
    productoImagen: document.getElementById('producto-imagen'),
    productoCategoria: document.getElementById('producto-categoria'),
    productoTipo: document.getElementById('producto-tipo'),
    productoColor: document.getElementById('producto-color'),
    productoUnidad: document.getElementById('producto-unidad'),
    productoPrecio: document.getElementById('producto-precio'),
    productoEstado: document.getElementById('producto-estado'),

    // Descripción
    productoDescripcion: document.getElementById('producto-descripcion'),

    // Auditoría
    seccionAuditoria: document.getElementById('seccion-auditoria'),
    productoRegistro: document.getElementById('producto-registro'),
    productoModificacion: document.getElementById('producto-modificacion'),

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

function obtenerIdProducto() {
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
// CARGA DE PRODUCTO
// ============================================================================

async function cargarProducto(id) {
  const {
    detalleContent,
    estadoCargando,
    estadoError,
    productoNombre,
    productoCodigo,
    productoImagen,
    productoCategoria,
    productoTipo,
    productoColor,
    productoUnidad,
    productoPrecio,
    productoEstado,
    productoDescripcion,
    seccionAuditoria,
    productoRegistro,
    productoModificacion,
    btnEditar,
    btnEstado,
    errorMensaje
  } = obtenerElementos();

  try {
    if (estadoCargando) estadoCargando.style.display = 'flex';
    if (detalleContent) detalleContent.style.display = 'none';
    if (estadoError) estadoError.style.display = 'none';

    productoActual = await obtenerProducto(id);

    // Llenar datos
    if (productoNombre) productoNombre.textContent = productoActual.nombre;
    if (productoCodigo) productoCodigo.textContent = productoActual.codigo;

    // Imagen
    if (productoImagen && productoActual.urlImagen) {
      productoImagen.src = productoActual.urlImagen;
      productoImagen.style.display = 'block';
    }

    // Metadata
    const categoria = CATEGORIAS_PRODUCTO.find(c => c.id === productoActual.idCategoria);
    const tipo = TIPOS_PRODUCTO.find(t => t.id === productoActual.idTipoProducto);
    const color = COLORES.find(c => c.id === productoActual.idColor);

    if (productoCategoria) productoCategoria.textContent = categoria?.nombre || '—';
    if (productoTipo) productoTipo.textContent = tipo?.nombre || '—';
    if (productoColor) productoColor.textContent = color?.nombre || '—';
    if (productoUnidad) productoUnidad.textContent = productoActual.unidad || '—';
    if (productoPrecio) productoPrecio.textContent = `$${productoActual.precioBase.toFixed(2)}`;

    const estadoTexto = productoActual.activo ? 'Activo' : 'Inactivo';
    if (productoEstado) {
      productoEstado.textContent = estadoTexto;
      productoEstado.className = productoActual.activo ? 'estado-activo' : 'estado-inactivo';
    }

    // Descripción
    if (productoDescripcion) {
      productoDescripcion.textContent = productoActual.descripcion || 'Sin descripción';
    }

    // Auditoría
    const session = getSession();
    const esGestor = hasPermission(session, PERMISOS_CATALOGO.AUXILIARES_GESTIONAR);

    if (seccionAuditoria && esGestor) {
      seccionAuditoria.style.display = 'block';
      if (productoRegistro) {
        productoRegistro.textContent = `${productoActual.creadoPor || 'Sistema'} • ${formatearFecha(productoActual.fechaCreacion)}`;
      }
      if (productoModificacion) {
        productoModificacion.textContent = `${productoActual.modificadoPor || 'Sistema'} • ${formatearFecha(productoActual.fechaModificacion)}`;
      }
    }

    // Botones de acción
    const puedeEditar = hasPermission(session, PERMISOS_CATALOGO.PRODUCTOS_MODIFICAR);
    const puedeCambiarEstado = hasPermission(session, PERMISOS_CATALOGO.PRODUCTOS_DESACTIVAR);

    if (btnEditar) {
      btnEditar.style.display = puedeEditar ? 'inline-block' : 'none';
    }

    if (btnEstado) {
      btnEstado.style.display = puedeCambiarEstado ? 'inline-block' : 'none';
      btnEstado.textContent = productoActual.activo ? '⊘ Desactivar' : '↻ Activar';
    }

    // Mostrar contenido
    if (estadoCargando) estadoCargando.style.display = 'none';
    if (detalleContent) detalleContent.style.display = 'block';

  } catch (error) {
    console.error('Error cargando producto:', error);

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

    const nuevoEstado = !productoActual.activo;
    await cambiarEstadoProducto(productoActual.id, nuevoEstado);

    showNotification(
      nuevoEstado
        ? MENSAJES.PRODUCTO_ACTIVADO
        : MENSAJES.PRODUCTO_DESACTIVADO,
      { type: 'success', timeout: 2000 }
    );

    // Recargar producto
    await cargarProducto(productoActual.id);

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
  const idProducto = obtenerIdProducto();

  // Verificar permiso de consulta
  if (!hasPermission(session, PERMISOS_CATALOGO.CONSULTAR)) {
    const { estadoAcceso, detalleContent } = obtenerElementos();
    if (estadoAcceso) estadoAcceso.style.display = 'flex';
    if (detalleContent) detalleContent.style.display = 'none';
    return;
  }

  if (!idProducto) {
    showNotification('ID de producto no especificado', { type: 'error' });
    setTimeout(() => {
      window.location.hash = '#/catalogo/productos';
    }, 2000);
    return;
  }

  // Cargar producto
  await cargarProducto(idProducto);

  // Configurar event listeners
  const { btnVolver, btnEditar, btnEstado } = obtenerElementos();

  if (btnVolver) {
    btnVolver.addEventListener('click', () => {
      window.location.hash = '#/catalogo/productos';
    });
  }

  if (btnEditar) {
    btnEditar.addEventListener('click', () => {
      window.location.hash = `#/catalogo/productos/formulario?id=${productoActual.id}`;
    });
  }

  if (btnEstado) {
    btnEstado.addEventListener('click', manejarCambioEstado);
  }
}
