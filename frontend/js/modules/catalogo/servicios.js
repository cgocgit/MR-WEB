/**
 * Módulo: Catálogo - Lista de Servicios
 * Funcionalidad: Listar, filtrar y paginar servicios del catálogo
 */

import {
  listarServicios,
  cambiarEstadoServicio
} from '../../api/catalogo.service.js';

import {
  ESTADO_REGISTRO,
  TIPOS_SERVICIO,
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

let filtroActual = {
  codigo: '',
  nombre: '',
  descripcion: '',
  tipo: '',
  estado: '',
  soloActivos: false,
  skip: 0,
  limit: 10
};

let paginaActual = 1;
let totalServicios = 0;
let serviciosActuales = [];

// ============================================================================
// REFERENCIAS AL DOM
// ============================================================================

function obtenerElementos() {
  return {
    // Contenedores
    contenedorPrincipal: document.getElementById('servicios-content'),
    contenedorCargando: document.getElementById('estado-cargando'),
    contenedorError: document.getElementById('estado-error'),
    contenedorAcceso: document.getElementById('estado-acceso'),
    contenedorVacio: document.getElementById('estado-vacio'),

    // Filtros
    filtrosCodigo: document.getElementById('filtro-codigo'),
    filtrosNombre: document.getElementById('filtro-nombre'),
    filtrosTipo: document.getElementById('filtro-tipo'),
    filtrosEstado: document.getElementById('filtro-estado'),
    btnLimpiar: document.getElementById('btn-limpiar-filtros'),
    btnFiltrar: document.getElementById('btn-filtrar'),

    // Tabla
    tablaCuerpo: document.querySelector('.catalogo-table tbody'),
    tablaContenedor: document.querySelector('.catalogo-table'),

    // Acciones
    btnNuevo: document.getElementById('btn-nuevo-servicio'),

    // Paginación
    paginacionContenedor: document.getElementById('paginacion'),

    // Mensajes
    mensajeError: document.getElementById('error-mensaje')
  };
}

// ============================================================================
// CARGA Y RENDERIZADO DE SERVICIOS
// ============================================================================

async function cargarServicios() {
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
    const resultado = await listarServicios(filtroActual);
    serviciosActuales = resultado.items;
    totalServicios = resultado.total;

    // Mostrar contenedor principal
    if (contenedorCargando) contenedorCargando.style.display = 'none';
    if (contenedorPrincipal) contenedorPrincipal.style.display = 'block';

    // Renderizar tabla
    if (serviciosActuales.length === 0) {
      if (contenedorVacio) contenedorVacio.style.display = 'flex';
      if (tablaCuerpo) tablaCuerpo.innerHTML = '';
    } else {
      if (contenedorVacio) contenedorVacio.style.display = 'none';
      renderizarTabla(serviciosActuales);
    }

    // Renderizar paginación
    renderizarPaginacion();

  } catch (error) {
    console.error('Error cargando servicios:', error);

    if (contenedorCargando) contenedorCargando.style.display = 'none';
    if (contenedorError) contenedorError.style.display = 'flex';
    if (contenedorPrincipal) contenedorPrincipal.style.display = 'none';

    if (mensajeError) {
      mensajeError.textContent = error.detalles || error.message || 'Error desconocido';
    }
  }
}

