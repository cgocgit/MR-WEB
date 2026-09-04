import {
  listarOrdenesRetorno,
  obtenerOrdenRetorno,
  registrarRetorno
} from '../../api/inventario-retornos.service.js';

import {
  getSession
} from '../../shared/auth-guard.js';

let ordenActual =
  null;

let cantidadesRetorno =
  new Map();

let secuenciaOrden =
  0;

let secuenciaBusqueda =
  0;

let procesandoRegistro =
  false;

let temporizadorBusqueda =
  null;

let idSolicitudActual =
  null;

function elemento(id) {
  return document.getElementById(
    id
  );
}

function texto(
  id,
  valor,
  vacio = '—'
) {
  const nodo =
    elemento(id);

  if (!nodo) {
    return;
  }

  nodo.textContent =
    valor === null ||
    valor === undefined ||
    valor === ''
      ? vacio
      : String(valor);
}

function formatoFechaHora(
  valor
) {
  if (!valor) {
    return '—';
  }

  const fecha =
    new Date(valor);

  if (
    Number.isNaN(
      fecha.getTime()
    )
  ) {
    return String(valor);
  }

  return new Intl.DateTimeFormat(
    'es-MX',
    {
      dateStyle: 'short',
      timeStyle: 'short'
    }
  ).format(fecha);
}

function formatoFecha(
  valor
) {
  if (!valor) {
    return '—';
  }

  const fecha =
    new Date(valor);

  if (
    Number.isNaN(
      fecha.getTime()
    )
  ) {
    return String(valor);
  }

  return new Intl.DateTimeFormat(
    'es-MX',
    {
      dateStyle: 'short'
    }
  ).format(fecha);
}

function obtenerUsuario() {
  const session =
    getSession();

  return (
    session?.user?.name ||
    session?.user?.username ||
    'Usuario'
  );
}

function crearIdSolicitud() {
  if (
    globalThis.crypto
      ?.randomUUID
  ) {
    return globalThis.crypto
      .randomUUID();
  }

  return [
    'retorno',
    Date.now(),
    Math.random()
      .toString(16)
      .slice(2)
  ].join('-');
}

function establecerBusy(
  valor
) {
  const pagina =
    elemento(
      'registro-retorno-page'
    );

  if (pagina) {
    pagina.setAttribute(
      'aria-busy',
      valor
        ? 'true'
        : 'false'
    );
  }
}

function limpiarFeedback() {
  const feedback =
    elemento(
      'retorno-feedback'
    );

  feedback.textContent =
    '';

  feedback.hidden =
    true;

  feedback.className =
    'inventario-salida-feedback';
}

function mostrarFeedback(
  mensaje,
  tipo = 'error'
) {
  const feedback =
    elemento(
      'retorno-feedback'
    );

  feedback.textContent =
    mensaje;

  feedback.className =
    'inventario-salida-feedback ' +
    `inventario-salida-feedback-${tipo}`;

  feedback.hidden =
    false;
}

function limpiarSelectOrdenes(
  mensaje =
    'Seleccione una Orden'
) {
  const select =
    elemento(
      'retorno-orden'
    );

  select.replaceChildren();

  const option =
    document.createElement(
      'option'
    );

  option.value =
    '';

  option.textContent =
    mensaje;

  select.appendChild(
    option
  );
}

function cargarOpcionesOrdenes(
  ordenes
) {
  const select =
    elemento(
      'retorno-orden'
    );

  limpiarSelectOrdenes(
    ordenes.length
      ? 'Seleccione una Orden'
      : 'Sin Órdenes disponibles'
  );

  ordenes.forEach(
    orden => {
      const option =
        document.createElement(
          'option'
        );

      option.value =
        String(
          orden.id
        );

      option.textContent =
        `${orden.folio} — ${orden.cliente}`;

      select.appendChild(
        option
      );
    }
  );

  select.disabled =
    ordenes.length === 0;
}

