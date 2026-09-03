import {
  consultarExistenciasInventario
} from '../../api/inventario.service.js';

import {
  getSession
} from '../../shared/auth-guard.js';

import {
  hasPermission
} from '../../shared/permissions.js';

import {
  escapeHtml
} from '../../shared/formatters.js';

const ROOT_ID =
  'existencia-detalle-root';

const PERMISOS = {
  CONSULTAR:
    'inventario.consultar',

  OPERATIVO:
    'inventario.existencias.operativas.consultar',

  INACTIVOS:
    'inventario.existencias.inactivos.consultar',

  DISPONIBILIDAD:
    'inventario.disponibilidad.consultar',

  ALERTAS:
    'inventario.alertas.consultar'
};

/**
 * Obtiene el elemento raíz.
 *
 * @returns {HTMLElement|null}
 */
function obtenerRoot() {
  return document.getElementById(
    ROOT_ID
  );
}

/**
 * Valida un permiso efectivo.
 *
 * @param {string} permiso
 * @returns {boolean}
 */
function puede(permiso) {
  return hasPermission(
    getSession(),
    permiso
  );
}

/**
 * Obtiene el producto enviado
 * mediante el hash.
 *
 * @returns {number|null}
 */
function obtenerIdProducto() {
  const query =
    new URLSearchParams(
      window.location.hash
        .split('?')[1] ||
        ''
    );

  const idProducto =
    Number(
      query.get(
        'idProducto'
      )
    );

  return (
    Number.isInteger(
      idProducto
    ) &&
    idProducto > 0
  )
    ? idProducto
    : null;
}

/**
 * Formatea una fecha.
 *
 * @param {string|null} fecha
 * @returns {string}
 */
function formatearFecha(fecha) {
  if (!fecha) {
    return '—';
  }

  const valor =
    new Date(fecha);

  if (
    Number.isNaN(
      valor.getTime()
    )
  ) {
    return '—';
  }

  return new Intl.DateTimeFormat(
    'es-MX',
    {
      dateStyle: 'short',
      timeStyle: 'short'
    }
  ).format(valor);
}

/**
 * Obtiene la etiqueta
 * correspondiente al nivel.
 *
 * @param {string} nivel
 * @returns {string}
 */
function etiquetaNivel(nivel) {
  switch (nivel) {
    case 'BAJO_MINIMO':
      return 'Bajo mínimo';

    case 'EN_RANGO':
      return 'En rango';

    case 'SOBRE_MAXIMO':
      return 'Sobre máximo';

    case 'SIN_CONFIGURAR':
      return 'Sin configurar';

    default:
      return '—';
  }
}

/**
 * Construye un dato etiqueta/valor.
 *
 * @param {string} etiqueta
 * @param {*} valor
 * @returns {string}
 */
function dato(
  etiqueta,
  valor
) {
  return `
    <div
      class="
        inventario-existencia-detalle-dato
      "
    >
      <span>
        ${escapeHtml(
          etiqueta
        )}
      </span>

      <strong>
        ${escapeHtml(
          String(
            valor ?? '—'
          )
        )}
      </strong>
    </div>
  `;
}

/**
 * Construye las acciones
 * disponibles para el producto.
 *
 * @param {Object} item
 * @returns {string}
 */
function acciones(item) {
  const enlaces = [];

  if (
    puede(
      PERMISOS.DISPONIBILIDAD
    )
  ) {
    enlaces.push(`
      <a
        class="
          button
          button-secondary
        "
        href="#/inventario/disponibilidad-futura?idProducto=${item.idProducto}&origen=existencia-detalle"
      >
        Disponibilidad futura
      </a>
    `);
  }

  if (
    puede(
      PERMISOS.ALERTAS
    )
  ) {
    enlaces.push(`
      <a
        class="
          button
          button-secondary
        "
        href="#/inventario/alertas?idProducto=${item.idProducto}&origen=existencia-detalle"
      >
        Ver alertas
      </a>
    `);
  }

  return enlaces.join('');
}

/**
 * Construye el contenido provisional
 * de Detalle de existencia.
 *
 * @param {Object} item
 * @returns {string}
 */
