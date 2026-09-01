/**
 * Módulo: Catálogo - Lista de Paquetes
 * Funcionalidad: Listar, filtrar y paginar paquetes del catálogo
 */

import {
  listarPaquetes,
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

let filtroActual = {
  codigo: '',
  nombre: '',
  descripcion: '',
  estado: '',
  soloActivos: false,
  skip: 0,
  limit: 10
};

let paginaActual = 1;
let totalPaquetes = 0;
let paquetesActuales = [];

// ============================================================================
// REFERENCIAS AL DOM
// ============================================================================

function obtenerElementos() {
  return {
    // Contenedores
    contenedorPrincipal: document.getElementById('paquetes-content'),
    contenedorCargando: document.getElementById('estado-cargando'),
    contenedorError: document.getElementById('estado-error'),
    contenedorAcceso: document.getElementById('estado-acceso'),
    contenedorVacio: document.getElementById('estado-vacio'),

    // Filtros
    filtrosCodigo: document.getElementById('filtro-codigo'),
    filtrosNombre: document.getElementById('filtro-nombre'),
    filtrosEstado: document.getElementById('filtro-estado'),
    btnLimpiar: document.getElementById('btn-limpiar-filtros'),
    btnFiltrar: document.getElementById('btn-filtrar'),

    // Tabla
    tablaCuerpo: document.querySelector('.catalogo-table tbody'),
    tablaContenedor: document.querySelector('.catalogo-table'),

    // Acciones
    btnNuevo: document.getElementById('btn-nuevo-paquete'),

    // Paginación
    paginacionContenedor: document.getElementById('paginacion'),

    // Mensajes
    mensajeError: document.getElementById('error-mensaje')
  };
}

// ============================================================================
// CARGA Y RENDERIZADO DE PAQUETES
// ============================================================================

async function cargarPaquetes() {
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
    const resultado = await listarPaquetes(filtroActual);
    paquetesActuales = resultado.items;
    totalPaquetes = resultado.total;

    // Mostrar contenedor principal
    if (contenedorCargando) contenedorCargando.style.display = 'none';
    if (contenedorPrincipal) contenedorPrincipal.style.display = 'block';

    // Renderizar tabla
    if (paquetesActuales.length === 0) {
      if (contenedorVacio) contenedorVacio.style.display = 'flex';
      if (tablaCuerpo) tablaCuerpo.innerHTML = '';
    } else {
      if (contenedorVacio) contenedorVacio.style.display = 'none';
      renderizarTabla(paquetesActuales);
    }

    // Renderizar paginación
    renderizarPaginacion();

  } catch (error) {
    console.error('Error cargando paquetes:', error);

    if (contenedorCargando) contenedorCargando.style.display = 'none';
    if (contenedorError) contenedorError.style.display = 'flex';
    if (contenedorPrincipal) contenedorPrincipal.style.display = 'none';

    if (mensajeError) {
      mensajeError.textContent = error.detalles || error.message || 'Error desconocido';
    }
  }
}

