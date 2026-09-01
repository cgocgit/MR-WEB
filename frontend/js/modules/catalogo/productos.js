import {
  listarProductos,
  cambiarEstadoProducto,
  listarCategoriasProducto,
  listarTiposProducto,
  listarColores
} from '../../api/catalogo.service.js';

import {
  PERMISOS_CATALOGO,
  MENSAJES,
  RUTAS_IMAGENES
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
  renderNavegacionCatalogo
} from './catalogo-ui.js';

let categorias = [];
let tipos = [];
let colores = [];

let paginaActual = 1;
let totalProductos = 0;

let puedeGestionar = false;

let filtros = {
  texto: '',
  categoria: '',
  tipo: '',
  color: '',
  estado: '',
  disponibilidad: '',
  soloActivos: false,
  skip: 0,
  limit: 10
};

function obtenerElementos() {
  return {
    contenido:
      document.getElementById('productos-content'),

    cargando:
      document.getElementById('estado-cargando'),

    error:
      document.getElementById('estado-error'),

    vacio:
      document.getElementById('estado-vacio'),

    acceso:
      document.getElementById('estado-acceso'),

    errorMensaje:
      document.getElementById('error-mensaje'),

    tbody:
      document.getElementById('productos-tbody'),

    cards:
      document.getElementById('productos-cards'),

    paginacion:
      document.getElementById('paginacion'),

    filtroTexto:
      document.getElementById('filtro-texto'),

    filtroCategoria:
      document.getElementById('filtro-categoria'),

    filtroTipo:
      document.getElementById('filtro-tipo'),

    filtroColor:
      document.getElementById('filtro-color'),

    filtroEstado:
      document.getElementById('filtro-estado'),

    filtroDisponibilidad:
      document.getElementById(
        'filtro-disponibilidad'
      ),

    grupoEstado:
      document.getElementById(
        'grupo-filtro-estado'
      ),

    btnFiltrar:
      document.getElementById('btn-filtrar'),

    btnLimpiar:
      document.getElementById(
        'btn-limpiar-filtros'
      ),

    btnNuevo:
      document.getElementById(
        'btn-nuevo-producto'
      ),

    colUltimaModificacion:
      document.getElementById(
        'col-ultima-modificacion'
      )
  };
}

function nombreAuxiliar(lista, id) {
  return lista.find(
    item => item.id === id
  )?.nombre || '—';
}

function formatoMoneda(valor) {
  return Number(valor || 0).toLocaleString(
    'es-MX',
    {
      style: 'currency',
      currency: 'MXN'
    }
  );
}

function formatoFecha(fecha) {
  if (!fecha) return '—';

  return new Date(fecha).toLocaleString(
    'es-MX',
    {
      dateStyle: 'short',
      timeStyle: 'short'
    }
  );
}

function imagenProducto(producto) {
  return (
    producto.imagenUrl ||
    RUTAS_IMAGENES.PLACEHOLDER_PRODUCTO
  );
}

async function cargarAuxiliares() {
  [
    categorias,
    tipos,
    colores
  ] = await Promise.all([
    listarCategoriasProducto(),
    listarTiposProducto(),
    listarColores()
  ]);

  const {
    filtroCategoria,
    filtroTipo,
    filtroColor
  } = obtenerElementos();

  filtroCategoria.innerHTML =
    '<option value="">Todas</option>';

  categorias.forEach(item => {
    filtroCategoria.insertAdjacentHTML(
      'beforeend',
      `<option value="${item.id}">
        ${item.nombre}
      </option>`
    );
  });

  filtroTipo.innerHTML =
    '<option value="">Todos</option>';

  tipos.forEach(item => {
    filtroTipo.insertAdjacentHTML(
      'beforeend',
      `<option value="${item.id}">
        ${item.nombre}
      </option>`
    );
  });

  filtroColor.innerHTML =
    '<option value="">Todos</option>';

  colores.forEach(item => {
    filtroColor.insertAdjacentHTML(
      'beforeend',
      `<option value="${item.id}">
        ${item.nombre}
      </option>`
    );
  });
}

function accionesProducto(producto) {
  const session = getSession();

  const editar = hasPermission(
    session,
    PERMISOS_CATALOGO.PRODUCTOS_MODIFICAR
  );

  const cambiarEstado = hasPermission(
    session,
    PERMISOS_CATALOGO.PRODUCTOS_DESACTIVAR
  );

  return `
    <button
      type="button"
      class="btn btn-sm btn-primary"
      data-action="ver"
      data-id="${producto.idProducto}"
    >
      Ver
    </button>

    ${editar ? `
      <button
        type="button"
        class="btn btn-sm btn-secondary"
        data-action="editar"
        data-id="${producto.idProducto}"
      >
        Editar
      </button>
    ` : ''}

    ${cambiarEstado ? `
      <button
        type="button"
        class="btn btn-sm btn-secondary"
        data-action="estado"
        data-id="${producto.idProducto}"
        data-activo="${producto.activo}"
      >
        ${producto.activo ? 'Desactivar' : 'Activar'}
      </button>
    ` : ''}
  `;
}

