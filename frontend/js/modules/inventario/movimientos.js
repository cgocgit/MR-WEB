import {
  consultarMovimientosInventario,
  TIPOS_MOVIMIENTO,
  SENTIDOS_MOVIMIENTO,
  ORIGENES_MOVIMIENTO
} from '../../api/inventario-movimientos.service.js';

const STORAGE_KEY =
  'inventario.movimientos.estado';

const LIMIT_PAGINA = 10;

let secuenciaCarga = 0;
let focoAntesDetalle = null;

let estado = {
  fechaDesde: '',
  fechaHasta: '',
  texto: '',
  tipo: '',
  origen: '',
  usuario: '',
  referencia: '',
  sentido: '',
  idProducto: null,
  skip: 0,
  limit: LIMIT_PAGINA,
  datos: null
};

function elemento(id) {
  return document.getElementById(id);
}

function texto(id, contenido) {
  const destino = elemento(id);

  if (destino) {
    destino.textContent =
      contenido ?? '';
  }
}

function ocultar(id, oculto) {
  const destino = elemento(id);

  if (destino) {
    destino.hidden = oculto;
  }
}

function valorHistorico(valor) {
  return (
    valor === null ||
    valor === undefined ||
    valor === ''
  )
    ? 'No disponible'
    : String(valor);
}

function formatearFecha(fecha) {
  if (!fecha) {
    return 'No disponible';
  }

  const valor = new Date(fecha);

  if (Number.isNaN(valor.getTime())) {
    return 'No disponible';
  }

  return new Intl.DateTimeFormat(
    'es-MX',
    {
      dateStyle: 'short',
      timeStyle: 'short'
    }
  ).format(valor);
}

function etiquetaTipo(tipo) {
  switch (tipo) {
    case TIPOS_MOVIMIENTO.ENTRADA:
      return 'Entrada';

    case TIPOS_MOVIMIENTO.SALIDA:
      return 'Salida';

    case TIPOS_MOVIMIENTO.AJUSTE:
      return 'Ajuste';

    default:
      return 'No disponible';
  }
}

function etiquetaSentido(sentido) {
  switch (sentido) {
    case SENTIDOS_MOVIMIENTO.INCREMENTO:
      return 'Incremento';

    case SENTIDOS_MOVIMIENTO.DECREMENTO:
      return 'Decremento';

    default:
      return 'No disponible';
  }
}

function etiquetaOrigen(origen) {
  switch (origen) {
    case ORIGENES_MOVIMIENTO.CARGA_INICIAL:
      return 'Carga inicial';

    case ORIGENES_MOVIMIENTO.REINGRESO:
      return 'Reingreso';

    case ORIGENES_MOVIMIENTO.ORDEN_SERVICIO:
      return 'Orden de Servicio';

    case ORIGENES_MOVIMIENTO.CORTE_FISICO:
      return 'Corte físico';

    case ORIGENES_MOVIMIENTO.SOPORTE_ADMINISTRADOR:
      return 'Soporte del Administrador';

    default:
      return 'No disponible';
  }
}

function referenciaMovimiento(
  movimiento
) {
  if (movimiento.folioOrden) {
    return movimiento.folioOrden;
  }

  if (movimiento.folioCorte) {
    return movimiento.folioCorte;
  }

  return 'Sin referencia';
}

function guardarEstado() {
  try {
    sessionStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        fechaDesde:
          estado.fechaDesde,

        fechaHasta:
          estado.fechaHasta,

        texto:
          estado.texto,

        tipo:
          estado.tipo,

        origen:
          estado.origen,

        usuario:
          estado.usuario,

        referencia:
          estado.referencia,

        sentido:
          estado.sentido,

        idProducto:
          estado.idProducto,

        skip:
          estado.skip,

        limit:
          estado.limit
      })
    );
  } catch {
    // Persistencia auxiliar.
  }
}

