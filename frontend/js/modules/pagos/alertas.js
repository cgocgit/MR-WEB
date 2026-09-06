import {
  consultarAlertasPagos
} from '../../api/pagos.service.js';

import {
  getSession
} from '../../shared/auth-guard.js';

import {
  hasPermission
} from '../../shared/permissions.js';

import {
  formatDateTime
} from './pagos.formatters.js';

const ROOT_ID =
  'pagos-alertas-root';

const PERMISO =
  'pagos.alertas.consultar';

const LIMITE = 10;

let estado = {
  folioAlerta: '',
  folioPago: '',
  folioCotizacion: '',
  cliente: '',

  fechaInicial: '',
  fechaFinal: '',

  operacionFallida: '',

  skip: 0,
  limit: LIMITE,
  total: 0
};

let secuenciaConsulta = 0;

function elemento(id) {
  return document.getElementById(id);
}

function obtenerRoot() {
  return elemento(ROOT_ID);
}

function puedeConsultar() {
  return hasPermission(
    getSession(),
    PERMISO
  );
}

function texto(id, valor) {
  const destino =
    elemento(id);

  if (destino) {
    destino.textContent =
      valor ?? '';
  }
}

function ocultar(id, valor) {
  const destino =
    elemento(id);

  if (destino) {
    destino.hidden =
      valor;
  }
}

function valor(id) {
  return elemento(id)?.value
    ?.trim() || '';
}

function leerFiltros() {
  estado.folioAlerta =
    valor(
      'pagos-alertas-folio-alerta'
    );

  estado.folioPago =
    valor(
      'pagos-alertas-folio-pago'
    );

  estado.folioCotizacion =
    valor(
      'pagos-alertas-folio-cotizacion'
    );

  estado.cliente =
    valor(
      'pagos-alertas-cliente'
    );

  estado.fechaInicial =
    valor(
      'pagos-alertas-fecha-inicial'
    );

  estado.fechaFinal =
    valor(
      'pagos-alertas-fecha-final'
    );

  estado.operacionFallida =
    valor(
      'pagos-alertas-operacion'
    );

  estado.skip = 0;
}

function limpiarFiltros() {
  [
    'pagos-alertas-folio-alerta',
    'pagos-alertas-folio-pago',
    'pagos-alertas-folio-cotizacion',
    'pagos-alertas-cliente',
    'pagos-alertas-fecha-inicial',
    'pagos-alertas-fecha-final',
    'pagos-alertas-operacion'
  ].forEach(id => {
    const control =
      elemento(id);

    if (control) {
      control.value = '';
    }
  });

  estado = {
    ...estado,

    folioAlerta: '',
    folioPago: '',
    folioCotizacion: '',
    cliente: '',

    fechaInicial: '',
    fechaFinal: '',

    operacionFallida: '',

    skip: 0
  };

  consultar();
}

function filtrosServicio() {
  return {
    folioAlerta:
      estado.folioAlerta,

    folioPago:
      estado.folioPago,

    folioCotizacion:
      estado.folioCotizacion,

    cliente:
      estado.cliente,

    fechaInicial:
      estado.fechaInicial,

    fechaFinal:
      estado.fechaFinal,

    operacionFallida:
      estado.operacionFallida,

    skip:
      estado.skip,

    limit:
      estado.limit
  };
}

function crearCelda(valor) {
  const celda =
    document.createElement(
      'td'
    );

  celda.textContent =
    valor ?? '—';

  return celda;
}

function construirRutaCuenta(
  alerta
) {
  const parametros =
    new URLSearchParams();

  parametros.set(
    'idCotizacion',
    String(
      alerta.idCotizacion
    )
  );

  parametros.set(
    'idVersion',
    String(
      alerta.idVersion
    )
  );

  return (
    '#/pagos/cuenta?' +
    parametros.toString()
  );
}

function crearEnlace(
  textoEnlace,
  href
) {
  const enlace =
    document.createElement(
      'a'
    );

  enlace.textContent =
    textoEnlace;

  enlace.href =
    href;

  enlace.className =
    'pagos-table-action';

  return enlace;
}

