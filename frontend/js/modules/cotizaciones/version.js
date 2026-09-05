import {
  getCotizacion,
  getCotizacionVersion,
  updateCotizacionVersion,
  deleteCotizacionVersion,
  sendCotizacionVersion
} from '../../api/cotizaciones.service.js';

import {
  getClienteProspecto
} from '../../api/clientes.service.js';

import {
  listarProductos,
  listarServicios,
  listarPaquetes,
  obtenerServicio,
  obtenerPaquete
} from '../../api/catalogo.service.js';

import {
  consultarDisponibilidadFutura
} from '../../api/inventario.service.js';

import {
  listarListasPrecioDisponibles,
  obtenerConfiguracionListaPrecio,
  resolverPrecioProducto
} from '../../api/listas-precios.service.js';

import {
  ESTADOS_COTIZACION_GENERAL,
  ESTADOS_VERSION_COTIZACION,
  TIPOS_CONCEPTO_COTIZACION
} from '../../api/cotizaciones.constants.js';

import {
  construirFolioCotizacion,
  construirFolioVersion,
  crearBadge,
  escaparHtml,
  formatearFecha,
  formatearMoneda,
  obtenerClaseDisponibilidad,
  obtenerClaseEstadoVersion,
  obtenerEtiquetaDisponibilidad,
  obtenerEtiquetaEstadoVersion
} from './cotizaciones-ui.js';

import {
  openModal
} from '../../components/modal.js';

import {
  showNotification
} from '../../components/notification.js';

const el =
  id =>
    document.getElementById(id);

let cotizacion = null;
let version = null;
let clienteProspecto = null;

let listasDisponibles = [];
let configuracionLista = null;
let detalleLocal = [];

let tipoBusqueda =
  TIPOS_CONCEPTO_COTIZACION
    .PRODUCTO;

let secuenciaBusqueda = 0;
let secuenciaLista = 0;
let secuenciaDisponibilidad = 0;

let temporizadorBusqueda =
  null;

let soloConsulta = false;

let siguienteIdTemporal =
  -1;

function obtenerParametrosHash() {
  const [
    ,
    queryString = ''
  ] =
    String(
      location.hash || ''
    ).split('?');

  return new URLSearchParams(
    queryString
  );
}

function obtenerEnteroParametro(
  nombre
) {
  const valor =
    Number(
      obtenerParametrosHash()
        .get(nombre)
    );

  return (
    Number.isInteger(valor) &&
    valor > 0
  )
    ? valor
    : null;
}

function nombreCliente(
  registro
) {
  if (!registro) {
    return 'No disponible';
  }

  return [
    registro.nombres,
    registro.apellidos
  ]
    .filter(Boolean)
    .join(' ')
    .trim() ||
    'No disponible';
}

function mostrarError(
  mensaje
) {
  const estado =
    el('versionEstadoCarga');

  const contenido =
    el('versionContenido');

  if (
    !estado ||
    !contenido
  ) {
    return;
  }

  estado.className =
    'cotizaciones-error';

  estado.innerHTML = `
    <strong>
      No fue posible cargar la versión.
    </strong>

    <p>
      ${escaparHtml(mensaje)}
    </p>
  `;

  estado.hidden = false;
  contenido.hidden = true;
}

function renderEncabezado() {
  const folioCotizacion =
    construirFolioCotizacion(
      cotizacion.ejercicio,
      cotizacion.consecutivo
    );

  const folioVersion =
    construirFolioVersion(
      cotizacion.ejercicio,
      cotizacion.consecutivo,
      version.numeroVersion
    );

  const titulo =
    el('versionTitulo');

  const breadcrumbCotizacion =
    el(
      'breadcrumbCotizacion'
    );

  const breadcrumbVersion =
    el(
      'breadcrumbVersion'
    );

  const badge =
    el('versionEstadoBadge');

  if (titulo) {
    titulo.textContent =
      soloConsulta
        ? `Versión ${folioVersion}`
        : `Editar versión ${folioVersion}`;
  }

  if (breadcrumbCotizacion) {
    breadcrumbCotizacion
      .textContent =
      folioCotizacion;

    breadcrumbCotizacion.href =
      `#/cotizaciones/detalle?id=${
        Number(
          cotizacion
            .idCotizacion
        )
      }`;
  }

  if (breadcrumbVersion) {
    breadcrumbVersion.textContent =
      `Versión V${
        Number(
          version.numeroVersion
        )
      }`;
  }

  if (badge) {
    badge.className =
      `cotizaciones-badge ${
        obtenerClaseEstadoVersion(
          version.estadoVersion
        )
      }`;

    badge.textContent =
      obtenerEtiquetaEstadoVersion(
        version.estadoVersion
      );
  }

  el(
    'btnEliminarVersion'
  ).hidden =
    soloConsulta;

  el(
    'btnGuardarVersion'
  ).hidden =
    soloConsulta;

  el(
    'btnEnviarVersion'
  ).hidden =
    soloConsulta;
}

function renderContexto() {
  const asignar =
    (id, valor) => {
      const nodo = el(id);

      if (nodo) {
        nodo.textContent =
          valor;
      }
    };

  asignar(
    'versionCotizacionFolio',
    construirFolioCotizacion(
      cotizacion.ejercicio,
      cotizacion.consecutivo
    )
  );

  asignar(
    'versionCliente',
    nombreCliente(
      clienteProspecto
    )
  );

  asignar(
    'versionFechaServicio',
    formatearFecha(
      cotizacion.fechaEvento
    )
  );

  asignar(
    'versionHoraServicio',
    cotizacion.horaEvento ||
      '—'
  );
}

