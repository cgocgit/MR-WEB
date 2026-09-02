/**
 * Módulo: Catálogo - Formulario de Servicios
 * Funcionalidad: Crear y editar servicios del catálogo
 */

import {
  registrarServicio,
  obtenerServicio,
  actualizarServicio,
  listarCategoriasServicio
} from '../../api/catalogo.service.js';

import {
  TIPOS_SERVICIO,
  PERMISOS_CATALOGO,
  MENSAJES,
  RUTAS_IMAGENES
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
let esEdicion = false;

// ============================================================================
// REFERENCIAS AL DOM
// ============================================================================

function obtenerElementos() {
  return {
    // Formulario
    form: document.getElementById('servicio-form'),
    formTitle: document.getElementById('form-title'),
    formMessage: document.getElementById('form-message'),

    // Campos
    codigo: document.getElementById('codigo'),
    nombre: document.getElementById('nombre'),
    descripcion: document.getElementById('descripcion'),
    idCategoria: document.getElementById('idCategoria'),
    tipoServicio: document.getElementById('tipoServicio'),
    tarifaBase: document.getElementById('tarifaBase'),
    activo: document.getElementById('activo'),

    previewImagen:
      document.getElementById('preview-imagen'),

    // Botones
    btnCancelar: document.getElementById('btn-cancelar'),
    btnGuardar: document.querySelector('button[type="submit"]'),

    // Errores
    errorCodigo: document.getElementById('error-codigo'),
    errorNombre: document.getElementById('error-nombre'),
    errorDescripcion: document.getElementById('error-descripcion'),
    errorIdCategoria: document.getElementById('error-idCategoria'),
    errorTipoServicio: document.getElementById('error-tipoServicio'),
    errorTarifaBase: document.getElementById('error-tarifaBase')
  };
}

// ============================================================================
// UTILIDADES
// ============================================================================

function obtenerIdServicio() {
  const queryString = location.hash.split('?')[1] || '';
  return new URLSearchParams(queryString).get('id');
}

function limpiarErrores() {
  const {
    errorCodigo,
    errorNombre,
    errorDescripcion,
    errorIdCategoria,
    errorTipoServicio,
    errorTarifaBase
  } = obtenerElementos();

  [
    errorCodigo,
    errorNombre,
    errorDescripcion,
    errorIdCategoria,
    errorTipoServicio,
    errorTarifaBase
  ].forEach(el => {
    if (el) {
      el.textContent = '';
    }
  });
}

function mostrarError(campo, mensaje) {
  const elemento = document.getElementById(`error-${campo}`);
  if (elemento) {
    elemento.textContent = mensaje;
  }
}

function mostrarMensaje(tipo, mensaje) {
  const { formMessage } = obtenerElementos();
  if (!formMessage) return;

  formMessage.textContent = mensaje;
  formMessage.className = `catalogo-${tipo}`;
  formMessage.style.display = 'block';

  if (tipo === 'success') {
    setTimeout(() => {
      formMessage.style.display = 'none';
    }, 3000);
  }
}

async function cargarCategoriasServicio() {
  const { idCategoria } =
    obtenerElementos();

  if (!idCategoria) return;

  const categorias =
    await listarCategoriasServicio();

  idCategoria.innerHTML =
    '<option value="">Seleccione una categoría</option>';

  categorias.forEach(categoria => {
    const option =
      document.createElement('option');

    option.value = categoria.id;

    option.textContent =
      `${categoria.nombre}${
        categoria.activo
          ? ''
          : ' (Inactiva)'
      }`;

    option.disabled =
      categoria.activo !== 1;

    idCategoria.appendChild(option);
  });
}

// ============================================================================
// CARGA DE SERVICIO (Si es edición)
// ============================================================================

async function cargarServicio(id) {
  try {
    showLoader();

    const servicio = await obtenerServicio(id);

    servicioActual = servicio;
    esEdicion = true;

    const {
      formTitle,
      codigo,
      nombre,
      descripcion,
      idCategoria,
      tipoServicio,
      tarifaBase,
      activo,
      previewImagen
    } = obtenerElementos();

    if (formTitle) {
      formTitle.textContent = 'Editar Servicio';
    }

    if (codigo) {
      codigo.value = servicio.codigo;
      codigo.disabled = true;
    }

    if (nombre) {
      nombre.value = servicio.nombre;
    }

    if (descripcion) {
      descripcion.value = servicio.descripcion || '';
    }

    if (idCategoria) {
      idCategoria.value = servicio.idCategoria || '';
    }

    if (tipoServicio) {
      tipoServicio.value = servicio.tipoServicio || '';
    }

    if (tarifaBase) {
      tarifaBase.value = servicio.tarifaBase;
    }

    if (activo) {
      activo.checked = servicio.activo === 1;
    }

    if (previewImagen) {
      previewImagen.src =
        servicio.imagenUrl ||
        RUTAS_IMAGENES.PLACEHOLDER_SERVICIO;

      previewImagen.alt =
        `Imagen de ${servicio.nombre}`;

      previewImagen.onerror = () => {
        previewImagen.onerror = null;

        previewImagen.src =
          RUTAS_IMAGENES.PLACEHOLDER_SERVICIO;
      };
    }

  } catch (error) {
    console.error('Error cargando servicio:', error);

    showNotification(
      error.message || 'Error cargando servicio',
      { type: 'error' }
    );

    setTimeout(() => {
      window.location.hash = '#/catalogo/servicios';
    }, 2000);

  } finally {
    hideLoader();
  }
}


// ============================================================================
// ENVÍO DEL FORMULARIO
// ============================================================================

async function manejarEnvio(e) {
  e.preventDefault();

  const {
    codigo,
    nombre,
    descripcion,
    idCategoria,
    tipoServicio,
    tarifaBase,
    activo
  } = obtenerElementos();

  try {
    showLoader();
    limpiarErrores();

    const datos = {
      codigo: codigo?.value.trim() || '',
      nombre: nombre?.value.trim() || '',
      descripcion: descripcion?.value.trim() || '',

      idCategoria: idCategoria?.value
        ? Number(idCategoria.value)
        : null,

      tipoServicio: tipoServicio?.value || '',

      tarifaBase: Number(tarifaBase?.value || 0),

      activo: Boolean(activo?.checked),

      imagenUrl:
        servicioActual?.imagenUrl || null
    };

    let resultado;

    if (esEdicion && servicioActual) {
      resultado = await actualizarServicio(
        servicioActual.idServicio,
        datos
      );

      showNotification(
        MENSAJES.SERVICIO_ACTUALIZADO,
        { type: 'success' }
      );
    } else {
      resultado = await registrarServicio(datos);

      showNotification(
        MENSAJES.SERVICIO_REGISTRADO,
        { type: 'success' }
      );
    }

    setTimeout(() => {
      window.location.hash =
        `#/catalogo/servicios/detalle?id=${resultado.idServicio}`;
    }, 500);

  } catch (error) {
    console.error('Error guardando servicio:', error);

    if (error.detalles && Array.isArray(error.detalles)) {
      error.detalles.forEach(err => {
        mostrarError(err.campo, err.mensaje);
      });
    } else {
      mostrarMensaje(
        'error',
        error.message || 'Error desconocido'
      );
    }
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

  // Verificar permisos
  const permiso = idServicio
    ? PERMISOS_CATALOGO.SERVICIOS_MODIFICAR
    : PERMISOS_CATALOGO.SERVICIOS_REGISTRAR;

  if (!hasPermission(session, permiso)) {
    showNotification('No tiene permisos para acceder a esta página', { type: 'error' });
    setTimeout(() => {
      window.location.hash = '#/catalogo/servicios';
    }, 2000);
    return;
  }

  // Llenar tipos de servicio
  const { tipoServicio } = obtenerElementos();
  if (tipoServicio) {
    tipoServicio.innerHTML = '<option value="">Seleccione un tipo</option>';
    TIPOS_SERVICIO.forEach(tipo => {
      const option = document.createElement('option');
      option.value = tipo;
      option.textContent = tipo;
      tipoServicio.appendChild(option);
    });
  }

  await cargarCategoriasServicio();

  // Cargar servicio si es edición
  if (idServicio) {
    await cargarServicio(idServicio);
  }

  // Configurar event listeners
  const {
    form,
    btnCancelar
  } = obtenerElementos();

  if (form) {
    form.addEventListener('submit', manejarEnvio);
  }

  if (btnCancelar) {
    btnCancelar.addEventListener('click', () => {
      window.location.hash = '#/catalogo/servicios';
    });
  }

}
