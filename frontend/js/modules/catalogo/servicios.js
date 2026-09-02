import {
  listarServicios,
  cambiarEstadoServicio,
  listarCategoriasServicio
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

let paginaActual = 1;
let totalServicios = 0;
let puedeGestionar = false;

let filtros = {
  texto: '',
  categoria: '',
  tipo: '',
  estado: '',
  tarifaMin: '',
  tarifaMax: '',
  soloActivos: false,
  skip: 0,
  limit: 10
};

function obtenerElementos() {
  return {
    contenido:
      document.getElementById('servicios-content'),

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
      document.getElementById('servicios-tbody'),

    cards:
      document.getElementById('servicios-cards'),

    paginacion:
      document.getElementById('paginacion'),

    filtroTexto:
      document.getElementById('filtro-texto'),

    filtroCategoria:
      document.getElementById('filtro-categoria'),

    filtroTipo:
      document.getElementById('filtro-tipo'),

    filtroEstado:
      document.getElementById('filtro-estado'),

    filtroTarifaMin:
      document.getElementById('filtro-tarifa-min'),

    filtroTarifaMax:
      document.getElementById('filtro-tarifa-max'),

    grupoEstado:
      document.getElementById('grupo-filtro-estado'),

    btnFiltrar:
      document.getElementById('btn-filtrar'),

    btnLimpiar:
      document.getElementById('btn-limpiar-filtros'),

    btnNuevo:
      document.getElementById('btn-nuevo-servicio'),

    colUltimaModificacion:
      document.getElementById(
        'col-ultima-modificacion'
      )
  };
}

function obtenerCategoria(id) {
  return categorias.find(
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

function imagenServicio(servicio) {
  return (
    servicio.imagenUrl ||
    RUTAS_IMAGENES.PLACEHOLDER_SERVICIO
  );
}

async function cargarCategorias() {
  categorias =
    await listarCategoriasServicio();

  const {
    filtroCategoria
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
}

function accionesServicio(servicio) {
  const session = getSession();

  const editar = hasPermission(
    session,
    PERMISOS_CATALOGO.SERVICIOS_MODIFICAR
  );

  const cambiarEstado = hasPermission(
    session,
    PERMISOS_CATALOGO.SERVICIOS_DESACTIVAR
  );

  return `
    <button
      type="button"
      class="btn btn-sm btn-primary"
      data-action="ver"
      data-id="${servicio.idServicio}"
    >
      Ver
    </button>

    ${editar ? `
      <button
        type="button"
        class="btn btn-sm btn-secondary"
        data-action="editar"
        data-id="${servicio.idServicio}"
      >
        Editar
      </button>
    ` : ''}

    ${cambiarEstado ? `
      <button
        type="button"
        class="btn btn-sm btn-secondary"
        data-action="estado"
        data-id="${servicio.idServicio}"
        data-activo="${servicio.activo}"
      >
        ${servicio.activo
          ? 'Desactivar'
          : 'Activar'}
      </button>
    ` : ''}
  `;
}

function renderTabla(servicios) {
  const { tbody } = obtenerElementos();

  tbody.innerHTML = servicios
    .map(servicio => `
      <tr>

        <td>
          <img
            src="${imagenServicio(servicio)}"
            alt="${servicio.nombre}"
            loading="lazy"
            onerror="this.onerror=null;this.src='${RUTAS_IMAGENES.PLACEHOLDER_SERVICIO}'"
          >
        </td>

        <td>${servicio.codigo}</td>

        <td>${servicio.nombre}</td>

        <td>
          ${obtenerCategoria(
            servicio.idCategoria
          )}
        </td>

        <td>
          ${servicio.tipoServicio || '—'}
        </td>

        <td>
          ${formatoMoneda(
            servicio.tarifaBase
          )}
        </td>

        <td>
          <span class="catalogo-badge ${
            servicio.activo
              ? 'estado-activo'
              : 'estado-inactivo'
          }">
            ${servicio.activo
              ? 'Activo'
              : 'Inactivo'}
          </span>
        </td>

        ${puedeGestionar ? `
          <td>
            ${formatoFecha(
              servicio.fechaModificacion
            )}
          </td>
        ` : ''}

        <td>
          <div class="catalogo-table-actions">
            ${accionesServicio(servicio)}
          </div>
        </td>

      </tr>
    `)
    .join('');
}

function renderCards(servicios) {
  const { cards } = obtenerElementos();

  cards.innerHTML = servicios
    .map(servicio => `
      <article class="catalogo-card">

        <img
          class="catalogo-card-image"
          src="${imagenServicio(servicio)}"
          alt="${servicio.nombre}"
          loading="lazy"
          onerror="this.onerror=null;this.src='${RUTAS_IMAGENES.PLACEHOLDER_SERVICIO}'"
        >

        <div class="catalogo-card-content">

          <h3 class="catalogo-card-title">
            ${servicio.nombre}
          </h3>

          <p class="catalogo-card-subtitle">
            ${servicio.codigo}
          </p>

          <div class="catalogo-card-info">

            <div class="catalogo-card-info-item">
              <span class="catalogo-card-info-label">
                Tarifa
              </span>

              <span>
                ${formatoMoneda(
                  servicio.tarifaBase
                )}
              </span>
            </div>

            <div class="catalogo-card-info-item">
              <span class="catalogo-card-info-label">
                Categoría
              </span>

              <span>
                ${obtenerCategoria(
                  servicio.idCategoria
                )}
              </span>
            </div>

            <div class="catalogo-card-info-item">
              <span class="catalogo-card-info-label">
                Tipo
              </span>

              <span>
                ${servicio.tipoServicio}
              </span>
            </div>

            <div class="catalogo-card-info-item">
              <span class="catalogo-card-info-label">
                Estado
              </span>

              <span>
                ${servicio.activo
                  ? 'Activo'
                  : 'Inactivo'}
              </span>
            </div>

          </div>

        </div>

        <div class="catalogo-card-actions">
          ${accionesServicio(servicio)}
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

async function cargarServicios() {
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
      (paginaActual - 1) *
      filtros.limit;

    const resultado =
      await listarServicios(filtros);

    totalServicios = resultado.total;

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
  const { paginacion } =
    obtenerElementos();

  const totalPaginas =
    Math.ceil(
      totalServicios / filtros.limit
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
        ${paginaActual === 1
          ? 'disabled'
          : ''}
      >
        Anterior
      </button>

      <span>
        Página ${paginaActual}
        de ${totalPaginas}
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
    ?.addEventListener(
      'click',
      () => {
        paginaActual--;
        cargarServicios();
      }
    );

  document
    .getElementById('pagina-siguiente')
    ?.addEventListener(
      'click',
      () => {
        paginaActual++;
        cargarServicios();
      }
    );
}

async function manejarAccion(evento) {
  const boton = evento.currentTarget;
  const id = boton.dataset.id;

  if (boton.dataset.action === 'ver') {
    location.hash =
      `#/catalogo/servicios/detalle?id=${id}`;
    return;
  }

  if (boton.dataset.action === 'editar') {
    location.hash =
      `#/catalogo/servicios/formulario?id=${id}`;
    return;
  }

  if (boton.dataset.action === 'estado') {
    const activo =
      boton.dataset.activo === '1';

    const confirmar =
      window.confirm(
        activo
          ? '¿Desactivar este servicio?'
          : '¿Activar este servicio?'
      );

    if (!confirmar) return;

    await cambiarEstadoServicio(
      id,
      !activo
    );

    showNotification(
      activo
        ? MENSAJES.SERVICIO_DESACTIVADO
        : MENSAJES.SERVICIO_ACTIVADO,
      { type: 'success' }
    );

    await cargarServicios();
  }
}

function aplicarFiltros() {
  const {
    filtroTexto,
    filtroCategoria,
    filtroTipo,
    filtroEstado,
    filtroTarifaMin,
    filtroTarifaMax
  } = obtenerElementos();

  filtros = {
    ...filtros,

    texto:
      filtroTexto.value.trim(),

    categoria:
      filtroCategoria.value,

    tipo:
      filtroTipo.value,

    estado:
      puedeGestionar
        ? filtroEstado.value
        : '',

    tarifaMin:
      filtroTarifaMin.value,

    tarifaMax:
      filtroTarifaMax.value,

    soloActivos:
      !puedeGestionar,

    skip: 0
  };

  paginaActual = 1;

  cargarServicios();
}

function limpiarFiltros() {
  const {
    filtroTexto,
    filtroCategoria,
    filtroTipo,
    filtroEstado,
    filtroTarifaMin,
    filtroTarifaMax
  } = obtenerElementos();

  filtroTexto.value = '';
  filtroCategoria.value = '';
  filtroTipo.value = '';
  filtroEstado.value = '';
  filtroTarifaMin.value = '';
  filtroTarifaMax.value = '';

  filtros = {
    texto: '',
    categoria: '',
    tipo: '',
    estado: '',
    tarifaMin: '',
    tarifaMax: '',
    soloActivos: !puedeGestionar,
    skip: 0,
    limit: 10
  };

  paginaActual = 1;

  cargarServicios();
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
      PERMISOS_CATALOGO.SERVICIOS_REGISTRAR
    ) ||
    hasPermission(
      session,
      PERMISOS_CATALOGO.SERVICIOS_MODIFICAR
    ) ||
    hasPermission(
      session,
      PERMISOS_CATALOGO.SERVICIOS_DESACTIVAR
    );

  filtros.soloActivos =
    !puedeGestionar;

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
      PERMISOS_CATALOGO.SERVICIOS_REGISTRAR
    )
  ) {
    btnNuevo.style.display = 'none';
  }

  if (!puedeGestionar) {
    grupoEstado.style.display = 'none';

    colUltimaModificacion.style.display =
      'none';
  }

  await cargarCategorias();
  await cargarServicios();

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
        '#/catalogo/servicios/formulario';
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