function crearCampoCard(
  etiqueta,
  valor
) {
  const campo =
    document.createElement(
      'div'
    );

  campo.className =
    'pagos-mobile-card-field';

  const label =
    document.createElement(
      'span'
    );

  label.textContent =
    etiqueta;

  const contenido =
    document.createElement(
      'strong'
    );

  contenido.textContent =
    valor ?? '—';

  campo.append(
    label,
    contenido
  );

  return campo;
}

function normalizarReferencia(
  referencia
) {
  if (
    referencia === null ||
    referencia === undefined ||
    referencia === ''
  ) {
    return {
      valor: null,
      ruta: null
    };
  }

  if (
    typeof referencia ===
    'object'
  ) {
    return {
      valor:
        referencia.valor ||
        referencia.folio ||
        referencia.referencia ||
        referencia.id ||
        null,

      ruta:
        referencia.ruta ||
        referencia.href ||
        null
    };
  }

  return {
    valor:
      String(
        referencia
      ),

    ruta:
      null
  };
}

function obtenerReferencias(
  alerta
) {
  const referencias =
    alerta.referenciasGeneradas ||
    {};

  return [
    {
      tipo:
        'Cotización confirmada',

      ...normalizarReferencia(
        referencias
          .cotizacionConfirmada
      )
    },

    {
      tipo:
        'Reserva de Inventario',

      ...normalizarReferencia(
        referencias
          .reservaInventario
      )
    },

    {
      tipo:
        'Orden de servicio',

      ...normalizarReferencia(
        referencias
          .ordenServicio
      )
    }
  ];
}

function renderizarReferencias(
  alerta
) {
  const contenedor =
    elemento(
      'pagos-alertas-detalle-referencias'
    );

  if (!contenedor) {
    return;
  }

  contenedor.replaceChildren();

  const referencias =
    obtenerReferencias(
      alerta
    );

  const referenciasDisponibles =
    referencias.filter(
      referencia =>
        referencia.valor
    );

  ocultar(
    'pagos-alertas-detalle-sin-referencias',
    referenciasDisponibles.length >
      0
  );

  referenciasDisponibles.forEach(
    referencia => {
      const item =
        document.createElement(
          'div'
        );

      item.className =
        'pagos-reference-item';

      const etiqueta =
        document.createElement(
          'span'
        );

      etiqueta.textContent =
        referencia.tipo;

      const valorReferencia =
        document.createElement(
          'strong'
        );

      valorReferencia.textContent =
        referencia.valor;

      item.append(
        etiqueta,
        valorReferencia
      );

      if (
        referencia.ruta &&
        String(
          referencia.ruta
        ).startsWith('#/')
      ) {
        const enlace =
          document.createElement(
            'a'
          );

        enlace.href =
          referencia.ruta;

        enlace.className =
          'pagos-table-action';

        enlace.textContent =
          'Abrir referencia';

        item.appendChild(
          enlace
        );
      }

      contenedor.appendChild(
        item
      );
    }
  );
}

