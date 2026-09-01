/**
 * Módulo: Catálogo - Formulario de Productos
 * Funcionalidad: Crear y editar productos del catálogo
 */

import {
  registrarProducto,
  obtenerProducto,
  actualizarProducto,
  listarCategoriasProducto,
  listarTiposProducto,
  listarColores
} from '../../api/catalogo.service.js';

import {
  ESTADO_REGISTRO,
  CATEGORIAS_PRODUCTO,
  TIPOS_PRODUCTO,
  COLORES,
  UNIDADES_MEDIDA,
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

let productoActual = null;
let esEdicion = false;

// ============================================================================
// REFERENCIAS AL DOM
// ============================================================================

function obtenerElementos() {
  return {
    // Formulario
    form: document.getElementById('producto-form'),
    formTitle: document.getElementById('form-title'),
    formMessage: document.getElementById('form-message'),

    // Campos
    codigo: document.getElementById('codigo'),
    nombre: document.getElementById('nombre'),
    descripcion: document.getElementById('descripcion'),
    idCategoria: document.getElementById('idCategoria'),
    idTipoProducto: document.getElementById('idTipoProducto'),
    idColor: document.getElementById('idColor'),
    unidadMedida: document.getElementById('unidadMedida'),
    precioBase: document.getElementById('precioBase'),
    imagen: document.getElementById('imagen'),
    urlImagen: document.getElementById('urlImagen'),
    previewImagen: document.getElementById('preview-imagen'),
    activo: document.getElementById('activo'),

    // Botones
    btnCancelar: document.getElementById('btn-cancelar'),
    btnGuardar: document.querySelector('button[type="submit"]'),

    // Errores
    errorCodigo: document.getElementById('error-codigo'),
    errorNombre: document.getElementById('error-nombre'),
    errorDescripcion: document.getElementById('error-descripcion'),
    errorIdCategoria: document.getElementById('error-idCategoria'),
    errorIdTipoProducto: document.getElementById('error-idTipoProducto'),
    errorIdColor: document.getElementById('error-idColor'),
    errorUnidadMedida: document.getElementById('error-unidadMedida'),
    errorPrecioBase: document.getElementById('error-precioBase'),
    errorImagen: document.getElementById('error-imagen'),
    errorUrlImagen: document.getElementById('error-urlImagen')
  };
}

// ============================================================================
// UTILIDADES
// ============================================================================

function obtenerIdProducto() {
  const queryString = location.hash.split('?')[1] || '';
  return new URLSearchParams(queryString).get('id');
}

function limpiarErrores() {
  const {
    errorCodigo,
    errorNombre,
    errorDescripcion,
    errorIdCategoria,
    errorIdTipoProducto,
    errorIdColor,
    errorUnidad,
    errorPrecioBase,
    errorImagen,
    errorUrlImagen
  } = obtenerElementos();

  [
    errorCodigo,
    errorNombre,
    errorDescripcion,
    errorIdCategoria,
    errorIdTipoProducto,
    errorIdColor,
    errorUnidad,
    errorPrecioBase,
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

// ============================================================================
// CARGA DE AUXILIARES
// ============================================================================

async function cargarAuxiliares() {
  const {
    idCategoria,
    idTipoProducto,
    idColor
  } = obtenerElementos();

  try {
    // Categorías
    if (idCategoria) {
      idCategoria.innerHTML = '<option value="">Seleccione una categoría</option>';
      CATEGORIAS_PRODUCTO.forEach(cat => {
        const option = document.createElement('option');
        option.value = cat.id;
        option.textContent = cat.nombre;
        idCategoria.appendChild(option);
      });
    }

    // Tipos
    if (idTipoProducto) {
      idTipoProducto.innerHTML = '<option value="">Seleccione un tipo</option>';
      TIPOS_PRODUCTO.forEach(tipo => {
        const option = document.createElement('option');
        option.value = tipo.id;
        option.textContent = tipo.nombre;
        idTipoProducto.appendChild(option);
      });
    }

    // Colores
    if (idColor) {
      idColor.innerHTML = '<option value="">Sin color</option>';
      COLORES.forEach(color => {
        const option = document.createElement('option');
        option.value = color.id;
        option.textContent = color.nombre;
        idColor.appendChild(option);
      });
    }

    const { unidadMedida } = obtenerElementos();

    if (unidadMedida) {
      unidadMedida.innerHTML =
        '<option value="">Seleccione una unidad</option>';

      UNIDADES_MEDIDA.forEach(unidad => {
        const option = document.createElement('option');
        option.value = unidad;
        option.textContent = unidad;
        unidadMedida.appendChild(option);
      });
    }
  } catch (error) {
    console.error('Error cargando auxiliares:', error);
    showNotification('Error cargando datos auxiliares', { type: 'error' });
  }
}

// ============================================================================
// CARGA DE PRODUCTO (Si es edición)
// ============================================================================

async function cargarProducto(id) {
  try {
    showLoader();

    const producto = await obtenerProducto(id);
    productoActual = producto;
    esEdicion = true;

    // Llenar formulario
    const {
      formTitle,
      codigo,
      nombre,
      descripcion,
      idCategoria,
      idTipoProducto,
      idColor,
      unidadMedida,
      precioBase,
      urlImagen,
      previewImagen,
      activo
    } = obtenerElementos();

    if (formTitle) formTitle.textContent = 'Editar Producto';
    if (codigo) codigo.value = producto.codigo;
    if (nombre) nombre.value = producto.nombre;
    if (descripcion) descripcion.value = producto.descripcion || '';
    if (idCategoria) idCategoria.value = producto.idCategoria || '';
    if (idTipoProducto) idTipoProducto.value = producto.idTipoProducto || '';
    if (idColor) idColor.value = producto.idColor || '';
    if (unidadMedida) {
      unidadMedida.value = producto.unidadMedida || '';
    }
    if (precioBase) precioBase.value = producto.precioBase;
    if (urlImagen) urlImagen.value = producto.urlImagen || '';
    if (activo) activo.checked = producto.activo;

    // Vista previa de imagen
    if (producto.urlImagen && previewImagen) {
      previewImagen.src = producto.urlImagen;
      previewImagen.style.display = 'block';
    }

    // Desactivar código (no se puede editar)
    if (codigo) codigo.disabled = true;

  } catch (error) {
    console.error('Error cargando producto:', error);
    showNotification(error.message || 'Error cargando producto', { type: 'error' });
    setTimeout(() => {
      window.location.hash = '#/catalogo/productos';
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
    idTipoProducto,
    idColor,
    unidadMedida,
    precioBase,
    urlImagen,
    activo
  } = obtenerElementos();

  try {
    showLoader();
    limpiarErrores();

    // Obtener datos
    const datos = {
      codigo: codigo?.value.trim() || '',
      nombre: nombre?.value.trim() || '',
      descripcion: descripcion?.value.trim() || '',

      idCategoria: idCategoria?.value
        ? Number(idCategoria.value)
        : null,

      idTipoProducto: idTipoProducto?.value
        ? Number(idTipoProducto.value)
        : null,

      idColor: idColor?.value
        ? Number(idColor.value)
        : null,

      unidadMedida: unidadMedida?.value.trim() || '',

      precioBase: Number(precioBase?.value || 0),

      activo: Boolean(activo?.checked)
    };

    // Guardar
    let resultado;
    if (esEdicion && productoActual) {
      resultado = await actualizarProducto(productoActual.idProducto, datos);
      showNotification(MENSAJES.PRODUCTO_ACTUALIZADO, { type: 'success' });
    } else {
      resultado = await registrarProducto(datos);
      showNotification(MENSAJES.PRODUCTO_REGISTRADO, { type: 'success' });
    }

    // Redirigir después de 1.5 segundos
    setTimeout(() => {
      window.location.hash = '#/catalogo/productos';
    }, 1500);

  } catch (error) {
    console.error('Error guardando producto:', error);

    if (error.detalles && Array.isArray(error.detalles)) {
      // Son errores de validación
      error.detalles.forEach(err => {
        mostrarError(err.campo, err.mensaje);
      });
    } else {
      mostrarMensaje('error', error.message || 'Error desconocido');
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
  const idProducto = obtenerIdProducto();

  // Verificar permisos
  const permiso = idProducto
    ? PERMISOS_CATALOGO.PRODUCTOS_MODIFICAR
    : PERMISOS_CATALOGO.PRODUCTOS_REGISTRAR;

  if (!hasPermission(session, permiso)) {
    showNotification('No tiene permisos para acceder a esta página', { type: 'error' });
    setTimeout(() => {
      window.location.hash = '#/catalogo/productos';
    }, 2000);
    return;
  }

  // Cargar auxiliares
  await cargarAuxiliares();

  // Cargar producto si es edición
  if (idProducto) {
    await cargarProducto(idProducto);
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
      window.location.hash = '#/catalogo/productos';
    });
  }

  if (imagen) {
    imagen.addEventListener('change', manejarCambioImagen);
  }

  if (urlImagen) {
    urlImagen.addEventListener('input', manejarCambioUrlImagen);
  }
}
