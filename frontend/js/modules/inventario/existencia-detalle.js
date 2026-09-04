import {
  consultarExistenciasInventario
} from '../../api/inventario.service.js';

import {
  consultarReservasInventario,
  ESTADOS_RESERVA
} from '../../api/inventario-reservas.service.js';

import {
  consultarMovimientosInventario
} from '../../api/inventario-movimientos.service.js';

import {
  consultarAlertasInventario,
  TIPOS_ALERTA_INVENTARIO
} from '../../api/inventario-alertas.service.js';

import {
  getSession
} from '../../shared/auth-guard.js';

import {
  hasAnyRole,
  hasPermission
} from '../../shared/permissions.js';

import {
  escapeHtml
} from '../../shared/formatters.js';

const ROOT_ID =
  'existencia-detalle-root';

const LIMITE_RESERVAS = 5;
const LIMITE_MOVIMIENTOS = 5;

const PERMISOS = {
  CONSULTAR:
    'inventario.consultar',

  OPERATIVO:
    'inventario.existencias.operativas.consultar',

  INACTIVOS:
    'inventario.existencias.inactivos.consultar',

  DISPONIBILIDAD:
    'inventario.disponibilidad.consultar',

  RESERVAS:
    'inventario.reservas.consultar',

  MOVIMIENTOS:
    'inventario.movimientos.consultar',

  ALERTAS:
    'inventario.alertas.consultar',

  GESTIONAR:
    'inventario.gestionar',

  CORTES:
    'inventario.cortes.consultar'
};

let secuenciaCarga = 0;

function obtenerRoot() {
  return document.getElementById(
    ROOT_ID
  );
}

function sesionActual() {
  return getSession();
}

function puede(permiso) {
  return hasPermission(
    sesionActual(),
    permiso
  );
}

function tieneRol(rol) {
  return hasAnyRole(
    sesionActual(),
    [rol]
  );
}

function parametrosHash() {
  return new URLSearchParams(
    window.location.hash
      .split('?')[1] ||
    ''
  );
}

function obtenerIdParametro(
  nombre
) {
  const id =
    Number(
      parametrosHash()
        .get(nombre)
    );

  return (
    Number.isInteger(id) &&
    id > 0
  )
    ? id
    : null;
}

function accesoTecnicoContextual() {
  return (
    tieneRol('TECH') &&
    obtenerIdParametro(
      'idOrden'
    ) !== null &&
    obtenerIdParametro(
      'idProducto'
    ) !== null
  );
}

function esOperativo() {
  return puede(
    PERMISOS.OPERATIVO
  );
}

function valorSeguro(valor) {
  return escapeHtml(
    valor === null ||
    valor === undefined ||
    valor === ''
      ? 'No disponible'
      : String(valor)
  );
}

function formatearFechaHora(
  valor
) {
  if (!valor) {
    return 'No disponible';
  }

  const fecha =
    new Date(valor);

  if (
    Number.isNaN(
      fecha.getTime()
    )
  ) {
    return 'No disponible';
  }

  return new Intl.DateTimeFormat(
    'es-MX',
    {
      dateStyle: 'short',
      timeStyle: 'short'
    }
  ).format(fecha);
}

function formatearFecha(valor) {
  if (!valor) {
    return 'No disponible';
  }

  const fecha =
    new Date(
      `${String(valor)
        .slice(0, 10)}T12:00:00`
    );

  if (
    Number.isNaN(
      fecha.getTime()
    )
  ) {
    return 'No disponible';
  }

  return new Intl.DateTimeFormat(
    'es-MX',
    {
      dateStyle: 'short'
    }
  ).format(fecha);
}

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
      return 'No disponible';
  }
}

function claseNivel(nivel) {
  switch (nivel) {
    case 'BAJO_MINIMO':
      return (
        'inventario-existencia-detalle-condicion-peligro'
      );

    case 'EN_RANGO':
      return (
        'inventario-existencia-detalle-condicion-correcta'
      );

    case 'SOBRE_MAXIMO':
      return (
        'inventario-existencia-detalle-condicion-advertencia'
      );

    default:
      return (
        'inventario-existencia-detalle-condicion-neutra'
      );
  }
}