function renderizarAlertas(
  items
) {
  const tbody =
    elemento(
      'pagos-alertas-tbody'
    );

  if (!tbody) {
    return;
  }

  tbody.replaceChildren();

  items.forEach(
    alerta => {
      const fila =
        document.createElement(
          'tr'
        );

      fila.append(
        crearCelda(
          alerta.folioAlerta
        ),

        crearCelda(
          formatDateTime(
            alerta.fechaHora
          )
        ),

        crearCelda(
          alerta.folioPago
        ),

        crearCelda(
          alerta
            .folioCotizacion
        ),

        crearCelda(
          `Versión ${
            alerta.numeroVersion
          }`
        ),

        crearCelda(
          alerta.nombreCliente
        ),

        crearCelda(
          alerta.operacionFallida
        ),

        crearCelda(
          alerta.descripcionError
        ),

        crearCelda(
          alerta.resultadoConocido ||
            '—'
        )
      );

      const estadoCelda =
        document.createElement(
          'td'
        );

      const badge =
        document.createElement(
          'span'
        );

      badge.className =
        'pagos-alerta-estado';

      badge.textContent =
        alerta.estado ||
        'Pendiente';

      estadoCelda.appendChild(
        badge
      );

      fila.appendChild(
        estadoCelda
      );

      const acciones =
        document.createElement(
          'td'
        );

      acciones.className =
        'pagos-table-actions';

      acciones.appendChild(
        crearEnlace(
          'Ver cuenta',
          construirRutaCuenta(
            alerta
          )
        )
      );

      const pago =
        document.createElement(
          'button'
        );

      pago.type =
        'button';

      pago.className =
        'pagos-table-action';

      pago.textContent =
        'Ver pago';

      pago.addEventListener(
        'click',
        () =>
          mostrarPago(
            alerta
          )
      );

      acciones.appendChild(
        pago
      );

      fila.appendChild(
        acciones
      );

      tbody.appendChild(
        fila
      );
    }
  );

  renderizarAlertasMovil(
      items
    );
  }

  function renderizarAlertasMovil(
    items = []
  ) {
    const contenedor =
      elemento(
        'pagos-alertas-cards'
      );

    if (!contenedor) {
      return;
    }

    contenedor.replaceChildren();

    items.forEach(
      alerta => {
        const card =
          document.createElement(
            'article'
          );

        card.className =
          'pagos-mobile-card';

        const header =
          document.createElement(
            'div'
          );

        header.className =
          'pagos-mobile-card-header';

        const folio =
          document.createElement(
            'strong'
          );

        folio.textContent =
          alerta.folioAlerta;

        const estadoAlerta =
          document.createElement(
            'span'
          );

        estadoAlerta.className =
          'pagos-alerta-estado';

        estadoAlerta.textContent =
          alerta.estado ||
          'Pendiente';

        header.append(
          folio,
          estadoAlerta
        );

        const grid =
          document.createElement(
            'div'
          );

        grid.className =
          'pagos-mobile-card-grid';

        grid.append(
          crearCampoCard(
            'Fecha y hora',
            formatDateTime(
              alerta.fechaHora
            )
          ),

          crearCampoCard(
            'Pago',
            alerta.folioPago
          ),

          crearCampoCard(
            'Cotización',
            alerta.folioCotizacion
          ),

          crearCampoCard(
            'Versión',
            `Versión ${
              alerta.numeroVersion
            }`
          ),

          crearCampoCard(
            'Cliente',
            alerta.nombreCliente
          ),

          crearCampoCard(
            'Operación fallida',
            alerta.operacionFallida
          ),

          crearCampoCard(
            'Descripción',
            alerta.descripcionError
          ),

          crearCampoCard(
            'Resultado conocido',
            alerta.resultadoConocido ||
              '—'
          )
        );

        const acciones =
          document.createElement(
            'div'
          );

        acciones.className =
          'pagos-table-actions';

        acciones.appendChild(
          crearEnlace(
            'Ver cuenta',
            construirRutaCuenta(
              alerta
            )
          )
        );

        const verPago =
          document.createElement(
            'button'
          );

        verPago.type =
          'button';

        verPago.className =
          'pagos-table-action';

        verPago.textContent =
          'Ver pago';

        verPago.addEventListener(
          'click',
          () =>
            mostrarPago(
              alerta
            )
        );

        acciones.appendChild(
          verPago
        );

        card.append(
          header,
          grid,
          acciones
        );

        contenedor.appendChild(
          card
        );
      }
    );
  }

function mostrarPago(
  alerta
) {
  texto(
    'pagos-alertas-detalle-alerta',
    alerta.folioAlerta
  );

  texto(
    'pagos-alertas-detalle-fecha',
    formatDateTime(
      alerta.fechaHora
    )
  );

  texto(
    'pagos-alertas-detalle-pago',
    alerta.folioPago
  );

  texto(
    'pagos-alertas-detalle-cotizacion',
    alerta.folioCotizacion
  );

  texto(
    'pagos-alertas-detalle-version',
    `Versión ${
      alerta.numeroVersion
    }`
  );

  texto(
    'pagos-alertas-detalle-cliente',
    alerta.nombreCliente
  );

  texto(
    'pagos-alertas-detalle-operacion',
    alerta.operacionFallida
  );

  texto(
    'pagos-alertas-detalle-resultado',
    alerta.resultadoConocido ||
      '—'
  );

  texto(
    'pagos-alertas-detalle-estado',
    alerta.estado ||
      'Pendiente'
  );

  texto(
    'pagos-alertas-detalle-error',
    alerta.descripcionError
  );

  renderizarReferencias(
    alerta
  );

  const cuenta =
    elemento(
      'btn-pagos-alertas-detalle-cuenta'
    );

  if (cuenta) {
    cuenta.href =
      construirRutaCuenta(
        alerta
      );
  }

  const dialogo =
    elemento(
      'pagos-alertas-dialog'
    );

  if (
    dialogo &&
    typeof dialogo.showModal ===
      'function'
  ) {
    dialogo.showModal();
  }
}