function crearBadge(
  valor,
  tipo = 'neutral'
) {
  const span =
    document.createElement(
      'span'
    );

  span.className =
    'inventario-salida-badge ' +
    `inventario-salida-badge-${tipo}`;

  span.textContent =
    valor;

  return span;
}

function normalizarCantidadEntrada(
  valor
) {
  if (
    valor === ''
  ) {
    return null;
  }

  const cantidad =
    Number(valor);

  if (
    !Number.isInteger(
      cantidad
    )
  ) {
    return Number.NaN;
  }

  return cantidad;
}

function validacionProducto(
  producto
) {
  const cantidad =
    cantidadesRetorno.get(
      Number(
        producto.idReserva
      )
    );

  if (
    cantidad === undefined ||
    cantidad === null
  ) {
    return {
      valida: true,
      texto: 'Sin captura',
      tipo: 'neutral'
    };
  }

  if (
    !Number.isInteger(
      cantidad
    ) ||
    cantidad <= 0
  ) {
    return {
      valida: false,
      texto: 'Inválida',
      tipo: 'danger'
    };
  }

  if (
    cantidad >
    producto.cantidadPendiente
  ) {
    return {
      valida: false,
      texto: 'Supera pendiente',
      tipo: 'danger'
    };
  }

  if (
    cantidad ===
    producto.cantidadPendiente
  ) {
    return {
      valida: true,
      texto:
        'Retorno completo',
      tipo: 'success'
    };
  }

  return {
    valida: true,
    texto:
      'Retorno parcial',
    tipo: 'warning'
  };
}

function crearProductoIdentidad(
  producto
) {
  const contenedor =
    document.createElement(
      'div'
    );

  contenedor.className =
    'inventario-salida-producto';

  const imagenWrap =
    document.createElement(
      'div'
    );

  imagenWrap.className =
    'inventario-salida-producto-imagen';

  if (
    producto.imagenUrl
  ) {
    const imagen =
      document.createElement(
        'img'
      );

    imagen.src =
      producto.imagenUrl;

    imagen.alt =
      `Imagen de ${producto.nombre}`;

    imagenWrap.appendChild(
      imagen
    );
  } else {
    const placeholder =
      document.createElement(
        'span'
      );

    placeholder.textContent =
      'Sin imagen';

    imagenWrap.appendChild(
      placeholder
    );
  }

  const datos =
    document.createElement(
      'div'
    );

  const nombre =
    document.createElement(
      'strong'
    );

  const codigo =
    document.createElement(
      'span'
    );

  nombre.textContent =
    producto.nombre;

  codigo.textContent =
    producto.codigo;

  datos.append(
    nombre,
    codigo
  );

  contenedor.append(
    imagenWrap,
    datos
  );

  return contenedor;
}

function crearInputCantidad(
  producto,
  origen
) {
  const wrap =
    document.createElement(
      'div'
    );

  wrap.className =
    'inventario-salida-cantidad-wrap';

  const input =
    document.createElement(
      'input'
    );

  input.type =
    'number';

  input.min =
    '1';

  input.max =
    String(
      producto.cantidadPendiente
    );

  input.step =
    '1';

  input.inputMode =
    'numeric';

  input.dataset.idReserva =
    String(
      producto.idReserva
    );

  input.dataset.origen =
    origen;

  input.setAttribute(
    'aria-label',
    `Cantidad de retorno para ${producto.nombre}`
  );

  const cantidadActual =
    cantidadesRetorno.get(
      Number(
        producto.idReserva
      )
    );

  if (
    cantidadActual !== undefined &&
    cantidadActual !== null &&
    !Number.isNaN(
      cantidadActual
    )
  ) {
    input.value =
      String(
        cantidadActual
      );
  }

  const ayuda =
    document.createElement(
      'small'
    );

  ayuda.textContent =
    `Máx. ${producto.cantidadPendiente}`;

  wrap.append(
    input,
    ayuda
  );

  return wrap;
}