async function cargarListas() {
  listasDisponibles =
    await listarListasPrecioDisponibles({
      fecha:
        cotizacion.fechaEvento
    });

  const select =
    el('versionListaPrecio');

  if (!select) {
    return;
  }

  const idsDisponibles =
    new Set(
      listasDisponibles.map(
        lista =>
          Number(
            lista.idListaPrecio
          )
      )
    );

  let opciones =
    [...listasDisponibles];

  if (
    version.idListaPrecio &&
    !idsDisponibles.has(
      Number(
        version.idListaPrecio
      )
    )
  ) {
    const historica =
      await obtenerConfiguracionListaPrecio(
        version.idListaPrecio
      ).catch(
        () => null
      );

    if (historica) {
      opciones = [
        historica,
        ...opciones
      ];
    }
  }

  select.innerHTML = `
    <option value="">
      Selecciona una lista
    </option>

    ${opciones
      .map(
        lista => `
          <option
            value="${
              Number(
                lista
                  .idListaPrecio
              )
            }"
          >
            ${escaparHtml(
              lista.nombre ||
              'Lista de Precios'
            )}
          </option>
        `
      )
      .join('')}
  `;

  select.value =
    version.idListaPrecio
      ? String(
          version.idListaPrecio
        )
      : '';

  select.disabled =
    soloConsulta;

  if (select.value) {
    await cargarConfiguracionLista(
      Number(select.value),
      false
    );
  } else {
    renderConfiguracionLista(
      null
    );
  }
}

function renderConfiguracionLista(
  lista
) {
  const vigencia =
    el('listaPrecioVigencia');

  const condicion =
    el('listaPrecioCondicion');

  const adicional =
    el('listaPrecioAdicional');

  if (vigencia) {
    vigencia.textContent =
      lista
        ? `${
            formatearFecha(
              lista.vigenciaInicio
            )
          } - ${
            formatearFecha(
              lista.vigenciaFin
            )
          }`
        : '—';
  }

  if (condicion) {
    condicion.textContent =
      lista?.condicion ||
      'No definida';
  }

  if (adicional) {
    adicional.textContent =
      lista
        ? `${
            Number(
              lista
                .porcentajeAdicionalFueraLista ||
              0
            )
          }%`
        : '—';
  }
}

async function cargarConfiguracionLista(
  idListaPrecio,
  recalcular = true
) {
  const secuencia =
    ++secuenciaLista;

  try {
    const configuracion =
      await obtenerConfiguracionListaPrecio(
        idListaPrecio
      );

    if (
      secuencia !==
      secuenciaLista
    ) {
      return;
    }

    configuracionLista =
      configuracion;

    renderConfiguracionLista(
      configuracion
    );

    if (recalcular) {
      await recalcularProductosPorLista(
        idListaPrecio,
        secuencia
      );
    }
  } catch (error) {
    if (
      secuencia !==
      secuenciaLista
    ) {
      return;
    }

    configuracionLista =
      null;

    renderConfiguracionLista(
      null
    );

    showNotification(
      error?.message ||
      'No fue posible consultar la Lista de Precios.',
      {
        type: 'error'
      }
    );
  }
}

async function recalcularProductosPorLista(
  idListaPrecio,
  secuencia
) {
  const productos =
    detalleLocal.filter(
      item =>
        item.tipoConcepto ===
          TIPOS_CONCEPTO_COTIZACION
            .PRODUCTO &&
        item.idProducto
    );

  const resoluciones =
    await Promise.all(
      productos.map(
        item =>
          resolverPrecioProducto({
            idListaPrecio,
            idProducto:
              item.idProducto
          })
      )
    );

  if (
    secuencia !==
    secuenciaLista
  ) {
    return;
  }

  const porProducto =
    new Map(
      resoluciones.map(
        precio => [
          Number(
            precio.idProducto
          ),
          precio
        ]
      )
    );

  detalleLocal =
    detalleLocal.map(
      item => {
        if (
          item.tipoConcepto !==
          TIPOS_CONCEPTO_COTIZACION
            .PRODUCTO
        ) {
          return item;
        }

        const precio =
          porProducto.get(
            Number(
              item.idProducto
            )
          );

        if (!precio) {
          return item;
        }

        const cantidad =
          Number(
            item.cantidad ||
            0
          );

        return {
          ...item,

          precioBase:
            precio.precioBase,

          precioLista:
            precio.precioLista,

          porcentajeAdicional:
            precio
              .porcentajeAdicional,

          precioAplicado:
            precio
              .precioAplicado,

          subtotal:
            cantidad *
            precio
              .precioAplicado
        };
      }
    );

  recalcularEconomia();
  renderDetalle();
}

function precioDetalleHtml(
  item
) {
  if (
    item.tipoConcepto ===
      TIPOS_CONCEPTO_COTIZACION
        .PRODUCTO &&
    Number(
      item
        .porcentajeAdicional ||
      0
    ) > 0
  ) {
    return `
      ${crearBadge(
        'Fuera de lista',
        'cotizaciones-badge--warning'
      )}

      <div>
        <small>
          Precio base:
          ${escaparHtml(
            formatearMoneda(
              item.precioBase
            )
          )}
        </small>

        <br>

        <small>
          + ${
            Number(
              item
                .porcentajeAdicional
            )
          }%
        </small>

        <br>

        <strong>
          ${escaparHtml(
            formatearMoneda(
              item.precioAplicado
            )
          )}
        </strong>
      </div>
    `;
  }

  return escaparHtml(
    formatearMoneda(
      item.precioAplicado
    )
  );
}