function renderizarTabla(paquetes) {
  const { tablaCuerpo } = obtenerElementos();
  const session = getSession();

  if (!tablaCuerpo) return;

  tablaCuerpo.innerHTML = paquetes.map(paquete => {
    const puedeBorrar = hasPermission(session, PERMISOS_CATALOGO.PAQUETES_DESACTIVAR);
    const puedeEditar = hasPermission(session, PERMISOS_CATALOGO.PAQUETES_MODIFICAR);
    const estadoTexto = paquete.activo ? 'Activo' : 'Inactivo';
    const estadoClase = paquete.activo ? 'estado-activo' : 'estado-inactivo';

    // Contar componentes
    const totalProductos = (paquete.detalleProductos || []).length;
    const totalServicios = (paquete.detalleServicios || []).length;
    const totalComponentes = totalProductos + totalServicios;

    return `
      <tr class="catalogo-table-row">
        <td class="catalogo-table-cell">
          <strong>${paquete.codigo}</strong>
        </td>
        <td class="catalogo-table-cell">
          ${paquete.nombre}
        </td>
        <td class="catalogo-table-cell">
          <span style="font-size: 0.875rem; color: var(--color-text-secondary);">
            ${totalComponentes} componentes
          </span>
        </td>
        <td class="catalogo-table-cell">
          $${paquete.precio.toFixed(2)}
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
              data-id="${paquete.id}"
              title="Ver detalle"
            >
              👁️
            </button>
            ${puedeEditar ? `
              <button
                type="button"
                class="btn btn-sm btn-secondary"
                data-action="editar"
                data-id="${paquete.id}"
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
                data-id="${paquete.id}"
                data-estado="${!paquete.activo}"
                title="${paquete.activo ? 'Desactivar' : 'Activar'}"
              >
                ${paquete.activo ? '⊘' : '↻'}
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

  const totalPaginas = Math.ceil(totalPaquetes / filtroActual.limit);

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
        Página ${paginaActual} de ${totalPaginas} (${totalPaquetes} paquetes)
      </span>
    </div>
  `;

  // Event listeners de paginación
  document.getElementById('btn-anterior')?.addEventListener('click', () => {
    if (paginaActual > 1) {
      paginaActual--;
      cargarPaquetes();
    }
  });

  document.getElementById('btn-siguiente')?.addEventListener('click', () => {
    if (paginaActual < totalPaginas) {
      paginaActual++;
      cargarPaquetes();
    }
  });

  paginacionContenedor.querySelectorAll('[data-page]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      paginaActual = parseInt(e.target.dataset.page);
      cargarPaquetes();
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
      window.location.hash = `#/catalogo/paquetes/detalle?id=${id}`;
      break;

    case 'editar':
      window.location.hash = `#/catalogo/paquetes/formulario?id=${id}`;
      break;

    case 'cambiar-estado':
      const nuevoEstado = btn.dataset.estado === 'true';
      cambiarEstadoPaqueteUI(id, nuevoEstado);
      break;
  }
}

async function cambiarEstadoPaqueteUI(id, activo) {
  try {
    showLoader();

    await cambiarEstadoPaquete(id, activo);

    showNotification(
      activo
        ? MENSAJES.PAQUETE_ACTIVADO
        : MENSAJES.PAQUETE_DESACTIVADO,
      { type: 'success', timeout: 2000 }
    );

    // Recargar lista
    paginaActual = 1;
    await cargarPaquetes();

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
    filtrosEstado
  } = obtenerElementos();

  filtroActual = {
    codigo: filtrosCodigo?.value.trim() || '',
    nombre: filtrosNombre?.value.trim() || '',
    descripcion: '',
    estado: filtrosEstado?.value || '',
    soloActivos: false,
    skip: 0,
    limit: filtroActual.limit
  };

  paginaActual = 1;
  cargarPaquetes();
}

function limpiarFiltros() {
  const {
    filtrosCodigo,
    filtrosNombre,
    filtrosEstado
  } = obtenerElementos();

  if (filtrosCodigo) filtrosCodigo.value = '';
  if (filtrosNombre) filtrosNombre.value = '';
  if (filtrosEstado) filtrosEstado.value = '';

  filtroActual = {
    codigo: '',
    nombre: '',
    descripcion: '',
    estado: '',
    soloActivos: false,
    skip: 0,
    limit: filtroActual.limit
  };

  paginaActual = 1;
  cargarPaquetes();
}

function manejarNuevoPaquete() {
  window.location.hash = '#/catalogo/paquetes/formulario';
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

  // Verificar si el usuario puede crear paquetes
  const puedeCrear = hasPermission(session, PERMISOS_CATALOGO.PAQUETES_REGISTRAR);
  const { btnNuevo } = obtenerElementos();
  if (btnNuevo && !puedeCrear) {
    btnNuevo.style.display = 'none';
  }

  // Cargar paquetes inicialmente
  await cargarPaquetes();

  // Configurar event listeners
  const {
    btnFiltrar,
    btnLimpiar,
    btnNuevo
  } = obtenerElementos();

  if (btnFiltrar) btnFiltrar.addEventListener('click', manejarFiltros);
  if (btnLimpiar) btnLimpiar.addEventListener('click', limpiarFiltros);
  if (btnNuevo) btnNuevo.addEventListener('click', manejarNuevoPaquete);

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