function crearCelda(
  valor
) {
  const td =
    document.createElement(
      'td'
    );

  td.textContent =
    String(
      valor ?? '—'
    );

  return td;
}

function renderTablaProductos(
  productos
) {
  const tbody =
    elemento(
      'retorno-productos-tbody'
    );

  tbody.replaceChildren();

  productos.forEach(
    producto => {
      const tr =
        document.createElement(
          'tr'
        );

      const tdProducto =
        document.createElement(
          'td'
        );

      tdProducto.appendChild(
        crearProductoIdentidad(
          producto
        )
      );

      const tdCantidad =
        document.createElement(
          'td'
        );

      tdCantidad.appendChild(
        crearInputCantidad(
          producto,
          'tabla'
        )
      );

      const validacion =
        validacionProducto(
          producto
        );

      const tdResultado =
        document.createElement(
          'td'
        );

      tdResultado.appendChild(
        crearBadge(
          validacion.texto,
          validacion.tipo
        )
      );

      tr.append(
        tdProducto,

        crearCelda(
          producto.codigo
        ),

        crearCelda(
          producto.unidadMedida
        ),

        crearCelda(
          producto.cantidadSolicitada
        ),

        crearCelda(
          producto.cantidadSalida
        ),

        crearCelda(
          producto.cantidadRetornadaAcumulada
        ),

        crearCelda(
          producto.cantidadPendiente
        ),

        tdCantidad,
        tdResultado
      );

      tbody.appendChild(
        tr
      );
    }
  );
}

function agregarDatoCard(
  dl,
  etiqueta,
  valor
) {
  const contenedor =
    document.createElement(
      'div'
    );

  const dt =
    document.createElement(
      'dt'
    );

  const dd =
    document.createElement(
      'dd'
    );

  dt.textContent =
    etiqueta;

  dd.textContent =
    String(
      valor ?? '—'
    );

  contenedor.append(
    dt,
    dd
  );

  dl.appendChild(
    contenedor
  );
}

function renderCardsProductos(
  productos
) {
  const contenedor =
    elemento(
      'retorno-productos-cards'
    );

  contenedor.replaceChildren();

  productos.forEach(
    producto => {
      const card =
        document.createElement(
          'article'
        );

      card.className =
        'inventario-salida-producto-card';

      const header =
        document.createElement(
          'div'
        );

      header.className =
        'inventario-salida-producto-card-header';

      header.appendChild(
        crearProductoIdentidad(
          producto
        )
      );

      const validacion =
        validacionProducto(
          producto
        );

      header.appendChild(
        crearBadge(
          validacion.texto,
          validacion.tipo
        )
      );

      const datos =
        document.createElement(
          'dl'
        );

      datos.className =
        'inventario-salida-producto-card-datos';

      agregarDatoCard(
        datos,
        'Unidad',
        producto.unidadMedida
      );

      agregarDatoCard(
        datos,
        'Solicitada',
        producto.cantidadSolicitada
      );

      agregarDatoCard(
        datos,
        'Salida',
        producto.cantidadSalida
      );

      agregarDatoCard(
        datos,
        'Retornado acumulado',
        producto.cantidadRetornadaAcumulada
      );

      agregarDatoCard(
        datos,
        'Pendiente',
        producto.cantidadPendiente
      );

      const captura =
        document.createElement(
          'div'
        );

      captura.className =
        'form-field';

      const label =
        document.createElement(
          'label'
        );

      label.textContent =
        'Retorno actual';

      captura.append(
        label,
        crearInputCantidad(
          producto,
          'card'
        )
      );

      card.append(
        header,
        datos,
        captura
      );

      contenedor.appendChild(
        card
      );
    }
  );
}

function renderProductos() {
  if (
    !ordenActual
  ) {
    return;
  }

  renderTablaProductos(
    ordenActual.productos
  );

  renderCardsProductos(
    ordenActual.productos
  );
}