function badgeDisponibilidad(
  item
) {
  if (!item.disponibilidad) {
    return crearBadge(
      'Sin consultar',
      'cotizaciones-badge--neutral'
    );
  }

  return crearBadge(
    obtenerEtiquetaDisponibilidad(
      item.disponibilidad
    ),
    obtenerClaseDisponibilidad(
      item.disponibilidad
    )
  );
}

function composicionPaqueteHtml(
  item
) {
  if (
    item.tipoConcepto !==
      TIPOS_CONCEPTO_COTIZACION
        .PAQUETE ||
    !item.composicion
  ) {
    return '';
  }

  const componentes = [
    ...(
      item.composicion.productos ||
      []
    ).map(
      componente =>
        `${componente.nombre} × ${componente.cantidad}`
    ),

    ...(
      item.composicion.servicios ||
      []
    ).map(
      componente =>
        `${componente.nombre} × ${componente.cantidad}`
    )
  ];

  if (!componentes.length) {
    return '';
  }

  return `
    <div
      class="cotizaciones-field-help"
    >
      Incluye:
      ${componentes
        .map(
          componente =>
            escaparHtml(
              componente
            )
        )
        .join(' · ')}
    </div>
  `;
}

function renderDetalle() {
  const tbody =
    el('detalleVersionBody');

  const mobile =
    el('detalleVersionMobile');

  const empty =
    el('detalleVersionEmpty');

  const cantidad =
    el('detalleVersionCantidad');

  if (cantidad) {
    cantidad.textContent =
      `${detalleLocal.length} ` +
      `${
        detalleLocal.length === 1
          ? 'concepto'
          : 'conceptos'
      }`;
  }

  if (empty) {
    empty.hidden =
      detalleLocal.length > 0;
  }

  if (tbody) {
    tbody.innerHTML =
      detalleLocal
        .map(
          item => `
            <tr>
              <td>
                <strong>
                  ${escaparHtml(
                    item
                      .descripcionHistorica ||
                    'Concepto'
                  )}
                </strong>
                ${composicionPaqueteHtml(
                  item
                )}
              </td>

              <td>
                ${escaparHtml(
                  item.tipoConcepto ===
                    TIPOS_CONCEPTO_COTIZACION
                      .PRODUCTO
                    ? 'Producto'
                    : item.tipoConcepto ===
                        TIPOS_CONCEPTO_COTIZACION
                          .SERVICIO
                      ? 'Servicio'
                      : 'Paquete'
                )}
              </td>

              <td>
                <input
                  type="number"
                  min="1"
                  step="1"
                  value="${
                    Number(
                      item.cantidad ||
                      1
                    )
                  }"
                  data-cantidad-detalle="${
                    Number(
                      item.idDetalle
                    )
                  }"
                  ${
                    soloConsulta
                      ? 'disabled'
                      : ''
                  }
                  aria-label="Cantidad de ${
                    escaparHtml(
                      item
                        .descripcionHistorica ||
                      'concepto'
                    )
                  }"
                >
              </td>

              <td>
                ${precioDetalleHtml(
                  item
                )}
              </td>

              <td>
                ${badgeDisponibilidad(
                  item
                )}
              </td>

              <td
                class="
                  cotizaciones-money
                "
              >
                ${escaparHtml(
                  formatearMoneda(
                    item.subtotal
                  )
                )}
              </td>

              <td>
                ${
                  soloConsulta
                    ? '—'
                    : `
                      <button
                        type="button"
                        class="
                          cotizaciones-btn
                          cotizaciones-btn--danger
                        "
                        data-eliminar-detalle="${
                          Number(
                            item.idDetalle
                          )
                        }"
                      >
                        Quitar
                      </button>
                    `
                }
              </td>
            </tr>
          `
        )
        .join('');
  }

  if (mobile) {
    mobile.innerHTML =
      detalleLocal
        .map(
          item => `
            <article
              class="
                cotizaciones-mobile-card
              "
            >
              <div
                class="
                  cotizaciones-mobile-card-header
                "
              >
                <strong>
                  ${escaparHtml(
                    item
                      .descripcionHistorica ||
                    'Concepto'
                  )}
                </strong>
                ${composicionPaqueteHtml(
                  item
                )}
                ${badgeDisponibilidad(
                  item
                )}
              </div>

              <div
                class="
                  cotizaciones-mobile-card-grid
                "
              >
                <div
                  class="
                    cotizaciones-mobile-card-field
                  "
                >
                  <span>Tipo</span>

                  <strong>
                    ${escaparHtml(
                      item.tipoConcepto
                    )}
                  </strong>
                </div>

                <div
                  class="
                    cotizaciones-mobile-card-field
                  "
                >
                  <span>
                    Cantidad
                  </span>

                  <input
                    type="number"
                    min="1"
                    step="1"
                    value="${
                      Number(
                        item.cantidad ||
                        1
                      )
                    }"
                    data-cantidad-detalle="${
                      Number(
                        item.idDetalle
                      )
                    }"
                    ${
                      soloConsulta
                        ? 'disabled'
                        : ''
                    }
                  >
                </div>

                <div
                  class="
                    cotizaciones-mobile-card-field
                  "
                >
                  <span>Precio</span>

                  <strong>
                    ${escaparHtml(
                      formatearMoneda(
                        item
                          .precioAplicado
                      )
                    )}
                  </strong>
                </div>

                <div
                  class="
                    cotizaciones-mobile-card-field
                  "
                >
                  <span>
                    Subtotal
                  </span>

                  <strong>
                    ${escaparHtml(
                      formatearMoneda(
                        item.subtotal
                      )
                    )}
                  </strong>
                </div>
              </div>

              ${
                soloConsulta
                  ? ''
                  : `
                    <button
                      type="button"
                      class="
                        cotizaciones-btn
                        cotizaciones-btn--danger
                      "
                      data-eliminar-detalle="${
                        Number(
                          item.idDetalle
                        )
                      }"
                    >
                      Quitar concepto
                    </button>
                  `
              }
            </article>
          `
        )
        .join('');
  }
}

