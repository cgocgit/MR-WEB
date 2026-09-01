/**
 * Módulo: Catálogo - Configuración de Auxiliares
 * Funcionalidad: CRUD de categorías, tipos de producto y colores
 */

import {
  listarCategoriasProducto,
  listarTiposProducto,
  listarColores
} from '../../api/catalogo.service.js';

import {
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

import {
  renderNavegacionCatalogo
} from './catalogo-ui.js';

// ============================================================================
// ESTADO DEL MÓDULO
// ============================================================================

let auxiliarActual = null;
let tipoAuxiliarActual = null;

// ============================================================================
// REFERENCIAS AL DOM
// ============================================================================

function obtenerElementos() {
  return {
    // Contenedor general
    estadoAcceso: document.getElementById('estado-acceso'),

    // Tabs
    tabs: document.querySelectorAll('[role="tab"]'),

    // Secciones
    seccionCategorias: document.getElementById('seccion-categorias'),
    seccionTipos: document.getElementById('seccion-tipos'),
    seccionColores: document.getElementById('seccion-colores'),

    // Listas
    listaCategoriasDiv: document.getElementById('categorias-lista'),
    listaTiposDiv: document.getElementById('tipos-lista'),
    listaColoresDiv: document.getElementById('colores-lista'),

    // Botones de crear
    btnNuevaCategoria: document.getElementById('btn-nueva-categoria'),
    btnNuevoTipo: document.getElementById('btn-nuevo-tipo'),
    btnNuevoColor: document.getElementById('btn-nuevo-color'),

    // Modal
    modalAuxiliar: document.getElementById('modal-auxiliar'),
    modalTitulo: document.getElementById('modal-titulo'),
    auxiliarForm: document.getElementById('auxiliar-form'),

    // Campos del modal
    auxNombre: document.getElementById('aux-nombre'),
    auxTipo: document.getElementById('aux-tipo'),
    auxHexadecimal: document.getElementById('aux-hexadecimal'),
    auxColorPicker: document.getElementById('aux-color-picker'),
    auxActivo: document.getElementById('aux-activo'),

    // Botones del modal
    btnCerrarModal: document.getElementById('btn-cerrar-modal'),
    btnGuardarAuxiliar: document.getElementById('btn-guardar-auxiliar'),

    // Campos dinámicos del modal
    campTipoCategoria: document.getElementById('campo-tipo-categoria'),
    campHexadecimal: document.getElementById('campo-hexadecimal'),

    // Errores
    errorAuxNombre: document.getElementById('error-aux-nombre'),
    errorAuxTipo: document.getElementById('error-aux-tipo'),
    errorAuxHexadecimal: document.getElementById('error-aux-hexadecimal')
  };
}

// ============================================================================
// UTILIDADES
// ============================================================================

function limpiarModalAuxiliar() {
  const {
    auxiliarForm,
    auxNombre,
    auxTipo,
    auxHexadecimal,
    auxColorPicker,
    auxActivo,
    errorAuxNombre,
    errorAuxTipo,
    errorAuxHexadecimal
  } = obtenerElementos();

  if (auxiliarForm) auxiliarForm.reset();
  if (auxNombre) auxNombre.value = '';
  if (auxTipo) auxTipo.value = '';
  if (auxHexadecimal) auxHexadecimal.value = '';
  if (auxColorPicker) auxColorPicker.value = '#FFFFFF';
  if (auxActivo) auxActivo.checked = true;

  if (errorAuxNombre) errorAuxNombre.textContent = '';
  if (errorAuxTipo) errorAuxTipo.textContent = '';
  if (errorAuxHexadecimal) errorAuxHexadecimal.textContent = '';

  auxiliarActual = null;
}

function mostrarModal() {
  const { modalAuxiliar } = obtenerElementos();
  if (modalAuxiliar) modalAuxiliar.style.display = 'flex';
}

function cerrarModal() {
  const { modalAuxiliar } = obtenerElementos();
  if (modalAuxiliar) modalAuxiliar.style.display = 'none';
  limpiarModalAuxiliar();
}

function actualizarVisibilidadCampos() {
  const { campTipoCategoria, campHexadecimal } = obtenerElementos();

  if (tipoAuxiliarActual === 'categorias') {
    if (campTipoCategoria) campTipoCategoria.style.display = 'block';
    if (campHexadecimal) campHexadecimal.style.display = 'none';
  } else if (tipoAuxiliarActual === 'colores') {
    if (campTipoCategoria) campTipoCategoria.style.display = 'none';
    if (campHexadecimal) campHexadecimal.style.display = 'block';
  } else {
    if (campTipoCategoria) campTipoCategoria.style.display = 'none';
    if (campHexadecimal) campHexadecimal.style.display = 'none';
  }
}

// ============================================================================
// CARGA Y RENDERIZADO DE AUXILIARES
// ============================================================================

async function cargarYRenderizar(tipo) {
  try {
    showLoader();

    let datos;
    let contenedor;
    const { listaCategoriasDiv, listaTiposDiv, listaColoresDiv } = obtenerElementos();

    switch (tipo) {
      case 'categorias':
        datos = CATEGORIAS_PRODUCTO;
        contenedor = listaCategoriasDiv;
        break;
      case 'tipos':
        datos = TIPOS_PRODUCTO;
        contenedor = listaTiposDiv;
        break;
      case 'colores':
        datos = COLORES;
        contenedor = listaColoresDiv;
        break;
    }

    if (!contenedor) return;

    // Renderizar como cards
    contenedor.innerHTML = datos.map(item => {
      const estado = item.activo ? 'Activo' : 'Inactivo';
      const estadoClase = item.activo ? 'estado-activo' : 'estado-inactivo';

      let contenidoExtra = '';
      if (tipo === 'categorias') {
        const tipoNombre = item.tipo === 'Producto' ? 'Producto' : 'Servicio';
        contenidoExtra = `<p style="font-size: 0.875rem; color: var(--color-text-secondary); margin: 0.5rem 0 0 0;">Tipo: ${tipoNombre}</p>`;
      } else if (tipo === 'colores') {
        contenidoExtra = `
          <div style="display: flex; align-items: center; gap: 0.5rem; margin-top: 0.5rem;">
            <div style="width: 30px; height: 30px; background-color: ${item.hexadecimal}; border: 1px solid var(--color-border); border-radius: 4px;"></div>
            <span style="font-size: 0.875rem; font-family: monospace; color: var(--color-text-secondary);">${item.hexadecimal}</span>
          </div>
        `;
      }

      return `
        <div class="catalogo-card" style="padding: 1rem;">
          <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 0.5rem;">
            <div>
              <h3 style="margin: 0; font-size: 1rem;">${item.nombre}</h3>
              ${contenidoExtra}
            </div>
            <span class="catalogo-badge ${estadoClase}" style="white-space: nowrap;">
              ${estado}
            </span>
          </div>

          <div style="display: flex; gap: 0.5rem; margin-top: 1rem; justify-content: flex-end;">
            <button
              type="button"
              class="btn btn-sm btn-secondary"
              data-action="editar"
              data-id="${item.id}"
              data-tipo="${tipo}"
            >
              ✎ Editar
            </button>
          </div>
        </div>
      `;
    }).join('');

    // Event listeners
    contenedor.querySelectorAll('[data-action="editar"]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = e.currentTarget.dataset.id;
        const tipo = e.currentTarget.dataset.tipo;
        abrirEditarAuxiliar(tipo, id);
      });
    });

  } catch (error) {
    console.error('Error cargando auxiliares:', error);
    showNotification('Error cargando auxiliares', { type: 'error' });
  } finally {
    hideLoader();
  }
}

