import {
  listarOrdenesSalida,
  obtenerOrdenSalida,
  registrarSalida
} from '../../api/inventario-salidas.service.js';

import {
  getSession
} from '../../shared/auth-guard.js';

let ordenActual = null;
let cantidadesSalida = new Map();

let secuenciaOrden = 0;
let secuenciaBusqueda = 0;

let procesandoRegistro = false;
let temporizadorBusqueda = null;
let idSolicitudActual = null;

function elemento(id) {
  return document.getElementById(id);
}

function texto(
  id,
  valor,
  vacio = '—'
) {
  const nodo = elemento(id);

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

function formatoFechaHora(valor) {
  if (!valor) {
    return '—';
  }

  const fecha = new Date(valor);

  if (Number.isNaN(fecha.getTime())) {
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

function formatoPeriodo(
  inicio,
  fin
) {
  return (
    `${formatoFechaHora(inicio)} — ` +
    formatoFechaHora(fin)
  );
}

function obtenerUsuario() {
  const session = getSession();

  return (
    session?.user?.name ||
    session?.user?.username ||
    'Usuario'
  );
}

function crearIdSolicitud() {
  if (globalThis.crypto?.randomUUID) {
    return globalThis.crypto.randomUUID();
  }

  return [
    'salida',
    Date.now(),
    Math.random()
      .toString(16)
      .slice(2)
  ].join('-');
}

function establecerBusy(valor) {
  const pagina =
    elemento(
      'registro-salida-page'
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
      'salida-feedback'
    );

  feedback.textContent = '';
  feedback.hidden = true;
  feedback.className =
    'inventario-salida-feedback';
}

function mostrarFeedback(
  mensaje,
  tipo = 'error'
) {
  const feedback =
    elemento(
      'salida-feedback'
    );

  feedback.textContent =
    mensaje;

  feedback.className =
    'inventario-salida-feedback ' +
    `inventario-salida-feedback-${tipo}`;

  feedback.hidden = false;
}

function limpiarSelectOrdenes(
  mensaje = 'Seleccione una Orden'
) {
  const select =
    elemento(
      'salida-orden'
    );

  select.replaceChildren();

  const option =
    document.createElement(
      'option'
    );

  option.value = '';
  option.textContent = mensaje;

  select.appendChild(
    option
  );
}

function cargarOpcionesOrdenes(
  ordenes
) {
  const select =
    elemento(
      'salida-orden'
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

function tipoEstadoReserva(
  estado
) {
  return estado === 'ACTIVA'
    ? 'success'
    : 'info';
}

function tipoEstadoLogistico(
  estado
) {
  return (
    estado ===
    'RECOLECCION_COMPLETADA'
  )
    ? 'success'
    : 'warning';
}

function normalizarCantidadEntrada(
  valor
) {
  if (valor === '') {
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

function obtenerValidacionProducto(
  producto
) {
  const cantidad =
    cantidadesSalida.get(
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
      texto: 'Completa',
      tipo: 'success'
    };
  }

  return {
    valida: true,
    texto: 'Parcial',
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

  input.type = 'number';
  input.min = '1';

  input.max =
    String(
      producto.cantidadPendiente
    );

  input.step = '1';
  input.inputMode = 'numeric';

  input.dataset.idReserva =
    String(
      producto.idReserva
    );

  input.dataset.origen =
    origen;

  input.setAttribute(
    'aria-label',
    `Cantidad de salida para ${producto.nombre}`
  );

  const cantidadActual =
    cantidadesSalida.get(
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

function crearCelda(valor) {
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
      'salida-productos-tbody'
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

      const tdEstado =
        document.createElement(
          'td'
        );

      tdEstado.appendChild(
        crearBadge(
          producto.estadoReserva,
          tipoEstadoReserva(
            producto.estadoReserva
          )
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
        obtenerValidacionProducto(
          producto
        );

      const tdValidacion =
        document.createElement(
          'td'
        );

      tdValidacion.appendChild(
        crearBadge(
          validacion.texto,
          validacion.tipo
        )
      );

      tr.append(
        tdProducto,
        crearCelda(
          producto.unidadMedida
        ),
        tdEstado,
        crearCelda(
          producto.cantidadReservada
        ),
        crearCelda(
          producto.cantidadEntregadaAcumulada
        ),
        crearCelda(
          producto.cantidadPendiente
        ),
        tdCantidad,
        tdValidacion
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
  const div =
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

  div.append(
    dt,
    dd
  );

  dl.appendChild(
    div
  );
}

function renderCardsProductos(
  productos
) {
  const contenedor =
    elemento(
      'salida-productos-cards'
    );

  contenedor.replaceChildren();

  productos.forEach(
    producto => {
      const article =
        document.createElement(
          'article'
        );

      article.className =
        'inventario-salida-producto-card';

      const encabezado =
        document.createElement(
          'div'
        );

      encabezado.className =
        'inventario-salida-producto-card-header';

      encabezado.appendChild(
        crearProductoIdentidad(
          producto
        )
      );

      encabezado.appendChild(
        crearBadge(
          producto.estadoReserva,
          tipoEstadoReserva(
            producto.estadoReserva
          )
        )
      );

      const dl =
        document.createElement(
          'dl'
        );

      dl.className =
        'inventario-salida-producto-card-datos';

      agregarDatoCard(
        dl,
        'Unidad',
        producto.unidadMedida
      );

      agregarDatoCard(
        dl,
        'Reservada',
        producto.cantidadReservada
      );

      agregarDatoCard(
        dl,
        'Entregada acumulada',
        producto.cantidadEntregadaAcumulada
      );

      agregarDatoCard(
        dl,
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
        'Salida actual';

      captura.append(
        label,
        crearInputCantidad(
          producto,
          'card'
        )
      );

      const validacion =
        obtenerValidacionProducto(
          producto
        );

      const estado =
        document.createElement(
          'div'
        );

      estado.className =
        'inventario-salida-card-validacion';

      estado.appendChild(
        crearBadge(
          validacion.texto,
          validacion.tipo
        )
      );

      article.append(
        encabezado,
        dl,
        captura,
        estado
      );

      contenedor.appendChild(
        article
      );
    }
  );
}

function renderProductos() {
  if (!ordenActual) {
    return;
  }

  renderTablaProductos(
    ordenActual.productos
  );

  renderCardsProductos(
    ordenActual.productos
  );
}

function resultadoCaptura() {
  if (!ordenActual) {
    return {
      partidas: [],
      cantidadTotal: 0,
      productosIncluidos: 0,
      valida: false,
      estadoLogistico: null
    };
  }

  const partidas = [];
  let valida = true;

  ordenActual.productos.forEach(
    producto => {
      const cantidad =
        cantidadesSalida.get(
          Number(
            producto.idReserva
          )
        );

      if (
        cantidad === undefined ||
        cantidad === null
      ) {
        return;
      }

      if (
        !Number.isInteger(
          cantidad
        ) ||
        cantidad <= 0 ||
        cantidad >
          producto.cantidadPendiente
      ) {
        valida = false;
        return;
      }

      partidas.push({
        idReserva:
          producto.idReserva,
        cantidad
      });
    }
  );

  if (
    partidas.length === 0
  ) {
    valida = false;
  }

  const cantidadTotal =
    partidas.reduce(
      (
        total,
        partida
      ) =>
        total +
        partida.cantidad,
      0
    );

  const cantidades =
    new Map(
      partidas.map(
        partida => [
          Number(
            partida.idReserva
          ),
          partida.cantidad
        ]
      )
    );

  const existePendiente =
    ordenActual.productos.some(
      producto =>
        producto.cantidadPendiente -
          (
            cantidades.get(
              Number(
                producto.idReserva
              )
            ) || 0
          ) >
        0
    );

  return {
    partidas,
    cantidadTotal,
    productosIncluidos:
      partidas.length,
    valida,
    estadoLogistico:
      existePendiente
        ? 'RECOLECCION_EN_PROCESO'
        : 'RECOLECCION_COMPLETADA'
  };
}

function renderEstadoEnNodo(
  id,
  valor,
  tipo
) {
  const nodo =
    elemento(id);

  nodo.replaceChildren();

  if (!valor) {
    nodo.textContent = '—';
    return;
  }

  nodo.appendChild(
    crearBadge(
      valor,
      tipo
    )
  );
}

function actualizarResumen() {
  const resumen =
    resultadoCaptura();

  if (!ordenActual) {
    return;
  }

  texto(
    'salida-resumen-orden',
    ordenActual.orden.folio
  );

  texto(
    'salida-resumen-cliente',
    `${ordenActual.orden.cliente} / ` +
      `${ordenActual.orden.evento}`
  );

  texto(
    'salida-resumen-productos',
    resumen.productosIncluidos,
    '0'
  );

  texto(
    'salida-resumen-cantidad',
    resumen.cantidadTotal,
    '0'
  );

  texto(
    'salida-resumen-usuario',
    obtenerUsuario()
  );

  renderEstadoEnNodo(
    'salida-resumen-reserva',
    resumen.productosIncluidos
      ? 'ACTIVA'
      : null,
    'success'
  );

  renderEstadoEnNodo(
    'salida-resumen-logistica',
    resumen.productosIncluidos
      ? resumen.estadoLogistico
      : null,
    tipoEstadoLogistico(
      resumen.estadoLogistico
    )
  );

  elemento(
    'salida-registrar'
  ).disabled =
    !resumen.valida ||
    procesandoRegistro;
}

function sincronizarInputs(
  idReserva,
  valor,
  origen
) {
  document.querySelectorAll(
    `input[data-id-reserva="${idReserva}"]`
  ).forEach(
    input => {
      if (
        input.dataset.origen !==
        origen
      ) {
        input.value =
          valor;
      }
    }
  );
}

function cambiarCantidad(
  evento
) {
  const input =
    evento.target.closest(
      'input[data-id-reserva]'
    );

  if (!input) {
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
    cantidadesSalida.delete(
      idReserva
    );
  } else {
    cantidadesSalida.set(
      idReserva,
      cantidad
    );
  }

  sincronizarInputs(
    idReserva,
    input.value,
    input.dataset.origen
  );

  idSolicitudActual = null;

  renderProductos();
  actualizarResumen();
}

function ocultarDatosOrden() {
  elemento(
    'salida-orden-resumen'
  ).hidden = true;

  elemento(
    'salida-logistica'
  ).hidden = true;

  elemento(
    'salida-productos'
  ).hidden = true;

  elemento(
    'salida-captura-complementaria'
  ).hidden = true;

  elemento(
    'salida-advertencia'
  ).hidden = true;

  elemento(
    'salida-registrar'
  ).disabled = true;
}

function limpiarOperacion({
  conservarResultado = false
} = {}) {
  ++secuenciaOrden;

  ordenActual = null;
  cantidadesSalida =
    new Map();

  idSolicitudActual = null;

  elemento(
    'salida-orden'
  ).value = '';

  elemento(
    'salida-observaciones'
  ).value = '';

  texto(
    'salida-observaciones-contador',
    '0 / 500 caracteres'
  );

  ocultarDatosOrden();
  limpiarFeedback();

  if (
    !conservarResultado
  ) {
    elemento(
      'salida-resultado'
    ).hidden = true;
  }
}

function mostrarOrden(datos) {
  ordenActual = datos;

  cantidadesSalida =
    new Map();

  idSolicitudActual =
    null;

  texto(
    'salida-orden-folio',
    datos.orden.folio
  );

  texto(
    'salida-orden-cliente',
    datos.orden.cliente
  );

  texto(
    'salida-orden-evento',
    datos.orden.evento
  );

  texto(
    'salida-orden-direccion',
    datos.orden.direccionEntrega ||
      datos.logistica.direccion
  );

  renderEstadoEnNodo(
    'salida-orden-estado',
    datos.orden.estado,
    'success'
  );

  texto(
    'salida-orden-periodo',
    formatoPeriodo(
      datos.logistica.fechaInicio,
      datos.logistica.fechaFin
    )
  );

  texto(
    'salida-logistica-inicio',
    formatoFechaHora(
      datos.logistica.fechaInicio
    )
  );

  texto(
    'salida-logistica-fin',
    formatoFechaHora(
      datos.logistica.fechaFin
    )
  );

  texto(
    'salida-logistica-direccion',
    datos.logistica.direccion ||
      datos.orden.direccionEntrega
  );

  texto(
    'salida-logistica-responsable',
    datos.logistica.responsable
  );

  texto(
    'salida-logistica-vehiculo',
    datos.logistica.vehiculo
  );

  renderEstadoEnNodo(
    'salida-logistica-estado',
    datos.logistica.estadoRecoleccion,
    tipoEstadoLogistico(
      datos.logistica.estadoRecoleccion
    )
  );

  elemento(
    'salida-orden-resumen'
  ).hidden = false;

  elemento(
    'salida-logistica'
  ).hidden = false;

  elemento(
    'salida-productos'
  ).hidden = false;

  elemento(
    'salida-captura-complementaria'
  ).hidden = false;

  elemento(
    'salida-advertencia'
  ).hidden = false;

  elemento(
    'salida-resultado'
  ).hidden = true;

  renderProductos();
  actualizarResumen();
}

async function cargarOrden(
  idOrden
) {
  const solicitud =
    ++secuenciaOrden;

  limpiarFeedback();

  ordenActual = null;

  cantidadesSalida =
    new Map();

  idSolicitudActual =
    null;

  ocultarDatosOrden();

  if (!idOrden) {
    return;
  }

  establecerBusy(true);

  try {
    const datos =
      await obtenerOrdenSalida(
        idOrden
      );

    if (
      solicitud !==
      secuenciaOrden
    ) {
      return;
    }

    mostrarOrden(
      datos
    );
  } catch (error) {
    if (
      solicitud !==
      secuenciaOrden
    ) {
      return;
    }

    mostrarFeedback(
      error.message ||
        'No fue posible consultar la Orden de Servicio.'
    );
  } finally {
    if (
      solicitud ===
      secuenciaOrden
    ) {
      establecerBusy(false);
    }
  }
}

async function buscarOrdenes(
  textoBusqueda = ''
) {
  const solicitud =
    ++secuenciaBusqueda;

  const select =
    elemento(
      'salida-orden'
    );

  select.disabled = true;

  limpiarSelectOrdenes(
    'Consultando Órdenes...'
  );

  try {
    const ordenes =
      await listarOrdenesSalida(
        textoBusqueda
      );

    if (
      solicitud !==
      secuenciaBusqueda
    ) {
      return;
    }

    cargarOpcionesOrdenes(
      ordenes
    );
  } catch (error) {
    if (
      solicitud !==
      secuenciaBusqueda
    ) {
      return;
    }

    limpiarSelectOrdenes(
      'No fue posible cargar Órdenes'
    );

    mostrarFeedback(
      error.message ||
        'No fue posible consultar las Órdenes disponibles.'
    );
  }
}

function programarBusqueda() {
  window.clearTimeout(
    temporizadorBusqueda
  );

  temporizadorBusqueda =
    window.setTimeout(
      () => {
        ++secuenciaOrden;

        ordenActual = null;

        cantidadesSalida =
          new Map();

        ocultarDatosOrden();

        buscarOrdenes(
          elemento(
            'salida-buscar-folio'
          ).value
        );
      },
      250
    );
}

function actualizarContadorObservaciones() {
  const valor =
    elemento(
      'salida-observaciones'
    ).value;

  texto(
    'salida-observaciones-contador',
    `${valor.length} / 500 caracteres`
  );
}

function prepararConfirmacion() {
  const resumen =
    resultadoCaptura();

  if (!ordenActual) {
    mostrarFeedback(
      'Seleccione una Orden de Servicio.'
    );

    return;
  }

  if (!resumen.valida) {
    mostrarFeedback(
      'Capture cantidades enteras mayores que cero ' +
      'y no superiores a la cantidad pendiente.'
    );

    return;
  }

  limpiarFeedback();

  idSolicitudActual =
    crearIdSolicitud();

  texto(
    'salida-confirmacion-orden',
    ordenActual.orden.folio
  );

  texto(
    'salida-confirmacion-cliente',
    `${ordenActual.orden.cliente} / ` +
      `${ordenActual.orden.evento}`
  );

  texto(
    'salida-confirmacion-productos',
    resumen.productosIncluidos
  );

  texto(
    'salida-confirmacion-cantidad',
    resumen.cantidadTotal
  );

  texto(
    'salida-confirmacion-reserva',
    'ACTIVA'
  );

  renderEstadoEnNodo(
    'salida-confirmacion-logistica',
    resumen.estadoLogistico,
    tipoEstadoLogistico(
      resumen.estadoLogistico
    )
  );

  elemento(
    'salida-confirmacion'
  ).showModal();
}

function cerrarConfirmacion() {
  const dialog =
    elemento(
      'salida-confirmacion'
    );

  if (
    dialog.open
  ) {
    dialog.close();
  }

  idSolicitudActual =
    null;
}

function mostrarResultado(
  resultado
) {
  texto(
    'salida-resultado-folio',
    resultado.folioSalida
  );

  texto(
    'salida-resultado-orden',
    resultado.folioOrden
  );

  texto(
    'salida-resultado-fecha',
    formatoFechaHora(
      resultado.fechaRegistro
    )
  );

  renderEstadoEnNodo(
    'salida-resultado-logistica',
    resultado.estadoLogisticoResultante,
    tipoEstadoLogistico(
      resultado.estadoLogisticoResultante
    )
  );

  elemento(
    'salida-resultado'
  ).hidden = false;
}

async function confirmarRegistro() {
  if (
    procesandoRegistro ||
    !ordenActual
  ) {
    return;
  }

  const resumen =
    resultadoCaptura();

  if (
    !resumen.valida ||
    !idSolicitudActual
  ) {
    cerrarConfirmacion();

    mostrarFeedback(
      'La captura cambió. Revise nuevamente ' +
      'las cantidades antes de registrar.'
    );

    return;
  }

  const datos = {
    idOrden:
      ordenActual.orden.id,

    partidas:
      resumen.partidas,

    observaciones:
      elemento(
        'salida-observaciones'
      ).value,

    idSolicitud:
      idSolicitudActual
  };

  procesandoRegistro = true;

  establecerBusy(true);

  elemento(
    'salida-registrar'
  ).disabled = true;

  elemento(
    'salida-confirmacion-aceptar'
  ).disabled = true;

  elemento(
    'salida-confirmacion-cancelar'
  ).disabled = true;

  elemento(
    'salida-confirmacion-cerrar'
  ).disabled = true;

  limpiarFeedback();

  try {
    const resultado =
      await registrarSalida(
        datos
      );

    if (
      elemento(
        'salida-confirmacion'
      ).open
    ) {
      elemento(
        'salida-confirmacion'
      ).close();
    }

    limpiarOperacion({
      conservarResultado: true
    });

    mostrarResultado(
      resultado
    );

    mostrarFeedback(
      `Salida ${resultado.folioSalida} registrada correctamente.`,
      'success'
    );

    await buscarOrdenes('');
  } catch (error) {
    if (
      elemento(
        'salida-confirmacion'
      ).open
    ) {
      elemento(
        'salida-confirmacion'
      ).close();
    }

    idSolicitudActual =
      null;

    const mensaje =
      error.message ||
      'No fue posible registrar la salida.';

    const idOrden =
      ordenActual?.orden?.id;

    if (idOrden) {
      await cargarOrden(
        idOrden
      );
    }

    mostrarFeedback(
      mensaje
    );
  } finally {
    procesandoRegistro =
      false;

    establecerBusy(false);

    elemento(
      'salida-confirmacion-aceptar'
    ).disabled = false;

    elemento(
      'salida-confirmacion-cancelar'
    ).disabled = false;

    elemento(
      'salida-confirmacion-cerrar'
    ).disabled = false;

    actualizarResumen();
  }
}

function registrarEventos() {
  elemento(
    'salida-buscar-folio'
  ).addEventListener(
    'input',
    programarBusqueda
  );

  elemento(
    'salida-orden'
  ).addEventListener(
    'change',
    evento =>
      cargarOrden(
        evento.target.value
      )
  );

  elemento(
    'salida-productos'
  ).addEventListener(
    'change',
    cambiarCantidad
  );

  elemento(
    'salida-observaciones'
  ).addEventListener(
    'input',
    actualizarContadorObservaciones
  );

  elemento(
    'salida-form'
  ).addEventListener(
    'submit',
    evento => {
      evento.preventDefault();
      prepararConfirmacion();
    }
  );

  elemento(
    'salida-limpiar'
  ).addEventListener(
    'click',
    () => {
      elemento(
        'salida-buscar-folio'
      ).value = '';

      limpiarOperacion();
      buscarOrdenes('');
    }
  );

  elemento(
    'salida-confirmacion-cerrar'
  ).addEventListener(
    'click',
    cerrarConfirmacion
  );

  elemento(
    'salida-confirmacion-cancelar'
  ).addEventListener(
    'click',
    cerrarConfirmacion
  );

  elemento(
    'salida-confirmacion-aceptar'
  ).addEventListener(
    'click',
    confirmarRegistro
  );

  elemento(
    'salida-confirmacion'
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
      'registro-salida-page'
    );

  if (!pagina) {
    return;
  }

  texto(
    'salida-fecha-hora',
    formatoFechaHora(
      new Date().toISOString()
    )
  );

  texto(
    'salida-resumen-usuario',
    obtenerUsuario()
  );

  registrarEventos();

  establecerBusy(true);

  try {
    await buscarOrdenes('');
  } finally {
    establecerBusy(false);
  }
}