function recalcularEconomia() {
  const importeConceptos =
    detalleLocal.reduce(
      (total, item) =>
        total +
        Number(
          item.subtotal ||
          0
        ),
      0
    );

  const descuentos =
    Number(
      version.descuentos ||
      0
    );

  const impuestos =
    Number(
      version.impuestos ||
      0
    );

  const cargos =
    Number(
      version.cargos ||
      0
    );

  const subtotal =
    Math.max(
      0,
      importeConceptos -
      descuentos
    );

  const total =
    subtotal +
    impuestos +
    cargos;

  version.importeConceptos =
    importeConceptos;

  version.subtotal =
    subtotal;

  version.total =
    total;

  const asignar =
    (id, valor) => {
      const nodo =
        el(id);

      if (nodo) {
        nodo.textContent =
          valor;
      }
    };

  asignar(
    'resumenImporteConceptos',
    formatearMoneda(
      importeConceptos
    )
  );

  asignar(
    'resumenDescuentos',
    formatearMoneda(
      descuentos
    )
  );

  asignar(
    'resumenSubtotal',
    formatearMoneda(
      subtotal
    )
  );

  asignar(
    'resumenImpuestos',
    impuestos
      ? formatearMoneda(
          impuestos
        )
      : 'Pendiente de regla fiscal'
  );

  asignar(
    'resumenCargos',
    formatearMoneda(
      cargos
    )
  );

  asignar(
    'resumenTotal',
    formatearMoneda(
      total
    )
  );
}

function renderDisponibilidadGlobal() {
  const badge =
    el(
      'versionDisponibilidadBadge'
    );

  if (!badge) {
    return;
  }

  if (
    !version
      .disponibilidadGlobal
  ) {
    badge.className =
      'cotizaciones-badge cotizaciones-badge--neutral';

    badge.textContent =
      'Sin consultar';

    return;
  }

  badge.className =
    `cotizaciones-badge ${
      obtenerClaseDisponibilidad(
        version
          .disponibilidadGlobal
      )
    }`;

  badge.textContent =
    obtenerEtiquetaDisponibilidad(
      version
        .disponibilidadGlobal
    );
}

function renderResultadoBusqueda(
  items,
  tipo
) {
  const contenedor =
    el('resultadosConceptos');

  const empty =
    el(
      'resultadosConceptosEmpty'
    );

  if (
    !contenedor ||
    !empty
  ) {
    return;
  }

  if (!items.length) {
    contenedor.innerHTML = '';

    empty.hidden = false;

    empty
      .querySelector('strong')
      .textContent =
      'No se encontraron resultados.';

    return;
  }

  empty.hidden = true;

  const listaSeleccionada =
    Boolean(
      el(
        'versionListaPrecio'
      )?.value
    );

  contenedor.innerHTML = `
    <div
      class="
        cotizaciones-grid
        cotizaciones-grid--3
      "
    >
      ${items
        .map(item => {
          const id =
            tipo ===
            TIPOS_CONCEPTO_COTIZACION
              .PRODUCTO
              ? item.idProducto
              : tipo ===
                  TIPOS_CONCEPTO_COTIZACION
                    .SERVICIO
                ? item.idServicio
                : item.idPaquete;

          const precioTexto =
            tipo ===
            TIPOS_CONCEPTO_COTIZACION
              .PRODUCTO
              ? 'Precio según Lista de Precios'
              : tipo ===
                  TIPOS_CONCEPTO_COTIZACION
                    .SERVICIO
                ? `Tarifa: ${
                    formatearMoneda(
                      item.tarifaBase
                    )
                  }`
                : `Precio: ${
                    formatearMoneda(
                      item.precio
                    )
                  }`;

          const detallePaquete =
            tipo ===
              TIPOS_CONCEPTO_COTIZACION
                .PAQUETE
              ? `${
                  Number(
                    item.totalProductos ||
                    0
                  )
                } producto(s) · ${
                  Number(
                    item.totalServicios ||
                    0
                  )
                } servicio(s)`
              : '';

          const puedeAgregar =
            !soloConsulta &&
            listaSeleccionada;

          return `
            <article
              class="cotizaciones-card"
            >
              <div
                class="cotizaciones-card-body"
              >
                <strong>
                  ${escaparHtml(
                    item.nombre ||
                    'Sin nombre'
                  )}
                </strong>

                <p
                  class="cotizaciones-subtitle"
                >
                  ${escaparHtml(
                    item.codigo ||
                    ''
                  )}
                </p>

                <p
                  class="cotizaciones-field-help"
                >
                  ${escaparHtml(
                    precioTexto
                  )}
                </p>

                ${
                  detallePaquete
                    ? `
                      <p
                        class="
                          cotizaciones-field-help
                        "
                      >
                        ${escaparHtml(
                          detallePaquete
                        )}
                      </p>
                    `
                    : ''
                }

                <button
                  type="button"
                  class="
                    cotizaciones-btn
                    cotizaciones-btn--secondary
                  "
                  data-agregar-concepto="${
                    Number(id)
                  }"
                  data-tipo-concepto="${
                    escaparHtml(tipo)
                  }"
                  ${
                    puedeAgregar
                      ? ''
                      : 'disabled'
                  }
                >
                  Agregar
                </button>
              </div>
            </article>
          `;
        })
        .join('')}
    </div>
  `;
}

