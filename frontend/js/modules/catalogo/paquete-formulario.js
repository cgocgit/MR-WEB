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

let paqueteActual = null;
let esEdicion = false;

let productosDisponibles = [];
let serviciosDisponibles = [];

let componentesProductos = [];
let componentesServicios = [];

function obtenerElementos() {
  return {
    form:
      document.getElementById(
        'paquete-form'
      ),

    formTitle:
      document.getElementById(
        'form-title'
      ),

    codigo:
      document.getElementById(
        'codigo'
      ),

    nombre:
      document.getElementById(
        'nombre'
      ),

    descripcion:
      document.getElementById(
        'descripcion'
      ),

    precio:
      document.getElementById(
        'precio'
      ),

    activo:
      document.getElementById(
        'activo'
      ),

    buscarProductos:
      document.getElementById(
        'buscar-productos'
      ),

    btnAgregarProducto:
      document.getElementById(
        'btn-agregar-producto'
      ),

    productosComponentes:
      document.getElementById(
        'productos-componentes'
      ),

    buscarServicios:
      document.getElementById(
        'buscar-servicios'
      ),

    btnAgregarServicio:
      document.getElementById(
        'btn-agregar-servicio'
      ),

    serviciosComponentes:
      document.getElementById(
        'servicios-componentes'
      ),

    advertenciaInactivos:
      document.getElementById(
        'advertencia-componentes-inactivos'
      ),

    resumenTotalProductos:
      document.getElementById(
        'resumen-total-productos'
      ),

    resumenTotalServicios:
      document.getElementById(
        'resumen-total-servicios'
      ),

    resumenTotalComponentes:
      document.getElementById(
        'resumen-total-componentes'
      ),

    resumenSubtotal:
      document.getElementById(
        'resumen-subtotal'
      ),

    resumenPrecioRegistrado:
      document.getElementById(
        'resumen-precio-registrado'
      ),

    resumenDiferencia:
      document.getElementById(
        'resumen-diferencia'
      ),

    btnCancelar:
      document.getElementById(
        'btn-cancelar'
      )
  };
}

