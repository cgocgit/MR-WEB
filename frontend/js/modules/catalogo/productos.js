/**
 * Módulo: Catálogo - Lista de Productos
 * Funcionalidad: Listar, filtrar y paginar productos del catálogo
 */

import {
  listarProductos,
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

let filtroActual = {
  codigo: '',
  nombre: '',
  descripcion: '',
  categoria: '',
  tipo: '',
  color: '',
  estado: '',
  soloActivos: false,
  skip: 0,
  limit: 10
};

let paginaActual = 1;
let totalProductos = 0;
let productosActuales = [];

// ============================================================================
// REFERENCIAS AL DOM
// ============================================================================

function obtenerElementos() {
  return {
    // Contenedores
    contenedorPrincipal: document.getElementById('productos-content'),
    contenedorCargando: document.getElementById('estado-cargando'),
    contenedorError: document.getElementById('estado-error'),
    contenedorAcceso: document.getElementById('estado-acceso'),
    contenedorVacio: document.getElementById('estado-vacio'),

    // Filtros
    filtrosCodigo: document.getElementById('filtro-codigo'),
    filtrosNombre: document.getElementById('filtro-nombre'),
    filtrosCategoria: document.getElementById('filtro-categoria'),
    filtrosTipo: document.getElementById('filtro-tipo'),
    filtrosColor: document.getElementById('filtro-color'),
    filtrosEstado: document.getElementById('filtro-estado'),
    btnLimpiar: document.getElementById('btn-limpiar-filtros'),
    btnFiltrar: document.getElementById('btn-filtrar'),

    // Tabla
    tablaCuerpo: document.querySelector('.catalogo-table tbody'),
    tablaContenedor: document.querySelector('.catalogo-table'),

    // Acciones
    btnNuevo: document.getElementById('btn-nuevo-producto'),

    // Paginación
    paginacionContenedor: document.getElementById('paginacion'),

    // Mensajes
    mensajeError: document.getElementById('error-mensaje')
  };
}

// ============================================================================
// CARGA DE DATOS INICIALES
// ============================================================================

async function cargarAuxiliares() {
  const {
    filtrosCategoria,
    filtrosTipo,
    filtrosColor
  } = obtenerElementos();

  // Llenar categorías
  if (filtrosCategoria) {
    filtrosCategoria.innerHTML = '<option value="">Todas las categorías</option>';
    CATEGORIAS_PRODUCTO.forEach(cat => {
      const option = document.createElement('option');
      option.value = cat.id;
      option.textContent = cat.nombre;
      filtrosCategoria.appendChild(option);
    });
  }

  // Llenar tipos
  if (filtrosTipo) {
    filtrosTipo.innerHTML = '<option value="">Todos los tipos</option>';
    TIPOS_PRODUCTO.forEach(tipo => {
      const option = document.createElement('option');
      option.value = tipo.id;
      option.textContent = tipo.nombre;
      filtrosTipo.appendChild(option);
    });
  }

  // Llenar colores
  if (filtrosColor) {
    filtrosColor.innerHTML = '<option value="">Todos los colores</option>';
    COLORES.forEach(color => {
      const option = document.createElement('option');
      option.value = color.id;
      option.textContent = color.nombre;
      filtrosColor.appendChild(option);
    });
  }
}

// ============================================================================
// CARGA Y RENDERIZADO DE PRODUCTOS
// ============================================================================

async function cargarProductos() {
  const {
    contenedorPrincipal,
    contenedorCargando,
    contenedorError,
    contenedorVacio,
    tablaCuerpo,
    mensajeError
  } = obtenerElementos();

  try {
    // Mostrar cargando
    if (contenedorCargando) contenedorCargando.style.display = 'flex';
    if (contenedorPrincipal) contenedorPrincipal.style.display = 'none';
    if (contenedorError) contenedorError.style.display = 'none';
    if (contenedorVacio) contenedorVacio.style.display = 'none';

    // Calcular skip basado en página actual
    filtroActual.skip = (paginaActual - 1) * filtroActual.limit;

    // Cargar datos
    const resultado = await listarProductos(filtroActual);
    productosActuales = resultado.items;
    totalProductos = resultado.total;

    // Mostrar contenedor principal
    if (contenedorCargando) contenedorCargando.style.display = 'none';
    if (contenedorPrincipal) contenedorPrincipal.style.display = 'block';

    // Renderizar tabla
    if (productosActuales.length === 0) {
      if (contenedorVacio) contenedorVacio.style.display = 'flex';
      if (tablaCuerpo) tablaCuerpo.innerHTML = '';
    } else {
      if (contenedorVacio) contenedorVacio.style.display = 'none';
      renderizarTabla(productosActuales);
    }

    // Renderizar paginación
    renderizarPaginacion();

  } catch (error) {
    console.error('Error cargando productos:', error);

    if (contenedorCargando) contenedorCargando.style.display = 'none';
    if (contenedorError) contenedorError.style.display = 'flex';
    if (contenedorPrincipal) contenedorPrincipal.style.display = 'none';

    if (mensajeError) {
      mensajeError.textContent = error.detalles || error.message || 'Error desconocido';
    }
  }
}

function renderizarTabla(productos) {
  const { tablaCuerpo } = obtenerElementos();
  const session = getSession();

  if (!tablaCuerpo) return;

  tablaCuerpo.innerHTML = productos.map(producto => {
    const puedeBorrar = hasPermission(session, PERMISOS_CATALOGO.PRODUCTOS_DESACTIVAR);
    const puedeEditar = hasPermission(session, PERMISOS_CATALOGO.PRODUCTOS_MODIFICAR);
    const estadoTexto = producto.activo ? 'Activo' : 'Inactivo';
    const estadoClase = producto.activo ? 'estado-activo' : 'estado-inactivo';

    // Obtener nombre de categoría
    const categoria = CATEGORIAS_PRODUCTO.find(c => c.id === producto.idCategoria);
    const categoriaNombre = categoria ? categoria.nombre : '—';

    // Obtener nombre de tipo
    const tipo = TIPOS_PRODUCTO.find(t => t.id === producto.idTipoProducto);
    const tipoNombre = tipo ? tipo.nombre : '—';

    return `
      <tr class="catalogo-table-row">
        <td class="catalogo-table-cell">
          <strong>${producto.codigo}</strong>
        </td>
        <td class="catalogo-table-cell">
          ${producto.nombre}
        </td>
        <td class="catalogo-table-cell">
          ${categoriaNombre}
        </td>
        <td class="catalogo-table-cell">
          ${tipoNombre}
        </td>
        <td class="catalogo-table-cell">
          $${producto.precioBase.toFixed(2)}
        </td>
        <td class="catalogo-table-cell">
          <span class="catalogo-badge ${estadoClase}">
            ${estadoTexto}
          </span>
        </td>
        <td class="catalogo-table-cell">
          <div class="catalogo-table-actions">
            <button
              type="button"
              class="btn btn-sm btn-primary"
              data-action="ver"
              data-id="${producto.id}"
              title="Ver detalle"
            >
              👁️
            </button>
            ${puedeEditar ? `
              <button
                type="button"
                class="btn btn-sm btn-secondary"
                data-action="editar"
                data-id="${producto.id}"
                title="Editar"
              >
                ✎
              </button>
            ` : ''}
            ${puedeBorrar ? `
              <button
                type="button"
                class="btn btn-sm btn-danger"
                data-action="cambiar-estado"
                data-id="${producto.id}"
                data-estado="${!producto.activo}"
                title="${producto.activo ? 'Desactivar' : 'Activar'}"
              >
                ${producto.activo ? '⊘' : '↻'}
              </button>
            ` : ''}
          </div>
        </td>
      </tr>
    `;
  }).join('');

  // Agregar event listeners a los botones
  tablaCuerpo.querySelectorAll('button').forEach(btn => {
    btn.addEventListener('click', manejarAccionTabla);
  });
}

function renderizarPaginacion() {
  const { paginacionContenedor } = obtenerElementos();

  if (!paginacionContenedor) return;

  const totalPaginas = Math.ceil(totalProductos / filtroActual.limit);

  if (totalPaginas <= 1) {
    paginacionContenedor.innerHTML = '';
    return;
  }

  const paginas = [];
  for (let i = 1; i <= totalPaginas; i++) {
    paginas.push(i);
  }

  paginacionContenedor.innerHTML = `
    <div class="catalogo-pagination">
      <button
        type="button"
        class="btn btn-sm ${paginaActual === 1 ? 'disabled' : ''}"
        id="btn-anterior"
        ${paginaActual === 1 ? 'disabled' : ''}
      >
        ← Anterior
      </button>

      <div class="catalogo-pagination-numbers">
        ${paginas.map(p => `
          <button
            type="button"
            class="btn btn-sm ${p === paginaActual ? 'active' : ''}"
            data-page="${p}"
          >
            ${p}
          </button>
        `).join('')}
      </div>

      <button
        type="button"
        class="btn btn-sm ${paginaActual === totalPaginas ? 'disabled' : ''}"
        id="btn-siguiente"
        ${paginaActual === totalPaginas ? 'disabled' : ''}
      >
        Siguiente →
      </button>

      <span style="margin-left: 1rem; font-size: 0.875rem; color: var(--color-text-secondary);">
        Página ${paginaActual} de ${totalPaginas} (${totalProductos} productos)
      </span>
    </div>
  `;

  // Event listeners de paginación
  document.getElementById('btn-anterior')?.addEventListener('click', () => {
    if (paginaActual > 1) {
      paginaActual--;
      cargarProductos();
    }
  });

  document.getElementById('btn-siguiente')?.addEventListener('click', () => {
    if (paginaActual < totalPaginas) {
      paginaActual++;
      cargarProductos();
    }
  });

  paginacionContenedor.querySelectorAll('[data-page]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      paginaActual = parseInt(e.target.dataset.page);
      cargarProductos();
    });
  });
}