function claseReserva(estado) {
  return estado ===
    ESTADOS_RESERVA.ACTIVA
    ? 'inventario-reservas-estado-activa'
    : 'inventario-reservas-estado-confirmada';
}

function etiquetaReserva(
  estado
) {
  return estado ===
    ESTADOS_RESERVA.ACTIVA
    ? 'ACTIVA'
    : 'CONFIRMADA';
}

function claseMovimiento(
  tipo
) {
  switch (tipo) {
    case 'ENTRADA':
      return (
        'inventario-movimientos-tipo-entrada'
      );

    case 'SALIDA':
      return (
        'inventario-movimientos-tipo-salida'
      );

    case 'AJUSTE':
      return (
        'inventario-movimientos-tipo-ajuste'
      );

    default:
      return '';
  }
}

function etiquetaAlerta(
  tipo
) {
  switch (tipo) {
    case TIPOS_ALERTA_INVENTARIO
      .MINIMO:
      return 'Bajo mínimo';

    case TIPOS_ALERTA_INVENTARIO
      .MAXIMO:
      return 'Sobre máximo';

    case TIPOS_ALERTA_INVENTARIO
      .CONFIGURACION_INCONSISTENTE:
      return (
        'Configuración inconsistente'
      );

    default:
      return 'Alerta vigente';
  }
}

function construirRutaRegreso() {
  const entrada =
    parametrosHash();

  const salida =
    new URLSearchParams();

  [
    'texto',
    'disponibilidad',
    'nivel',
    'estadoProducto',
    'mostrarInactivos',
    'skip'
  ].forEach(
    nombre => {
      const valor =
        entrada.get(nombre);

      if (
        valor !== null &&
        valor !== ''
      ) {
        salida.set(
          nombre,
          valor
        );
      }
    }
  );

  const query =
    salida.toString();

  return (
    '#/inventario/existencias' +
    (
      query
        ? `?${query}`
        : ''
    )
  );
}

function crearTarjetaResumen(
  etiqueta,
  valor,
  clase = ''
) {
  return `
    <article
      class="
        card
        inventario-existencia-detalle-resumen-card
        ${clase}
      "
    >
      <span>
        ${valorSeguro(
          etiqueta
        )}
      </span>

      <strong>
        ${valorSeguro(
          valor
        )}
      </strong>
    </article>
  `;
}

function crearResumen(item) {
  const tarjetas = [];

  if (esOperativo()) {
    tarjetas.push(
      crearTarjetaResumen(
        'Existencia registrada',
        item.cantidadRegistrada
      )
    );
  }

  tarjetas.push(
    crearTarjetaResumen(
      'Comprometido',
      item.cantidadReservada,
      'inventario-existencia-detalle-resumen-comprometida'
    )
  );

  tarjetas.push(
    crearTarjetaResumen(
      'Disponible',
      item.cantidadDisponible,
      'inventario-existencia-detalle-resumen-disponible'
    )
  );

  if (esOperativo()) {
    tarjetas.push(
      crearTarjetaResumen(
        'Mínimo',
        item.stockMinimo
      )
    );

    tarjetas.push(
      crearTarjetaResumen(
        'Máximo',
        item.stockMaximo
      )
    );

    tarjetas.push(`
      <article
        class="
          card
          inventario-existencia-detalle-resumen-card
        "
      >
        <span>
          Condición
        </span>

        <strong
          class="
            inventario-existencia-detalle-condicion
            ${claseNivel(
              item.nivel
            )}
          "
        >
          ${valorSeguro(
            etiquetaNivel(
              item.nivel
            )
          )}
        </strong>
      </article>
    `);
  }

  return tarjetas.join('');
}

