/**
 * Módulo: Catálogo - Formulario de Lista de Precios
 * Funcionalidad: Alta y cambio de listas de precios
 */

import {
  registrarListaPrecio,
  obtenerListaPrecio,
  actualizarListaPrecio,
  listarProductos
} from '../../api/catalogo.service.js';

import {
  obtenerConfiguracionListaPrecio,
  guardarConfiguracionListaPrecio
} from '../../api/listas-precios.service.js';

import {
  PERMISOS_CATALOGO
} from '../../api/catalogo.constants.js';

import {
  getSession,
  requireAuth
} from '../../shared/auth-guard.js';

import {
  hasPermission
} from '../../shared/permissions.js';

import {
  showNotification
} from '../../components/notification.js';

import {
  showLoader,
  hideLoader
} from '../../components/loader.js';

import {
  renderNavegacionCatalogo
} from './catalogo-ui.js';


let listaActual = null;
let esEdicion = false;

let productosDisponibles = [];
let detalleProductos = [];


function obtenerElementos() {
  return {
    form:
      document.getElementById(
        'lista-precio-form'
      ),

    formTitle:
      document.getElementById(
        'form-title'
      ),

    nombre:
      document.getElementById(
        'nombre'
      ),

    descripcion:
      document.getElementById(
        'descripcion'
      ),

    vigenciaInicio:
      document.getElementById(
        'vigenciaInicio'
      ),

    vigenciaFin:
      document.getElementById(
        'vigenciaFin'
      ),

    porcentajeAdicionalFueraLista:
      document.getElementById(
        'porcentajeAdicionalFueraLista'
      ),

    activo:
      document.getElementById(
        'activo'
      ),

    buscarProductos:
      document.getElementById(
        'buscar-productos'
      ),

    productosOpciones:
      document.getElementById(
        'productos-opciones'
      ),

    btnAgregarProducto:
      document.getElementById(
        'btn-agregar-producto'
      ),

    productosComponentes:
      document.getElementById(
        'productos-componentes'
      ),

    resumenTotalProductos:
      document.getElementById(
        'resumen-total-productos'
      ),

    btnCancelar:
      document.getElementById(
        'btn-cancelar'
      )
  };
}


function obtenerIdListaPrecio() {
  const queryString =
    location.hash.split('?')[1] || '';

  return new URLSearchParams(
    queryString
  ).get('id');
}


