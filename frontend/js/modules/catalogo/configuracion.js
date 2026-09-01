/**
 * Módulo: Catálogo - Configuración de Auxiliares
 * Funcionalidad: CRUD de categorías, tipos de producto y colores
 */

import {
  listarCategoriasConfiguracion,
  listarTiposProducto,
  listarColores,

  registrarCategoria,
  actualizarCategoria,
  cambiarEstadoCategoria,

  registrarTipoProducto,
  actualizarTipoProducto,
  cambiarEstadoTipoProducto,

  registrarColor,
  actualizarColor,
  cambiarEstadoColor
} from '../../api/catalogo.service.js';

import {
  PERMISOS_CATALOGO
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
let datosAuxiliares = {
  categorias: [],
  tipos: [],
  colores: []
};

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
    errorAuxHexadecimal: document.getElementById('error-aux-hexadecimal'),

    buscarCategorias:
      document.getElementById('buscar-categorias'),

    buscarTipos:
      document.getElementById('buscar-tipos'),

    buscarColores:
      document.getElementById('buscar-colores'),
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

async function cargarYRenderizar(
  tipo,
  texto = ''
) {
  try {
    showLoader();

    let datos = [];
    let contenedor;

    const {
      listaCategoriasDiv,
      listaTiposDiv,
      listaColoresDiv
    } = obtenerElementos();

    if (tipo === 'categorias') {
      datos =
        await listarCategoriasConfiguracion();

      contenedor =
        listaCategoriasDiv;
    }

    if (tipo === 'tipos') {
      datos =
        await listarTiposProducto();

      contenedor =
        listaTiposDiv;
    }

    if (tipo === 'colores') {
      datos =
        await listarColores();

      contenedor =
        listaColoresDiv;
    }

    datosAuxiliares[tipo] = datos;

    const filtro =
      texto.toLowerCase().trim();

    const filtrados =
      filtro
        ? datos.filter(item =>
            item.nombre
              .toLowerCase()
              .includes(filtro)
          )
        : datos;

    contenedor.innerHTML =
      filtrados
        .map(item => {
          const extra =
            tipo === 'categorias'
              ? `<p>Tipo: ${item.tipo}</p>`
              : tipo === 'colores'
                ? `<p>${item.hexadecimal}</p>`
                : '';

          return `
            <article class="catalogo-card">
              <div class="catalogo-card-content">

                <h3 class="catalogo-card-title">
                  ${item.nombre}
                </h3>

                ${extra}

                <p>
                  ${item.activo
                    ? 'Activo'
                    : 'Inactivo'}
                </p>

              </div>

              <div class="catalogo-card-actions">

                <button
                  type="button"
                  class="btn btn-secondary"
                  data-action="editar"
                  data-id="${item.id}"
                  data-tipo="${tipo}"
                >
                  Editar
                </button>

                <button
                  type="button"
                  class="btn btn-secondary"
                  data-action="estado"
                  data-id="${item.id}"
                  data-tipo="${tipo}"
                  data-activo="${item.activo}"
                >
                  ${item.activo
                    ? 'Desactivar'
                    : 'Activar'}
                </button>

              </div>
            </article>
          `;
        })
        .join('');

    contenedor
      .querySelectorAll('[data-action]')
      .forEach(boton => {
        boton.addEventListener(
          'click',
          manejarAccionAuxiliar
        );
      });

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

  auxiliarActual =
    datosAuxiliares[tipo].find(
      item => item.id === Number(id)
    );

  if (!auxiliarActual) return;

  const {
    modalTitulo,
    auxNombre,
    auxTipo,
    auxHexadecimal,
    auxColorPicker,
    auxActivo
  } = obtenerElementos();

  modalTitulo.textContent =
    'Editar auxiliar';

  auxNombre.value =
    auxiliarActual.nombre || '';

  auxTipo.value =
    auxiliarActual.tipo || '';

  auxHexadecimal.value =
    auxiliarActual.hexadecimal || '';

  if (auxiliarActual.hexadecimal) {
    auxColorPicker.value =
      auxiliarActual.hexadecimal;
  }

  auxActivo.checked =
    auxiliarActual.activo === 1;

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

  errorAuxNombre.textContent = '';
  errorAuxTipo.textContent = '';
  errorAuxHexadecimal.textContent = '';

  const nombre =
    auxNombre.value.trim();

  if (!nombre) {
    errorAuxNombre.textContent =
      'El nombre es requerido';
    return;
  }

  try {
    showLoader();

    if (tipoAuxiliarActual === 'categorias') {
      if (!auxTipo.value) {
        errorAuxTipo.textContent =
          'El tipo es requerido';
        return;
      }

      const datos = {
        nombre,
        tipo: auxTipo.value,
        activo: auxActivo.checked
      };

      if (auxiliarActual) {
        await actualizarCategoria(
          auxiliarActual.id,
          datos
        );
      } else {
        await registrarCategoria(datos);
      }
    }

    if (tipoAuxiliarActual === 'tipos') {
      const datos = {
        nombre,
        activo: auxActivo.checked
      };

      if (auxiliarActual) {
        await actualizarTipoProducto(
          auxiliarActual.id,
          datos
        );
      } else {
        await registrarTipoProducto(datos);
      }
    }

    if (tipoAuxiliarActual === 'colores') {
      const hexadecimal =
        auxHexadecimal.value.trim();

      if (
        !/^#[0-9A-F]{6}$/i.test(hexadecimal)
      ) {
        errorAuxHexadecimal.textContent =
          'Formato: #RRGGBB';
        return;
      }

      const datos = {
        nombre,
        hexadecimal,
        activo: auxActivo.checked
      };

      if (auxiliarActual) {
        await actualizarColor(
          auxiliarActual.id,
          datos
        );
      } else {
        await registrarColor(datos);
      }
    }

    showNotification(
      auxiliarActual
        ? 'Auxiliar actualizado correctamente'
        : 'Auxiliar creado correctamente',
      { type: 'success' }
    );

    cerrarModal();

    await cargarYRenderizar(
      tipoAuxiliarActual
    );

  } catch (error) {
    showNotification(
      error.message ||
        'Error guardando auxiliar',
      { type: 'error' }
    );

  } finally {
    hideLoader();
  }
}

async function manejarAccionAuxiliar(evento) {
  const boton =
    evento.currentTarget;

  const tipo =
    boton.dataset.tipo;

  const id =
    Number(boton.dataset.id);

  if (boton.dataset.action === 'editar') {
    abrirEditarAuxiliar(tipo, id);
    return;
  }

  if (boton.dataset.action === 'estado') {
    const activo =
      boton.dataset.activo === '1';

    const nuevoEstado =
      !activo;

    if (tipo === 'categorias') {
      await cambiarEstadoCategoria(
        id,
        nuevoEstado
      );
    }

    if (tipo === 'tipos') {
      await cambiarEstadoTipoProducto(
        id,
        nuevoEstado
      );
    }

    if (tipo === 'colores') {
      await cambiarEstadoColor(
        id,
        nuevoEstado
      );
    }

    await cargarYRenderizar(tipo);
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

  const {
    buscarCategorias,
    buscarTipos,
    buscarColores
  } = obtenerElementos();

  buscarCategorias?.addEventListener(
    'input',
    evento =>
      cargarYRenderizar(
        'categorias',
        evento.target.value
      )
  );

  buscarTipos?.addEventListener(
    'input',
    evento =>
      cargarYRenderizar(
        'tipos',
        evento.target.value
      )
  );

  buscarColores?.addEventListener(
    'input',
    evento =>
      cargarYRenderizar(
        'colores',
        evento.target.value
      )
  );
}