function renderizarTabla(servicios) {
  const { tablaCuerpo } = obtenerElementos();
  const session = getSession();

  if (!tablaCuerpo) return;

  tablaCuerpo.innerHTML = servicios.map(servicio => {
    const puedeBorrar = hasPermission(session, PERMISOS_CATALOGO.SERVICIOS_DESACTIVAR);
    const puedeEditar = hasPermission(session, PERMISOS_CATALOGO.SERVICIOS_MODIFICAR);
    const estadoTexto = servicio.activo ? 'Activo' : 'Inactivo';
    const estadoClase = servicio.activo ? 'estado-activo' : 'estado-inactivo';

    return `
      <tr class="catalogo-table-row">
        <td class="catalogo-table-cell">
          <strong>${servicio.codigo}</strong>
        </td>
        <td class="catalogo-table-cell">
          ${servicio.nombre}
        </td>
        <td class="catalogo-table-cell">
          ${servicio.tipoServicio}
        </td>
        <td class="catalogo-table-cell">
          $${servicio.tarifaBase.toFixed(2)}
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
              data-id="${servicio.idServicio}"
              title="Ver detalle"
            >
              👁️
            </button>

            ${puedeEditar ? `
              <button
                type="button"
                class="btn btn-sm btn-secondary"
                data-action="editar"
                data-id="${servicio.idServicio}"
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
                data-id="${servicio.idServicio}"
                data-estado="${!servicio.activo}"
                title="${servicio.activo ? 'Desactivar' : 'Activar'}"
              >
                ${servicio.activo ? '⊘' : '↻'}
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

  const totalPaginas = Math.ceil(totalServicios / filtroActual.limit);

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
        Página ${paginaActual} de ${totalPaginas} (${totalServicios} servicios)
      </span>
    </div>
  `;

  // Event listeners de paginación
  document.getElementById('btn-anterior')?.addEventListener('click', () => {
    if (paginaActual > 1) {
      paginaActual--;
      cargarServicios();
    }
  });

  document.getElementById('btn-siguiente')?.addEventListener('click', () => {
    if (paginaActual < totalPaginas) {
      paginaActual++;
      cargarServicios();
    }
  });

  paginacionContenedor.querySelectorAll('[data-page]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      paginaActual = parseInt(e.target.dataset.page);
      cargarServicios();
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
      window.location.hash = `#/catalogo/servicios/detalle?id=${id}`;
      break;

    case 'editar':
      window.location.hash = `#/catalogo/servicios/formulario?id=${id}`;
      break;

    case 'cambiar-estado':
      const nuevoEstado = btn.dataset.estado === 'true';
      cambiarEstadoServicioUI(id, nuevoEstado);
      break;
  }
}

async function cambiarEstadoServicioUI(id, activo) {
  try {
    showLoader();

    await cambiarEstadoServicio(id, activo);

    showNotification(
      activo
        ? MENSAJES.SERVICIO_ACTIVADO
        : MENSAJES.SERVICIO_DESACTIVADO,
      { type: 'success', timeout: 2000 }
    );

    // Recargar lista
    paginaActual = 1;
    await cargarServicios();

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
    filtrosTipo,
    filtrosEstado
  } = obtenerElementos();

  filtroActual = {
    codigo: filtrosCodigo?.value.trim() || '',
    nombre: filtrosNombre?.value.trim() || '',
    descripcion: '',
    tipo: filtrosTipo?.value || '',
    estado: filtrosEstado?.value || '',
    soloActivos: false,
    skip: 0,
    limit: filtroActual.limit
  };

  paginaActual = 1;
  cargarServicios();
}

function limpiarFiltros() {
  const {
    filtrosCodigo,
    filtrosNombre,
    filtrosTipo,
    filtrosEstado
  } = obtenerElementos();

  if (filtrosCodigo) filtrosCodigo.value = '';
  if (filtrosNombre) filtrosNombre.value = '';
  if (filtrosTipo) filtrosTipo.value = '';
  if (filtrosEstado) filtrosEstado.value = '';

  filtroActual = {
    codigo: '',
    nombre: '',
    descripcion: '',
    tipo: '',
    estado: '',
    soloActivos: false,
    skip: 0,
    limit: filtroActual.limit
  };

  paginaActual = 1;
  cargarServicios();
}

function manejarNuevoServicio() {
  window.location.hash = '#/catalogo/servicios/formulario';
}

// ============================================================================
// INICIALIZACIÓN
// ============================================================================

export async function init() {
  // Validar autenticación y permisos
  if (!requireAuth()) return;

  renderNavegacionCatalogo();

  const session = getSession();
  if (!hasPermission(session, PERMISOS_CATALOGO.CONSULTAR)) {
    const { contenedorAcceso, contenedorPrincipal } = obtenerElementos();
    if (contenedorAcceso) contenedorAcceso.style.display = 'flex';
    if (contenedorPrincipal) contenedorPrincipal.style.display = 'none';
    return;
  }

  // Verificar si el usuario puede crear servicios
  const puedeCrear = hasPermission(session, PERMISOS_CATALOGO.SERVICIOS_REGISTRAR);
  const { btnNuevo } = obtenerElementos();
  if (btnNuevo && !puedeCrear) {
    btnNuevo.style.display = 'none';
  }

  // Cargar servicios inicialmente
  await cargarServicios();

  // Configurar event listeners
  const {
    btnFiltrar,
    btnLimpiar,
    btnNuevo
  } = obtenerElementos();

  if (btnFiltrar) btnFiltrar.addEventListener('click', manejarFiltros);
  if (btnLimpiar) btnLimpiar.addEventListener('click', limpiarFiltros);
  if (btnNuevo) btnNuevo.addEventListener('click', manejarNuevoServicio);

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
