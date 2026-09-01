import {
  listarPaquetes,
  cambiarEstadoPaquete
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
  renderNavegacionCatalogo
} from './catalogo-ui.js';

let paginaActual = 1;
let totalPaquetes = 0;
let puedeGestionar = false;

let filtros = {
  texto: '',
  componente: '',
  precioMin: '',
  precioMax: '',
  estado: '',
  soloActivos: false,
  skip: 0,
  limit: 10
};

function obtenerElementos() {
  return {
    contenido:
      document.getElementById(
        'paquetes-content'
      ),

    cargando:
      document.getElementById(
        'estado-cargando'
      ),

    error:
      document.getElementById(
        'estado-error'
      ),

    vacio:
      document.getElementById(
        'estado-vacio'
      ),

    acceso:
      document.getElementById(
        'estado-acceso'
      ),

    errorMensaje:
      document.getElementById(
        'error-mensaje'
      ),

    tbody:
      document.getElementById(
        'paquetes-tbody'
      ),

    cards:
      document.getElementById(
        'paquetes-cards'
      ),

    paginacion:
      document.getElementById(
        'paginacion'
      ),

    filtroTexto:
      document.getElementById(
        'filtro-texto'
      ),

    filtroComponente:
      document.getElementById(
        'filtro-componente'
      ),

    filtroPrecioMin:
      document.getElementById(
        'filtro-precio-min'
      ),

    filtroPrecioMax:
      document.getElementById(
        'filtro-precio-max'
      ),

    filtroEstado:
      document.getElementById(
        'filtro-estado'
      ),

    grupoEstado:
      document.getElementById(
        'grupo-filtro-estado'
      ),

    btnFiltrar:
      document.getElementById(
        'btn-filtrar'
      ),

    btnLimpiar:
      document.getElementById(
        'btn-limpiar-filtros'
      ),

    btnNuevo:
      document.getElementById(
        'btn-nuevo-paquete'
      ),

    colUltimaModificacion:
      document.getElementById(
        'col-ultima-modificacion'
      )
  };
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

function formatoFecha(fecha) {
  if (!fecha) return '—';

  return new Date(fecha)
    .toLocaleString(
      'es-MX',
      {
        dateStyle: 'short',
        timeStyle: 'short'
      }
    );
}

function accionesPaquete(paquete) {
  const session = getSession();

  const editar =
    hasPermission(
      session,
      PERMISOS_CATALOGO.PAQUETES_MODIFICAR
    );

  const cambiarEstado =
    hasPermission(
      session,
      PERMISOS_CATALOGO.PAQUETES_DESACTIVAR
    );

  return `
    <button
      type="button"
      class="btn btn-sm btn-primary"
      data-action="ver"
      data-id="${paquete.idPaquete}"
    >
      Ver
    </button>

    ${editar ? `
      <button
        type="button"
        class="btn btn-sm btn-secondary"
        data-action="editar"
        data-id="${paquete.idPaquete}"
      >
        Editar
      </button>
    ` : ''}

    ${cambiarEstado ? `
      <button
        type="button"
        class="btn btn-sm btn-secondary"
        data-action="estado"
        data-id="${paquete.idPaquete}"
        data-activo="${paquete.activo}"
      >
        ${paquete.activo
          ? 'Desactivar'
          : 'Activar'}
      </button>
    ` : ''}
  `;
}

function renderTabla(paquetes) {
  const { tbody } =
    obtenerElementos();

  tbody.innerHTML =
    paquetes.map(
      paquete => `
        <tr>
          <td>${paquete.codigo}</td>

          <td>${paquete.nombre}</td>

          <td>
            ${paquete.totalProductos}
          </td>

          <td>
            ${paquete.totalServicios}
          </td>

          <td>
            ${paquete.totalComponentes}
          </td>

          <td>
            ${formatoMoneda(
              paquete.precio
            )}
          </td>

          <td>
            <span class="catalogo-badge ${
              paquete.activo
                ? 'estado-activo'
                : 'estado-inactivo'
            }">
              ${paquete.activo
                ? 'Activo'
                : 'Inactivo'}
            </span>
          </td>

          ${puedeGestionar ? `
            <td>
              ${formatoFecha(
                paquete.fechaModificacion
              )}
            </td>
          ` : ''}

          <td>
            <div class="catalogo-table-actions">
              ${accionesPaquete(paquete)}
            </div>
          </td>
        </tr>
      `
    ).join('');
}

function renderCards(paquetes) {
  const { cards } =
    obtenerElementos();

  cards.innerHTML =
    paquetes.map(
      paquete => `
        <article class="catalogo-card">

          <div class="catalogo-card-content">

            <h3 class="catalogo-card-title">
              ${paquete.nombre}
            </h3>

            <p class="catalogo-card-subtitle">
              ${paquete.codigo}
            </p>

            <div class="catalogo-card-info">

              <div class="catalogo-card-info-item">
                <span class="catalogo-card-info-label">
                  Productos
                </span>
                <span>
                  ${paquete.totalProductos}
                </span>
              </div>

              <div class="catalogo-card-info-item">
                <span class="catalogo-card-info-label">
                  Servicios
                </span>
                <span>
                  ${paquete.totalServicios}
                </span>
              </div>

              <div class="catalogo-card-info-item">
                <span class="catalogo-card-info-label">
                  Precio
                </span>
                <span>
                  ${formatoMoneda(
                    paquete.precio
                  )}
                </span>
              </div>

              <div class="catalogo-card-info-item">
                <span class="catalogo-card-info-label">
                  Estado
                </span>
                <span>
                  ${paquete.activo
                    ? 'Activo'
                    : 'Inactivo'}
                </span>
              </div>

            </div>

          </div>

          <div class="catalogo-card-actions">
            ${accionesPaquete(paquete)}
          </div>

        </article>
      `
    ).join('');
}

function registrarAcciones() {
  document
    .querySelectorAll(
      '[data-action][data-id]'
    )
    .forEach(boton => {
      boton.addEventListener(
        'click',
        manejarAccion
      );
    });
}

async function cargarPaquetes() {
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
      await listarPaquetes(
        filtros
      );

    totalPaquetes =
      resultado.total;

    cargando.style.display = 'none';

    if (
      resultado.items.length === 0
    ) {
      vacio.style.display = 'block';
      return;
    }

    contenido.style.display =
      'block';

    renderTabla(
      resultado.items
    );

    renderCards(
      resultado.items
    );

    renderPaginacion();
    registrarAcciones();

  } catch (err) {
    cargando.style.display = 'none';
    error.style.display = 'flex';

    errorMensaje.textContent =
      err.message ||
      'Error desconocido';
  }
}