function crearAcciones(item) {
  const acciones = [];

  if (
    puede(
      PERMISOS.DISPONIBILIDAD
    )
  ) {
    acciones.push(`
      <a
        class="
          button
          button-secondary
        "
        href="#/inventario/disponibilidad-futura?idProducto=${item.idProducto}&origen=existencia-detalle"
      >
        Consultar disponibilidad futura
      </a>
    `);
  }

  if (
    puede(
      PERMISOS.RESERVAS
    )
  ) {
    acciones.push(`
      <a
        class="
          button
          button-secondary
        "
        href="#/inventario/reservas?idProducto=${item.idProducto}&origen=existencia-detalle"
      >
        Consultar reservaciones
      </a>
    `);
  }

  if (
    esOperativo() &&
    puede(
      PERMISOS.MOVIMIENTOS
    )
  ) {
    acciones.push(`
      <a
        class="
          button
          button-secondary
        "
        href="#/inventario/movimientos?idProducto=${item.idProducto}&origen=existencia-detalle"
      >
        Consultar movimientos
      </a>
    `);
  }

  if (
    esOperativo() &&
    puede(
      PERMISOS.ALERTAS
    )
  ) {
    acciones.push(`
      <a
        class="
          button
          button-secondary
        "
        href="#/inventario/alertas?idProducto=${item.idProducto}&origen=existencia-detalle"
      >
        Ver alerta
      </a>
    `);
  }

  if (
    esOperativo() &&
    puede(
      PERMISOS.GESTIONAR
    )
  ) {
    acciones.push(`
      <a
        class="
          button
          button-secondary
        "
        href="#/inventario/limites?idProducto=${item.idProducto}&origen=existencia-detalle"
      >
        Configurar límites
      </a>
    `);

    acciones.push(`
      <a
        class="
          button
          button-secondary
        "
        href="#/inventario/registro-entrada?idProducto=${item.idProducto}&origen=existencia-detalle"
      >
        Registrar entrada
      </a>
    `);

    acciones.push(`
      <a
        class="
          button
          button-secondary
        "
        href="#/inventario/ajuste-autorizado?idProducto=${item.idProducto}&origen=existencia-detalle"
      >
        Registrar ajuste autorizado
      </a>
    `);
  }

  if (
    esOperativo() &&
    puede(
      PERMISOS.CORTES
    )
  ) {
    acciones.push(`
      <a
        class="
          button
          button-secondary
        "
        href="#/inventario/cortes-fisicos?idProducto=${item.idProducto}&origen=existencia-detalle"
      >
        Consultar corte físico
      </a>
    `);
  }

  return acciones.join('');
}