function renderizarDetalle(item) {
  const datosComerciales = [
    dato(
      'Unidad de medida',
      item.unidadMedida
    ),

    dato(
      'Cantidad disponible',
      item.cantidadDisponible
    ),

    dato(
      'Disponibilidad',
      item.estadoDisponibilidad ===
        'DISPONIBLE'
        ? 'Disponible'
        : 'No disponible'
    ),

    dato(
      'Nivel',
      etiquetaNivel(
        item.nivel
      )
    )
  ].join('');

  const datosOperativos =
    puede(
      PERMISOS.OPERATIVO
    )
      ? `
        <section
          class="
            card
            inventario-existencia-detalle-seccion
          "
        >
          <h2>
            Información operativa
          </h2>

          <div
            class="
              inventario-existencia-detalle-grid
            "
          >
            ${dato(
              'Existencia registrada',
              item.cantidadRegistrada
            )}

            ${dato(
              'Cantidad reservada',
              item.cantidadReservada
            )}

            ${dato(
              'Mínimo',
              item.stockMinimo ?? '—'
            )}

            ${dato(
              'Máximo',
              item.stockMaximo ?? '—'
            )}

            ${dato(
              'Última actualización',
              formatearFecha(
                item.fechaActualizacion
              )
            )}

            ${dato(
              'Identificador de inventario',
              item.idInventario ?? '—'
            )}
          </div>
        </section>
      `
      : '';

  const imagen =
    item.imagenUrl
      ? `
        <img
          class="
            inventario-existencia-detalle-imagen
          "
          src="${escapeHtml(
            item.imagenUrl
          )}"
          alt="Imagen de ${escapeHtml(
            item.nombre
          )}"
        >
      `
      : '';

  return `
    <header
      class="
        inventario-page-header
      "
    >
      <div>
        <h1>
          Detalle de existencia
        </h1>

        <p
          class="
            inventario-page-description
          "
        >
          Vista provisional para
          presentar la existencia del
          producto seleccionado.
        </p>
      </div>

      <a
        class="
          button
          button-secondary
        "
        href="#/inventario/existencias?idProducto=${item.idProducto}&origen=detalle"
      >
        Volver a existencias
      </a>
    </header>

    <section
      class="
        card
        inventario-existencia-detalle-producto
      "
    >
      ${imagen}

      <div>
        <span
          class="
            inventario-existencia-detalle-codigo
          "
        >
          ${escapeHtml(
            item.codigo ||
            '—'
          )}
        </span>

        <h2>
          ${escapeHtml(
            item.nombre ||
            '—'
          )}
        </h2>

        <p>
          ${escapeHtml(
            item.descripcion ||
            'Sin descripción disponible.'
          )}
        </p>

        ${
          item.activo === false
            ? `
              <span
                class="
                  inventario-existencias-inactivo
                "
              >
                Producto inactivo
              </span>
            `
            : ''
        }
      </div>
    </section>

    <section
      class="
        card
        inventario-existencia-detalle-seccion
      "
    >
      <h2>
        Disponibilidad actual
      </h2>

      <div
        class="
          inventario-existencia-detalle-grid
        "
      >
        ${datosComerciales}
      </div>
    </section>

    ${datosOperativos}

    <div
      class="
        inventario-form-actions
        inventario-existencia-detalle-acciones
      "
    >
      ${acciones(item)}
    </div>
  `;
}

/**
 * Presenta un error.
 *
 * @param {HTMLElement} root
 * @param {string} mensaje
 */
function renderizarError(
  root,
  mensaje
) {
  root.innerHTML = `
    <header
      class="
        inventario-page-header
      "
    >
      <div>
        <h1>
          Detalle de existencia
        </h1>
      </div>

      <a
        class="
          button
          button-secondary
        "
        href="#/inventario/existencias"
      >
        Volver a existencias
      </a>
    </header>

    <div
      class="
        inventario-state
        inventario-state-error
      "
      role="alert"
    >
      ${escapeHtml(
        mensaje
      )}
    </div>
  `;
}

/**
 * Inicializa el cascarón
 * Detalle de existencia.
 */
export async function initExistenciaDetalle() {
  const root =
    obtenerRoot();

  if (!root) {
    return;
  }

  if (
    !puede(
      PERMISOS.CONSULTAR
    )
  ) {
    renderizarError(
      root,
      'No tiene permisos para consultar existencias de inventario.'
    );

    root.setAttribute(
      'aria-busy',
      'false'
    );

    return;
  }

  const idProducto =
    obtenerIdProducto();

  if (!idProducto) {
    renderizarError(
      root,
      'No se recibió un producto válido para consultar.'
    );

    root.setAttribute(
      'aria-busy',
      'false'
    );

    return;
  }

  try {
    /*
     * Se utiliza la misma consulta
     * y por lo tanto el mismo origen
     * mock de Consulta de existencias.
     */
    const resultado =
    await consultarExistenciasInventario({
      idProducto,
      mostrarInactivos:
        puede(
          PERMISOS.INACTIVOS
        ),
      skip: 0,
      limit: 1
    });

    const item =
      resultado.items?.[0];

    if (!item) {
      renderizarError(
        root,
        'No se encontró información de existencia para el producto seleccionado.'
      );

      return;
    }

    root.innerHTML =
      renderizarDetalle(
        item
      );
  } catch (error) {
    renderizarError(
      root,
      error?.message ||
        'No fue posible cargar el detalle de existencia.'
    );
  } finally {
    root.setAttribute(
      'aria-busy',
      'false'
    );
  }
}