function resumenCaptura() {
  if (
    !ordenActual
  ) {
    return {
      partidas: [],
      total: 0,
      validas: false,
      pendientesPosteriores: 0
    };
  }

  let validas =
    true;

  let total =
    0;

  let pendientesPosteriores =
    0;

  const partidas =
    [];

  ordenActual.productos.forEach(
    producto => {
      const cantidad =
        cantidadesRetorno.get(
          Number(
            producto.idReserva
          )
        );

      if (
        cantidad !== undefined &&
        cantidad !== null
      ) {
        const validacion =
          validacionProducto(
            producto
          );

        if (
          !validacion.valida
        ) {
          validas =
            false;
        } else {
          partidas.push({
            idReserva:
              producto.idReserva,

            cantidad
          });

          total +=
            cantidad;
        }

        pendientesPosteriores +=
          Math.max(
            0,
            producto.cantidadPendiente -
            (
              Number.isInteger(
                cantidad
              ) &&
              cantidad > 0
                ? cantidad
                : 0
            )
          );
      } else {
        pendientesPosteriores +=
          producto.cantidadPendiente;
      }
    }
  );

  return {
    partidas,
    total,

    validas:
      validas &&
      partidas.length > 0,

    pendientesPosteriores
  };
}

function estadoReservaPrevisto(
  resumen
) {
  const cerrar =
    elemento(
      'retorno-cerrar-ciclo'
    ).checked;

  if (
    cerrar ||
    resumen.pendientesPosteriores ===
      0
  ) {
    return 'LIBERADA';
  }

  return 'ACTIVA';
}

function actualizarResumen() {
  if (
    !ordenActual
  ) {
    return;
  }

  const resumen =
    resumenCaptura();

  const estadoReserva =
    estadoReservaPrevisto(
      resumen
    );

  texto(
    'retorno-resumen-orden',
    ordenActual.orden.folio
  );

  texto(
    'retorno-resumen-cliente',
    `${ordenActual.orden.cliente} / ${ordenActual.orden.evento}`
  );

  texto(
    'retorno-resumen-productos',
    resumen.partidas.length
  );

  texto(
    'retorno-resumen-cantidad',
    resumen.total
  );

  texto(
    'retorno-resumen-existencia',
    resumen.total
  );

  texto(
    'retorno-resumen-reserva',
    estadoReserva
  );

  texto(
    'retorno-resumen-logistica',
    ordenActual.logistica
      ?.estadoRecoleccion
  );

  texto(
    'retorno-resumen-usuario',
    obtenerUsuario()
  );

  elemento(
    'retorno-registrar'
  ).disabled =
    procesandoRegistro ||
    !resumen.validas;
}

function renderOrden() {
  if (
    !ordenActual
  ) {
    return;
  }

  texto(
    'retorno-orden-folio',
    ordenActual.orden.folio
  );

  texto(
    'retorno-orden-cliente',
    ordenActual.orden.cliente
  );

  texto(
    'retorno-orden-evento',
    ordenActual.orden.evento
  );

  texto(
    'retorno-orden-fecha-servicio',
    formatoFecha(
      ordenActual.orden.fechaEntrega
    )
  );

  texto(
    'retorno-orden-estado',
    ordenActual.orden.estatus ||
    ordenActual.orden.estado
  );

  texto(
    'retorno-orden-logistica',
    ordenActual.logistica
      ?.estadoRecoleccion
  );

  texto(
    'retorno-orden-fecha-retorno',
    formatoFechaHora(
      ordenActual.orden.fechaRecoleccion ||
      ordenActual.logistica
        ?.fechaFin
    )
  );

  elemento(
    'retorno-orden-resumen'
  ).hidden =
    false;

  elemento(
    'retorno-productos'
  ).hidden =
    false;

  elemento(
    'retorno-captura-complementaria'
  ).hidden =
    false;

  renderProductos();

  actualizarResumen();
}