function renderTabla(productos) {
  const { tbody } = obtenerElementos();

  tbody.innerHTML = productos
    .map(producto => `
      <tr>
        <td>
          <img
            src="${imagenProducto(producto)}"
            alt="${producto.nombre}"
            loading="lazy"
            onerror="this.onerror=null;this.src='${RUTAS_IMAGENES.PLACEHOLDER_PRODUCTO}'"
          >
        </td>

        <td>${producto.codigo}</td>
        <td>${producto.nombre}</td>

        <td>
          ${nombreAuxiliar(
            categorias,
            producto.idCategoria
          )}
        </td>

        <td>
          ${nombreAuxiliar(
            tipos,
            producto.idTipoProducto
          )}
        </td>

        <td>
          ${nombreAuxiliar(
            colores,
            producto.idColor
          )}
        </td>

        <td>${producto.unidadMedida || '—'}</td>

        <td>
          ${formatoMoneda(producto.precioBase)}
        </td>

        <td>
          ${Number(producto.disponibilidad || 0)}
        </td>

        <td>
          <span class="catalogo-badge ${
            producto.activo
              ? 'estado-activo'
              : 'estado-inactivo'
          }">
            ${producto.activo ? 'Activo' : 'Inactivo'}
          </span>
        </td>

        ${puedeGestionar ? `
          <td>
            ${formatoFecha(
              producto.fechaModificacion
            )}
          </td>
        ` : ''}

        <td>
          <div class="catalogo-table-actions">
            ${accionesProducto(producto)}
          </div>
        </td>
      </tr>
    `)
    .join('');
}

function renderCards(productos) {
  const { cards } = obtenerElementos();

  cards.innerHTML = productos
    .map(producto => `
      <article class="catalogo-card">

        <img
          class="catalogo-card-image"
          src="${imagenProducto(producto)}"
          alt="${producto.nombre}"
          loading="lazy"
          onerror="this.onerror=null;this.src='${RUTAS_IMAGENES.PLACEHOLDER_PRODUCTO}'"
        >

        <div class="catalogo-card-content">

          <h3 class="catalogo-card-title">
            ${producto.nombre}
          </h3>

          <p class="catalogo-card-subtitle">
            ${producto.codigo}
          </p>

          <div class="catalogo-card-info">

            <div class="catalogo-card-info-item">
              <span class="catalogo-card-info-label">
                Precio
              </span>
              <span>
                ${formatoMoneda(producto.precioBase)}
              </span>
            </div>

            <div class="catalogo-card-info-item">
              <span class="catalogo-card-info-label">
                Disponible
              </span>
              <span>
                ${Number(
                  producto.disponibilidad || 0
                )}
              </span>
            </div>

            <div class="catalogo-card-info-item">
              <span class="catalogo-card-info-label">
                Estado
              </span>
              <span>
                ${producto.activo
                  ? 'Activo'
                  : 'Inactivo'}
              </span>
            </div>

            <div class="catalogo-card-info-item">
              <span class="catalogo-card-info-label">
                Categoría
              </span>
              <span>
                ${nombreAuxiliar(
                  categorias,
                  producto.idCategoria
                )}
              </span>
            </div>

          </div>
        </div>

        <div class="catalogo-card-actions">
          ${accionesProducto(producto)}
        </div>

      </article>
    `)
    .join('');
}

function registrarAcciones() {
  document
    .querySelectorAll('[data-action][data-id]')
    .forEach(boton => {
      boton.addEventListener(
        'click',
        manejarAccion
      );
    });
}

async function cargarProductos() {
  const {
    contenido,
    cargando,
    error,
    vacio,
    errorMensaje
  } = obtenerElementos();

  try {
    cargando.style.display = 'flex';
    contenido.style.display = 'none';
    error.style.display = 'none';
    vacio.style.display = 'none';

    filtros.skip =
      (paginaActual - 1) * filtros.limit;

    const resultado =
      await listarProductos(filtros);

    totalProductos = resultado.total;

    cargando.style.display = 'none';

    if (!resultado.items.length) {
      vacio.style.display = 'block';
      return;
    }

    contenido.style.display = 'block';

    renderTabla(resultado.items);
    renderCards(resultado.items);
    renderPaginacion();
    registrarAcciones();

  } catch (err) {
    cargando.style.display = 'none';
    error.style.display = 'flex';

    errorMensaje.textContent =
      err.message || 'Error desconocido';
  }
}

