import {
  listarListasPrecio,
  cambiarEstadoListaPrecio
} from '../../api/catalogo.service.js';

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
  renderNavegacionCatalogo
} from './catalogo-ui.js';

let paginaActual = 1;
let totalListas = 0;
let puedeGestionar = false;

let filtros = {
  texto: '',
  estado: '',
  soloActivos: false,
  skip: 0,
  limit: 10
};

function obtenerElementos() {
  return {
    contenido:
      document.getElementById(
        'precios-content'
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

    errorMensaje:
      document.getElementById(
        'error-mensaje'
      ),

    tbody:
      document.getElementById(
        'precios-tbody'
      ),

    cards:
      document.getElementById(
        'precios-cards'
      ),

    paginacion:
      document.getElementById(
        'paginacion'
      ),

    filtroTexto:
      document.getElementById(
        'filtro-texto'
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

    btnNueva:
      document.getElementById(
        'btn-nueva-lista'
      ),

    colUltimaModificacion:
      document.getElementById(
        'col-ultima-modificacion'
      )
  };
}

function formatoFecha(fecha) {
  if (!fecha) return '—';

  return new Date(fecha)
    .toLocaleDateString(
      'es-MX'
    );
}

function accionesLista(lista) {
  return `
    <button
      type="button"
      class="btn btn-sm btn-primary"
      data-action="ver"
      data-id="${lista.idListaPrecio}"
    >
      Ver
    </button>

    ${puedeGestionar ? `
      <button
        type="button"
        class="btn btn-sm btn-secondary"
        data-action="editar"
        data-id="${lista.idListaPrecio}"
      >
        Editar
      </button>

      <button
        type="button"
        class="btn btn-sm btn-secondary"
        data-action="estado"
        data-id="${lista.idListaPrecio}"
        data-activo="${lista.activo}"
      >
        ${lista.activo
          ? 'Desactivar'
          : 'Activar'}
      </button>
    ` : ''}
  `;
}

function renderTabla(listas) {
  const { tbody } =
    obtenerElementos();

  tbody.innerHTML =
    listas.map(
      lista => `
        <tr>
          <td>${lista.nombre}</td>

          <td>
            ${formatoFecha(
              lista.vigenciaInicio
            )}
          </td>

          <td>
            ${formatoFecha(
              lista.vigenciaFin
            )}
          </td>

          <td>
            <span class="catalogo-badge ${
              lista.activo
                ? 'estado-activo'
                : 'estado-inactivo'
            }">
              ${lista.activo
                ? 'Activo'
                : 'Inactivo'}
            </span>
          </td>

          ${puedeGestionar ? `
            <td>
              ${formatoFecha(
                lista.fechaModificacion
              )}
            </td>
          ` : ''}

          <td>
            <div class="catalogo-table-actions">
              ${accionesLista(lista)}
            </div>
          </td>
        </tr>
      `
    ).join('');
}

function renderCards(listas) {
  const { cards } =
    obtenerElementos();

  cards.innerHTML =
    listas.map(
      lista => `
        <article class="catalogo-card">

          <div class="catalogo-card-content">

            <h3 class="catalogo-card-title">
              ${lista.nombre}
            </h3>

            <div class="catalogo-card-info">

              <div class="catalogo-card-info-item">
                <span class="catalogo-card-info-label">
                  Inicio
                </span>
                <span>
                  ${formatoFecha(
                    lista.vigenciaInicio
                  )}
                </span>
              </div>

              <div class="catalogo-card-info-item">
                <span class="catalogo-card-info-label">
                  Fin
                </span>
                <span>
                  ${formatoFecha(
                    lista.vigenciaFin
                  )}
                </span>
              </div>

              <div class="catalogo-card-info-item">
                <span class="catalogo-card-info-label">
                  Estado
                </span>
                <span>
                  ${lista.activo
                    ? 'Activo'
                    : 'Inactivo'}
                </span>
              </div>

            </div>

          </div>

          <div class="catalogo-card-actions">
            ${accionesLista(lista)}
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

async function cargarListas() {
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
      await listarListasPrecio(
        filtros
      );

    totalListas =
      resultado.total;

    cargando.style.display = 'none';

    if (
      resultado.items.length === 0
    ) {
      vacio.style.display =
        'block';
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
    cargando.style.display =
      'none';

    error.style.display =
      'flex';

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
      totalListas /
      filtros.limit
    );

  if (totalPaginas <= 1) {
    paginacion.innerHTML = '';
    return;
  }

  paginacion.innerHTML = `
    <div class="catalogo-pagination">

      <button
        id="pagina-anterior"
        type="button"
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
        id="pagina-siguiente"
        type="button"
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
        cargarListas();
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
        cargarListas();
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
      `#/catalogo/precios/detalle?id=${id}`;

    return;
  }

  if (
    boton.dataset.action ===
    'editar'
  ) {
    location.hash =
      `#/catalogo/precios/formulario?id=${id}`;

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
          ? '¿Desactivar esta lista de precios?'
          : '¿Activar esta lista de precios?'
      );

    if (!confirmar) return;

    await cambiarEstadoListaPrecio(
      id,
      !activo
    );

    showNotification(
      activo
        ? 'Lista de precios desactivada.'
        : 'Lista de precios activada.',
      { type: 'success' }
    );

    await cargarListas();
  }
}

function aplicarFiltros() {
  const {
    filtroTexto,
    filtroEstado
  } = obtenerElementos();

  filtros = {
    ...filtros,

    texto:
      filtroTexto.value.trim(),

    estado:
      puedeGestionar
        ? filtroEstado.value
        : '',

    soloActivos:
      !puedeGestionar,

    skip: 0
  };

  paginaActual = 1;

  cargarListas();
}

function limpiarFiltros() {
  const {
    filtroTexto,
    filtroEstado
  } = obtenerElementos();

  filtroTexto.value = '';
  filtroEstado.value = '';

  filtros = {
    texto: '',
    estado: '',
    soloActivos:
      !puedeGestionar,
    skip: 0,
    limit: 10
  };

  paginaActual = 1;

  cargarListas();
}

export async function init() {
  if (!requireAuth()) return;

  renderNavegacionCatalogo();

  const session =
    getSession();

  puedeGestionar =
    hasPermission(
      session,
      PERMISOS_CATALOGO.PRECIOS_GESTIONAR
    );

  filtros.soloActivos =
    !puedeGestionar;

  const {
    btnNueva,
    grupoEstado,
    colUltimaModificacion,
    btnFiltrar,
    btnLimpiar,
    filtroTexto
  } = obtenerElementos();

  if (!puedeGestionar) {
    btnNueva.style.display =
      'none';

    grupoEstado.style.display =
      'none';

    colUltimaModificacion.style.display =
      'none';
  }

  await cargarListas();

  btnNueva.addEventListener(
    'click',
    () => {
      location.hash =
        '#/catalogo/precios/formulario';
    }
  );

  btnFiltrar.addEventListener(
    'click',
    aplicarFiltros
  );

  btnLimpiar.addEventListener(
    'click',
    limpiarFiltros
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