function renderPaginacion() {
  const { paginacion } =
    obtenerElementos();

  const totalPaginas =
    Math.ceil(
      totalPaquetes /
      filtros.limit
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
    .getElementById(
      'pagina-anterior'
    )
    ?.addEventListener(
      'click',
      () => {
        paginaActual--;
        cargarPaquetes();
      }
    );

  document
    .getElementById(
      'pagina-siguiente'
    )
    ?.addEventListener(
      'click',
      () => {
        paginaActual++;
        cargarPaquetes();
      }
    );
}

async function manejarAccion(
  evento
) {
  const boton =
    evento.currentTarget;

  const id =
    boton.dataset.id;

  if (
    boton.dataset.action === 'ver'
  ) {
    location.hash =
      `#/catalogo/paquetes/detalle?id=${id}`;

    return;
  }

  if (
    boton.dataset.action ===
    'editar'
  ) {
    location.hash =
      `#/catalogo/paquetes/formulario?id=${id}`;

    return;
  }

  if (
    boton.dataset.action ===
    'estado'
  ) {
    const activo =
      boton.dataset.activo === '1';

    const confirmar =
      window.confirm(
        activo
          ? '¿Desactivar este paquete?'
          : '¿Activar este paquete?'
      );

    if (!confirmar) return;

    try {
      await cambiarEstadoPaquete(
        id,
        !activo
      );

      showNotification(
        activo
          ? MENSAJES.PAQUETE_DESACTIVADO
          : MENSAJES.PAQUETE_ACTIVADO,
        { type: 'success' }
      );

      await cargarPaquetes();

    } catch (error) {
      showNotification(
        error.message,
        { type: 'error' }
      );
    }
  }
}

function aplicarFiltros() {
  const {
    filtroTexto,
    filtroComponente,
    filtroPrecioMin,
    filtroPrecioMax,
    filtroEstado
  } = obtenerElementos();

  filtros = {
    ...filtros,

    texto:
      filtroTexto.value.trim(),

    componente:
      filtroComponente.value,

    precioMin:
      filtroPrecioMin.value,

    precioMax:
      filtroPrecioMax.value,

    estado:
      puedeGestionar
        ? filtroEstado.value
        : '',

    soloActivos:
      !puedeGestionar,

    skip: 0
  };

  paginaActual = 1;

  cargarPaquetes();
}

function limpiarFiltros() {
  const {
    filtroTexto,
    filtroComponente,
    filtroPrecioMin,
    filtroPrecioMax,
    filtroEstado
  } = obtenerElementos();

  filtroTexto.value = '';
  filtroComponente.value = '';
  filtroPrecioMin.value = '';
  filtroPrecioMax.value = '';
  filtroEstado.value = '';

  filtros = {
    texto: '',
    componente: '',
    precioMin: '',
    precioMax: '',
    estado: '',
    soloActivos:
      !puedeGestionar,
    skip: 0,
    limit: 10
  };

  paginaActual = 1;

  cargarPaquetes();
}

export async function init() {
  if (!requireAuth()) return;

  renderNavegacionCatalogo();

  const session =
    getSession();

  if (
    !hasPermission(
      session,
      PERMISOS_CATALOGO.CONSULTAR
    )
  ) {
    obtenerElementos()
      .acceso
      .style.display =
        'flex';

    return;
  }

  puedeGestionar =
    hasPermission(
      session,
      PERMISOS_CATALOGO.PAQUETES_REGISTRAR
    ) ||
    hasPermission(
      session,
      PERMISOS_CATALOGO.PAQUETES_MODIFICAR
    ) ||
    hasPermission(
      session,
      PERMISOS_CATALOGO.PAQUETES_DESACTIVAR
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
      PERMISOS_CATALOGO.PAQUETES_REGISTRAR
    )
  ) {
    btnNuevo.style.display =
      'none';
  }

  if (!puedeGestionar) {
    grupoEstado.style.display =
      'none';

    colUltimaModificacion.style.display =
      'none';
  }

  await cargarPaquetes();

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
        '#/catalogo/paquetes/formulario';
    }
  );

  filtroTexto.addEventListener(
    'keydown',
    evento => {
      if (
        evento.key === 'Enter'
      ) {
        aplicarFiltros();
      }
    }
  );
}