function renderPaginacion() {
  const { paginacion } = obtenerElementos();

  const totalPaginas =
    Math.ceil(
      totalProductos / filtros.limit
    );

  if (totalPaginas <= 1) {
    paginacion.innerHTML = '';
    return;
  }

  paginacion.innerHTML = `
    <div class="catalogo-pagination">

      <button
        type="button"
        id="pagina-anterior"
        class="btn btn-secondary"
        ${paginaActual === 1 ? 'disabled' : ''}
      >
        Anterior
      </button>

      <span>
        Página ${paginaActual} de ${totalPaginas}
      </span>

      <button
        type="button"
        id="pagina-siguiente"
        class="btn btn-secondary"
        ${paginaActual === totalPaginas
          ? 'disabled'
          : ''}
      >
        Siguiente
      </button>

    </div>
  `;

  document
    .getElementById('pagina-anterior')
    ?.addEventListener('click', () => {
      paginaActual--;
      cargarProductos();
    });

  document
    .getElementById('pagina-siguiente')
    ?.addEventListener('click', () => {
      paginaActual++;
      cargarProductos();
    });
}

async function manejarAccion(evento) {
  const boton =
    evento.currentTarget;

  const id = boton.dataset.id;

  switch (boton.dataset.action) {
    case 'ver':
      location.hash =
        `#/catalogo/productos/detalle?id=${id}`;
      break;

    case 'editar':
      location.hash =
        `#/catalogo/productos/formulario?id=${id}`;
      break;

    case 'estado': {
      const activo =
        boton.dataset.activo === '1';

      const confirmar = window.confirm(
        activo
          ? '¿Desactivar este producto?'
          : '¿Activar este producto?'
      );

      if (!confirmar) return;

      await cambiarEstadoProducto(
        id,
        !activo
      );

      showNotification(
        activo
          ? MENSAJES.PRODUCTO_DESACTIVADO
          : MENSAJES.PRODUCTO_ACTIVADO,
        { type: 'success' }
      );

      await cargarProductos();
      break;
    }
  }
}

function aplicarFiltros() {
  const {
    filtroTexto,
    filtroCategoria,
    filtroTipo,
    filtroColor,
    filtroEstado,
    filtroDisponibilidad
  } = obtenerElementos();

  filtros = {
    ...filtros,
    texto:
      filtroTexto.value.trim(),
    categoria:
      filtroCategoria.value,
    tipo:
      filtroTipo.value,
    color:
      filtroColor.value,
    estado:
      puedeGestionar
        ? filtroEstado.value
        : '',
    disponibilidad:
      filtroDisponibilidad.value,
    soloActivos:
      !puedeGestionar,
    skip: 0
  };

  paginaActual = 1;

  cargarProductos();
}

function limpiarFiltros() {
  const {
    filtroTexto,
    filtroCategoria,
    filtroTipo,
    filtroColor,
    filtroEstado,
    filtroDisponibilidad
  } = obtenerElementos();

  filtroTexto.value = '';
  filtroCategoria.value = '';
  filtroTipo.value = '';
  filtroColor.value = '';
  filtroEstado.value = '';
  filtroDisponibilidad.value = '';

  filtros = {
    texto: '',
    categoria: '',
    tipo: '',
    color: '',
    estado: '',
    disponibilidad: '',
    soloActivos: !puedeGestionar,
    skip: 0,
    limit: 10
  };

  paginaActual = 1;

  cargarProductos();
}

export async function init() {
  if (!requireAuth()) return;

  renderNavegacionCatalogo();

  const session = getSession();

  if (
    !hasPermission(
      session,
      PERMISOS_CATALOGO.CONSULTAR
    )
  ) {
    obtenerElementos().acceso.style.display =
      'flex';
    return;
  }

  puedeGestionar =
    hasPermission(
      session,
      PERMISOS_CATALOGO.PRODUCTOS_REGISTRAR
    ) ||
    hasPermission(
      session,
      PERMISOS_CATALOGO.PRODUCTOS_MODIFICAR
    ) ||
    hasPermission(
      session,
      PERMISOS_CATALOGO.PRODUCTOS_DESACTIVAR
    );

  filtros.soloActivos = !puedeGestionar;

  const {
    btnNuevo,
    grupoEstado,
    colUltimaModificacion,
    btnFiltrar,
    btnLimpiar,
    filtroTexto
  } = obtenerElementos();

  if (
    !hasPermission(
      session,
      PERMISOS_CATALOGO.PRODUCTOS_REGISTRAR
    )
  ) {
    btnNuevo.style.display = 'none';
  }

  if (!puedeGestionar) {
    grupoEstado.style.display = 'none';
    colUltimaModificacion.style.display =
      'none';
  }

  await cargarAuxiliares();
  await cargarProductos();

  btnFiltrar.addEventListener(
    'click',
    aplicarFiltros
  );

  btnLimpiar.addEventListener(
    'click',
    limpiarFiltros
  );

  btnNuevo.addEventListener(
    'click',
    () => {
      location.hash =
        '#/catalogo/productos/formulario';
    }
  );

  filtroTexto.addEventListener(
    'keydown',
    evento => {
      if (evento.key === 'Enter') {
        aplicarFiltros();
      }
    }
  );
}