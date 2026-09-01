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
  UNIDADES_MEDIDA,
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
    errorUnidadMedida,
    errorPrecioBase
  } = obtenerElementos();

  [
    errorCodigo,
    errorNombre,
    errorDescripcion,
    errorIdCategoria,
    errorIdTipoProducto,
    errorIdColor,
    errorUnidadMedida,
    errorPrecioBase
  ].forEach(elemento => {
    if (elemento) {
      elemento.textContent = '';
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

// ============================================================================
// CARGA DE AUXILIARES
// ============================================================================

async function cargarAuxiliares() {
  const {
    idCategoria,
    idTipoProducto,
    idColor,
    unidadMedida
  } = obtenerElementos();

  const [
    categorias,
    tipos,
    colores
  ] = await Promise.all([
    listarCategoriasProducto(),
    listarTiposProducto(),
    listarColores()
  ]);

  idCategoria.innerHTML =
    '<option value="">Seleccione una categoría</option>';

  categorias.forEach(item => {
    const option =
      document.createElement('option');

    option.value = item.id;
    option.textContent =
      `${item.nombre}${item.activo ? '' : ' (Inactivo)'}`;

    option.disabled =
      item.activo !== 1;

    idCategoria.appendChild(option);
  });

  idTipoProducto.innerHTML =
    '<option value="">Seleccione un tipo</option>';

  tipos.forEach(item => {
    const option =
      document.createElement('option');

    option.value = item.id;
    option.textContent =
      `${item.nombre}${item.activo ? '' : ' (Inactivo)'}`;

    option.disabled =
      item.activo !== 1;

    idTipoProducto.appendChild(option);
  });

  idColor.innerHTML =
    '<option value="">Sin color</option>';

  colores.forEach(item => {
    const option =
      document.createElement('option');

    option.value = item.id;
    option.textContent =
      `${item.nombre}${item.activo ? '' : ' (Inactivo)'}`;

    option.disabled =
      item.activo !== 1;

    idColor.appendChild(option);
  });

  unidadMedida.innerHTML =
    '<option value="">Seleccione una unidad</option>';

  UNIDADES_MEDIDA.forEach(unidad => {
    unidadMedida.insertAdjacentHTML(
      'beforeend',
      `<option value="${unidad}">
        ${unidad}
      </option>`
    );
  });
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
    if (activo) activo.checked = producto.activo;

    // Vista previa de imagen
    if (previewImagen) {
      previewImagen.src =
        producto.imagenUrl ||
        RUTAS_IMAGENES.PLACEHOLDER_PRODUCTO;

      previewImagen.alt =
        `Imagen de ${producto.nombre}`;

      previewImagen.onerror = () => {
        previewImagen.onerror = null;
        previewImagen.src =
          RUTAS_IMAGENES.PLACEHOLDER_PRODUCTO;
      };
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
      codigo:
        codigo?.value.trim() || '',

      nombre:
        nombre?.value.trim() || '',

      descripcion:
        descripcion?.value.trim() || '',

      idCategoria:
        idCategoria?.value
          ? Number(idCategoria.value)
          : null,

      idTipoProducto:
        idTipoProducto?.value
          ? Number(idTipoProducto.value)
          : null,

      idColor:
        idColor?.value
          ? Number(idColor.value)
          : null,

      unidadMedida:
        unidadMedida?.value.trim() || '',

      precioBase:
        Number(precioBase?.value || 0),

      activo:
        Boolean(activo?.checked),

      imagenUrl:
        productoActual?.imagenUrl || null
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
      window.location.hash =
        `#/catalogo/productos/detalle?id=${resultado.idProducto}`;
    }, 500);

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

  renderNavegacionCatalogo();

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
    btnCancelar
  } = obtenerElementos();

  if (form) {
    form.addEventListener('submit', manejarEnvio);
  }

  if (btnCancelar) {
    btnCancelar.addEventListener('click', () => {
      window.location.hash = '#/catalogo/productos';
    });
  }
}