// ============================================================================
// MANEJO DE EVENTOS
// ============================================================================

function manejarAccionTabla(e) {
  const btn = e.target.closest('button[data-action]');
  if (!btn) return;

  const action = btn.dataset.action;
  const id = btn.dataset.id;

  switch (action) {
    case 'ver':
      window.location.hash = `#/catalogo/productos/detalle?id=${id}`;
      break;

    case 'editar':
      window.location.hash = `#/catalogo/productos/formulario?id=${id}`;
      break;

    case 'cambiar-estado':
      const nuevoEstado = btn.dataset.estado === 'true';
      cambiarEstadoProductoUI(id, nuevoEstado);
      break;
  }
}

async function cambiarEstadoProductoUI(id, activo) {
  try {
    showLoader();

    await cambiarEstadoProducto(id, activo);

    showNotification(
      activo
        ? MENSAJES.PRODUCTO_ACTIVADO
        : MENSAJES.PRODUCTO_DESACTIVADO,
      { type: 'success', timeout: 2000 }
    );

    // Recargar lista
    paginaActual = 1;
    await cargarProductos();

  } catch (error) {
    console.error('Error cambiando estado:', error);
    showNotification(error.message, { type: 'error' });
  } finally {
    hideLoader();
  }
}

function manejarFiltros() {
  const {
    filtrosCodigo,
    filtrosNombre,
    filtrosCategoria,
    filtrosTipo,
    filtrosColor,
    filtrosEstado
  } = obtenerElementos();

  filtroActual = {
    codigo: filtrosCodigo?.value.trim() || '',
    nombre: filtrosNombre?.value.trim() || '',
    descripcion: '', // No está en el formulario de filtros de lista
    categoria: filtrosCategoria?.value || '',
    tipo: filtrosTipo?.value || '',
    color: filtrosColor?.value || '',
    estado: filtrosEstado?.value || '',
    soloActivos: false,
    skip: 0,
    limit: filtroActual.limit
  };

  paginaActual = 1;
  cargarProductos();
}