function renderizarPaginacion() {
  const inicio =
    estado.total === 0
      ? 0
      : estado.skip + 1;

  const fin =
    Math.min(
      estado.skip +
        estado.limit,
      estado.total
    );

  texto(
    'pagos-alertas-paginacion',
    `${inicio}-${fin} de ${estado.total}`
  );

  const anterior =
    elemento(
      'btn-pagos-alertas-anterior'
    );

  const siguiente =
    elemento(
      'btn-pagos-alertas-siguiente'
    );

  if (anterior) {
    anterior.disabled =
      estado.skip === 0;
  }

  if (siguiente) {
    siguiente.disabled =
      estado.skip +
        estado.limit >=
      estado.total;
  }
}

async function consultar() {
  const secuencia =
    ++secuenciaConsulta;

  ocultar(
    'pagos-alertas-error',
    true
  );

  ocultar(
    'pagos-alertas-cargando',
    false
  );

  try {
    const resultado =
      await consultarAlertasPagos(
        filtrosServicio()
      );

    if (
      secuencia !==
      secuenciaConsulta
    ) {
      return;
    }

    const items =
      resultado.items || [];

    estado.total =
      resultado.total || 0;

    ocultar(
      'pagos-alertas-vacio',
      items.length > 0
    );

    ocultar(
      'pagos-alertas-resultados',
      items.length === 0
    );

    if (
      items.length === 0
    ) {
      texto(
        'pagos-alertas-vacio',
        'No se encontraron alertas para los filtros seleccionados.'
      );
    } else {
      renderizarAlertas(
        items
      );
    }

    renderizarPaginacion();
  } catch (error) {
    texto(
      'pagos-alertas-error',
      error?.message ||
        'No fue posible consultar las alertas de integración.'
    );

    ocultar(
      'pagos-alertas-error',
      false
    );
  } finally {
    if (
      secuencia ===
      secuenciaConsulta
    ) {
      ocultar(
        'pagos-alertas-cargando',
        true
      );
    }
  }
}

function paginaAnterior() {
  estado.skip =
    Math.max(
      0,
      estado.skip -
        estado.limit
    );

  consultar();
}

function paginaSiguiente() {
  if (
    estado.skip +
      estado.limit >=
    estado.total
  ) {
    return;
  }

  estado.skip +=
    estado.limit;

  consultar();
}

function registrarEventos() {
  elemento(
    'btn-pagos-alertas-buscar'
  )?.addEventListener(
    'click',
    () => {
      leerFiltros();
      consultar();
    }
  );

  elemento(
    'btn-pagos-alertas-limpiar'
  )?.addEventListener(
    'click',
    limpiarFiltros
  );

  elemento(
    'btn-pagos-alertas-actualizar'
  )?.addEventListener(
    'click',
    consultar
  );

  elemento(
    'btn-pagos-alertas-anterior'
  )?.addEventListener(
    'click',
    paginaAnterior
  );

  elemento(
    'btn-pagos-alertas-siguiente'
  )?.addEventListener(
    'click',
    paginaSiguiente
  );

  elemento(
    'btn-pagos-alertas-dialog-cerrar'
  )?.addEventListener(
    'click',
    () =>
      elemento(
        'pagos-alertas-dialog'
      )?.close()
  );
}

export function init() {
  const root =
    obtenerRoot();

  if (!root) {
    return;
  }

  if (!puedeConsultar()) {
    ocultar(
      'pagos-alertas-contenido',
      true
    );

    ocultar(
      'pagos-alertas-acceso-denegado',
      false
    );

    return;
  }

  registrarEventos();

  consultar();
}