function restaurarEstado() {
  try {
    const contenido =
      sessionStorage.getItem(
        STORAGE_KEY
      );

    if (!contenido) {
      return;
    }

    const guardado =
      JSON.parse(contenido);

    estado = {
      ...estado,

      fechaDesde:
        typeof guardado.fechaDesde ===
        'string'
          ? guardado.fechaDesde
          : '',

      fechaHasta:
        typeof guardado.fechaHasta ===
        'string'
          ? guardado.fechaHasta
          : '',

      texto:
        typeof guardado.texto ===
        'string'
          ? guardado.texto
          : '',

      tipo:
        typeof guardado.tipo ===
        'string'
          ? guardado.tipo
          : '',

      origen:
        typeof guardado.origen ===
        'string'
          ? guardado.origen
          : '',

      usuario:
        typeof guardado.usuario ===
        'string'
          ? guardado.usuario
          : '',

      referencia:
        typeof guardado.referencia ===
        'string'
          ? guardado.referencia
          : '',

      sentido:
        typeof guardado.sentido ===
        'string'
          ? guardado.sentido
          : '',

      idProducto:
        Number.isInteger(
          Number(
            guardado.idProducto
          )
        ) &&
        Number(
          guardado.idProducto
        ) > 0
          ? Number(
              guardado.idProducto
            )
          : null,

      skip:
        Number.isInteger(
          guardado.skip
        ) &&
        guardado.skip >= 0
          ? guardado.skip
          : 0,

      limit:
        Number.isInteger(
          guardado.limit
        ) &&
        guardado.limit > 0
          ? guardado.limit
          : LIMIT_PAGINA
    };
  } catch {
    // Se conserva el estado inicial.
  }
}

function aplicarContextoUrl() {
  const [, queryString = ''] =
    (location.hash || '')
      .split('?');

  const query =
    new URLSearchParams(
      queryString
    );

  const idProducto =
    Number(
      query.get('idProducto')
    );

  if (
    Number.isInteger(idProducto) &&
    idProducto > 0
  ) {
    estado.idProducto =
      idProducto;

    estado.skip = 0;
  }
}

function sincronizarControles() {
  const controles = {
    'movimientos-fecha-desde':
      estado.fechaDesde,

    'movimientos-fecha-hasta':
      estado.fechaHasta,

    'movimientos-busqueda':
      estado.texto,

    'movimientos-tipo':
      estado.tipo,

    'movimientos-origen':
      estado.origen,

    'movimientos-usuario':
      estado.usuario,

    'movimientos-referencia':
      estado.referencia,

    'movimientos-sentido':
      estado.sentido
  };

  Object.entries(
    controles
  ).forEach(
    ([id, valor]) => {
      const control =
        elemento(id);

      if (control) {
        control.value = valor;
      }
    }
  );
}

function mostrarCarga(cargando) {
  ocultar(
    'movimientos-estado-cargando',
    !cargando
  );

  elemento(
    'movimientos-page'
  )?.setAttribute(
    'aria-busy',
    cargando
      ? 'true'
      : 'false'
  );

  const boton =
    elemento(
      'btn-movimientos-buscar'
    );

  if (boton) {
    boton.setAttribute(
      'aria-busy',
      cargando
        ? 'true'
        : 'false'
    );
  }
}

function limpiarEstados() {
  ocultar(
    'movimientos-estado-error',
    true
  );

  ocultar(
    'movimientos-estado-vacio',
    true
  );
}

function crearCelda(contenido) {
  const celda =
    document.createElement(
      'td'
    );

  celda.textContent =
    valorHistorico(
      contenido
    );

  return celda;
}

function crearTipo(tipo) {
  const indicador =
    document.createElement(
      'span'
    );

  indicador.classList.add(
    'inventario-movimientos-tipo'
  );

  if (
    tipo ===
    TIPOS_MOVIMIENTO.ENTRADA
  ) {
    indicador.classList.add(
      'inventario-movimientos-tipo-entrada'
    );
  } else if (
    tipo ===
    TIPOS_MOVIMIENTO.SALIDA
  ) {
    indicador.classList.add(
      'inventario-movimientos-tipo-salida'
    );
  } else if (
    tipo ===
    TIPOS_MOVIMIENTO.AJUSTE
  ) {
    indicador.classList.add(
      'inventario-movimientos-tipo-ajuste'
    );
  }

  indicador.textContent =
    etiquetaTipo(tipo);

  return indicador;
}