function escaparHtml(valor) {
  return String(valor ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}


function formatoMoneda(valor) {
  return Number(valor || 0)
    .toLocaleString(
      'es-MX',
      {
        style: 'currency',
        currency: 'MXN'
      }
    );
}


function limpiarErrores() {
  document
    .querySelectorAll(
      '.catalogo-form-error'
    )
    .forEach(elemento => {
      elemento.textContent = '';
    });
}


function mostrarError(
  campo,
  mensaje
) {
  const elemento =
    document.getElementById(
      `error-${campo}`
    );

  if (!elemento) {
    return false;
  }

  elemento.textContent =
    mensaje;

  return true;
}


async function cargarCatalogos() {
  const resultado =
    await listarProductos({
      limit: 1000,
      soloActivos: false
    });

  productosDisponibles =
    resultado.items || [];

  renderizarOpcionesProductos();
}


function renderizarOpcionesProductos() {
  const {
    productosOpciones
  } = obtenerElementos();

  if (!productosOpciones) {
    return;
  }

  productosOpciones.innerHTML =
    productosDisponibles
      .filter(
        producto =>
          producto.activo === 1
      )
      .map(
        producto => `
          <option
            value="${escaparHtml(producto.codigo)} - ${escaparHtml(producto.nombre)}"
          ></option>
        `
      )
      .join('');
}


function enriquecerDetalleProducto(
  detalle
) {
  const producto =
    productosDisponibles.find(
      item =>
        item.idProducto ===
        Number(detalle.idProducto)
    );

  return {
    idProducto:
      Number(
        detalle.idProducto
      ),

    codigo:
      producto?.codigo ||
      detalle.codigo ||
      `Producto ${detalle.idProducto}`,

    nombre:
      producto?.nombre ||
      detalle.nombre ||
      'Producto no disponible',

    precioBase:
      Number(
        producto?.precioBase ??
        detalle.precioBase ??
        0
      ),

    precio:
      Number(
        detalle.precio ??
        0
      ),

    activo:
      producto?.activo === 1
        ? 1
        : 0,

    existe:
      Boolean(producto)
  };
}


function renderizarProductos() {
  const {
    productosComponentes,
    resumenTotalProductos
  } = obtenerElementos();

  if (resumenTotalProductos) {
    resumenTotalProductos.textContent =
      String(
        detalleProductos.length
      );
  }

  if (!productosComponentes) {
    return;
  }

  if (
    detalleProductos.length === 0
  ) {
    productosComponentes.innerHTML =
      '<p class="catalogo-empty-text">No hay productos agregados.</p>';

    return;
  }

  productosComponentes.innerHTML =
    detalleProductos
      .map(
        (detalle, indice) => `
          <div class="catalogo-component-item">

            <div>
              <strong>
                ${escaparHtml(detalle.nombre)}
              </strong>

              <div class="catalogo-card-subtitle">
                ${escaparHtml(detalle.codigo)}
              </div>

              ${
                detalle.activo !== 1
                  ? `
                    <span class="catalogo-badge estado-inactivo">
                      Inactivo
                    </span>
                  `
                  : ''
              }
            </div>

            <div>
              <div class="catalogo-card-subtitle">
                Precio base
              </div>

              <strong>
                ${formatoMoneda(
                  detalle.precioBase
                )}
              </strong>
            </div>

            <div>

              <label
                for="precio-producto-${indice}"
                class="catalogo-card-subtitle"
              >
                Precio en lista
              </label>

              <input
                id="precio-producto-${indice}"
                type="number"
                min="0"
                step="0.01"
                value="${Number(detalle.precio)}"
                data-precio-producto="${indice}"
                aria-label="Precio en lista de ${escaparHtml(detalle.nombre)}"
              >

            </div>

            <button
              type="button"
              class="btn btn-secondary"
              data-eliminar-producto="${indice}"
            >
              Quitar
            </button>

          </div>
        `
      )
      .join('');
}


function buscarProductoPorEntrada(
  valor
) {
  const busqueda =
    String(valor || '')
      .trim()
      .toLowerCase();

  if (!busqueda) {
    return null;
  }

  const codigoEntrada =
    busqueda.includes(' - ')
      ? busqueda
          .split(' - ')[0]
          .trim()
      : busqueda;

  return (
    productosDisponibles.find(
      producto =>
        producto.activo === 1 &&
        String(
          producto.codigo || ''
        )
          .toLowerCase() ===
        codigoEntrada
    ) ||

    productosDisponibles.find(
      producto =>
        producto.activo === 1 &&
        (
          String(
            producto.codigo || ''
          )
            .toLowerCase()
            .includes(busqueda) ||

          String(
            producto.nombre || ''
          )
            .toLowerCase()
            .includes(busqueda)
        )
    ) ||

    null
  );
}


function manejarAgregarProducto() {
  const {
    buscarProductos
  } = obtenerElementos();

  const producto =
    buscarProductoPorEntrada(
      buscarProductos?.value
    );

  if (!producto) {
    showNotification(
      'Ingrese el código o nombre de un producto activo.',
      {
        type: 'warning'
      }
    );

    return;
  }

  const existente =
    detalleProductos.some(
      detalle =>
        detalle.idProducto ===
        producto.idProducto
    );

  if (existente) {
    showNotification(
      'El producto ya forma parte de la lista de precios.',
      {
        type: 'warning'
      }
    );

    return;
  }

  detalleProductos.push({
    idProducto:
      producto.idProducto,

    codigo:
      producto.codigo,

    nombre:
      producto.nombre,

    precioBase:
      Number(
        producto.precioBase ||
        0
      ),

    precio:
      Number(
        producto.precioBase ||
        0
      ),

    activo:
      producto.activo,

    existe:
      true
  });

  if (buscarProductos) {
    buscarProductos.value = '';
  }

  renderizarProductos();
}


function manejarCambioPrecio(
  evento
) {
  const input =
    evento.target.closest(
      '[data-precio-producto]'
    );

  if (!input) {
    return;
  }

  const indice =
    Number(
      input.dataset
        .precioProducto
    );

  const detalle =
    detalleProductos[indice];

  if (!detalle) {
    return;
  }

  detalle.precio =
    input.value === ''
      ? NaN
      : Number(input.value);
}


function manejarEliminarProducto(
  evento
) {
  const boton =
    evento.target.closest(
      '[data-eliminar-producto]'
    );

  if (!boton) {
    return;
  }

  const indice =
    Number(
      boton.dataset
        .eliminarProducto
    );

  if (
    !Number.isInteger(indice) ||
    !detalleProductos[indice]
  ) {
    return;
  }

  detalleProductos.splice(
    indice,
    1
  );

  renderizarProductos();
}


function validarConfiguracion() {
  const {
    porcentajeAdicionalFueraLista
  } = obtenerElementos();

  let valido = true;

  const porcentaje =
    porcentajeAdicionalFueraLista
      ?.value === ''
      ? NaN
      : Number(
          porcentajeAdicionalFueraLista
            .value
        );

  if (
    !Number.isFinite(
      porcentaje
    ) ||
    porcentaje < 0
  ) {
    mostrarError(
      'porcentajeAdicionalFueraLista',
      'El porcentaje adicional debe ser un número mayor o igual a cero.'
    );

    valido = false;
  }

  const precioInvalido =
    detalleProductos.some(
      detalle =>
        !Number.isFinite(
          Number(
            detalle.precio
          )
        ) ||
        Number(
          detalle.precio
        ) < 0
    );

  if (precioInvalido) {
    mostrarError(
      'detalleProductos',
      'Todos los productos deben tener un precio mayor o igual a cero.'
    );

    valido = false;
  }

  const ids =
    detalleProductos.map(
      detalle =>
        detalle.idProducto
    );

  if (
    new Set(ids).size !==
    ids.length
  ) {
    mostrarError(
      'detalleProductos',
      'No se permiten productos duplicados.'
    );

    valido = false;
  }

  return valido;
}


async function cargarListaPrecio(
  id
) {
  try {
    showLoader();

    const [
      cabecera,
      configuracion
    ] =
      await Promise.all([
        obtenerListaPrecio(id),

        obtenerConfiguracionListaPrecio(
          id
        )
      ]);

    listaActual =
      cabecera;

    esEdicion =
      true;

    const {
      formTitle,
      nombre,
      descripcion,
      vigenciaInicio,
      vigenciaFin,
      porcentajeAdicionalFueraLista,
      activo
    } = obtenerElementos();

    formTitle.textContent =
      'Editar Lista de Precios';

    nombre.value =
      cabecera.nombre ||
      '';

    descripcion.value =
      cabecera.descripcion ||
      '';

    vigenciaInicio.value =
      cabecera.vigenciaInicio ||
      '';

    vigenciaFin.value =
      cabecera.vigenciaFin ||
      '';

    porcentajeAdicionalFueraLista.value =
      Number(
        configuracion
          .porcentajeAdicionalFueraLista ??
        0
      );

    activo.checked =
      cabecera.activo === 1;

    detalleProductos =
      (
        configuracion
          .detalleProductos ||
        []
      )
        .map(
          enriquecerDetalleProducto
        );

    renderizarProductos();

  } catch (error) {
    showNotification(
      error.message ||
        'No fue posible cargar la lista de precios.',
      {
        type: 'error'
      }
    );

    window.location.hash =
      '#/catalogo/precios';

  } finally {
    hideLoader();
  }
}


async function manejarEnvio(
  evento
) {
  evento.preventDefault();

  const {
    nombre,
    descripcion,
    vigenciaInicio,
    vigenciaFin,
    porcentajeAdicionalFueraLista,
    activo
  } = obtenerElementos();

  limpiarErrores();

  if (
    !validarConfiguracion()
  ) {
    return;
  }

  const datosCabecera = {
    nombre:
      nombre.value.trim(),

    descripcion:
      descripcion.value.trim(),

    vigenciaInicio:
      vigenciaInicio.value,

    vigenciaFin:
      vigenciaFin.value,

    activo:
      Boolean(
        activo.checked
      )
  };

  const configuracion = {
    porcentajeAdicionalFueraLista:
      Number(
        porcentajeAdicionalFueraLista
          .value
      ),

    detalleProductos:
      detalleProductos.map(
        detalle => ({
          idProducto:
            detalle.idProducto,

          precio:
            Number(
              detalle.precio
            )
        })
      )
  };

  try {
    showLoader();

    let resultado;

    if (
      esEdicion &&
      listaActual
    ) {
      resultado =
        await actualizarListaPrecio(
          listaActual.idListaPrecio,
          datosCabecera
        );

    } else {
      resultado =
        await registrarListaPrecio(
          datosCabecera
        );
    }

    await guardarConfiguracionListaPrecio(
      resultado.idListaPrecio,
      configuracion
    );

    showNotification(
      esEdicion
        ? 'Lista de precios actualizada correctamente.'
        : 'Lista de precios registrada correctamente.',
      {
        type: 'success'
      }
    );

    window.location.hash =
      `#/catalogo/precios/detalle?id=${resultado.idListaPrecio}`;

  } catch (error) {
    let errorMostrado =
      false;

    if (
      Array.isArray(
        error.detalles
      )
    ) {
      error.detalles.forEach(
        detalle => {
          errorMostrado =
            mostrarError(
              detalle.campo,
              detalle.mensaje
            ) ||
            errorMostrado;
        }
      );
    }

    if (!errorMostrado) {
      showNotification(
        error.message ||
          'No fue posible guardar la lista de precios.',
        {
          type: 'error'
        }
      );
    }

  } finally {
    hideLoader();
  }
}


export async function init() {
  if (!requireAuth()) {
    return;
  }

  renderNavegacionCatalogo();

  const session =
    getSession();

  if (
    !hasPermission(
      session,
      PERMISOS_CATALOGO
        .PRECIOS_GESTIONAR
    )
  ) {
    showNotification(
      'No tiene permisos para administrar listas de precios.',
      {
        type: 'error'
      }
    );

    window.location.hash =
      '#/catalogo/precios';

    return;
  }

  try {
    showLoader();

    await cargarCatalogos();

  } catch (error) {
    showNotification(
      error.message ||
        'No fue posible cargar los productos del catálogo.',
      {
        type: 'error'
      }
    );

    window.location.hash =
      '#/catalogo/precios';

    return;

  } finally {
    hideLoader();
  }

  const idListaPrecio =
    obtenerIdListaPrecio();

  if (idListaPrecio) {
    await cargarListaPrecio(
      idListaPrecio
    );

  } else {
    renderizarProductos();
  }

  const {
    form,
    buscarProductos,
    btnAgregarProducto,
    productosComponentes,
    btnCancelar
  } = obtenerElementos();

  form?.addEventListener(
    'submit',
    manejarEnvio
  );

  btnAgregarProducto
    ?.addEventListener(
      'click',
      manejarAgregarProducto
    );

  buscarProductos
    ?.addEventListener(
      'keydown',
      evento => {
        if (
          evento.key ===
          'Enter'
        ) {
          evento.preventDefault();

          manejarAgregarProducto();
        }
      }
    );

  productosComponentes
    ?.addEventListener(
      'input',
      manejarCambioPrecio
    );

  productosComponentes
    ?.addEventListener(
      'click',
      manejarEliminarProducto
    );

  btnCancelar
    ?.addEventListener(
      'click',
      () => {
        window.location.hash =
          '#/catalogo/precios';
      }
    );
}