async function buscarConceptos() {
  const secuencia =
    ++secuenciaBusqueda;

  const texto =
    String(
      el(
        'buscarConcepto'
      )?.value ||
      ''
    ).trim();

  try {
    let respuesta;

    if (
      tipoBusqueda ===
      TIPOS_CONCEPTO_COTIZACION
        .PRODUCTO
    ) {
      respuesta =
        await listarProductos({
          texto,
          soloActivos: true,
          skip: 0,
          limit: 6
        });
    } else if (
      tipoBusqueda ===
      TIPOS_CONCEPTO_COTIZACION
        .SERVICIO
    ) {
      respuesta =
        await listarServicios({
          texto,
          soloActivos: true,
          skip: 0,
          limit: 6
        });
    } else {
      respuesta =
        await listarPaquetes({
          texto,
          soloActivos: true,
          skip: 0,
          limit: 6
        });
    }

    if (
      secuencia !==
      secuenciaBusqueda
    ) {
      return;
    }

    renderResultadoBusqueda(
      respuesta.items ||
        [],
      tipoBusqueda
    );
  } catch (error) {
    if (
      secuencia !==
      secuenciaBusqueda
    ) {
      return;
    }

    showNotification(
      error?.message ||
      'No fue posible consultar el Catálogo.',
      {
        type: 'error'
      }
    );
  }
}

function programarBusqueda() {
  clearTimeout(
    temporizadorBusqueda
  );

  temporizadorBusqueda =
    setTimeout(
      buscarConceptos,
      250
    );
}

async function agregarConcepto(
  idConcepto,
  tipo
) {
  const idListaPrecio =
    Number(
      el(
        'versionListaPrecio'
      )?.value
    );

  if (!idListaPrecio) {
    showNotification(
      'Selecciona primero una Lista de Precios.',
      {
        type: 'error'
      }
    );

    return;
  }

  const campoId =
    tipo ===
    TIPOS_CONCEPTO_COTIZACION
      .PRODUCTO
      ? 'idProducto'
      : tipo ===
          TIPOS_CONCEPTO_COTIZACION
            .SERVICIO
        ? 'idServicio'
        : 'idPaquete';

  const duplicado =
    detalleLocal.some(
      item =>
        item.tipoConcepto ===
          tipo &&
        Number(
          item[campoId]
        ) ===
          Number(
            idConcepto
          )
    );

  if (duplicado) {
    showNotification(
      'El concepto ya forma parte de la versión.',
      {
        type: 'info'
      }
    );

    return;
  }

  try {
    let entidad;
    let precioBase = 0;
    let precioLista = null;
    let porcentajeAdicional = 0;
    let precioAplicado = 0;
    let composicion = null;

    if (
      tipo ===
      TIPOS_CONCEPTO_COTIZACION
        .PRODUCTO
    ) {
      const [
        productos,
        precio
      ] =
        await Promise.all([
          listarProductos({
            texto: '',
            soloActivos: true,
            skip: 0,
            limit: 100
          }),

          resolverPrecioProducto({
            idListaPrecio,
            idProducto:
              idConcepto
          })
        ]);

      entidad =
        productos.items.find(
          item =>
            Number(
              item.idProducto
            ) ===
              Number(
                idConcepto
              )
        );

      if (!entidad) {
        throw new Error(
          'Producto no encontrado en el Catálogo.'
        );
      }

      precioBase =
        Number(
          precio.precioBase ||
          0
        );

      precioLista =
        precio.precioLista;

      porcentajeAdicional =
        Number(
          precio
            .porcentajeAdicional ||
          0
        );

      precioAplicado =
        Number(
          precio
            .precioAplicado ||
          0
        );
    }

    if (
      tipo ===
      TIPOS_CONCEPTO_COTIZACION
        .SERVICIO
    ) {
      entidad =
        await obtenerServicio(
          idConcepto
        );

      precioBase =
        Number(
          entidad.tarifaBase ||
          0
        );

      precioAplicado =
        precioBase;
    }

    if (
      tipo ===
      TIPOS_CONCEPTO_COTIZACION
        .PAQUETE
    ) {
      entidad =
        await obtenerPaquete(
          idConcepto
        );

      precioBase =
        Number(
          entidad.precio ||
          0
        );

      precioAplicado =
        precioBase;

      composicion = {
        productos:
          (
            entidad
              .detalleProductos ||
            []
          ).map(
            componente => ({
              idProducto:
                Number(
                  componente.idProducto
                ),

              nombre:
                componente.nombre,

              cantidad:
                Number(
                  componente.cantidad ||
                  0
                )
            })
          ),

        servicios:
          (
            entidad
              .detalleServicios ||
            []
          ).map(
            componente => ({
              idServicio:
                Number(
                  componente.idServicio
                ),

              nombre:
                componente.nombre,

              cantidad:
                Number(
                  componente.cantidad ||
                  0
                )
            })
          )
      };
    }

    detalleLocal.push({
      idDetalle:
        siguienteIdTemporal--,

      tipoConcepto:
        tipo,

      idProducto:
        tipo ===
          TIPOS_CONCEPTO_COTIZACION
            .PRODUCTO
          ? Number(idConcepto)
          : null,

      idServicio:
        tipo ===
          TIPOS_CONCEPTO_COTIZACION
            .SERVICIO
          ? Number(idConcepto)
          : null,

      idPaquete:
        tipo ===
          TIPOS_CONCEPTO_COTIZACION
            .PAQUETE
          ? Number(idConcepto)
          : null,

      descripcionHistorica:
        entidad.nombre,

      cantidad: 1,

      precioBase,
      precioLista,
      porcentajeAdicional,
      precioAplicado,

      subtotal:
        precioAplicado,

      composicion,

      disponibilidad:
        null
    });

    version
      .disponibilidadGlobal =
      null;

    secuenciaDisponibilidad += 1;

    recalcularEconomia();
    renderDetalle();
    renderDisponibilidadGlobal();
  } catch (error) {
    showNotification(
      error?.message ||
      'No fue posible agregar el concepto.',
      {
        type: 'error'
      }
    );
  }
}

