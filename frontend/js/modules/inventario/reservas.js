import {
  consultarReservasInventario,
  obtenerReservaInventario,
  ESTADOS_RESERVA
} from '../../api/inventario-reservas.service.js';

const LIMIT_PAGINA = 10;

let secuenciaCarga = 0;
let focoAntesDetalle = null;

let estado = {
  folioOrden: '',
  cliente: '',
  evento: '',
  producto: '',
  fechaDesde: '',
  fechaHasta: '',
  estado: '',
  idAlmacen: '1',
  skip: 0,
  limit: LIMIT_PAGINA,
  datos: null
};

const el = id =>
  document.getElementById(id);

const setText = (
  id,
  valor
) => {
  const nodo = el(id);

  if (nodo) {
    nodo.textContent =
      valor ?? '';
  }
};

const setHidden = (
  id,
  oculto
) => {
  const nodo = el(id);

  if (nodo) {
    nodo.hidden = oculto;
  }
};

const disponible = valor =>
  valor === null ||
  valor === undefined ||
  valor === ''
    ? 'No disponible'
    : String(valor);

const esc = valor =>
  disponible(valor).replace(
    /[&<>"']/g,
    caracter => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;'
    })[caracter]
  );

function fecha(valor) {
  if (!valor) {
    return 'No disponible';
  }

  const date =
    new Date(
      `${String(valor).slice(0, 10)}T12:00:00`
    );

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return 'No disponible';
  }

  return new Intl.DateTimeFormat(
    'es-MX',
    {
      dateStyle: 'short'
    }
  ).format(date);
}