function obtenerIdPaquete() {
  const queryString =
    location.hash.split('?')[1] || '';

  return new URLSearchParams(
    queryString
  ).get('id');
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

function limpiarErrores() {
  document
    .querySelectorAll(
      '.catalogo-form-error'
    )
    .forEach(elemento => {
      elemento.textContent = '';
    });
}

async function cargarCatalogos() {
  const [
    resultadoProductos,
    resultadoServicios
  ] = await Promise.all([
    listarProductos({
      limit: 100,
      soloActivos: false
    }),

    listarServicios({
      limit: 100,
      soloActivos: false
    })
  ]);

  productosDisponibles =
    resultadoProductos.items;

  serviciosDisponibles =
    resultadoServicios.items;
}

function enriquecerProducto(
  detalle
) {
  const producto =
    productosDisponibles.find(
      item =>
        item.idProducto ===
        Number(detalle.idProducto)
    );

  return {
    ...detalle,

    idProducto:
      Number(detalle.idProducto),

    codigo:
      producto?.codigo ||
      detalle.codigo ||
      `Producto ${detalle.idProducto}`,

    nombre:
      producto?.nombre ||
      detalle.nombre ||
      'Producto no disponible',

    activo:
      producto?.activo === 1
        ? 1
        : 0
  };
}

function enriquecerServicio(
  detalle
) {
  const servicio =
    serviciosDisponibles.find(
      item =>
        item.idServicio ===
        Number(detalle.idServicio)
    );

  return {
    ...detalle,

    idServicio:
      Number(detalle.idServicio),

    codigo:
      servicio?.codigo ||
      detalle.codigo ||
      `Servicio ${detalle.idServicio}`,

    nombre:
      servicio?.nombre ||
      detalle.nombre ||
      'Servicio no disponible',

    activo:
      servicio?.activo === 1
        ? 1
        : 0
  };
}

function tieneComponentesInactivos() {
  return (
    componentesProductos.some(
      componente =>
        componente.activo !== 1
    ) ||
    componentesServicios.some(
      componente =>
        componente.activo !== 1
    )
  );
}

function actualizarEstadoActivacion() {
  const {
    activo,
    advertenciaInactivos
  } = obtenerElementos();

  const tieneInactivos =
    tieneComponentesInactivos();

  if (advertenciaInactivos) {
    advertenciaInactivos.style.display =
      tieneInactivos
        ? 'flex'
        : 'none';
  }

  if (
    tieneInactivos &&
    activo?.checked
  ) {
    activo.checked = false;
  }
}

async function cargarPaquete(id) {
  try {
    showLoader();

    paqueteActual =
      await obtenerPaquete(id);

    esEdicion = true;

    const {
      formTitle,
      codigo,
      nombre,
      descripcion,
      precio,
      activo
    } = obtenerElementos();

    formTitle.textContent =
      'Editar Paquete';

    codigo.value =
      paqueteActual.codigo;

    nombre.value =
      paqueteActual.nombre;

    descripcion.value =
      paqueteActual.descripcion || '';

    precio.value =
      paqueteActual.precio;

    activo.checked =
      paqueteActual.activo === 1;

    componentesProductos =
      (paqueteActual.detalleProductos || [])
        .map(
          enriquecerProducto
        );

    componentesServicios =
      (paqueteActual.detalleServicios || [])
        .map(
          enriquecerServicio
        );

    renderizarComponentesProductos();
    renderizarComponentesServicios();
    actualizarResumen();
    actualizarEstadoActivacion();

  } finally {
    hideLoader();
  }
}

function manejarAgregarProducto() {
  const {
    buscarProductos
  } = obtenerElementos();

  const valor =
    buscarProductos.value
      .trim()
      .toLowerCase();

  if (!valor) {
    showNotification(
      'Ingrese código o nombre del producto.',
      { type: 'warning' }
    );
    return;
  }

  const producto =
    productosDisponibles.find(
      item =>
        item.activo === 1 &&
        (
          item.codigo
            .toLowerCase()
            .includes(valor) ||
          item.nombre
            .toLowerCase()
            .includes(valor)
        )
    );

  if (!producto) {
    showNotification(
      'No se encontró un producto activo.',
      { type: 'error' }
    );
    return;
  }

  const existente =
    componentesProductos.find(
      componente =>
        componente.idProducto ===
        producto.idProducto
    );

  if (existente) {
    existente.cantidad += 1;

    existente.subtotal =
      existente.cantidad *
      existente.precioUnitario;

  } else {
    componentesProductos.push({
      idProducto:
        producto.idProducto,

      codigo:
        producto.codigo,

      nombre:
        producto.nombre,

      cantidad:
        1,

      precioUnitario:
        Number(
          producto.precioBase || 0
        ),

      subtotal:
        Number(
          producto.precioBase || 0
        ),

      activo:
        producto.activo
    });
  }

  buscarProductos.value = '';

  renderizarComponentesProductos();
  actualizarResumen();
  actualizarEstadoActivacion();
}

function manejarAgregarServicio() {
  const {
    buscarServicios
  } = obtenerElementos();

  const valor =
    buscarServicios.value
      .trim()
      .toLowerCase();

  if (!valor) {
    showNotification(
      'Ingrese código o nombre del servicio.',
      { type: 'warning' }
    );
    return;
  }

  const servicio =
    serviciosDisponibles.find(
      item =>
        item.activo === 1 &&
        (
          item.codigo
            .toLowerCase()
            .includes(valor) ||
          item.nombre
            .toLowerCase()
            .includes(valor)
        )
    );

  if (!servicio) {
    showNotification(
      'No se encontró un servicio activo.',
      { type: 'error' }
    );
    return;
  }

  const existente =
    componentesServicios.find(
      componente =>
        componente.idServicio ===
        servicio.idServicio
    );

  if (existente) {
    existente.cantidad += 1;

    existente.subtotal =
      existente.cantidad *
      existente.tarifa;

  } else {
    componentesServicios.push({
      idServicio:
        servicio.idServicio,

      codigo:
        servicio.codigo,

      nombre:
        servicio.nombre,

      cantidad:
        1,

      tarifa:
        Number(
          servicio.tarifaBase || 0
        ),

      subtotal:
        Number(
          servicio.tarifaBase || 0
        ),

      activo:
        servicio.activo
    });
  }

  buscarServicios.value = '';

  renderizarComponentesServicios();
  actualizarResumen();
  actualizarEstadoActivacion();
}

function actualizarCantidadProducto(
  indice,
  cantidad
) {
  const componente =
    componentesProductos[indice];

  if (!componente) return;

  componente.cantidad =
    Math.max(
      1,
      Number(cantidad) || 1
    );

  componente.subtotal =
    componente.cantidad *
    componente.precioUnitario;

  renderizarComponentesProductos();
  actualizarResumen();
}

function actualizarCantidadServicio(
  indice,
  cantidad
) {
  const componente =
    componentesServicios[indice];

  if (!componente) return;

  componente.cantidad =
    Math.max(
      1,
      Number(cantidad) || 1
    );

  componente.subtotal =
    componente.cantidad *
    componente.tarifa;

  renderizarComponentesServicios();
  actualizarResumen();
}

function eliminarProducto(indice) {
  componentesProductos.splice(
    indice,
    1
  );

  renderizarComponentesProductos();
  actualizarResumen();
  actualizarEstadoActivacion();
}

function eliminarServicio(indice) {
  componentesServicios.splice(
    indice,
    1
  );

  renderizarComponentesServicios();
  actualizarResumen();
  actualizarEstadoActivacion();
}

function renderizarComponentesProductos() {
  const {
    productosComponentes
  } = obtenerElementos();

  if (
    componentesProductos.length === 0
  ) {
    productosComponentes.innerHTML =
      '<p class="catalogo-empty-text">No hay productos agregados.</p>';

    return;
  }

  productosComponentes.innerHTML =
    componentesProductos
      .map(
        (componente, indice) => `
          <div class="catalogo-component-item">

            <div>
              <strong>
                ${componente.nombre}
              </strong>

              <div class="catalogo-card-subtitle">
                ${componente.codigo}
              </div>

              ${componente.activo !== 1 ? `
                <span class="catalogo-badge estado-inactivo">
                  Inactivo
                </span>
              ` : ''}
            </div>

            <input
              type="number"
              min="1"
              value="${componente.cantidad}"
              data-cantidad-producto="${indice}"
              aria-label="Cantidad de ${componente.nombre}"
            >

            <div>
              <div>
                Referencia:
                ${formatoMoneda(
                  componente.precioUnitario
                )}
              </div>

              <strong>
                ${formatoMoneda(
                  componente.subtotal
                )}
              </strong>
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

  productosComponentes
    .querySelectorAll(
      '[data-cantidad-producto]'
    )
    .forEach(input => {
      input.addEventListener(
        'change',
        evento => {
          actualizarCantidadProducto(
            Number(
              evento.target.dataset
                .cantidadProducto
            ),
            evento.target.value
          );
        }
      );
    });

  productosComponentes
    .querySelectorAll(
      '[data-eliminar-producto]'
    )
    .forEach(boton => {
      boton.addEventListener(
        'click',
        evento => {
          eliminarProducto(
            Number(
              evento.currentTarget.dataset
                .eliminarProducto
            )
          );
        }
      );
    });
}

function renderizarComponentesServicios() {
  const {
    serviciosComponentes
  } = obtenerElementos();

  if (
    componentesServicios.length === 0
  ) {
    serviciosComponentes.innerHTML =
      '<p class="catalogo-empty-text">No hay servicios agregados.</p>';

    return;
  }

  serviciosComponentes.innerHTML =
    componentesServicios
      .map(
        (componente, indice) => `
          <div class="catalogo-component-item">

            <div>
              <strong>
                ${componente.nombre}
              </strong>

              <div class="catalogo-card-subtitle">
                ${componente.codigo}
              </div>

              ${componente.activo !== 1 ? `
                <span class="catalogo-badge estado-inactivo">
                  Inactivo
                </span>
              ` : ''}
            </div>

            <input
              type="number"
              min="1"
              value="${componente.cantidad}"
              data-cantidad-servicio="${indice}"
              aria-label="Cantidad de ${componente.nombre}"
            >

            <div>
              <div>
                Tarifa:
                ${formatoMoneda(
                  componente.tarifa
                )}
              </div>

              <strong>
                ${formatoMoneda(
                  componente.subtotal
                )}
              </strong>
            </div>

            <button
              type="button"
              class="btn btn-secondary"
              data-eliminar-servicio="${indice}"
            >
              Quitar
            </button>

          </div>
        `
      )
      .join('');

  serviciosComponentes
    .querySelectorAll(
      '[data-cantidad-servicio]'
    )
    .forEach(input => {
      input.addEventListener(
        'change',
        evento => {
          actualizarCantidadServicio(
            Number(
              evento.target.dataset
                .cantidadServicio
            ),
            evento.target.value
          );
        }
      );
    });

  serviciosComponentes
    .querySelectorAll(
      '[data-eliminar-servicio]'
    )
    .forEach(boton => {
      boton.addEventListener(
        'click',
        evento => {
          eliminarServicio(
            Number(
              evento.currentTarget.dataset
                .eliminarServicio
            )
          );
        }
      );
    });
}

function actualizarResumen() {
  const {
    resumenTotalProductos,
    resumenTotalServicios,
    resumenTotalComponentes,
    resumenSubtotal,
    resumenPrecioRegistrado,
    resumenDiferencia,
    precio
  } = obtenerElementos();

  const subtotalProductos =
    componentesProductos
      .reduce(
        (total, componente) =>
          total +
          Number(
            componente.subtotal || 0
          ),
        0
      );

  const subtotalServicios =
    componentesServicios
      .reduce(
        (total, componente) =>
          total +
          Number(
            componente.subtotal || 0
          ),
        0
      );

  const subtotal =
    subtotalProductos +
    subtotalServicios;

  const precioRegistrado =
    Number(
      precio?.value || 0
    );

  resumenTotalProductos.textContent =
    componentesProductos.length;

  resumenTotalServicios.textContent =
    componentesServicios.length;

  resumenTotalComponentes.textContent =
    componentesProductos.length +
    componentesServicios.length;

  resumenSubtotal.textContent =
    formatoMoneda(subtotal);

  resumenPrecioRegistrado.textContent =
    formatoMoneda(
      precioRegistrado
    );

  resumenDiferencia.textContent =
    formatoMoneda(
      precioRegistrado -
      subtotal
    );
}

async function manejarEnvio(
  evento
) {
  evento.preventDefault();

  limpiarErrores();

  const {
    codigo,
    nombre,
    descripcion,
    precio,
    activo
  } = obtenerElementos();

  if (
    activo.checked &&
    tieneComponentesInactivos()
  ) {
    activo.checked = false;

    showNotification(
      'No puede activar el paquete mientras tenga componentes inactivos.',
      { type: 'error' }
    );

    return;
  }

  const datos = {
    codigo:
      codigo.value.trim(),

    nombre:
      nombre.value.trim(),

    descripcion:
      descripcion.value.trim(),

    precio:
      Number(precio.value),

    activo:
      Boolean(activo.checked),

    detalleProductos:
      componentesProductos,

    detalleServicios:
      componentesServicios
  };

  try {
    showLoader();

    let resultado;

    if (
      esEdicion &&
      paqueteActual
    ) {
      resultado =
        await actualizarPaquete(
          paqueteActual.idPaquete,
          datos
        );

      showNotification(
        MENSAJES.PAQUETE_ACTUALIZADO,
        { type: 'success' }
      );

    } else {
      resultado =
        await registrarPaquete(
          datos
        );

      showNotification(
        MENSAJES.PAQUETE_REGISTRADO,
        { type: 'success' }
      );
    }

    window.location.hash =
      `#/catalogo/paquetes/detalle?id=${resultado.idPaquete}`;

  } catch (error) {
    if (
      Array.isArray(
        error.detalles
      )
    ) {
      let mostrado = false;

      error.detalles.forEach(
        detalle => {
          const encontrado =
            mostrarError(
              detalle.campo,
              detalle.mensaje
            );

          mostrado =
            mostrado ||
            encontrado;
        }
      );

      if (!mostrado) {
        showNotification(
          error.detalles[0]?.mensaje ||
          error.message,
          { type: 'error' }
        );
      }

    } else {
      showNotification(
        error.message ||
        'No fue posible guardar el paquete.',
        { type: 'error' }
      );
    }

  } finally {
    hideLoader();
  }
}

export async function init() {
  if (!requireAuth()) return;

  renderNavegacionCatalogo();

  const session =
    getSession();

  const idPaquete =
    obtenerIdPaquete();

  const permiso =
    idPaquete
      ? PERMISOS_CATALOGO.PAQUETES_MODIFICAR
      : PERMISOS_CATALOGO.PAQUETES_REGISTRAR;

  if (
    !hasPermission(
      session,
      permiso
    )
  ) {
    showNotification(
      'No tiene permisos para administrar paquetes.',
      { type: 'error' }
    );

    window.location.hash =
      '#/catalogo/paquetes';

    return;
  }

  await cargarCatalogos();

  if (idPaquete) {
    await cargarPaquete(
      idPaquete
    );
  }

  const {
    form,
    btnCancelar,
    btnAgregarProducto,
    btnAgregarServicio,
    buscarProductos,
    buscarServicios,
    precio,
    activo
  } = obtenerElementos();

  form.addEventListener(
    'submit',
    manejarEnvio
  );

  btnCancelar.addEventListener(
    'click',
    () => {
      window.location.hash =
        '#/catalogo/paquetes';
    }
  );

  btnAgregarProducto.addEventListener(
    'click',
    manejarAgregarProducto
  );

  btnAgregarServicio.addEventListener(
    'click',
    manejarAgregarServicio
  );

  buscarProductos.addEventListener(
    'keydown',
    evento => {
      if (
        evento.key === 'Enter'
      ) {
        evento.preventDefault();
        manejarAgregarProducto();
      }
    }
  );

  buscarServicios.addEventListener(
    'keydown',
    evento => {
      if (
        evento.key === 'Enter'
      ) {
        evento.preventDefault();
        manejarAgregarServicio();
      }
    }
  );

  precio.addEventListener(
    'input',
    actualizarResumen
  );

  activo.addEventListener(
    'change',
    () => {
      if (
        activo.checked &&
        tieneComponentesInactivos()
      ) {
        activo.checked = false;

        showNotification(
          'El paquete tiene componentes inactivos y no puede activarse.',
          { type: 'error' }
        );
      }
    }
  );

  actualizarResumen();
}