function eliminarDetalle(
  idDetalle
) {
  detalleLocal =
    detalleLocal.filter(
      item =>
        Number(
          item.idDetalle
        ) !==
        Number(
          idDetalle
        )
    );

  version.disponibilidadGlobal =
    null;

  secuenciaDisponibilidad += 1;

  recalcularEconomia();
  renderDetalle();
  renderDisponibilidadGlobal();
}

function actualizarCantidad(
  idDetalle,
  cantidad
) {
  const valor =
    Number(cantidad);

  if (
    !Number.isInteger(valor) ||
    valor <= 0
  ) {
    showNotification(
      'La cantidad debe ser un entero mayor a cero.',
      {
        type: 'error'
      }
    );

    renderDetalle();
    return;
  }

  detalleLocal =
    detalleLocal.map(
      item => {
        if (
          Number(
            item.idDetalle
          ) !==
          Number(
            idDetalle
          )
        ) {
          return item;
        }

        return {
          ...item,

          cantidad:
            valor,

          subtotal:
            valor *
            Number(
              item
                .precioAplicado ||
              0
            ),

          disponibilidad:
            null
        };
      }
    );

  version.disponibilidadGlobal =
    null;

  secuenciaDisponibilidad += 1;

  recalcularEconomia();
  renderDetalle();
  renderDisponibilidadGlobal();
}

function construirPayloadVersion() {
  return {
    idListaPrecio:
      Number(
        el(
          'versionListaPrecio'
        )?.value
      ) || null,

    detalle:
      detalleLocal.map(
        item => ({
          ...item
        })
      ),

    disponibilidadGlobal:
      version
        .disponibilidadGlobal ||
      null,

    importeConceptos:
      Number(
        version
          .importeConceptos ||
        0
      ),

    descuentos:
      Number(
        version.descuentos ||
        0
      ),

    impuestos:
      Number(
        version.impuestos ||
        0
      ),

    cargos:
      Number(
        version.cargos ||
        0
      ),

    total:
      Number(
        version.total ||
        0
      )
  };
}

async function guardarBorrador() {
  const payload =
    construirPayloadVersion();

  if (!payload.idListaPrecio) {
    showNotification(
      'Selecciona una Lista de Precios.',
      {
        type: 'error'
      }
    );

    return false;
  }

  try {
    version =
      await updateCotizacionVersion(
        cotizacion.idCotizacion,
        version.idVersion,
        payload
      );

    detalleLocal =
      Array.isArray(
        version.detalle
      )
        ? version.detalle.map(
            item => ({
              ...item
            })
          )
        : [];

    showNotification(
      'Borrador guardado correctamente.',
      {
        type: 'success'
      }
    );

    return true;
  } catch (error) {
    showNotification(
      error?.message ||
      'No fue posible guardar el Borrador.',
      {
        type: 'error'
      }
    );

    return false;
  }
}

async function enviarVersion() {
  const guardado =
    await guardarBorrador();

  if (!guardado) {
    return;
  }

  try {
    await sendCotizacionVersion(
      cotizacion.idCotizacion,
      version.idVersion
    );

    showNotification(
      'Versión enviada correctamente.',
      {
        type: 'success'
      }
    );

    location.hash =
      `#/cotizaciones/detalle?id=${
        Number(
          cotizacion
            .idCotizacion
        )
      }`;
  } catch (error) {
    showNotification(
      error?.message ||
      'No fue posible enviar la versión.',
      {
        type: 'error'
      }
    );
  }
}

async function eliminarVersion() {
  const respuesta =
    await openModal({
      title:
        'Eliminar versión en Borrador',

      body:
        '<p>Se eliminará esta versión. La cotización general no se eliminará de forma implícita.</p>',

      confirmText:
        'Eliminar versión',

      cancelText:
        'Cancelar',

      danger: true
    });

  if (!respuesta.confirmed) {
    return;
  }

  try {
    await deleteCotizacionVersion(
      cotizacion.idCotizacion,
      version.idVersion
    );

    showNotification(
      'Versión eliminada correctamente.',
      {
        type: 'success'
      }
    );

    location.hash =
      `#/cotizaciones/detalle?id=${
        Number(
          cotizacion
            .idCotizacion
        )
      }`;
  } catch (error) {
    showNotification(
      error?.message ||
      'No fue posible eliminar la versión.',
      {
        type: 'error'
      }
    );
  }
}