// ============================================================================
// MANEJO DE MODAL
// ============================================================================

function abrirNuevoAuxiliar(tipo) {
  tipoAuxiliarActual = tipo;
  auxiliarActual = null;

  const { modalTitulo } = obtenerElementos();
  if (modalTitulo) {
    switch (tipo) {
      case 'categorias':
        modalTitulo.textContent = 'Nueva Categoría';
        break;
      case 'tipos':
        modalTitulo.textContent = 'Nuevo Tipo de Producto';
        break;
      case 'colores':
        modalTitulo.textContent = 'Nuevo Color';
        break;
    }
  }

  limpiarModalAuxiliar();
  actualizarVisibilidadCampos();
  mostrarModal();
}

function abrirEditarAuxiliar(tipo, id) {
  tipoAuxiliarActual = tipo;

  let datos;
  switch (tipo) {
    case 'categorias':
      datos = CATEGORIAS_PRODUCTO.find(c => c.id === parseInt(id));
      auxiliarActual = JSON.parse(JSON.stringify(datos));
      break;
    case 'tipos':
      datos = TIPOS_PRODUCTO.find(t => t.id === parseInt(id));
      auxiliarActual = JSON.parse(JSON.stringify(datos));
      break;
    case 'colores':
      datos = COLORES.find(c => c.id === parseInt(id));
      auxiliarActual = JSON.parse(JSON.stringify(datos));
      break;
  }

  const {
    modalTitulo,
    auxNombre,
    auxTipo,
    auxHexadecimal,
    auxColorPicker,
    auxActivo
  } = obtenerElementos();

  if (modalTitulo) {
    switch (tipo) {
      case 'categorias':
        modalTitulo.textContent = 'Editar Categoría';
        break;
      case 'tipos':
        modalTitulo.textContent = 'Editar Tipo de Producto';
        break;
      case 'colores':
        modalTitulo.textContent = 'Editar Color';
        break;
    }
  }

  if (auxNombre) auxNombre.value = auxiliarActual?.nombre || '';
  if (auxTipo && auxiliarActual?.tipo) auxTipo.value = auxiliarActual.tipo;
  if (auxHexadecimal && auxiliarActual?.hexadecimal) auxHexadecimal.value = auxiliarActual.hexadecimal;
  if (auxColorPicker && auxiliarActual?.hexadecimal) auxColorPicker.value = auxiliarActual.hexadecimal;
  if (auxActivo) auxActivo.checked = auxiliarActual?.activo ?? true;

  actualizarVisibilidadCampos();
  mostrarModal();
}