function limpiarOrdenVisual() {
  ordenActual =
    null;

  cantidadesRetorno =
    new Map();

  idSolicitudActual =
    null;

  elemento(
    'retorno-orden-resumen'
  ).hidden =
    true;

  elemento(
    'retorno-productos'
  ).hidden =
    true;

  elemento(
    'retorno-captura-complementaria'
  ).hidden =
    true;

  elemento(
    'retorno-resultado'
  ).hidden =
    true;

  elemento(
    'retorno-productos-tbody'
  ).replaceChildren();

  elemento(
    'retorno-productos-cards'
  ).replaceChildren();

  elemento(
    'retorno-observaciones'
  ).value =
    '';

  elemento(
    'retorno-observaciones-contador'
  ).textContent =
    '0 / 500 caracteres';

  elemento(
    'retorno-cerrar-ciclo'
  ).checked =
    false;

  elemento(
    'retorno-registrar'
  ).disabled =
    true;
}

async function buscarOrdenes(
  textoBusqueda
) {
  const secuencia =
    ++secuenciaBusqueda;

  try {
    const ordenes =
      await listarOrdenesRetorno(
        textoBusqueda
      );

    if (
      secuencia !==
      secuenciaBusqueda
    ) {
      return;
    }

    cargarOpcionesOrdenes(
      ordenes
    );
  } catch (error) {
    if (
      secuencia !==
      secuenciaBusqueda
    ) {
      return;
    }

    limpiarSelectOrdenes(
      'No fue posible cargar Órdenes'
    );

    elemento(
      'retorno-orden'
    ).disabled =
      true;

    mostrarFeedback(
      error.message
    );
  }
}

async function cargarOrden(
  idOrden
) {
  const secuencia =
    ++secuenciaOrden;

  limpiarFeedback();

  limpiarOrdenVisual();

  if (
    !idOrden
  ) {
    return;
  }

  establecerBusy(
    true
  );

  try {
    const datos =
      await obtenerOrdenRetorno(
        idOrden
      );

    if (
      secuencia !==
      secuenciaOrden
    ) {
      return;
    }

    ordenActual =
      datos;

    renderOrden();
  } catch (error) {
    if (
      secuencia !==
      secuenciaOrden
    ) {
      return;
    }

    mostrarFeedback(
      error.message
    );
  } finally {
    if (
      secuencia ===
      secuenciaOrden
    ) {
      establecerBusy(
        false
      );
    }
  }
}

function sincronizarInputs(
  idReserva,
  valor,
  origen
) {
  document
    .querySelectorAll(
      `[data-id-reserva="${idReserva}"][data-origen]`
    )
    .forEach(
      input => {
        if (
          input.dataset.origen !==
          origen
        ) {
          input.value =
            valor ?? '';
        }
      }
    );
}

function procesarCantidad(
  evento
) {
  const input =
    evento.target.closest(
      '[data-id-reserva][data-origen]'
    );

  if (
    !input
  ) {
    return;
  }

  const idReserva =
    Number(
      input.dataset.idReserva
    );

  const cantidad =
    normalizarCantidadEntrada(
      input.value
    );

  if (
    cantidad === null
  ) {
    cantidadesRetorno.delete(
      idReserva
    );
  } else {
    cantidadesRetorno.set(
      idReserva,
      cantidad
    );
  }

  sincronizarInputs(
    idReserva,
    input.value,
    input.dataset.origen
  );

  renderProductos();

  actualizarResumen();
}