async function consultarProductoInventario(
  idProducto,
  cantidad
) {
  const resultado =
    await consultarDisponibilidadFutura({
      idProducto,
      cantidad,

      /*
       * Cotizaciones consulta para la
       * fecha del evento.
       * El contrato actual de Inventario
       * recibe un rango de fechas.
       */
      fechaInicio:
        cotizacion.fechaEvento,

      fechaFin:
        cotizacion.fechaEvento
    });

  return resultado.disponible ===
    true;
}

async function resolverDisponibilidadDetalle(
  item
) {
  if (
    item.tipoConcepto ===
    TIPOS_CONCEPTO_COTIZACION
      .PRODUCTO
  ) {
    const disponible =
      await consultarProductoInventario(
        item.idProducto,
        item.cantidad
      );

    return {
      ...item,

      disponibilidad:
        disponible
          ? 'DISPONIBLE'
          : 'INCOMPLETO'
    };
  }

  if (
    item.tipoConcepto ===
    TIPOS_CONCEPTO_COTIZACION
      .SERVICIO
  ) {
    /*
     * Inventario administra existencia
     * física de productos.
     */
    return {
      ...item,
      disponibilidad:
        'DISPONIBLE'
    };
  }

  if (
    item.tipoConcepto ===
    TIPOS_CONCEPTO_COTIZACION
      .PAQUETE
  ) {
    const paquete =
      await obtenerPaquete(
        item.idPaquete
      );

    const productosFisicos =
      paquete.detalleProductos ||
      [];

    if (
      !productosFisicos.length
    ) {
      return {
        ...item,
        disponibilidad:
          'DISPONIBLE'
      };
    }

    const resultados =
      await Promise.all(
        productosFisicos.map(
          componente =>
            consultarProductoInventario(
              componente.idProducto,

              Number(
                componente.cantidad ||
                0
              ) *
              Number(
                item.cantidad ||
                1
              )
            )
        )
      );

    return {
      ...item,

      disponibilidad:
        resultados.every(Boolean)
          ? 'DISPONIBLE'
          : 'INCOMPLETO'
    };
  }

  return {
    ...item,
    disponibilidad:
      'INCOMPLETO'
  };
}

async function consultarDisponibilidad() {
  if (!detalleLocal.length) {
    showNotification(
      'Agrega al menos un concepto antes de consultar disponibilidad.',
      {
        type: 'info'
      }
    );

    return;
  }

  if (!cotizacion.fechaEvento) {
    showNotification(
      'La cotización no tiene fecha de evento.',
      {
        type: 'error'
      }
    );

    return;
  }

  const secuencia =
    ++secuenciaDisponibilidad;

  const boton =
    el(
      'btnActualizarDisponibilidad'
    );

  if (boton) {
    boton.disabled = true;
    boton.textContent =
      'Consultando...';
  }

  try {
    const resultado =
      await Promise.all(
        detalleLocal.map(
          resolverDisponibilidadDetalle
        )
      );

    if (
      secuencia !==
      secuenciaDisponibilidad
    ) {
      return;
    }

    detalleLocal =
      resultado;

    const disponible =
      detalleLocal.every(
        item =>
          item.disponibilidad ===
          'DISPONIBLE'
      );

    version.disponibilidadGlobal =
      disponible
        ? 'DISPONIBLE'
        : 'INCOMPLETO';

    renderDetalle();
    renderDisponibilidadGlobal();

    showNotification(
      disponible
        ? 'Disponibilidad consultada: Disponible.'
        : 'Disponibilidad consultada: No disponible / Incompleto.',
      {
        type:
          disponible
            ? 'success'
            : 'info'
      }
    );
  } catch (error) {
    if (
      secuencia !==
      secuenciaDisponibilidad
    ) {
      return;
    }

    console.error(
      '[Cotizaciones] Error al consultar disponibilidad:',
      error
    );

    showNotification(
      error?.message ||
      'No fue posible consultar la disponibilidad.',
      {
        type: 'error'
      }
    );
  } finally {
    if (
      secuencia ===
      secuenciaDisponibilidad &&
      boton
    ) {
      boton.disabled = false;
      boton.textContent =
        'Consultar disponibilidad';
    }
  }
}

function cambiarTipoBusqueda(
  tipo
) {
  tipoBusqueda = tipo;

  document
    .querySelectorAll(
      '[data-tipo-concepto]'
    )
    .forEach(tab => {
      const activo =
        tab.dataset
          .tipoConcepto ===
        tipo;

      tab.classList.toggle(
        'is-active',
        activo
      );

      tab.setAttribute(
        'aria-selected',
        activo
          ? 'true'
          : 'false'
      );
    });

  buscarConceptos();
}

