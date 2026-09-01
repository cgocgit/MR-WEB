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
  ESTADO_REGISTRO,
  TIPOS_SERVICIO,
  PERMISOS_CATALOGO,
  MENSAJES,
  LIMITES_CAMPOS
} from '../../api/catalogo.constants.js';

import { getSession, requireAuth } from '../../shared/auth-guard.js';
import { hasPermission } from '../../shared/permissions.js';
import { showNotification } from '../../components/notification.js';
import { showLoader, hideLoader } from '../../components/loader.js';

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
    tipoServicio: document.getElementById('tipoServicio'),
    tarifaBase: document.getElementById('tarifaBase'),
    imagen: document.getElementById('imagen'),
    urlImagen: document.getElementById('urlImagen'),
    previewImagen: document.getElementById('preview-imagen'),
    activo: document.getElementById('activo'),
    idCategoria: document.getElementById('idCategoria'),

    // Botones
    btnCancelar: document.getElementById('btn-cancelar'),
    btnGuardar: document.querySelector('button[type="submit"]'),

    // Errores
    errorCodigo: document.getElementById('error-codigo'),
    errorNombre: document.getElementById('error-nombre'),
    errorDescripcion: document.getElementById('error-descripcion'),
    errorTipoServicio: document.getElementById('error-tipoServicio'),
    errorTarifaBase: document.getElementById('error-tarifaBase'),
    errorImagen: document.getElementById('error-imagen'),
    errorUrlImagen: document.getElementById('error-urlImagen')
    idCategoria: document.getElementById('idCategoria'),
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
    errorTipoServicio,
    errorTarifaBase,
    errorImagen,
    errorUrlImagen
  } = obtenerElementos();

  [
    errorCodigo,
    errorNombre,
    errorDescripcion,
    errorTipoServicio,
    errorTarifaBase,
    errorImagen,
    errorUrlImagen
  ].forEach(el => {
    if (el) el.textContent = '';
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
  const { idCategoria } = obtenerElementos();

  if (!idCategoria) return;

  try {
    const categorias = await listarCategoriasServicio();

    idCategoria.innerHTML =
      '<option value="">Seleccione una categoría</option>';

    categorias
      .filter(categoria => categoria.activo === 1)
      .forEach(categoria => {
        const option = document.createElement('option');

        option.value = categoria.id;
        option.textContent = categoria.nombre;

        idCategoria.appendChild(option);
      });

  } catch (error) {
    console.error(
      'Error cargando categorías de servicio:',
      error
    );

    showNotification(
      'No fue posible cargar las categorías de servicio.',
      { type: 'error' }
    );
  }
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

    // Llenar formulario
    const {
      formTitle,
      codigo,
      nombre,
      descripcion,
      idCategoria,
      tipoServicio,
      tarifaBase,
      activo
    } = obtenerElementos();

    if (formTitle) formTitle.textContent = 'Editar Servicio';
    if (codigo) codigo.value = servicio.codigo;
    if (nombre) nombre.value = servicio.nombre;
    if (descripcion) descripcion.value = servicio.descripcion || '';
    if (tipoServicio) tipoServicio.value = servicio.tipoServicio || '';
    if (tarifaBase) tarifaBase.value = servicio.tarifaBase;
    if (urlImagen) urlImagen.value = servicio.urlImagen || '';
    if (activo) activo.checked = servicio.activo;
    if (idCategoria) {
      idCategoria.value = servicio.idCategoria || '';
    }

    // Vista previa de imagen
    if (servicio.urlImagen && previewImagen) {
      previewImagen.src = servicio.urlImagen;
      previewImagen.style.display = 'block';
    }

    // Desactivar código (no se puede editar)
    if (codigo) codigo.disabled = true;

  } catch (error) {
    console.error('Error cargando servicio:', error);
    showNotification(error.message || 'Error cargando servicio', { type: 'error' });
    setTimeout(() => {
      window.location.hash = '#/catalogo/servicios';
    }, 2000);
  } finally {
    hideLoader();
  }
}

// ============================================================================
// MANEJO DE IMAGEN
// ============================================================================

function manejarCambioImagen(e) {
  const archivo = e.target.files?.[0];
  const { previewImagen, urlImagen } = obtenerElementos();

  if (archivo) {
    const lector = new FileReader();

    lector.onload = (evento) => {
      const dataUrl = evento.target?.result;
      if (dataUrl && previewImagen) {
        previewImagen.src = dataUrl;
        previewImagen.style.display = 'block';

        // Convertir a base64 o URL
        if (urlImagen) {
          urlImagen.value = dataUrl;
        }
      }
    };

    lector.readAsDataURL(archivo);
  }
}

function manejarCambioUrlImagen(e) {
  const url = e.target.value.trim();
  const { previewImagen } = obtenerElementos();

  if (url && previewImagen) {
    previewImagen.src = url;
    previewImagen.onerror = () => {
      previewImagen.style.display = 'none';
    };
    previewImagen.onload = () => {
      previewImagen.style.display = 'block';
    };
  } else if (previewImagen) {
    previewImagen.style.display = 'none';
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

      activo: Boolean(activo?.checked)
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
      window.location.hash = '#/catalogo/servicios';
    }, 1500);

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
    btnCancelar,
    imagen,
    urlImagen
  } = obtenerElementos();

  if (form) {
    form.addEventListener('submit', manejarEnvio);
  }

  if (btnCancelar) {
    btnCancelar.addEventListener('click', () => {
      window.location.hash = '#/catalogo/servicios';
    });
  }

  if (imagen) {
    imagen.addEventListener('change', manejarCambioImagen);
  }

  if (urlImagen) {
    urlImagen.addEventListener('input', manejarCambioUrlImagen);
  }
}