function prepararConfirmacion() {
  const resumen =
    resumenCaptura();

  if (
    !ordenActual ||
    !resumen.validas
  ) {
    mostrarFeedback(
      'Capture una cantidad válida de retorno para al menos un producto.'
    );

    return false;
  }

  limpiarFeedback();

  idSolicitudActual =
    crearIdSolicitud();

  texto(
    'retorno-confirmacion-orden',
    ordenActual.orden.folio
  );

  texto(
    'retorno-confirmacion-cliente',
    `${ordenActual.orden.cliente} / ${ordenActual.orden.evento}`
  );

  texto(
    'retorno-confirmacion-productos',
    resumen.partidas.length
  );

  texto(
    'retorno-confirmacion-cantidad',
    resumen.total
  );

  texto(
    'retorno-confirmacion-reserva',
    estadoReservaPrevisto(
      resumen
    )
  );

  texto(
    'retorno-confirmacion-logistica',
    ordenActual.logistica
      ?.estadoRecoleccion
  );

  elemento(
    'retorno-confirmacion'
  ).showModal();

  return true;
}

function actualizarProductosTrasRegistro(
  resultado
) {
  if (
    !ordenActual
  ) {
    return;
  }

  const porReserva =
    new Map(
      resultado.productos.map(
        producto => [
          Number(
            producto.idReserva
          ),
          producto
        ]
      )
    );

  ordenActual.productos =
    ordenActual.productos.map(
      producto => {
        const actualizado =
          porReserva.get(
            Number(
              producto.idReserva
            )
          );

        if (
          !actualizado
        ) {
          return producto;
        }

        return {
          ...producto,

          estadoReserva:
            actualizado.estadoReserva,

          cantidadRetornadaAcumulada:
            actualizado
              .cantidadRetornadaAcumulada,

          cantidadPendiente:
            actualizado
              .cantidadPendiente
        };
      }
    );
}

async function confirmarRegistro() {
  if (
    procesandoRegistro ||
    !ordenActual ||
    !idSolicitudActual
  ) {
    return;
  }

  const resumen =
    resumenCaptura();

  if (
    !resumen.validas
  ) {
    elemento(
      'retorno-confirmacion'
    ).close();

    mostrarFeedback(
      'La captura cambió. Revise nuevamente las cantidades de retorno.'
    );

    return;
  }

  procesandoRegistro =
    true;

  establecerBusy(
    true
  );

  elemento(
    'retorno-confirmacion-aceptar'
  ).disabled =
    true;

  elemento(
    'retorno-confirmacion-cancelar'
  ).disabled =
    true;

  elemento(
    'retorno-confirmacion-cerrar'
  ).disabled =
    true;

  try {
    const resultado =
      await registrarRetorno({
        idOrden:
          ordenActual.orden.id,

        partidas:
          resumen.partidas,

        observaciones:
          elemento(
            'retorno-observaciones'
          ).value,

        cerrarCiclo:
          elemento(
            'retorno-cerrar-ciclo'
          ).checked,

        idSolicitud:
          idSolicitudActual
      });

    elemento(
      'retorno-confirmacion'
    ).close();

    actualizarProductosTrasRegistro(
      resultado
    );

    cantidadesRetorno =
      new Map();

    idSolicitudActual =
      null;

    texto(
      'retorno-resultado-folio',
      resultado.folioRetorno
    );

    texto(
      'retorno-resultado-orden',
      resultado.folioOrden
    );

    texto(
      'retorno-resultado-fecha',
      formatoFechaHora(
        resultado.fechaRegistro
      )
    );

    texto(
      'retorno-resultado-total',
      `${resultado.totalRetornado} piezas`
    );

    texto(
      'retorno-resultado-reserva',
      resultado.estadoReservaResultante
    );

    elemento(
      'retorno-resultado'
    ).hidden =
      false;

    mostrarFeedback(
      'El retorno fue registrado correctamente.',
      'success'
    );

    if (
      resultado.cicloCerrado
    ) {
      elemento(
        'retorno-productos'
      ).hidden =
        true;

      elemento(
        'retorno-captura-complementaria'
      ).hidden =
        true;

      elemento(
        'retorno-registrar'
      ).disabled =
        true;
    } else {
      ordenActual.productos =
        ordenActual.productos.filter(
          producto =>
            producto.cantidadPendiente >
            0
        );

      if (
        ordenActual.productos.length >
        0
      ) {
        renderProductos();

        actualizarResumen();
      } else {
        elemento(
          'retorno-productos'
        ).hidden =
          true;

        elemento(
          'retorno-captura-complementaria'
        ).hidden =
          true;

        elemento(
          'retorno-registrar'
        ).disabled =
          true;
      }
    }
  } catch (error) {
    mostrarFeedback(
      error.message
    );
  } finally {
    procesandoRegistro =
      false;

    establecerBusy(
      false
    );

    elemento(
      'retorno-confirmacion-aceptar'
    ).disabled =
      false;

    elemento(
      'retorno-confirmacion-cancelar'
    ).disabled =
      false;

    elemento(
      'retorno-confirmacion-cerrar'
    ).disabled =
      false;

    actualizarResumen();
  }
}