function registrarEventos() {
  el(
    'versionListaPrecio'
  )?.addEventListener(
    'change',
    async event => {
      const idListaPrecio =
        Number(
          event.target.value
        );

      version.idListaPrecio =
        idListaPrecio ||
        null;

      version.disponibilidadGlobal =
        null;

      detalleLocal =
        detalleLocal.map(
          item => ({
            ...item,
            disponibilidad: null
          })
        );

      secuenciaDisponibilidad += 1;

      renderDetalle();
      renderDisponibilidadGlobal();

      if (!idListaPrecio) {
        configuracionLista =
          null;

        renderConfiguracionLista(
          null
        );

        renderResultadoBusqueda(
          [],
          tipoBusqueda
        );

        return;
      }

      await cargarConfiguracionLista(
        idListaPrecio,
        true
      );

      await buscarConceptos();
    }
  );

  el(
    'buscarConcepto'
  )?.addEventListener(
    'input',
    programarBusqueda
  );

  el(
    'agregarConceptosTitulo'
  )
    ?.closest(
      '.cotizaciones-card'
    )
    ?.addEventListener(
      'click',
      event => {
        const tab =
          event.target.closest(
            '[data-tipo-concepto]'
          );

        if (tab) {
          cambiarTipoBusqueda(
            tab.dataset
              .tipoConcepto
          );

          return;
        }

        const botonAgregar =
          event.target.closest(
            '[data-agregar-concepto]'
          );

        if (!botonAgregar) {
          return;
        }

        agregarConcepto(
        Number(
          botonAgregar.dataset
            .agregarConcepto
        ),

        botonAgregar.dataset
          .tipoConcepto
      );

  el(
    'detalleVersionTitulo'
  )
    ?.closest(
      '.cotizaciones-card'
    )
    ?.addEventListener(
      'change',
      event => {
        const input =
          event.target.closest(
            '[data-cantidad-detalle]'
          );

        if (!input) {
          return;
        }

        actualizarCantidad(
          Number(
            input.dataset
              .cantidadDetalle
          ),
          input.value
        );
      }
    );

  el(
    'detalleVersionTitulo'
  )
    ?.closest(
      '.cotizaciones-card'
    )
    ?.addEventListener(
      'click',
      event => {
        const boton =
          event.target.closest(
            '[data-eliminar-detalle]'
          );

        if (!boton) {
          return;
        }

        eliminarDetalle(
          Number(
            boton.dataset
              .eliminarDetalle
          )
        );
      }
    );

  el(
    'btnGuardarVersion'
  )?.addEventListener(
    'click',
    guardarBorrador
  );

  el(
    'btnEnviarVersion'
  )?.addEventListener(
    'click',
    enviarVersion
  );

  el(
    'btnEliminarVersion'
  )?.addEventListener(
    'click',
    eliminarVersion
  );

  el(
    'btnActualizarDisponibilidad'
  )?.addEventListener(
    'click',
    consultarDisponibilidad
  );
}

async function inicializar() {
  const idCotizacion =
    obtenerEnteroParametro(
      'idCotizacion'
    );

  const idVersion =
    obtenerEnteroParametro(
      'idVersion'
    );

  const modo =
    obtenerParametrosHash()
      .get('modo');

  if (
    !idCotizacion ||
    !idVersion
  ) {
    mostrarError(
      'Los identificadores de cotización y versión son obligatorios.'
    );

    return;
  }

  try {
    [
      cotizacion,
      version
    ] =
      await Promise.all([
        getCotizacion(
          idCotizacion
        ),

        getCotizacionVersion(
          idCotizacion,
          idVersion
        )
      ]);

    clienteProspecto =
      await getClienteProspecto(
        cotizacion
          .idClienteProspecto
      ).catch(
        () => null
      );

    const cotizacionConfirmada = [
  ESTADOS_COTIZACION_GENERAL
    .CONFIRMADA,

  ESTADOS_COTIZACION_GENERAL
    .CONFIRMADA_RESERVADA
].includes(
  cotizacion.estadoGeneral
);

soloConsulta =
  modo === 'consulta' ||
  cotizacionConfirmada ||
  version.estadoVersion !==
    ESTADOS_VERSION_COTIZACION
      .BORRADOR;

    detalleLocal =
      Array.isArray(
        version.detalle
      )
        ? version.detalle.map(
            item => ({
              ...item
            })
          )
        : [];

    renderEncabezado();
    renderContexto();
    renderDetalle();
    recalcularEconomia();
    renderDisponibilidadGlobal();

    await cargarListas();
    await buscarConceptos();

    const buscador =
      el('buscarConcepto');

    if (buscador) {
      buscador.disabled =
        soloConsulta;
    }

    document
      .querySelectorAll(
        '[data-tipo-concepto]'
      )
      .forEach(tab => {
        tab.disabled =
          soloConsulta;
      });

    el(
      'btnActualizarDisponibilidad'
    ).disabled =
      false;

    el(
      'versionEstadoCarga'
    ).hidden =
      true;

    el(
      'versionContenido'
    ).hidden =
      false;
  } catch (error) {
    mostrarError(
      error?.message ||
      'Ocurrió un error inesperado.'
    );
  }
}

export function init() {
  cotizacion = null;
  version = null;
  clienteProspecto = null;

  listasDisponibles = [];
  configuracionLista = null;
  detalleLocal = [];

  tipoBusqueda =
    TIPOS_CONCEPTO_COTIZACION
      .PRODUCTO;

  /*
   * Invalida respuestas de búsquedas
   * y Listas de Precios anteriores.
   */
  secuenciaBusqueda += 1;
  secuenciaLista += 1;
  secuenciaDisponibilidad += 1;

  clearTimeout(
    temporizadorBusqueda
  );

  temporizadorBusqueda = null;

  soloConsulta = false;
  siguienteIdTemporal = -1;

  registrarEventos();
  inicializar();
}