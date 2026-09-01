/**
 * Módulo: Catálogo - Formulario de Paquetes
 * Funcionalidad: Crear y editar paquetes con componentes
 */

import {
  registrarPaquete,
  obtenerPaquete,
  actualizarPaquete,
  listarProductos,
  listarServicios
} from '../../api/catalogo.service.js';

import {
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

let paqueteActual = null;
let esEdicion = false;
let productosDisponibles = [];
let serviciosDisponibles = [];
let componentesProductos = [];
let componentesServicios = [];

// ============================================================================
// REFERENCIAS AL DOM
// ============================================================================

function obtenerElementos() {
  return {
    // Formulario
    form: document.getElementById('paquete-form'),
    formTitle: document.getElementById('form-title'),
    formMessage: document.getElementById('form-message'),

    // Campos básicos
    codigo: document.getElementById('codigo'),
    nombre: document.getElementById('nombre'),
    descripcion: document.getElementById('descripcion'),
    precio: document.getElementById('precio'),
    activo: document.getElementById('activo'),

    // Búsqueda de productos
    buscarProductos: document.getElementById('buscar-productos'),
    btnAgregarProducto: document.getElementById('btn-agregar-producto'),
    productosComponentes: document.getElementById('productos-componentes'),

    // Búsqueda de servicios
    buscarServicios: document.getElementById('buscar-servicios'),
    btnAgregarServicio: document.getElementById('btn-agregar-servicio'),
    serviciosComponentes: document.getElementById('servicios-componentes'),

    // Resumen
    resumenTotalProductos: document.getElementById('resumen-total-productos'),
    resumenTotalServicios: document.getElementById('resumen-total-servicios'),
    resumenTotalComponentes: document.getElementById('resumen-total-componentes'),
    resumenSubtotal: document.getElementById('resumen-subtotal'),
    resumenPrecioRegistrado: document.getElementById('resumen-precio-registrado'),
    resumenDiferencia: document.getElementById('resumen-diferencia'),

    // Botones
    btnCancelar: document.getElementById('btn-cancelar'),
    btnGuardar: document.querySelector('button[type="submit"]'),

    // Errores
    errorCodigo: document.getElementById('error-codigo'),
    errorNombre: document.getElementById('error-nombre'),
    errorDescripcion: document.getElementById('error-descripcion'),
    errorPrecio: document.getElementById('error-precio')
  };
}

// ============================================================================
// UTILIDADES
// ============================================================================

function obtenerIdPaquete() {
  const queryString = location.hash.split('?')[1] || '';
  return new URLSearchParams(queryString).get('id');
}

function limpiarErrores() {
  const {
    errorCodigo,
    errorNombre,
    errorDescripcion,
    errorPrecio
  } = obtenerElementos();

  [errorCodigo, errorNombre, errorDescripcion, errorPrecio].forEach(el => {
    if (el) el.textContent = '';
  });
}

function mostrarError(campo, mensaje) {
  const elemento = document.getElementById(`error-${campo}`);
  if (elemento) elemento.textContent = mensaje;
}

// ============================================================================
// CARGA DE DATOS
// ============================================================================

async function cargarProductosYServicios() {
  try {
    const resultadoProductos = await listarProductos({ soloActivos: true, limit: 100 });
    const resultadoServicios = await listarServicios({ soloActivos: true, limit: 100 });

    productosDisponibles = resultadoProductos.items;
    serviciosDisponibles = resultadoServicios.items;

  } catch (error) {
    console.error('Error cargando productos y servicios:', error);
    showNotification('Error cargando productos y servicios', { type: 'error' });
  }
}

async function cargarPaquete(id) {
  try {
    showLoader();

    const paquete = await obtenerPaquete(id);
    paqueteActual = paquete;
    esEdicion = true;

    const {
      formTitle,
      codigo,
      nombre,
      descripcion,
      precio,
      activo
    } = obtenerElementos();

    if (formTitle) formTitle.textContent = 'Editar Paquete';
    if (codigo) codigo.value = paquete.codigo;
    if (nombre) nombre.value = paquete.nombre;
    if (descripcion) descripcion.value = paquete.descripcion || '';
    if (precio) precio.value = paquete.precio;
    if (activo) activo.checked = paquete.activo;

    // Cargar componentes
    componentesProductos = JSON.parse(JSON.stringify(paquete.detalleProductos || []));
    componentesServicios = JSON.parse(JSON.stringify(paquete.detalleServicios || []));

    // Desactivar código
    if (codigo) codigo.disabled = true;

    // Renderizar componentes
    renderizarComponentesProductos();
    renderizarComponentesServicios();
    actualizarResumen();

  } catch (error) {
    console.error('Error cargando paquete:', error);
    showNotification(error.message || 'Error cargando paquete', { type: 'error' });
    setTimeout(() => {
      window.location.hash = '#/catalogo/paquetes';
    }, 2000);
  } finally {
    hideLoader();
  }
}

// ============================================================================
// MANEJO DE COMPONENTES
// ============================================================================

function manejarAgregarProducto() {
  const { buscarProductos } = obtenerElementos();

  const valor =
    buscarProductos?.value.toLowerCase().trim();

  if (!valor) {
    showNotification(
      'Ingrese un código o nombre de producto',
      { type: 'warning' }
    );
    return;
  }

  const producto = productosDisponibles.find(p =>
    p.codigo.toLowerCase().includes(valor) ||
    p.nombre.toLowerCase().includes(valor)
  );

  if (!producto) {
    showNotification(
      'Producto no encontrado',
      { type: 'error' }
    );
    return;
  }

  const existente = componentesProductos.find(
    componente =>
      componente.idProducto === producto.idProducto
  );

  if (existente) {
    existente.cantidad += 1;
    existente.subtotal =
      existente.cantidad * existente.precioUnitario;

    renderizarComponentesProductos();
    actualizarResumen();

    if (buscarProductos) {
      buscarProductos.value = '';
    }

    showNotification(
      'Cantidad del producto actualizada',
      { type: 'success', timeout: 1500 }
    );

    return;
  }

  componentesProductos.push({
    idProducto: producto.idProducto,
    codigo: producto.codigo,
    nombre: producto.nombre,
    cantidad: 1,
    precioUnitario: producto.precioBase,
    subtotal: producto.precioBase,
    activo: producto.activo
  });

  if (buscarProductos) {
    buscarProductos.value = '';
  }

  renderizarComponentesProductos();
  actualizarResumen();

  showNotification(
    'Producto agregado',
    { type: 'success', timeout: 1500 }
  );
}

function manejarAgregarServicio() {
  const { buscarServicios } = obtenerElementos();

  const valor = buscarServicios?.value
    .toLowerCase()
    .trim();

  if (!valor) {
    showNotification(
      'Ingrese un código o nombre de servicio',
      { type: 'warning' }
    );
    return;
  }

  const servicio = serviciosDisponibles.find(item =>
    item.codigo.toLowerCase().includes(valor) ||
    item.nombre.toLowerCase().includes(valor)
  );

  if (!servicio) {
    showNotification(
      'Servicio no encontrado',
      { type: 'error' }
    );
    return;
  }

  const existente = componentesServicios.find(
    componente =>
      componente.idServicio === servicio.idServicio
  );

  if (existente) {
    existente.cantidad += 1;

    existente.subtotal =
      existente.cantidad * existente.tarifa;

    renderizarComponentesServicios();
    actualizarResumen();

    if (buscarServicios) {
      buscarServicios.value = '';
    }

    showNotification(
      'Cantidad del servicio actualizada',
      { type: 'success', timeout: 1500 }
    );

    return;
  }

  componentesServicios.push({
    idServicio: servicio.idServicio,
    codigo: servicio.codigo,
    nombre: servicio.nombre,
    cantidad: 1,
    tarifa: servicio.tarifaBase,
    subtotal: servicio.tarifaBase,
    activo: servicio.activo
  });

  if (buscarServicios) {
    buscarServicios.value = '';
  }

  renderizarComponentesServicios();
  actualizarResumen();

  showNotification(
    'Servicio agregado',
    { type: 'success', timeout: 1500 }
  );
}

function eliminarComponentoProducto(index) {
  componentesProductos.splice(index, 1);
  renderizarComponentesProductos();
  actualizarResumen();
}

function eliminarComponentoServicio(index) {
  componentesServicios.splice(index, 1);
  renderizarComponentesServicios();
  actualizarResumen();
}

function actualizarCantidadProducto(index, cantidad) {
  componentesProductos[index].cantidad = Math.max(1, parseInt(cantidad) || 1);
  componentesProductos[index].subtotal = componentesProductos[index].cantidad * componentesProductos[index].precioUnitario;
  renderizarComponentesProductos();
  actualizarResumen();
}

function actualizarCantidadServicio(index, cantidad) {
  const componente = componentesServicios[index];

  if (!componente) {
    return;
  }

  componente.cantidad =
    Math.max(1, parseInt(cantidad, 10) || 1);

  componente.subtotal =
    componente.cantidad * componente.tarifa;

  renderizarComponentesServicios();
  actualizarResumen();
}

// ============================================================================
// RENDERIZADO
// ============================================================================

function renderizarComponentesProductos() {
  const { productosComponentes } = obtenerElementos();
  if (!productosComponentes) return;

  if (componentesProductos.length === 0) {
    productosComponentes.innerHTML = '<p style="color: var(--color-text-secondary); text-align: center; padding: 2rem;">No hay productos agregados</p>';
    return;
  }

  productosComponentes.innerHTML = componentesProductos.map((comp, idx) => `
    <div style="padding: 1rem; border-bottom: 1px solid var(--color-border); display: flex; justify-content: space-between; align-items: center;">
      <div style="flex: 1;">
        <div style="font-weight: 500;">${comp.nombre}</div>
        <div style="font-size: 0.875rem; color: var(--color-text-secondary);">Código: ${comp.codigo}</div>
      </div>

      <div style="display: flex; gap: 0.5rem; align-items: center;">
        <input
          type="number"
          min="1"
          value="${comp.cantidad}"
          style="width: 60px; padding: 0.5rem;"
          data-index="${idx}"
          data-type="cantidad-producto"
        >
        <div style="width: 100px; text-align: right;">
          <div style="font-size: 0.875rem; color: var(--color-text-secondary);">Subtotal:</div>
          <div style="font-weight: 500;">$${comp.subtotal.toFixed(2)}</div>
        </div>
        <button
          type="button"
          class="btn btn-sm btn-danger"
          data-index="${idx}"
          data-action="eliminar-producto"
        >
          ✕
        </button>
      </div>
    </div>
  `).join('');

  // Event listeners
  productosComponentes.querySelectorAll('[data-type="cantidad-producto"]').forEach(input => {
    input.addEventListener('change', (e) => {
      const idx = parseInt(e.target.dataset.index);
      actualizarCantidadProducto(idx, e.target.value);
    });
  });

  productosComponentes.querySelectorAll('[data-action="eliminar-producto"]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      eliminarComponentoProducto(parseInt(e.target.dataset.index));
    });
  });
}