function limpiarFiltros() {
  const {
    filtrosCodigo,
    filtrosNombre,
    filtrosCategoria,
    filtrosTipo,
    filtrosColor,
    filtrosEstado
  } = obtenerElementos();

  if (filtrosCodigo) filtrosCodigo.value = '';
  if (filtrosNombre) filtrosNombre.value = '';
  if (filtrosCategoria) filtrosCategoria.value = '';
  if (filtrosTipo) filtrosTipo.value = '';
  if (filtrosColor) filtrosColor.value = '';
  if (filtrosEstado) filtrosEstado.value = '';

  filtroActual = {
    codigo: '',
    nombre: '',
    descripcion: '',
    categoria: '',
    tipo: '',
    color: '',
    estado: '',
    soloActivos: false,
    skip: 0,
    limit: filtroActual.limit
  };

  paginaActual = 1;
  cargarProductos();
}

function manejarNuevoProducto() {
  window.location.hash = '#/catalogo/productos/formulario';
}

// ============================================================================
// INICIALIZACIÓN
// ============================================================================

export async function init() {
  // Validar autenticación y permisos
  if (!requireAuth()) return;

  const session = getSession();
  if (!hasPermission(session, PERMISOS_CATALOGO.CONSULTAR)) {
    const { contenedorAcceso, contenedorPrincipal } = obtenerElementos();
    if (contenedorAcceso) contenedorAcceso.style.display = 'flex';
    if (contenedorPrincipal) contenedorPrincipal.style.display = 'none';
    return;
  }

  // Verificar si el usuario puede crear productos
  const puedeCrear = hasPermission(session, PERMISOS_CATALOGO.PRODUCTOS_REGISTRAR);
  const { btnNuevo } = obtenerElementos();
  if (btnNuevo && !puedeCrear) {
    btnNuevo.style.display = 'none';
  }

  // Cargar auxiliares (categorías, tipos, colores)
  await cargarAuxiliares();

  // Cargar productos inicialmente
  await cargarProductos();

  // Configurar event listeners
  const {
    btnFiltrar,
    btnLimpiar,
    btnNuevo
  } = obtenerElementos();

  if (btnFiltrar) btnFiltrar.addEventListener('click', manejarFiltros);
  if (btnLimpiar) btnLimpiar.addEventListener('click', limpiarFiltros);
  if (btnNuevo) btnNuevo.addEventListener('click', manejarNuevoProducto);

  // Permitir filtrar con Enter en los campos de texto
  const { filtrosCodigo, filtrosNombre } = obtenerElementos();
  [filtrosCodigo, filtrosNombre].forEach(campo => {
    if (campo) {
      campo.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
          manejarFiltros();
        }
      });
    }
  });
}