function limpiarPantalla() {
  limpiarFeedback();

  limpiarOrdenVisual();

  elemento(
    'retorno-buscar-folio'
  ).value =
    '';

  elemento(
    'retorno-orden'
  ).value =
    '';

  buscarOrdenes(
    ''
  );
}

function registrarEventos() {
  elemento(
    'retorno-buscar-folio'
  ).addEventListener(
    'input',
    evento => {
      window.clearTimeout(
        temporizadorBusqueda
      );

      temporizadorBusqueda =
        window.setTimeout(
          () => {
            buscarOrdenes(
              evento.target.value
            );
          },
          250
        );
    }
  );

  elemento(
    'retorno-orden'
  ).addEventListener(
    'change',
    evento => {
      cargarOrden(
        evento.target.value
      );
    }
  );

  elemento(
    'retorno-form'
  ).addEventListener(
    'change',
    evento => {
      if (
        evento.target.matches(
          '[data-id-reserva][data-origen]'
        )
      ) {
        procesarCantidad(
          evento
        );
      }
    }
  );

  elemento(
    'retorno-observaciones'
  ).addEventListener(
    'input',
    evento => {
      texto(
        'retorno-observaciones-contador',
        `${evento.target.value.length} / 500 caracteres`
      );
    }
  );

  elemento(
    'retorno-cerrar-ciclo'
  ).addEventListener(
    'change',
    () => {
      actualizarResumen();
    }
  );

  elemento(
    'retorno-form'
  ).addEventListener(
    'submit',
    evento => {
      evento.preventDefault();

      prepararConfirmacion();
    }
  );

  elemento(
    'retorno-limpiar'
  ).addEventListener(
    'click',
    limpiarPantalla
  );

  elemento(
    'retorno-confirmacion-cerrar'
  ).addEventListener(
    'click',
    () => {
      idSolicitudActual =
        null;

      elemento(
        'retorno-confirmacion'
      ).close();
    }
  );

  elemento(
    'retorno-confirmacion-cancelar'
  ).addEventListener(
    'click',
    () => {
      idSolicitudActual =
        null;

      elemento(
        'retorno-confirmacion'
      ).close();
    }
  );

  elemento(
    'retorno-confirmacion-aceptar'
  ).addEventListener(
    'click',
    confirmarRegistro
  );

  elemento(
    'retorno-confirmacion'
  ).addEventListener(
    'cancel',
    evento => {
      if (
        procesandoRegistro
      ) {
        evento.preventDefault();
        return;
      }

      idSolicitudActual =
        null;
    }
  );
}

export async function init() {
  const pagina =
    elemento(
      'registro-retorno-page'
    );

  if (
    !pagina
  ) {
    return;
  }

  texto(
    'retorno-fecha-hora',
    formatoFechaHora(
      new Date()
        .toISOString()
    )
  );

  texto(
    'retorno-resumen-usuario',
    obtenerUsuario()
  );

  registrarEventos();

  establecerBusy(
    true
  );

  try {
    await buscarOrdenes(
      ''
    );
  } finally {
    establecerBusy(
      false
    );
  }
}