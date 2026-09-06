import {
  obtenerCuentaPago
} from '../../api/pagos.service.js';

import {
  getSession
} from '../../shared/auth-guard.js';

import {
  hasPermission
} from '../../shared/permissions.js';

import {
  calcularPorcentajeVisual
} from './pagos.calculations.js';

import {
  formatCurrency,
  formatDate,
  formatDateTime,
  formatMetodoPago,
  formatPercentage,
  formatTipoMovimiento,
  getIndicadorMeta
} from './pagos.formatters.js';

const ROOT_ID =
  'pagos-detalle-root';

const PERMISOS = {
  CONSULTAR:
    'pagos.consultar',

  GESTIONAR:
    'pagos.gestionar'
};

let cuentaActual = null;
let returnTo =
  '#/pagos/consulta';

function elemento(id) {
  return document.getElementById(id);
}

function obtenerRoot() {
  return elemento(ROOT_ID);
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

function parametrosHash() {
  const partes =
    window.location.hash
      .split('?');

  return new URLSearchParams(
    partes[1] || ''
  );
}

function obtenerParametros() {
  const parametros =
    parametrosHash();

  const idCotizacion =
    Number(
      parametros.get(
        'idCotizacion'
      )
    );

  const idVersion =
    Number(
      parametros.get(
        'idVersion'
      )
    );

  const regreso =
    parametros.get(
      'returnTo'
    );

  if (
    regreso &&
    regreso.startsWith(
      '#/pagos/'
    )
  ) {
    returnTo = regreso;
  }

  return {
    idCotizacion,
    idVersion
  };
}

function crearIndicador(
  codigo
) {
  const meta =
    getIndicadorMeta(
      codigo
    );

  const indicador =
    document.createElement(
      'span'
    );

  indicador.className =
    `pagos-indicador ${meta.clase}`;

  indicador.textContent =
    meta.texto;

  indicador.setAttribute(
    'aria-label',
    meta.texto
  );

  return indicador;
}

function renderizarEncabezado(
  cuenta
) {
  texto(
    'pagos-detalle-folio',
    cuenta.folioCotizacion
  );

  texto(
    'pagos-detalle-version',
    `Versión ${cuenta.numeroVersion}`
  );

  texto(
    'pagos-detalle-cliente',
    cuenta.nombreCliente
  );

  texto(
    'pagos-detalle-vendedor',
    cuenta.vendedorResponsable
  );

  texto(
    'pagos-detalle-ultimo-movimiento',
    formatDateTime(
      cuenta
        .fechaUltimoMovimiento
    )
  );

  const indicador =
    elemento(
      'pagos-detalle-indicador'
    );

  if (indicador) {
    indicador.replaceChildren(
      crearIndicador(
        cuenta
          .indicadorPresentacion
      )
    );
  }
}

function renderizarResumen(
  cuenta
) {
  const campos = {
    'pagos-detalle-total':
      formatCurrency(
        cuenta.totalCotizacion
      ),

    'pagos-detalle-porcentaje-requerido':
      formatPercentage(
        cuenta.porcentajeRequerido
      ),

    'pagos-detalle-importe-requerido':
      formatCurrency(
        cuenta.importeRequerido
      ),

    'pagos-detalle-acumulado-bruto':
      formatCurrency(
        cuenta.acumuladoBruto
      ),

    'pagos-detalle-total-compensado':
      formatCurrency(
        cuenta.totalCompensado
      ),

    'pagos-detalle-acumulado-neto':
      formatCurrency(
        cuenta.acumuladoNeto
      ),

    'pagos-detalle-saldo-confirmacion':
      formatCurrency(
        cuenta.saldoConfirmacion
      ),

    'pagos-detalle-saldo-liquidacion':
      formatCurrency(
        cuenta.saldoLiquidacion
      ),

    'pagos-detalle-excedente':
      formatCurrency(
        cuenta.excedente
      ),

    'pagos-detalle-porcentaje-cubierto':
      formatPercentage(
        cuenta.porcentajeCubierto
      )
  };

  Object.entries(
    campos
  ).forEach(
    ([id, value]) =>
      texto(id, value)
  );

  const porcentajeVisual =
    calcularPorcentajeVisual(
      cuenta.porcentajeCubierto
    );

  const barra =
    elemento(
      'pagos-detalle-progreso'
    );

  if (barra) {
    barra.style.width =
      `${porcentajeVisual}%`;
  }

  const metaIndicador =
    getIndicadorMeta(
      cuenta
        .indicadorPresentacion
    );

  const textoProgreso =
    `${
      formatPercentage(
        cuenta
          .porcentajeCubierto
      )
    } · ${
      metaIndicador.texto
    }`;

  texto(
    'pagos-detalle-progreso-texto',
    textoProgreso
  );

  const track =
    barra?.parentElement;

  if (
    track?.getAttribute(
      'role'
    ) ===
    'progressbar'
  ) {
    track.setAttribute(
      'aria-valuenow',
      String(
        porcentajeVisual
      )
    );

    track.setAttribute(
      'aria-valuetext',
      textoProgreso
    );
  }
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

function construirRutaCompensar(
  movimiento
) {
  const parametros =
    new URLSearchParams();

  parametros.set(
    'idPago',
    String(
      movimiento.idMovimiento
    )
  );

  parametros.set(
    'returnTo',
    window.location.hash
  );

  return (
    '#/pagos/compensar?' +
    parametros.toString()
  );
}

function crearBotonCompensar(
  movimiento
) {
  const enlace =
    document.createElement(
      'a'
    );

  enlace.href =
    construirRutaCompensar(
      movimiento
    );

  enlace.textContent =
    'Compensar pago';

  enlace.className =
    'pagos-table-action';

  return enlace;
}

function crearBotonComprobante(
  movimiento
) {
  const boton =
    document.createElement(
      'button'
    );

  boton.type =
    'button';

  boton.textContent =
    'Ver comprobante';

  boton.className =
    'pagos-table-action';

  boton.addEventListener(
    'click',
    () =>
      mostrarComprobante(
        movimiento
      )
  );

  return boton;
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

function renderizarMovimientos(
  movimientos = []
) {
  const tbody =
    elemento(
      'pagos-detalle-movimientos-tbody'
    );

  if (!tbody) {
    return;
  }

  tbody.replaceChildren();

  ocultar(
    'pagos-detalle-sin-movimientos',
    movimientos.length > 0
  );

  movimientos.forEach(
    movimiento => {
      const fila =
        document.createElement(
          'tr'
        );

      fila.className =
        'pagos-movimiento';

      if (
        movimiento
          .tipoMovimiento ===
        'COMPENSACION'
      ) {
        fila.classList.add(
          'pagos-movimiento-compensatorio'
        );
      }

      fila.append(
        crearCelda(
          movimiento
            .folioMovimiento
        ),

        crearCelda(
          formatTipoMovimiento(
            movimiento
              .tipoMovimiento
          )
        ),

        crearCelda(
          formatDate(
            movimiento.fechaPago
          )
        ),

        crearCelda(
          formatDateTime(
            movimiento
              .fechaHoraRegistro
          )
        ),

        crearCelda(
          formatCurrency(
            movimiento.monto
          )
        ),

        crearCelda(
          formatMetodoPago(
            movimiento.metodoPago
          )
        ),

        crearCelda(
          movimiento.referencia ||
            movimiento.observaciones ||
            '—'
        ),

        crearCelda(
          movimiento
            .motivoCompensacion ||
            '—'
        ),

        crearCelda(
          movimiento
            .usuarioResponsable
        )
      );

      const relacionado =
        document.createElement(
          'td'
        );

      relacionado.textContent =
        movimiento
          .folioPagoOriginal ||
        '—';

      fila.appendChild(
        relacionado
      );

      const acciones =
        document.createElement(
          'td'
        );

      acciones.className =
        'pagos-table-actions';

      if (
        movimiento
          .comprobante
          ?.disponibleDuranteSesion
      ) {
        acciones.appendChild(
          crearBotonComprobante(
            movimiento
          )
        );
      }

      if (
        movimiento
          .tipoMovimiento ===
          'PAGO' &&
        puede(
          PERMISOS.GESTIONAR
        )
      ) {
        acciones.appendChild(
          crearBotonCompensar(
            movimiento
          )
        );
      }

      fila.appendChild(
        acciones
      );

      tbody.appendChild(
        fila
      );
    }
  );

  renderizarMovimientosMovil(
    movimientos
  );
}

function renderizarMovimientosMovil(
  movimientos = []
) {
  const contenedor =
    elemento(
      'pagos-detalle-movimientos-cards'
    );

  if (!contenedor) {
    return;
  }

  contenedor.replaceChildren();

  movimientos.forEach(
    movimiento => {
      const card =
        document.createElement(
          'article'
        );

      card.className =
        'pagos-mobile-card';

      if (
        movimiento
          .tipoMovimiento ===
        'COMPENSACION'
      ) {
        card.classList.add(
          'pagos-movimiento-compensatorio'
        );
      }

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
        movimiento
          .folioMovimiento;

      header.appendChild(
        folio
      );

      const grid =
        document.createElement(
          'div'
        );

      grid.className =
        'pagos-mobile-card-grid';

      grid.append(
        crearCampoCard(
          'Tipo',
          formatTipoMovimiento(
            movimiento
              .tipoMovimiento
          )
        ),

        crearCampoCard(
          'Fecha del pago',
          formatDate(
            movimiento
              .fechaPago
          )
        ),

        crearCampoCard(
          'Fecha y hora de registro',
          formatDateTime(
            movimiento
              .fechaHoraRegistro
          )
        ),

        crearCampoCard(
          'Importe',
          formatCurrency(
            movimiento.monto
          )
        ),

        crearCampoCard(
          'Método',
          formatMetodoPago(
            movimiento
              .metodoPago
          )
        ),

        crearCampoCard(
          'Referencia / observaciones',
          movimiento.referencia ||
            movimiento.observaciones ||
            '—'
        ),

        crearCampoCard(
          'Usuario responsable',
          movimiento
            .usuarioResponsable
        ),

        crearCampoCard(
          'Pago original',
          movimiento
            .folioPagoOriginal ||
            '—'
        )
      );

      if (
        movimiento
          .tipoMovimiento ===
        'COMPENSACION'
      ) {
        grid.appendChild(
          crearCampoCard(
            'Motivo de compensación',
            movimiento
              .motivoCompensacion ||
              '—'
          )
        );
      }

      card.append(
        header,
        grid
      );

      const acciones =
        document.createElement(
          'div'
        );

      acciones.className =
        'pagos-table-actions';

      if (
        movimiento
          .comprobante
          ?.disponibleDuranteSesion
      ) {
        acciones.appendChild(
          crearBotonComprobante(
            movimiento
          )
        );
      }

      if (
        movimiento
          .tipoMovimiento ===
          'PAGO' &&
        puede(
          PERMISOS.GESTIONAR
        )
      ) {
        acciones.appendChild(
          crearBotonCompensar(
            movimiento
          )
        );
      }

      if (
        acciones
          .childElementCount >
        0
      ) {
        card.appendChild(
          acciones
        );
      }

      contenedor.appendChild(
        card
      );
    }
  );
}

function mostrarComprobante(
  movimiento
) {
  const comprobante =
    movimiento.comprobante;

  if (!comprobante) {
    texto(
      'pagos-detalle-comprobante-mensaje',
      'Este movimiento no cuenta con comprobante disponible.'
    );
  } else {
    texto(
      'pagos-detalle-comprobante-mensaje',
      comprobante.nombreArchivo
    );

    texto(
      'pagos-detalle-comprobante-tipo',
      comprobante.tipoArchivo ||
        '—'
    );

    texto(
      'pagos-detalle-comprobante-tamano',
      comprobante.tamanoBytes
        ? `${comprobante.tamanoBytes} bytes`
        : '—'
    );
  }

  const dialogo =
    elemento(
      'pagos-detalle-comprobante-dialog'
    );

  if (
    dialogo &&
    typeof dialogo.showModal ===
      'function'
  ) {
    dialogo.showModal();
  }
}

function renderizarIntegracion(
  cuenta
) {
  const resultado =
    cuenta.resultadoIntegracion;

  texto(
    'pagos-detalle-umbral',
    cuenta.acumuladoNeto >=
      cuenta.importeRequerido
      ? 'Sí'
      : 'No'
  );

  texto(
    'pagos-detalle-integracion-estado',
    resultado
      ? (
          resultado.exitoso
            ? 'Procesado correctamente'
            : 'Con fallo de integración'
        )
      : (
          cuenta
            .procesandoConfirmacion
            ? 'Procesando confirmación'
            : 'Sin proceso registrado'
        )
  );

  texto(
    'pagos-detalle-integracion-fecha',
    formatDateTime(
      resultado
        ?.fechaHoraProceso
    )
  );

  texto(
    'pagos-detalle-ref-cotizacion',
    resultado
      ?.referenciaCotizacionConfirmada ||
      '—'
  );

  texto(
    'pagos-detalle-ref-reserva',
    resultado
      ?.referenciaReserva ||
      '—'
  );

  texto(
    'pagos-detalle-ref-orden',
    resultado
      ?.referenciaOrdenServicio ||
      '—'
  );

  texto(
    'pagos-detalle-ref-alerta',
    resultado
      ?.folioAlerta ||
      resultado
        ?.idAlerta ||
      '—'
  );
}

function renderizarAcciones(
  cuenta
) {
  const volver =
    elemento(
      'btn-pagos-detalle-volver'
    );

  if (volver) {
    volver.href =
      returnTo;
  }

  const registrarOtro =
    elemento(
      'btn-pagos-detalle-registrar'
    );

  if (registrarOtro) {
    registrarOtro.hidden =
      !puede(
        PERMISOS.GESTIONAR
      ) ||
      cuenta
        .saldoLiquidacion === 0;

    const parametros =
      new URLSearchParams();

    parametros.set(
      'returnTo',
      returnTo
    );

    registrarOtro.href =
      '#/pagos/nuevo?' +
      parametros.toString();
  }
}

function renderizarCuenta(
  cuenta
) {
  cuentaActual = cuenta;

  renderizarEncabezado(
    cuenta
  );

  renderizarResumen(
    cuenta
  );

  renderizarMovimientos(
    cuenta.movimientos || []
  );

  renderizarIntegracion(
    cuenta
  );

  renderizarAcciones(
    cuenta
  );

  ocultar(
    'pagos-detalle-contenido',
    false
  );
}

async function cargar() {
  const {
    idCotizacion,
    idVersion
  } = obtenerParametros();

  if (
    !Number.isFinite(
      idCotizacion
    ) ||
    !Number.isFinite(
      idVersion
    )
  ) {
    ocultar(
      'pagos-detalle-cargando',
      true
    );

    ocultar(
      'pagos-detalle-no-encontrado',
      false
    );

    return;
  }

  ocultar(
    'pagos-detalle-cargando',
    false
  );

  try {
    const cuenta =
      await obtenerCuentaPago(
        idCotizacion,
        idVersion
      );

    renderizarCuenta(
      cuenta
    );
  } catch (error) {
    texto(
      'pagos-detalle-error',
      error?.message ||
        'No fue posible consultar la cuenta.'
    );

    ocultar(
      'pagos-detalle-error',
      false
    );
  } finally {
    ocultar(
      'pagos-detalle-cargando',
      true
    );
  }
}

function registrarEventos() {
  elemento(
    'btn-pagos-detalle-comprobante-cerrar'
  )?.addEventListener(
    'click',
    () =>
      elemento(
        'pagos-detalle-comprobante-dialog'
      )?.close()
  );
}

export function init() {
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
    ocultar(
      'pagos-detalle-contenido',
      true
    );

    ocultar(
      'pagos-detalle-acceso-denegado',
      false
    );

    return;
  }

  registrarEventos();

  cargar();
}