function renderizarComponentesServicios() {
  const { serviciosComponentes } = obtenerElementos();
  if (!serviciosComponentes) return;

  if (componentesServicios.length === 0) {
    serviciosComponentes.innerHTML = '<p style="color: var(--color-text-secondary); text-align: center; padding: 2rem;">No hay servicios agregados</p>';
    return;
  }

  serviciosComponentes.innerHTML = componentesServicios.map((comp, idx) => `
    <div style="padding: 1rem; border-bottom: 1px solid var(--color-border); display: flex; justify-content: space-between; align-items: center;">
      <div style="flex: 1;">
        <div style="font-weight: 500;">${comp.nombre}</div>
        <div style="font-size: 0.875rem; color: var(--color-text-secondary);">Código: ${comp.codigo}</div>
      </div>

      <div style="display: flex; gap: 0.5rem; align-items: center;">
        <input
          type="number"
          min="1"
          value="${comp.cantidad}"
          style="width: 60px; padding: 0.5rem;"
          data-index="${idx}"
          data-type="cantidad-servicio"
        >
        <div style="width: 100px; text-align: right;">
          <div style="font-size: 0.875rem; color: var(--color-text-secondary);">Subtotal:</div>
          <div style="font-weight: 500;">$${comp.subtotal.toFixed(2)}</div>
        </div>
        <button
          type="button"
          class="btn btn-sm btn-danger"
          data-index="${idx}"
          data-action="eliminar-servicio"
        >
          ✕
        </button>
      </div>
    </div>
  `).join('');

  // Event listeners
  serviciosComponentes.querySelectorAll('[data-type="cantidad-servicio"]').forEach(input => {
    input.addEventListener('change', (e) => {
      const idx = parseInt(e.target.dataset.index);
      actualizarCantidadServicio(idx, e.target.value);
    });
  });

  serviciosComponentes.querySelectorAll('[data-action="eliminar-servicio"]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      eliminarComponentoServicio(parseInt(e.target.dataset.index));
    });
  });
}

