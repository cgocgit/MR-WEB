/**
 * Módulo: Catálogo - Detalle de Producto
 * Funcionalidad: Mostrar detalles de un producto
 */

import {
  obtenerProducto,
  cambiarEstadoProducto,
  consultarDisponibilidad,
  listarPaquetes,
  listarCategoriasProducto,
  listarTiposProducto,
  listarColores
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
  renderNavegacionCatalogo
} from './catalogo-ui.js';
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

    productoDisponibilidad:
      document.getElementById(
        'producto-disponibilidad'
      ),

    paquetesLista:
      document.getElementById(
        'paquetes-lista'
      ),

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
  const elementos = obtenerElementos();

  try {
    elementos.estadoCargando.style.display =
      'flex';

    elementos.detalleContent.style.display =
      'none';

    elementos.estadoError.style.display =
      'none';

    productoActual =
      await obtenerProducto(id);

    const [
      categorias,
      tipos,
      colores,
      disponibilidad,
      resultadoPaquetes
    ] = await Promise.all([
      listarCategoriasProducto(),
      listarTiposProducto(),
      listarColores(),
      consultarDisponibilidad(id),
      listarPaquetes({
        skip: 0,
        limit: 100
      })
    ]);

    elementos.productoNombre.textContent =
      productoActual.nombre;

    elementos.productoCodigo.textContent =
      productoActual.codigo;

    elementos.productoImagen.src =
      productoActual.imagenUrl ||
      RUTAS_IMAGENES.PLACEHOLDER_PRODUCTO;

    elementos.productoImagen.alt =
      `Imagen de ${productoActual.nombre}`;

    elementos.productoImagen.onerror = () => {
      elementos.productoImagen.onerror = null;
      elementos.productoImagen.src =
        RUTAS_IMAGENES.PLACEHOLDER_PRODUCTO;
    };

    elementos.productoCategoria.textContent =
      categorias.find(
        item =>
          item.id === productoActual.idCategoria
      )?.nombre || '—';

    elementos.productoTipo.textContent =
      tipos.find(
        item =>
          item.id === productoActual.idTipoProducto
      )?.nombre || '—';

    elementos.productoColor.textContent =
      colores.find(
        item =>
          item.id === productoActual.idColor
      )?.nombre || '—';

    elementos.productoUnidad.textContent =
      productoActual.unidadMedida || '—';

    elementos.productoPrecio.textContent =
      Number(
        productoActual.precioBase || 0
      ).toLocaleString(
        'es-MX',
        {
          style: 'currency',
          currency: 'MXN'
        }
      );

    elementos.productoEstado.textContent =
      productoActual.activo
        ? 'Activo'
        : 'Inactivo';

    elementos.productoDisponibilidad.textContent =
      `${disponibilidad.cantidadDisponible} unidades`;

    elementos.productoDescripcion.textContent =
      productoActual.descripcion ||
      'Sin descripción';

    const paquetes =
      resultadoPaquetes.items.filter(
        paquete =>
          paquete.activo === 1 &&
          paquete.detalleProductos?.some(
            detalle =>
              detalle.idProducto ===
              productoActual.idProducto
          )
      );

    elementos.paquetesLista.innerHTML =
      paquetes.length
        ? paquetes
            .map(paquete => `
              <a
                href="#/catalogo/paquetes/detalle?id=${paquete.idPaquete}"
              >
                ${paquete.codigo} - ${paquete.nombre}
              </a>
            `)
            .join('<br>')
        : '<p>No participa en paquetes activos.</p>';

    const session = getSession();

    const esGestor =
      hasPermission(
        session,
        PERMISOS_CATALOGO.PRODUCTOS_MODIFICAR
      ) ||
      hasPermission(
        session,
        PERMISOS_CATALOGO.PRODUCTOS_DESACTIVAR
      );

    if (esGestor) {
      elementos.seccionAuditoria.style.display =
        'block';

      elementos.productoRegistro.textContent =
        `${productoActual.creadoPor || 'Sistema'} • ` +
        `${formatearFecha(productoActual.fechaRegistro)}`;

      elementos.productoModificacion.textContent =
        `${productoActual.modificadoPor || 'Sistema'} • ` +
        `${formatearFecha(productoActual.fechaModificacion)}`;
    }

    elementos.btnEditar.style.display =
      hasPermission(
        session,
        PERMISOS_CATALOGO.PRODUCTOS_MODIFICAR
      )
        ? 'inline-block'
        : 'none';

    elementos.btnEstado.style.display =
      hasPermission(
        session,
        PERMISOS_CATALOGO.PRODUCTOS_DESACTIVAR
      )
        ? 'inline-block'
        : 'none';

    elementos.btnEstado.textContent =
      productoActual.activo
        ? 'Desactivar'
        : 'Activar';

    elementos.estadoCargando.style.display =
      'none';

    elementos.detalleContent.style.display =
      'block';

  } catch (error) {
    elementos.estadoCargando.style.display =
      'none';

    elementos.estadoError.style.display =
      'flex';

    elementos.errorMensaje.textContent =
      error.message || 'Error desconocido';
  }
}

// ============================================================================
// MANEJO DE EVENTOS
// ============================================================================

async function manejarCambioEstado() {
  const nuevoEstado =
    !Boolean(productoActual.activo);

  const confirmar = window.confirm(
    nuevoEstado
      ? '¿Activar este producto?'
      : '¿Desactivar este producto?'
  );

  if (!confirmar) return;

  await cambiarEstadoProducto(
    productoActual.idProducto,
    nuevoEstado
  );

  showNotification(
    nuevoEstado
      ? MENSAJES.PRODUCTO_ACTIVADO
      : MENSAJES.PRODUCTO_DESACTIVADO,
    { type: 'success' }
  );

  await cargarProducto(
    productoActual.idProducto
  );
}

// ============================================================================
// INICIALIZACIÓN
// ============================================================================

export async function init() {
  // Validar autenticación y permisos
  if (!requireAuth()) return;

  renderNavegacionCatalogo();

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
    showNotification(
      'ID de producto no especificado',
      { type: 'error' }
    );

    setTimeout(() => {
      window.location.hash =
        '#/catalogo/productos';
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
    window.location.hash =
      `#/catalogo/productos/formulario?id=${productoActual.idProducto}`;
  });
}

  if (btnEstado) {
    btnEstado.addEventListener('click', manejarCambioEstado);
  }
}