// ============================================================================
// MANEJO DE GUARDADO
// ============================================================================

async function manejarGuardarAuxiliar() {
  const {
    auxNombre,
    auxTipo,
    auxHexadecimal,
    auxActivo,
    errorAuxNombre,
    errorAuxTipo,
    errorAuxHexadecimal
  } = obtenerElementos();

  // Validaciones básicas
  if (errorAuxNombre) errorAuxNombre.textContent = '';
  if (errorAuxTipo) errorAuxTipo.textContent = '';
  if (errorAuxHexadecimal) errorAuxHexadecimal.textContent = '';

  if (!auxNombre?.value.trim()) {
    if (errorAuxNombre) errorAuxNombre.textContent = 'El nombre es requerido';
    return;
  }

  if (tipoAuxiliarActual === 'categorias' && !auxTipo?.value) {
    if (errorAuxTipo) errorAuxTipo.textContent = 'El tipo es requerido';
    return;
  }

  if (tipoAuxiliarActual === 'colores' && !auxHexadecimal?.value) {
    if (errorAuxHexadecimal) errorAuxHexadecimal.textContent = 'El color es requerido';
    return;
  }

  try {
    showLoader();

    // Datos a guardar
    const datos = {
      nombre: auxNombre?.value.trim() || '',
      activo: auxActivo?.checked || false
    };

    if (tipoAuxiliarActual === 'categorias') {
      datos.tipo = auxTipo?.value || '';
    }

    if (tipoAuxiliarActual === 'colores') {
      datos.hexadecimal = auxHexadecimal?.value || '#FFFFFF';
    }

    // Simulación de guardado (sin servidor)
    // En producción, aquí iría el llamado al servicio

    if (auxiliarActual) {
      // Edición: actualizar en mock data
      if (tipoAuxiliarActual === 'categorias') {
        const idx = CATEGORIAS_PRODUCTO.findIndex(c => c.id === auxiliarActual.id);
        if (idx >= 0) Object.assign(CATEGORIAS_PRODUCTO[idx], datos);
      } else if (tipoAuxiliarActual === 'tipos') {
        const idx = TIPOS_PRODUCTO.findIndex(t => t.id === auxiliarActual.id);
        if (idx >= 0) Object.assign(TIPOS_PRODUCTO[idx], datos);
      } else if (tipoAuxiliarActual === 'colores') {
        const idx = COLORES.findIndex(c => c.id === auxiliarActual.id);
        if (idx >= 0) Object.assign(COLORES[idx], datos);
      }

      showNotification('Auxiliar actualizado correctamente', { type: 'success' });
    } else {
      // Creación: agregar al mock data
      const nuevoId = Math.max(
        ...(tipoAuxiliarActual === 'categorias' 
          ? CATEGORIAS_PRODUCTO.map(c => c.id)
          : tipoAuxiliarActual === 'tipos'
          ? TIPOS_PRODUCTO.map(t => t.id)
          : COLORES.map(c => c.id)
        ),
        0
      ) + 1;

      const nuevoAuxiliar = {
        id: nuevoId,
        ...datos
      };

      if (tipoAuxiliarActual === 'categorias') {
        CATEGORIAS_PRODUCTO.push(nuevoAuxiliar);
      } else if (tipoAuxiliarActual === 'tipos') {
        TIPOS_PRODUCTO.push(nuevoAuxiliar);
      } else if (tipoAuxiliarActual === 'colores') {
        COLORES.push(nuevoAuxiliar);
      }

      showNotification('Auxiliar creado correctamente', { type: 'success' });
    }

    // Cerrar modal y recargar
    cerrarModal();
    await cargarYRenderizar(tipoAuxiliarActual);

  } catch (error) {
    console.error('Error guardando auxiliar:', error);
    showNotification(error.message || 'Error guardando auxiliar', { type: 'error' });
  } finally {
    hideLoader();
  }
}