function renderizarPrincipal(
  item
) {
  const root =
    obtenerRoot();

  const imagen =
    item.imagenUrl
      ? `
        <img
          class="
            inventario-existencia-detalle-imagen
          "
          src="${valorSeguro(
            item.imagenUrl
          )}"
          alt="Imagen de ${valorSeguro(
            item.nombre
          )}"
        >
      `
      : `
        <div
          class="
            inventario-existencia-detalle-imagen
            inventario-existencia-detalle-imagen-vacia
          "
          role="img"
          aria-label="Producto sin imagen"
        >
          Sin imagen
        </div>
      `;

  const operativo =
    esOperativo()
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
              inventario-existencia-detalle-lista-datos
            "
          >
            <div>
              <span>
                Existencia registrada
              </span>
              <strong>
                ${valorSeguro(
                  item.cantidadRegistrada
                )}
              </strong>
            </div>

            <div>
              <span>
                Comprometido
                (CONFIRMADA + ACTIVA)
              </span>
              <strong>
                ${valorSeguro(
                  item.cantidadReservada
                )}
              </strong>
            </div>

            <div>
              <span>
                Disponible
              </span>
              <strong>
                ${valorSeguro(
                  item.cantidadDisponible
                )}
              </strong>
            </div>
          </div>
        </section>
      `
      : '';

  const movimientos =
    esOperativo() &&
    puede(
      PERMISOS.MOVIMIENTOS
    )
      ? `
        <section
          class="
            card
            inventario-existencia-detalle-seccion
          "
        >
          <div
            class="
              inventario-existencia-detalle-seccion-header
            "
          >
            <h2>
              Movimientos recientes
            </h2>

            <a
              class="
                inventario-existencia-detalle-link
              "
              href="#/inventario/movimientos?idProducto=${item.idProducto}&origen=existencia-detalle"
            >
              Ver todos
            </a>
          </div>

          <div
            id="existencia-detalle-movimientos"
            class="
              inventario-existencia-detalle-seccion-contenido
            "
            aria-live="polite"
          >
            <div
              class="inventario-state"
            >
              Cargando movimientos...
            </div>
          </div>
        </section>
      `
      : '';

  const alerta =
    esOperativo() &&
    puede(
      PERMISOS.ALERTAS
    )
      ? `
        <section
          class="
            card
            inventario-existencia-detalle-seccion
          "
        >
          <div
            class="
              inventario-existencia-detalle-seccion-header
            "
          >
            <h2>
              Alerta vigente
            </h2>

            <a
              class="
                inventario-existencia-detalle-link
              "
              href="#/inventario/alertas?idProducto=${item.idProducto}&origen=existencia-detalle"
            >
              Ver alertas
            </a>
          </div>

          <div
            id="existencia-detalle-alerta"
            class="
              inventario-existencia-detalle-seccion-contenido
            "
            aria-live="polite"
          >
            <div
              class="inventario-state"
            >
              Cargando alerta...
            </div>
          </div>
        </section>
      `
      : '';

  const actualizacion =
    esOperativo()
      ? `
        <section
          class="
            card
            inventario-existencia-detalle-seccion
          "
        >
          <h2>
            Actualización
          </h2>

          <div
            class="
              inventario-existencia-detalle-lista-datos
            "
          >
            <div>
              <span>
                Última actualización
              </span>
              <strong>
                ${valorSeguro(
                  formatearFechaHora(
                    item.fechaActualizacion
                  )
                )}
              </strong>
            </div>

            <div>
              <span>
                Almacén
              </span>
              <strong>
                ${valorSeguro(
                  item.almacen ||
                  'Almacén Central'
                )}
              </strong>
            </div>
          </div>
        </section>
      `
      : '';

  const acciones =
    crearAcciones(item);

  root.innerHTML = `
    <header
      class="
        inventario-page-header
      "
    >
      <div>
        <a
          class="
            button
            button-secondary
          "
          href="${construirRutaRegreso()}"
        >
          Volver a Consulta de existencias
        </a>

        <h1>
          Detalle de existencia por producto
        </h1>

        <p
          class="
            inventario-page-description
          "
        >
          Situación actual y compromisos
          del producto seleccionado.
        </p>
      </div>

      <div
        class="
          inventario-existencia-detalle-actualizacion
        "
      >
        <span>
          Última actualización
        </span>

        <strong>
          ${valorSeguro(
            formatearFechaHora(
              item.fechaActualizacion
            )
          )}
        </strong>
      </div>
    </header>

    <div
      class="
        inventario-existencia-detalle-superior
      "
    >
      <section
        class="
          card
          inventario-existencia-detalle-producto
        "
      >
        ${imagen}

        <div
          class="
            inventario-existencia-detalle-producto-info
          "
        >
          <div
            class="
              inventario-existencia-detalle-producto-cabecera
            "
          >
            <div>
              <span
                class="
                  inventario-existencia-detalle-codigo
                "
              >
                ${valorSeguro(
                  item.codigo
                )}
              </span>

              <h2>
                ${valorSeguro(
                  item.nombre
                )}
              </h2>
            </div>

            <span
              class="
                inventario-existencia-detalle-estado-producto
                ${
                  item.activo
                    ? 'inventario-existencia-detalle-estado-activo'
                    : 'inventario-existencia-detalle-estado-inactivo'
                }
              "
            >
              ${
                item.activo
                  ? 'Activo'
                  : 'Inactivo'
              }
            </span>
          </div>

          <p>
            ${valorSeguro(
              item.descripcion ||
              'Sin descripción disponible.'
            )}
          </p>

          <dl
            class="
              inventario-existencia-detalle-producto-datos
            "
          >
            <div>
              <dt>
                Unidad de medida
              </dt>
              <dd>
                ${valorSeguro(
                  item.unidadMedida
                )}
              </dd>
            </div>

            <div>
              <dt>
                Almacén
              </dt>
              <dd>
                ${valorSeguro(
                  item.almacen ||
                  'Almacén Central'
                )}
              </dd>
            </div>
          </dl>
        </div>
      </section>

      ${operativo}
    </div>

    <section
      class="
        inventario-existencia-detalle-resumen
      "
    >
      ${crearResumen(item)}
    </section>

    ${
      puede(
        PERMISOS.RESERVAS
      )
        ? `
          <section
            class="
              card
              inventario-existencia-detalle-seccion
            "
          >
            <div
              class="
                inventario-existencia-detalle-seccion-header
              "
            >
              <h2>
                Reservaciones actuales
                y próximas
              </h2>

              <a
                class="
                  inventario-existencia-detalle-link
                "
                href="#/inventario/reservas?idProducto=${item.idProducto}&origen=existencia-detalle"
              >
                Ver todas
              </a>
            </div>

            <div
              id="existencia-detalle-reservas"
              class="
                inventario-existencia-detalle-seccion-contenido
              "
              aria-live="polite"
            >
              <div
                class="inventario-state"
              >
                Cargando reservaciones...
              </div>
            </div>
          </section>
        `
        : ''
    }

    <div
      class="
        inventario-existencia-detalle-contenido
      "
    >
      ${movimientos}

      <div
        class="
          inventario-existencia-detalle-lateral
        "
      >
        ${alerta}
        ${actualizacion}
      </div>
    </div>

    ${
      acciones
        ? `
          <section
            class="
              card
              inventario-existencia-detalle-seccion
            "
          >
            <h2>
              Acciones permitidas
            </h2>

            <div
              class="
                inventario-form-actions
                inventario-existencia-detalle-acciones
              "
            >
              ${acciones}
            </div>
          </section>
        `
        : ''
    }
  `;
}

function renderizarErrorPrincipal(
  mensaje
) {
  const root =
    obtenerRoot();

  root.innerHTML = `
    <header
      class="
        inventario-page-header
      "
    >
      <div>
        <h1>
          Detalle de existencia por producto
        </h1>
      </div>

      <a
        class="
          button
          button-secondary
        "
        href="${construirRutaRegreso()}"
      >
        Volver a Consulta de existencias
      </a>
    </header>

    <div
      class="
        inventario-state
        inventario-state-error
      "
      role="alert"
    >
      ${valorSeguro(
        mensaje
      )}
    </div>
  `;
}

function renderizarErrorSeccion(
  id,
  mensaje
) {
  const destino =
    document.getElementById(id);

  if (!destino) {
    return;
  }

  destino.innerHTML = `
    <div
      class="
        inventario-state
        inventario-state-error
      "
      role="alert"
    >
      ${valorSeguro(
        mensaje
      )}
    </div>
  `;
}

async function cargarReservas(
  idProducto,
  secuencia
) {
  const destino =
    document.getElementById(
      'existencia-detalle-reservas'
    );

  if (!destino) {
    return;
  }

  try {
    const resultado =
      await consultarReservasInventario({
        idProducto,
        skip: 0,
        limit: 100
      });

    if (
      secuencia !==
      secuenciaCarga
    ) {
      return;
    }

    const items =
      (
        resultado.items || []
      )
        .filter(
          item =>
            item.estado ===
              ESTADOS_RESERVA
                .CONFIRMADA ||
            item.estado ===
              ESTADOS_RESERVA
                .ACTIVA
        )
        .slice(
          0,
          LIMITE_RESERVAS
        );

    if (!items.length) {
      destino.innerHTML = `
        <div
          class="inventario-state"
        >
          Sin reservaciones vigentes
          o próximas.
        </div>
      `;

      return;
    }

    const total =
      items.reduce(
        (suma, item) =>
          suma +
          Number(
            item.cantidadReservada ||
            0
          ),
        0
      );

    destino.innerHTML = `
      <div
        class="
          inventario-existencia-detalle-tabla-wrap
        "
      >
        <table>
          <thead>
            <tr>
              <th>
                Orden de servicio
              </th>
              <th>
                Estado
              </th>
              <th>
                Periodo de uso
              </th>
              <th>
                Cantidad
              </th>
            </tr>
          </thead>

          <tbody>
            ${
              items.map(
                item => `
                  <tr>
                    <td>
                      ${valorSeguro(
                        item.folioOrden
                      )}
                    </td>

                    <td>
                      <span
                        class="
                          inventario-reservas-estado-badge
                          ${claseReserva(
                            item.estado
                          )}
                        "
                      >
                        ${etiquetaReserva(
                          item.estado
                        )}
                      </span>
                    </td>

                    <td>
                      ${valorSeguro(
                        `${formatearFecha(
                          item.fechaEntrega
                        )} - ${formatearFecha(
                          item.fechaRecoleccion
                        )}`
                      )}
                    </td>

                    <td>
                      ${valorSeguro(
                        item.cantidadReservada
                      )}
                    </td>
                  </tr>
                `
              ).join('')
            }
          </tbody>
        </table>
      </div>

      <div
        class="
          inventario-existencia-detalle-total
        "
      >
        <span>
          Total mostrado comprometido
        </span>

        <strong>
          ${valorSeguro(total)}
        </strong>
      </div>
    `;
  } catch (error) {
    if (
      secuencia ===
      secuenciaCarga
    ) {
      renderizarErrorSeccion(
        'existencia-detalle-reservas',
        error?.message ||
        'No fue posible consultar las reservaciones.'
      );
    }
  }
}

async function cargarMovimientos(
  idProducto,
  secuencia
) {
  const destino =
    document.getElementById(
      'existencia-detalle-movimientos'
    );

  if (!destino) {
    return;
  }

  try {
    const resultado =
      await consultarMovimientosInventario({
        idProducto,
        skip: 0,
        limit:
          LIMITE_MOVIMIENTOS
      });

    if (
      secuencia !==
      secuenciaCarga
    ) {
      return;
    }

    const items =
      resultado.items || [];

    if (!items.length) {
      destino.innerHTML = `
        <div
          class="inventario-state"
        >
          Sin movimientos recientes.
        </div>
      `;

      return;
    }

    destino.innerHTML = `
      <div
        class="
          inventario-existencia-detalle-tabla-wrap
        "
      >
        <table>
          <thead>
            <tr>
              <th>Fecha</th>
              <th>Tipo</th>
              <th>Cantidad</th>
              <th>Sentido</th>
              <th>Existencia</th>
              <th>Referencia</th>
            </tr>
          </thead>

          <tbody>
            ${
              items.map(
                item => `
                  <tr>
                    <td>
                      ${valorSeguro(
                        formatearFechaHora(
                          item.fecha
                        )
                      )}
                    </td>

                    <td>
                      <span
                        class="
                          inventario-movimientos-tipo
                          ${claseMovimiento(
                            item.tipo
                          )}
                        "
                      >
                        ${valorSeguro(
                          item.tipo
                        )}
                      </span>
                    </td>

                    <td>
                      ${valorSeguro(
                        item.cantidad
                      )}
                    </td>

                    <td>
                      ${valorSeguro(
                        item.sentido
                      )}
                    </td>

                    <td>
                      ${valorSeguro(
                        item.existenciaResultante
                      )}
                    </td>

                    <td>
                      ${valorSeguro(
                        item.folioOrden ||
                        item.folioCorte ||
                        item.folio
                      )}
                    </td>
                  </tr>
                `
              ).join('')
            }
          </tbody>
        </table>
      </div>

      <p
        class="
          inventario-existencia-detalle-nota
        "
      >
        Mostrando los
        ${items.length}
        movimientos más recientes.
      </p>
    `;
  } catch (error) {
    if (
      secuencia ===
      secuenciaCarga
    ) {
      renderizarErrorSeccion(
        'existencia-detalle-movimientos',
        error?.message ||
        'No fue posible consultar los movimientos.'
      );
    }
  }
}

async function cargarAlerta(
  idProducto,
  secuencia
) {
  const destino =
    document.getElementById(
      'existencia-detalle-alerta'
    );

  if (!destino) {
    return;
  }

  try {
    const resultado =
      await consultarAlertasInventario({
        idProducto,
        skip: 0,
        limit: 1
      });

    if (
      secuencia !==
      secuenciaCarga
    ) {
      return;
    }

    const alerta =
      resultado.items?.[0] ||
      null;

    if (!alerta) {
      destino.innerHTML = `
        <div
          class="
            inventario-existencia-detalle-alerta-vacia
          "
        >
          <strong>
            Sin alerta vigente
          </strong>

          <span>
            El producto se encuentra
            dentro de los límites
            configurados.
          </span>
        </div>
      `;

      return;
    }

    destino.innerHTML = `
      <div
        class="
          inventario-existencia-detalle-alerta-contenido
        "
      >
        <strong>
          ${valorSeguro(
            etiquetaAlerta(
              alerta.tipo
            )
          )}
        </strong>

        <div
          class="
            inventario-existencia-detalle-lista-datos
          "
        >
          <div>
            <span>
              Existencia actual
            </span>

            <strong>
              ${valorSeguro(
                alerta.cantidadActual
              )}
            </strong>
          </div>

          <div>
            <span>
              Límite relacionado
            </span>

            <strong>
              ${valorSeguro(
                alerta.limiteAplicable
              )}
            </strong>
          </div>

          <div>
            <span>
              Fecha de detección
            </span>

            <strong>
              ${valorSeguro(
                formatearFechaHora(
                  alerta.fechaActualizacion
                )
              )}
            </strong>
          </div>
        </div>
      </div>
    `;
  } catch (error) {
    if (
      secuencia ===
      secuenciaCarga
    ) {
      renderizarErrorSeccion(
        'existencia-detalle-alerta',
        error?.message ||
        'No fue posible consultar la alerta.'
      );
    }
  }
}

export async function initExistenciaDetalle() {
  const root =
    obtenerRoot();

  if (!root) {
    return;
  }

  const idProducto =
    obtenerIdParametro(
      'idProducto'
    );

  const accesoPermitido =
    puede(
      PERMISOS.CONSULTAR
    ) ||
    accesoTecnicoContextual();

  if (!accesoPermitido) {
    renderizarErrorPrincipal(
      'No tiene permisos para consultar este detalle.'
    );

    root.setAttribute(
      'aria-busy',
      'false'
    );

    return;
  }

  if (!idProducto) {
    renderizarErrorPrincipal(
      'No se recibió un producto válido para consultar.'
    );

    root.setAttribute(
      'aria-busy',
      'false'
    );

    return;
  }

  const secuencia =
    ++secuenciaCarga;

  try {
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

    if (
      secuencia !==
      secuenciaCarga
    ) {
      return;
    }

    const item =
      resultado.items?.[0];

    if (!item) {
      renderizarErrorPrincipal(
        'No se encontró información de existencia para el producto seleccionado.'
      );

      return;
    }

    renderizarPrincipal(item);

    await Promise.allSettled([
      puede(
        PERMISOS.RESERVAS
      )
        ? cargarReservas(
            idProducto,
            secuencia
          )
        : Promise.resolve(),

      esOperativo() &&
      puede(
        PERMISOS.MOVIMIENTOS
      )
        ? cargarMovimientos(
            idProducto,
            secuencia
          )
        : Promise.resolve(),

      esOperativo() &&
      puede(
        PERMISOS.ALERTAS
      )
        ? cargarAlerta(
            idProducto,
            secuencia
          )
        : Promise.resolve()
    ]);
  } catch (error) {
    if (
      secuencia ===
      secuenciaCarga
    ) {
      renderizarErrorPrincipal(
        error?.message ||
        'No fue posible cargar el detalle de existencia.'
      );
    }
  } finally {
    if (
      secuencia ===
      secuenciaCarga
    ) {
      root.setAttribute(
        'aria-busy',
        'false'
      );
    }
  }
}