function actualizarResumen() {
  const {
    resumenTotalProductos,
    resumenTotalServicios,
    resumenTotalComponentes,
    resumenSubtotal,
    resumenPrecioRegistrado,
    resumenDiferencia
  } = obtenerElementos();

  const totalProductos = componentesProductos.length;
  const totalServicios = componentesServicios.length;
  const totalComponentes = totalProductos + totalServicios;

  const subtotal = [
    ...componentesProductos.map(p => p.subtotal || 0),
    ...componentesServicios.map(s => s.subtotal || 0)
  ].reduce((a, b) => a + b, 0);

  const { precio } = obtenerElementos();
  const precioRegistrado = parseFloat(precio?.value) || 0;
  const diferencia = precioRegistrado - subtotal;

  if (resumenTotalProductos) resumenTotalProductos.textContent = totalProductos;
  if (resumenTotalServicios) resumenTotalServicios.textContent = totalServicios;
  if (resumenTotalComponentes) resumenTotalComponentes.textContent = totalComponentes;
  if (resumenSubtotal) resumenSubtotal.textContent = `$${subtotal.toFixed(2)}`;
  if (resumenPrecioRegistrado) resumenPrecioRegistrado.textContent = `$${precioRegistrado.toFixed(2)}`;
  if (resumenDiferencia) resumenDiferencia.textContent = `$${Math.abs(diferencia).toFixed(2)}`;
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
    precio,
    activo
  } = obtenerElementos();

  try {
    showLoader();
    limpiarErrores();

    // Validar que hay componentes
    if (componentesProductos.length === 0 && componentesServicios.length === 0) {
      showNotification('El paquete debe tener al menos un componente', { type: 'error' });
      hideLoader();
      return;
    }

    // Obtener datos
    const datos = {
      codigo: codigo?.value.trim() || '',
      nombre: nombre?.value.trim() || '',
      descripcion: descripcion?.value.trim() || '',
      precio: parseFloat(precio?.value) || 0,
      detalleProductos: componentesProductos,
      detalleServicios: componentesServicios,
      activo: activo?.checked || false
    };

    // Guardar
    if (esEdicion && paqueteActual) {
      await actualizarPaquete(
        paqueteActual.idPaquete,
        datos
      );
      showNotification(MENSAJES.PAQUETE_ACTUALIZADO, { type: 'success' });
    } else {
      await registrarPaquete(datos);
      showNotification(MENSAJES.PAQUETE_REGISTRADO, { type: 'success' });
    }

    // Redirigir
    setTimeout(() => {
      window.location.hash = '#/catalogo/paquetes';
    }, 1500);

  } catch (error) {
    console.error('Error guardando paquete:', error);

    if (error.detalles && Array.isArray(error.detalles)) {
      error.detalles.forEach(err => {
        mostrarError(err.campo, err.mensaje);
      });
    } else {
      showNotification(error.message || 'Error desconocido', { type: 'error' });
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
  const idPaquete = obtenerIdPaquete();

  // Verificar permisos
  const permiso = idPaquete
    ? PERMISOS_CATALOGO.PAQUETES_MODIFICAR
    : PERMISOS_CATALOGO.PAQUETES_REGISTRAR;

  if (!hasPermission(session, permiso)) {
    showNotification('No tiene permisos para acceder a esta página', { type: 'error' });
    setTimeout(() => {
      window.location.hash = '#/catalogo/paquetes';
    }, 2000);
    return;
  }

  // Cargar productos y servicios disponibles
  await cargarProductosYServicios();

  // Cargar paquete si es edición
  if (idPaquete) {
    await cargarPaquete(idPaquete);
  }

  // Configurar event listeners
  const {
    form,
    btnCancelar,
    btnAgregarProducto,
    btnAgregarServicio,
    buscarProductos,
    buscarServicios,
    precio
  } = obtenerElementos();

  if (form) form.addEventListener('submit', manejarEnvio);
  if (btnCancelar) btnCancelar.addEventListener('click', () => {
    window.location.hash = '#/catalogo/paquetes';
  });

  if (btnAgregarProducto) btnAgregarProducto.addEventListener('click', manejarAgregarProducto);
  if (btnAgregarServicio) btnAgregarServicio.addEventListener('click', manejarAgregarServicio);

  // Permitir agregar con Enter
  if (buscarProductos) {
    buscarProductos.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') manejarAgregarProducto();
    });
  }

  if (buscarServicios) {
    buscarServicios.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') manejarAgregarServicio();
    });
  }

  // Actualizar resumen al cambiar precio
  if (precio) {
    precio.addEventListener('input', actualizarResumen);
  }
}