function crearProducto(
  movimiento
) {
  const contenedor =
    document.createElement(
      'div'
    );

  contenedor.className =
    'inventario-movimientos-producto';

  if (
    movimiento.imagenProducto
  ) {
    const imagen =
      document.createElement(
        'img'
      );

    imagen.src =
      movimiento.imagenProducto;

    imagen.alt =
      `Imagen de ${
        movimiento.nombreProducto ||
        'producto'
      }`;

    imagen.loading =
      'lazy';

    contenedor.appendChild(
      imagen
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

  nombre.textContent =
    valorHistorico(
      movimiento.nombreProducto
    );

  const codigo =
    document.createElement(
      'span'
    );

  codigo.textContent =
    valorHistorico(
      movimiento.codigoProducto
    );

  datos.append(
    nombre,
    codigo
  );

  contenedor.appendChild(
    datos
  );

  return contenedor;
}

function crearCantidad(
  movimiento
) {
  const contenedor =
    document.createElement(
      'div'
    );

  contenedor.className =
    'inventario-movimientos-cantidad';

  const cantidad =
    document.createElement(
      'strong'
    );

  cantidad.textContent =
    valorHistorico(
      movimiento.cantidad
    );

  const sentido =
    document.createElement(
      'span'
    );

  sentido.textContent =
    etiquetaSentido(
      movimiento.sentido
    );

  if (
    movimiento.sentido ===
    SENTIDOS_MOVIMIENTO.INCREMENTO
  ) {
    sentido.classList.add(
      'inventario-movimientos-incremento'
    );
  } else if (
    movimiento.sentido ===
    SENTIDOS_MOVIMIENTO.DECREMENTO
  ) {
    sentido.classList.add(
      'inventario-movimientos-decremento'
    );
  }

  contenedor.append(
    cantidad,
    sentido
  );

  return contenedor;
}

function crearBotonDetalle(
  idMovimiento
) {
  const boton =
    document.createElement(
      'button'
    );

  boton.type =
    'button';

  boton.className =
    'button-secondary inventario-movimientos-accion';

  boton.textContent =
    'Ver detalle';

  if (idMovimiento) {
    boton.dataset.movimientoDetalle =
      String(
        idMovimiento
      );
  } else {
    boton.disabled = true;
  }

  return boton;
}

function renderizarTabla(
  movimientos
) {
  const cuerpo =
    elemento(
      'movimientos-tbody'
    );

  if (!cuerpo) {
    return;
  }

  cuerpo.replaceChildren();

  movimientos.forEach(
    movimiento => {
      const fila =
        document.createElement(
          'tr'
        );

      const producto =
        document.createElement(
          'td'
        );

      producto.appendChild(
        crearProducto(
          movimiento
        )
      );

      const tipo =
        document.createElement(
          'td'
        );

      tipo.appendChild(
        crearTipo(
          movimiento.tipo
        )
      );

      const cantidad =
        document.createElement(
          'td'
        );

      cantidad.appendChild(
        crearCantidad(
          movimiento
        )
      );

      const acciones =
        document.createElement(
          'td'
        );

      acciones.appendChild(
        crearBotonDetalle(
          movimiento.idMovimiento
        )
      );

      fila.append(
        crearCelda(
          formatearFecha(
            movimiento.fecha
          )
        ),

        crearCelda(
          movimiento.folio
        ),

        producto,

        tipo,

        crearCelda(
          etiquetaOrigen(
            movimiento.origen
          )
        ),

        cantidad,

        crearCelda(
          movimiento
            .existenciaResultante
        ),

        crearCelda(
          referenciaMovimiento(
            movimiento
          )
        ),

        crearCelda(
          movimiento.usuario
        ),

        acciones
      );

      cuerpo.appendChild(
        fila
      );
    }
  );
}

function crearDatoTarjeta(
  etiqueta,
  valor
) {
  const grupo =
    document.createElement(
      'div'
    );

  grupo.className =
    'inventario-movimientos-card-dato';

  const titulo =
    document.createElement(
      'span'
    );

  titulo.textContent =
    etiqueta;

  const contenido =
    document.createElement(
      'strong'
    );

  contenido.textContent =
    valorHistorico(
      valor
    );

  grupo.append(
    titulo,
    contenido
  );

  return grupo;
}

function renderizarTarjetas(
  movimientos
) {
  const contenedor =
    elemento(
      'movimientos-cards'
    );

  if (!contenedor) {
    return;
  }

  contenedor.replaceChildren();

  movimientos.forEach(
    movimiento => {
      const tarjeta =
        document.createElement(
          'article'
        );

      tarjeta.className =
        'card inventario-movimientos-card';

      const encabezado =
        document.createElement(
          'header'
        );

      const fechaFolio =
        document.createElement(
          'div'
        );

      const fecha =
        document.createElement(
          'strong'
        );

      fecha.textContent =
        formatearFecha(
          movimiento.fecha
        );

      const folio =
        document.createElement(
          'span'
        );

      folio.textContent =
        valorHistorico(
          movimiento.folio
        );

      fechaFolio.append(
        fecha,
        folio
      );

      encabezado.append(
        fechaFolio,
        crearTipo(
          movimiento.tipo
        )
      );

      const datos =
        document.createElement(
          'div'
        );

      datos.className =
        'inventario-movimientos-card-grid';

      datos.append(
        crearDatoTarjeta(
          'Sentido',
          etiquetaSentido(
            movimiento.sentido
          )
        ),

        crearDatoTarjeta(
          'Cantidad',
          movimiento.cantidad
        ),

        crearDatoTarjeta(
          'Existencia resultante',
          movimiento
            .existenciaResultante
        ),

        crearDatoTarjeta(
          'Usuario',
          movimiento.usuario
        ),

        crearDatoTarjeta(
          'Origen',
          etiquetaOrigen(
            movimiento.origen
          )
        ),

        crearDatoTarjeta(
          'Referencia',
          referenciaMovimiento(
            movimiento
          )
        )
      );

      tarjeta.append(
        encabezado,
        crearProducto(
          movimiento
        ),
        datos,
        crearBotonDetalle(
          movimiento.idMovimiento
        )
      );

      contenedor.appendChild(
        tarjeta
      );
    }
  );
}

function renderizarResumen(
  resumen
) {
  texto(
    'movimientos-total',
    resumen.total
  );

  texto(
    'movimientos-total-entradas',
    resumen.entradas
  );

  texto(
    'movimientos-total-salidas',
    resumen.salidas
  );

  texto(
    'movimientos-total-ajustes',
    resumen.ajustes
  );
}

function renderizarPaginacion(
  datos
) {
  const paginaActual =
    Math.floor(
      datos.skip /
      datos.limit
    ) + 1;

  const paginas =
    Math.max(
      1,
      Math.ceil(
        datos.total /
        datos.limit
      )
    );

  texto(
    'movimientos-pagina',
    `${paginaActual} de ${paginas}`
  );

  texto(
    'movimientos-resultados',
    datos.total === 1
      ? '1 movimiento'
      : `${datos.total} movimientos`
  );

  const anterior =
    elemento(
      'btn-movimientos-anterior'
    );

  const siguiente =
    elemento(
      'btn-movimientos-siguiente'
    );

  if (anterior) {
    anterior.disabled =
      datos.skip <= 0;
  }

  if (siguiente) {
    siguiente.disabled =
      datos.skip +
        datos.limit >=
      datos.total;
  }
}

function renderizarUsuarios(
  usuarios
) {
  const control =
    elemento(
      'movimientos-usuario'
    );

  if (!control) {
    return;
  }

  const valorActual =
    estado.usuario;

  control.replaceChildren();

  const todos =
    document.createElement(
      'option'
    );

  todos.value = '';
  todos.textContent =
    'Todos';

  control.appendChild(
    todos
  );

  usuarios.forEach(
    usuario => {
      const opcion =
        document.createElement(
          'option'
        );

      opcion.value =
        usuario;

      opcion.textContent =
        usuario;

      control.appendChild(
        opcion
      );
    }
  );

  control.value =
    valorActual;
}

function renderizarContextoProducto(
  contexto
) {
  const contenedor =
    elemento(
      'movimientos-filtro-contexto'
    );

  if (!contenedor) {
    return;
  }

  if (!contexto) {
    contenedor.hidden =
      true;

    contenedor.textContent =
      '';

    return;
  }

  const descripcion = [
    contexto.codigo,
    contexto.nombre
  ]
    .filter(Boolean)
    .join(' - ');

  contenedor.textContent =
    descripcion
      ? `Filtro de producto aplicado: ${descripcion}.`
      : `Filtro de producto aplicado: ID ${contexto.idProducto}.`;

  contenedor.hidden =
    false;
}

function renderizar(datos) {
  estado.datos = datos;

  renderizarResumen(
    datos.resumen
  );

  renderizarUsuarios(
    datos.opciones?.usuarios ||
    []
  );

  renderizarContextoProducto(
    datos.contextoProducto ||
    null
  );

  renderizarTabla(
    datos.items
  );

  renderizarTarjetas(
    datos.items
  );

  renderizarPaginacion(
    datos
  );

  texto(
    'movimientos-ultima-consulta',
    formatearFecha(
      datos.fechaConsulta
    )
  );

  const sinResultados =
    datos.total === 0;

  if (sinResultados) {
    texto(
      'movimientos-vacio-mensaje',
      datos.totalHistorico === 0
        ? 'No existen movimientos de inventario registrados.'
        : 'No hay movimientos con los filtros seleccionados.'
    );
  }

  ocultar(
    'movimientos-estado-vacio',
    !sinResultados
  );

  ocultar(
    'movimientos-resultados-contenido',
    sinResultados
  );
}

function validarRangoPantalla() {
  if (
    estado.fechaDesde &&
    estado.fechaHasta &&
    estado.fechaDesde >
      estado.fechaHasta
  ) {
    texto(
      'movimientos-error-mensaje',
      'Fecha desde no puede ser posterior a Fecha hasta.'
    );

    ocultar(
      'movimientos-estado-error',
      false
    );

    elemento(
      'movimientos-fecha-desde'
    )?.focus();

    return false;
  }

  return true;
}

async function cargarMovimientos() {
  const solicitudActual =
    ++secuenciaCarga;

  limpiarEstados();

  if (
    !validarRangoPantalla()
  ) {
    return;
  }

  mostrarCarga(true);

  try {
    const datos =
      await consultarMovimientosInventario({
        fechaDesde:
          estado.fechaDesde,

        fechaHasta:
          estado.fechaHasta,

        texto:
          estado.texto,

        tipo:
          estado.tipo,

        origen:
          estado.origen,

        usuario:
          estado.usuario,

        referencia:
          estado.referencia,

        sentido:
          estado.sentido,

        idProducto:
          estado.idProducto,

        skip:
          estado.skip,

        limit:
          estado.limit
      });

    if (
      solicitudActual !==
      secuenciaCarga
    ) {
      return;
    }

    if (
      datos.total > 0 &&
      datos.skip >=
        datos.total
    ) {
      estado.skip = 0;

      guardarEstado();

      await cargarMovimientos();

      return;
    }

    renderizar(
      datos
    );
  } catch (error) {
    if (
      solicitudActual !==
      secuenciaCarga
    ) {
      return;
    }

    texto(
      'movimientos-error-mensaje',
      error?.message ||
      'No fue posible consultar el historial de movimientos.'
    );

    ocultar(
      'movimientos-estado-error',
      false
    );
  } finally {
    if (
      solicitudActual ===
      secuenciaCarga
    ) {
      mostrarCarga(false);
    }
  }
}

function leerFiltros() {
  estado.fechaDesde =
    elemento(
      'movimientos-fecha-desde'
    )?.value || '';

  estado.fechaHasta =
    elemento(
      'movimientos-fecha-hasta'
    )?.value || '';

  estado.texto =
    elemento(
      'movimientos-busqueda'
    )?.value?.trim() ||
    '';

  estado.tipo =
    elemento(
      'movimientos-tipo'
    )?.value || '';

  estado.origen =
    elemento(
      'movimientos-origen'
    )?.value || '';

  estado.usuario =
    elemento(
      'movimientos-usuario'
    )?.value || '';

  estado.referencia =
    elemento(
      'movimientos-referencia'
    )?.value?.trim() ||
    '';

  estado.sentido =
    elemento(
      'movimientos-sentido'
    )?.value || '';
}

function invalidarConsultaPendiente() {
  secuenciaCarga += 1;

  mostrarCarga(false);
}

function aplicarFiltros() {
  leerFiltros();

  estado.skip = 0;

  guardarEstado();

  cargarMovimientos();
}

function limpiarFiltros() {
  estado = {
    ...estado,

    fechaDesde: '',
    fechaHasta: '',
    texto: '',
    tipo: '',
    origen: '',
    usuario: '',
    referencia: '',
    sentido: '',
    idProducto: null,
    skip: 0
  };

  sincronizarControles();

  renderizarContextoProducto(
    null
  );

  guardarEstado();

  cargarMovimientos();
}

function buscarMovimientoActual(
  idMovimiento
) {
  return (
    estado.datos
      ?.items
      ?.find(
        movimiento =>
          Number(
            movimiento.idMovimiento
          ) ===
          Number(
            idMovimiento
          )
      ) ||
    null
  );
}

function asignarDetalle(
  movimiento
) {
  texto(
    'movimientos-detalle-id',
    valorHistorico(
      movimiento.idMovimiento
    )
  );

  texto(
    'movimientos-detalle-folio',
    valorHistorico(
      movimiento.folio
    )
  );

  texto(
    'movimientos-detalle-tipo',
    etiquetaTipo(
      movimiento.tipo
    )
  );

  texto(
    'movimientos-detalle-fecha',
    formatearFecha(
      movimiento.fecha
    )
  );

  texto(
    'movimientos-detalle-usuario',
    valorHistorico(
      movimiento.usuario
    )
  );

  texto(
    'movimientos-detalle-producto-id',
    valorHistorico(
      movimiento.idProducto
    )
  );

  texto(
    'movimientos-detalle-producto-codigo',
    valorHistorico(
      movimiento.codigoProducto
    )
  );

  texto(
    'movimientos-detalle-producto-nombre',
    valorHistorico(
      movimiento.nombreProducto
    )
  );

  texto(
    'movimientos-detalle-producto-unidad',
    valorHistorico(
      movimiento.unidadMedida
    )
  );

  const imagen =
    elemento(
      'movimientos-detalle-producto-imagen'
    );

  const placeholder =
    elemento(
      'movimientos-detalle-producto-placeholder'
    );

  if (
    imagen &&
    placeholder
  ) {
    if (
      movimiento.imagenProducto
    ) {
      imagen.src =
        movimiento.imagenProducto;

      imagen.alt =
        `Imagen de ${
          movimiento.nombreProducto ||
          'producto'
        }`;

      imagen.hidden =
        false;

      placeholder.hidden =
        true;

      imagen.onerror =
        () => {
          imagen.hidden =
            true;

          placeholder.hidden =
            false;
        };
    } else {
      imagen.removeAttribute(
        'src'
      );

      imagen.alt = '';

      imagen.hidden =
        true;

      placeholder.hidden =
        false;
    }
  }

  texto(
    'movimientos-detalle-almacen-id',
    valorHistorico(
      movimiento.idAlmacen
    )
  );

  texto(
    'movimientos-detalle-almacen',
    valorHistorico(
      movimiento.almacen
    )
  );

  texto(
    'movimientos-detalle-cantidad',
    valorHistorico(
      movimiento.cantidad
    )
  );

  texto(
    'movimientos-detalle-sentido',
    etiquetaSentido(
      movimiento.sentido
    )
  );

  texto(
    'movimientos-detalle-existencia-anterior',
    valorHistorico(
      movimiento.existenciaAnterior
    )
  );

  texto(
    'movimientos-detalle-existencia-resultante',
    valorHistorico(
      movimiento.existenciaResultante
    )
  );

  texto(
    'movimientos-detalle-reservada',
    valorHistorico(
      movimiento.cantidadReservada
    )
  );

  texto(
    'movimientos-detalle-disponibilidad',
    valorHistorico(
      movimiento
        .disponibilidadResultante
    )
  );

  texto(
    'movimientos-detalle-origen',
    etiquetaOrigen(
      movimiento.origen
    )
  );

  texto(
    'movimientos-detalle-orden',
    movimiento.folioOrden ||
    'Sin referencia'
  );

  texto(
    'movimientos-detalle-corte',
    movimiento.folioCorte ||
    'Sin referencia'
  );

  texto(
    'movimientos-detalle-comentario',
    valorHistorico(
      movimiento.comentario
    )
  );

  texto(
    'movimientos-detalle-observaciones',
    valorHistorico(
      movimiento.observaciones
    )
  );
}

function abrirDetalle(
  idMovimiento,
  origenFoco
) {
  const movimiento =
    buscarMovimientoActual(
      idMovimiento
    );

  if (!movimiento) {
    texto(
      'movimientos-error-mensaje',
      'El movimiento seleccionado no se encuentra disponible en la consulta actual.'
    );

    ocultar(
      'movimientos-estado-error',
      false
    );

    return;
  }

  const dialogo =
    elemento(
      'movimientos-dialog'
    );

  if (!dialogo) {
    return;
  }

  focoAntesDetalle =
    origenFoco ||
    document.activeElement;

  asignarDetalle(
    movimiento
  );

  if (!dialogo.open) {
    dialogo.showModal();
  }
}

function cerrarDetalle() {
  const dialogo =
    elemento(
      'movimientos-dialog'
    );

  if (dialogo?.open) {
    dialogo.close();
  }
}

function manejarDetalle(
  event
) {
  const boton =
    event.target
      ?.closest?.(
        '[data-movimiento-detalle]'
      );

  if (!boton) {
    return;
  }

  abrirDetalle(
    boton.dataset
      .movimientoDetalle,
    boton
  );
}

function registrarEventos() {
  const formulario =
    elemento(
      'movimientos-form-filtros'
    );

  formulario
    ?.addEventListener(
      'submit',
      event => {
        event.preventDefault();

        aplicarFiltros();
      }
    );

  formulario
    ?.addEventListener(
      'input',
      invalidarConsultaPendiente
    );

  formulario
    ?.addEventListener(
      'change',
      invalidarConsultaPendiente
    );

  elemento(
    'btn-movimientos-limpiar'
  )?.addEventListener(
    'click',
    limpiarFiltros
  );

  elemento(
    'btn-movimientos-reintentar'
  )?.addEventListener(
    'click',
    cargarMovimientos
  );

  elemento(
    'btn-movimientos-anterior'
  )?.addEventListener(
    'click',
    () => {
      estado.skip =
        Math.max(
          0,
          estado.skip -
            estado.limit
        );

      guardarEstado();

      cargarMovimientos();
    }
  );

  elemento(
    'btn-movimientos-siguiente'
  )?.addEventListener(
    'click',
    () => {
      if (
        !estado.datos ||
        estado.skip +
          estado.limit >=
        estado.datos.total
      ) {
        return;
      }

      estado.skip +=
        estado.limit;

      guardarEstado();

      cargarMovimientos();
    }
  );

  elemento(
    'movimientos-tbody'
  )?.addEventListener(
    'click',
    manejarDetalle
  );

  elemento(
    'movimientos-cards'
  )?.addEventListener(
    'click',
    manejarDetalle
  );

  elemento(
    'btn-movimientos-cerrar-detalle'
  )?.addEventListener(
    'click',
    cerrarDetalle
  );

  elemento(
    'movimientos-dialog'
  )?.addEventListener(
    'close',
    () => {
      if (
        focoAntesDetalle &&
        typeof focoAntesDetalle.focus ===
          'function'
      ) {
        focoAntesDetalle.focus();
      }

      focoAntesDetalle =
        null;
    }
  );
}

export async function init() {
  if (
    !elemento(
      'movimientos-page'
    )
  ) {
    return;
  }

  restaurarEstado();

  aplicarContextoUrl();

  sincronizarControles();

  registrarEventos();

  await cargarMovimientos();
}