function fechaHora(valor) {
  if (!valor) {
    return 'No disponible';
  }

  const date =
    new Date(valor);

  if (
    Number.isNaN(
      date.getTime()
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
  ).format(date);
}

function etiquetaEstado(valor) {
  return ({
    [ESTADOS_RESERVA.CONFIRMADA]:
      'Confirmada',

    [ESTADOS_RESERVA.ACTIVA]:
      'Activa',

    [ESTADOS_RESERVA.LIBERADA]:
      'Liberada',

    [ESTADOS_RESERVA.CANCELADA]:
      'Cancelada'
  })[valor] ||
    'No disponible';
}

function claseEstado(valor) {
  return ({
    [ESTADOS_RESERVA.CONFIRMADA]:
      'inventario-reservas-estado-confirmada',

    [ESTADOS_RESERVA.ACTIVA]:
      'inventario-reservas-estado-activa',

    [ESTADOS_RESERVA.LIBERADA]:
      'inventario-reservas-estado-liberada',

    [ESTADOS_RESERVA.CANCELADA]:
      'inventario-reservas-estado-cancelada'
  })[valor] || '';
}

function badge(valor) {
  return `
    <span
      class="inventario-reservas-estado-badge ${claseEstado(valor)}"
    >
      ${esc(etiquetaEstado(valor))}
    </span>
  `;
}

function renderResumen(
  resumen = {}
) {
  setText(
    'reservas-total',
    resumen.total ?? 0
  );

  setText(
    'reservas-total-confirmadas',
    resumen.confirmadas ?? 0
  );

  setText(
    'reservas-total-activas',
    resumen.activas ?? 0
  );

  setText(
    'reservas-total-liberadas',
    resumen.liberadas ?? 0
  );

  setText(
    'reservas-total-canceladas',
    resumen.canceladas ?? 0
  );
}

function renderTabla(items) {
  const tbody =
    el('reservas-tbody');

  if (!tbody) {
    return;
  }

  tbody.innerHTML =
    items.map(
      reserva => `
        <tr>
          <td>
            ${esc(reserva.folioOrden)}
          </td>

          <td>
            <strong>
              ${esc(reserva.cliente)}
            </strong>

            <span class="inventario-reservas-secundario">
              ${esc(reserva.evento)}
            </span>
          </td>

          <td>
            <div class="inventario-reservas-producto">
              ${
                reserva.imagenUrl
                  ? `
                    <img
                      src="${esc(reserva.imagenUrl)}"
                      alt=""
                      loading="lazy"
                    >
                  `
                  : ''
              }

              <div>
                <strong>
                  ${esc(reserva.producto)}
                </strong>

                <span>
                  ${esc(reserva.codigoProducto)}
                </span>
              </div>
            </div>
          </td>

          <td>
            ${esc(
              `${reserva.cantidadReservada} ${reserva.unidadMedida || ''}`.trim()
            )}
          </td>

          <td>
            <strong>
              ${esc(
                fecha(
                  reserva.fechaEntrega
                )
              )}
            </strong>

            <span class="inventario-reservas-secundario">
              Recolección:
              ${esc(
                fecha(
                  reserva.fechaRecoleccion
                )
              )}
            </span>
          </td>

          <td>
            ${badge(reserva.estado)}
          </td>

          <td>
            <button
              type="button"
              class="button-secondary inventario-reservas-accion"
              data-id-reserva="${Number(reserva.idReserva)}"
            >
              Ver detalle
            </button>
          </td>
        </tr>
      `
    ).join('');
}

function renderCards(items) {
  const contenedor =
    el('reservas-cards');

  if (!contenedor) {
    return;
  }

  contenedor.innerHTML =
    items.map(
      reserva => `
        <article class="card inventario-reservas-card">
          <header>
            <div>
              <strong>
                ${esc(reserva.folioOrden)}
              </strong>

              <span>
                ${esc(reserva.cliente)}
              </span>
            </div>

            ${badge(reserva.estado)}
          </header>

          <div class="inventario-reservas-card-grid">
            <div class="inventario-reservas-card-dato">
              <span>Producto</span>

              <strong>
                ${esc(reserva.producto)}
              </strong>
            </div>

            <div class="inventario-reservas-card-dato">
              <span>Cantidad</span>

              <strong>
                ${esc(
                  `${reserva.cantidadReservada} ${reserva.unidadMedida || ''}`.trim()
                )}
              </strong>
            </div>

            <div class="inventario-reservas-card-dato">
              <span>Entrega</span>

              <strong>
                ${esc(
                  fecha(
                    reserva.fechaEntrega
                  )
                )}
              </strong>
            </div>

            <div class="inventario-reservas-card-dato">
              <span>Recolección</span>

              <strong>
                ${esc(
                  fecha(
                    reserva.fechaRecoleccion
                  )
                )}
              </strong>
            </div>
          </div>

          <button
            type="button"
            class="button-secondary inventario-reservas-accion"
            data-id-reserva="${Number(reserva.idReserva)}"
          >
            Ver detalle
          </button>
        </article>
      `
    ).join('');
}

function renderPaginacion(datos) {
  const total =
    Number(
      datos.total || 0
    );

  const limit =
    Number(
      datos.limit ||
      LIMIT_PAGINA
    );

  const skip =
    Number(
      datos.skip || 0
    );

  const paginas =
    Math.max(
      1,
      Math.ceil(
        total / limit
      )
    );

  const actual =
    Math.min(
      paginas,
      Math.floor(
        skip / limit
      ) + 1
    );

  setText(
    'reservas-resultados',
    `${total} ${
      total === 1
        ? 'reserva'
        : 'reservas'
    }`
  );

  setText(
    'reservas-pagina',
    `${actual} de ${paginas}`
  );

  const anterior =
    el('btn-reservas-anterior');

  const siguiente =
    el('btn-reservas-siguiente');

  if (anterior) {
    anterior.disabled =
      skip <= 0;
  }

  if (siguiente) {
    siguiente.disabled =
      skip + limit >= total;
  }
}

function hayFiltros() {
  return Boolean(
    estado.folioOrden ||
    estado.cliente ||
    estado.evento ||
    estado.producto ||
    estado.fechaDesde ||
    estado.fechaHasta ||
    estado.estado
  );
}

function render(datos) {
  const items =
    Array.isArray(
      datos.items
    )
      ? datos.items
      : [];

  renderResumen(
    datos.resumen
  );

  renderTabla(items);
  renderCards(items);
  renderPaginacion(datos);

  setText(
    'reservas-ultima-consulta',
    fechaHora(
      datos.fechaConsulta
    )
  );

  const vacio =
    datos.total === 0;

  setHidden(
    'reservas-resultados-contenido',
    vacio
  );

  setHidden(
    'reservas-estado-vacio',
    !vacio
  );

  if (vacio) {
    setText(
      'reservas-vacio-mensaje',
      datos.totalHistorico === 0 ||
      !hayFiltros()
        ? 'No existen reservas registradas.'
        : 'No hay reservas con los filtros seleccionados.'
    );
  }
}

function loading(activo) {
  setHidden(
    'reservas-estado-cargando',
    !activo
  );

  el('reservas-page')
    ?.setAttribute(
      'aria-busy',
      activo
        ? 'true'
        : 'false'
    );

  const boton =
    el('btn-reservas-buscar');

  if (boton) {
    boton.disabled =
      activo;

    boton.setAttribute(
      'aria-busy',
      activo
        ? 'true'
        : 'false'
    );
  }
}

function mostrarError(error) {
  setText(
    'reservas-error-mensaje',
    error?.message ||
    'No fue posible consultar las reservas.'
  );

  setHidden(
    'reservas-estado-error',
    false
  );
}

function leerFiltros() {
  return {
    folioOrden:
      el('reservas-orden')
        ?.value
        .trim() || '',

    cliente:
      el('reservas-cliente')
        ?.value
        .trim() || '',

    evento:
      el('reservas-evento')
        ?.value
        .trim() || '',

    producto:
      el('reservas-producto')
        ?.value
        .trim() || '',

    fechaDesde:
      el('reservas-fecha-desde')
        ?.value || '',

    fechaHasta:
      el('reservas-fecha-hasta')
        ?.value || '',

    estado:
      el('reservas-estado')
        ?.value || '',

    idAlmacen:
      el('reservas-almacen')
        ?.value || '1'
  };
}

function sincronizar() {
  const controles = {
    'reservas-orden':
      estado.folioOrden,

    'reservas-cliente':
      estado.cliente,

    'reservas-evento':
      estado.evento,

    'reservas-producto':
      estado.producto,

    'reservas-fecha-desde':
      estado.fechaDesde,

    'reservas-fecha-hasta':
      estado.fechaHasta,

    'reservas-estado':
      estado.estado,

    'reservas-almacen':
      estado.idAlmacen
  };

  Object.entries(
    controles
  ).forEach(
    ([id, valor]) => {
      if (el(id)) {
        el(id).value =
          valor;
      }
    }
  );
}

async function cargar() {
  const secuencia =
    ++secuenciaCarga;

  setHidden(
    'reservas-estado-error',
    true
  );

  loading(true);

  try {
    const datos =
      await consultarReservasInventario({
        ...estado
      });

    if (
      secuencia !==
      secuenciaCarga
    ) {
      return;
    }

    if (
      estado.skip > 0 &&
      datos.total > 0 &&
      datos.items.length === 0
    ) {
      estado.skip =
        Math.max(
          0,
          Math.floor(
            (datos.total - 1) /
            estado.limit
          ) *
          estado.limit
        );

      return cargar();
    }

    estado.datos =
      datos;

    render(datos);

  } catch (error) {
    if (
      secuencia !==
      secuenciaCarga
    ) {
      return;
    }

    mostrarError(error);

    setHidden(
      'reservas-resultados-contenido',
      true
    );

    setHidden(
      'reservas-estado-vacio',
      true
    );

  } finally {
    if (
      secuencia ===
      secuenciaCarga
    ) {
      loading(false);
    }
  }
}

function llenarDetalle(reserva) {
  const valores = {
    'reservas-detalle-id':
      disponible(
        reserva.idReserva
      ),

    'reservas-detalle-folio':
      disponible(
        reserva.folioReserva
      ),

    'reservas-detalle-estado':
      etiquetaEstado(
        reserva.estado
      ),

    'reservas-detalle-generacion':
      fechaHora(
        reserva.fechaGeneracion
      ),

    'reservas-detalle-actualizacion':
      fechaHora(
        reserva.fechaUltimaModificacion
      ),

    'reservas-detalle-orden-id':
      disponible(
        reserva.idOrden
      ),

    'reservas-detalle-orden-folio':
      disponible(
        reserva.folioOrden
      ),

    'reservas-detalle-orden-estado':
      disponible(
        reserva.estadoOrden
      ),

    'reservas-detalle-cliente':
      disponible(
        reserva.cliente
      ),

    'reservas-detalle-evento':
      disponible(
        reserva.evento
      ),

    'reservas-detalle-direccion':
      disponible(
        reserva.direccionEvento
      ),

    'reservas-detalle-entrega':
      fecha(
        reserva.fechaEntrega
      ),

    'reservas-detalle-recoleccion':
      fecha(
        reserva.fechaRecoleccion
      ),

    'reservas-detalle-producto-id':
      disponible(
        reserva.idProducto
      ),

    'reservas-detalle-producto-codigo':
      disponible(
        reserva.codigoProducto
      ),

    'reservas-detalle-producto-nombre':
      disponible(
        reserva.producto
      ),

    'reservas-detalle-producto-unidad':
      disponible(
        reserva.unidadMedida
      ),

    'reservas-detalle-cantidad':
      `${
        reserva.cantidadReservada
      } ${
        reserva.unidadMedida || ''
      }`.trim(),

    'reservas-detalle-almacen-id':
      disponible(
        reserva.idAlmacen
      ),

    'reservas-detalle-almacen':
      disponible(
        reserva.almacen
      ),

    'reservas-detalle-usuario-generacion':
      disponible(
        reserva.usuarioGeneracion
      ),

    'reservas-detalle-usuario-modificacion':
      disponible(
        reserva.usuarioUltimaModificacion
      ),

    'reservas-detalle-salida':
      disponible(
        reserva.referenciaSalida
      ),

    'reservas-detalle-retorno':
      disponible(
        reserva.referenciaRetorno
      ),

    'reservas-detalle-cancelacion':
      disponible(
        reserva.motivoCancelacion
      )
  };

  Object.entries(
    valores
  ).forEach(
    ([id, valor]) =>
      setText(
        id,
        valor
      )
  );

  const imagen =
    el(
      'reservas-detalle-producto-imagen'
    );

  const placeholder =
    el(
      'reservas-detalle-producto-placeholder'
    );

  if (
    !imagen ||
    !placeholder
  ) {
    return;
  }

  imagen.hidden = true;

  imagen.removeAttribute(
    'src'
  );

  placeholder.hidden =
    false;

  if (!reserva.imagenUrl) {
    return;
  }

  imagen.onload =
    () => {
      imagen.hidden =
        false;

      placeholder.hidden =
        true;
    };

  imagen.onerror =
    () => {
      imagen.hidden =
        true;

      placeholder.hidden =
        false;
    };

  imagen.alt =
    reserva.producto
      ? `Imagen de ${reserva.producto}`
      : 'Imagen del producto';

  imagen.src =
    reserva.imagenUrl;
}

async function abrirDetalle(
  idReserva,
  disparador
) {
  focoAntesDetalle =
    disparador ||
    document.activeElement;

  try {
    const reserva =
      await obtenerReservaInventario(
        idReserva
      );

    llenarDetalle(
      reserva
    );

    const dialog =
      el('reservas-dialog');

    if (
      dialog &&
      !dialog.open
    ) {
      dialog.showModal();

      el(
        'btn-reservas-cerrar-detalle'
      )?.focus();
    }

  } catch (error) {
    mostrarError(error);
  }
}

function registrarEventos() {
  el(
    'reservas-form-filtros'
  )?.addEventListener(
    'submit',
    event => {
      event.preventDefault();

      estado = {
        ...estado,
        ...leerFiltros(),
        skip: 0
      };

      cargar();
    }
  );

  el(
    'btn-reservas-limpiar'
  )?.addEventListener(
    'click',
    () => {
      estado = {
        ...estado,
        folioOrden: '',
        cliente: '',
        evento: '',
        producto: '',
        fechaDesde: '',
        fechaHasta: '',
        estado: '',
        idAlmacen: '1',
        skip: 0
      };

      sincronizar();

      cargar();
    }
  );

  el(
    'btn-reservas-reintentar'
  )?.addEventListener(
    'click',
    cargar
  );

  el(
    'btn-reservas-anterior'
  )?.addEventListener(
    'click',
    () => {
      estado.skip =
        Math.max(
          0,
          estado.skip -
          estado.limit
        );

      cargar();
    }
  );

  el(
    'btn-reservas-siguiente'
  )?.addEventListener(
    'click',
    () => {
      estado.skip +=
        estado.limit;

      cargar();
    }
  );

  el(
    'reservas-resultados-contenido'
  )?.addEventListener(
    'click',
    event => {
      const boton =
        event.target.closest(
          '[data-id-reserva]'
        );

      if (!boton) {
        return;
      }

      const id =
        Number(
          boton.dataset.idReserva
        );

      if (
        Number.isInteger(id) &&
        id > 0
      ) {
        abrirDetalle(
          id,
          boton
        );
      }
    }
  );

  const dialog =
    el('reservas-dialog');

  el(
    'btn-reservas-cerrar-detalle'
  )?.addEventListener(
    'click',
    () =>
      dialog?.close()
  );

  dialog?.addEventListener(
    'click',
    event => {
      if (
        event.target ===
        dialog
      ) {
        dialog.close();
      }
    }
  );

  dialog?.addEventListener(
    'close',
    () => {
      if (
        focoAntesDetalle
          instanceof HTMLElement &&
        document.contains(
          focoAntesDetalle
        )
      ) {
        focoAntesDetalle.focus();
      }

      focoAntesDetalle =
        null;
    }
  );
}

export function init() {
  if (
    !el('reservas-page')
  ) {
    return;
  }

  registrarEventos();
  sincronizar();
  cargar();
}