// ============================================================================
// MANEJO DE TABS
// ============================================================================

function manejarCambioTab(e) {
  const tabBtn = e.target.closest('[role="tab"]');
  if (!tabBtn) return;

  const tipo = tabBtn.dataset.auxiliar;
  const { tabs, seccionCategorias, seccionTipos, seccionColores } = obtenerElementos();

  // Actualizar tabs
  tabs.forEach(t => t.setAttribute('aria-selected', 'false'));
  tabBtn.setAttribute('aria-selected', 'true');

  // Mostrar/ocultar secciones
  if (seccionCategorias) seccionCategorias.style.display = tipo === 'categorias' ? 'block' : 'none';
  if (seccionTipos) seccionTipos.style.display = tipo === 'tipos' ? 'block' : 'none';
  if (seccionColores) seccionColores.style.display = tipo === 'colores' ? 'block' : 'none';

  // Cargar datos
  cargarYRenderizar(tipo);
}

// ============================================================================
// SINCRONIZACIÓN DE HEXADECIMAL Y COLOR PICKER
// ============================================================================

function manejarCambioColorPicker(e) {
  const { auxHexadecimal } = obtenerElementos();
  if (auxHexadecimal) {
    auxHexadecimal.value = e.target.value;
  }
}

function manejarCambioHexadecimal(e) {
  const valor = e.target.value.trim();
  const { auxColorPicker, errorAuxHexadecimal } = obtenerElementos();

  if (/^#[0-9A-F]{6}$/i.test(valor)) {
    if (auxColorPicker) auxColorPicker.value = valor;
    if (errorAuxHexadecimal) errorAuxHexadecimal.textContent = '';
  } else if (valor && errorAuxHexadecimal) {
    errorAuxHexadecimal.textContent = 'Formato: #RRGGBB';
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

  // Verificar permisos
  if (!hasPermission(session, PERMISOS_CATALOGO.AUXILIARES_GESTIONAR)) {
    const { estadoAcceso } = obtenerElementos();
    if (estadoAcceso) estadoAcceso.style.display = 'flex';
    return;
  }

  // Cargar la primera sección (categorías)
  tipoAuxiliarActual = 'categorias';
  await cargarYRenderizar('categorias');

  // Configurar event listeners
  const {
    tabs,
    btnNuevaCategoria,
    btnNuevoTipo,
    btnNuevoColor,
    btnCerrarModal,
    btnGuardarAuxiliar,
    modalAuxiliar,
    auxColorPicker,
    auxHexadecimal
  } = obtenerElementos();

  // Tabs
  tabs.forEach(tab => tab.addEventListener('click', manejarCambioTab));

  // Botones de crear
  if (btnNuevaCategoria) {
    btnNuevaCategoria.addEventListener('click', () => abrirNuevoAuxiliar('categorias'));
  }
  if (btnNuevoTipo) {
    btnNuevoTipo.addEventListener('click', () => abrirNuevoAuxiliar('tipos'));
  }
  if (btnNuevoColor) {
    btnNuevoColor.addEventListener('click', () => abrirNuevoAuxiliar('colores'));
  }

  // Modal
  if (btnCerrarModal) btnCerrarModal.addEventListener('click', cerrarModal);
  if (btnGuardarAuxiliar) btnGuardarAuxiliar.addEventListener('click', manejarGuardarAuxiliar);
  if (modalAuxiliar) {
    modalAuxiliar.addEventListener('click', (e) => {
      if (e.target === modalAuxiliar) cerrarModal();
    });
  }

  // Color picker y hexadecimal
  if (auxColorPicker) auxColorPicker.addEventListener('input', manejarCambioColorPicker);
  if (auxHexadecimal) auxHexadecimal.addEventListener('input', manejarCambioHexadecimal);
}
