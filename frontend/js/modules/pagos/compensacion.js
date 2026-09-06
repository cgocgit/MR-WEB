import {
  obtenerPagoOriginal,
  registrarMovimientoCompensatorio
} from '../../api/pagos.service.js';

import {
  getSession
} from '../../shared/auth-guard.js';

import {
  hasPermission
} from '../../shared/permissions.js';

import {
  proyectarCompensacion
} from './pagos.calculations.js';

import {
  formatCurrency,
  formatDate,
  formatMetodoPago
} from './pagos.formatters.js';

const ROOT_ID =
  'pagos-compensacion-root';

const PERMISO =
  'pagos.gestionar';

let pagoOriginal = null;
let procesando = false;
let returnTo =
  '#/pagos/consulta';

function elemento(id) {
  return document.getElementById(id);
}

function obtenerRoot() {
  return elemento(ROOT_ID);
}

function puedeGestionar() {
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

  const idPago =
    Number(
      parametros.get(
        'idPago'
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
    idPago
  };
}

function montoCompensacion() {
  const monto =
    Number(
      valor(
        'pagos-compensacion-monto'
      )
    );

  return Number.isFinite(monto)
    ? monto
    : 0;
}

function mostrarError(
  id,
  mensaje
) {
  texto(id, mensaje);

  ocultar(
    id,
    !mensaje
  );
}

function renderizarPagoOriginal(
  pago
) {
  texto(
    'pagos-compensacion-folio-pago',
    pago.folioMovimiento
  );

  texto(
    'pagos-compensacion-cotizacion',
    pago.folioCotizacion
  );

  texto(
    'pagos-compensacion-version',
    `Versión ${pago.numeroVersion}`
  );

  texto(
    'pagos-compensacion-cliente',
    pago.nombreCliente
  );

  texto(
    'pagos-compensacion-fecha-pago',
    formatDate(
      pago.fechaPago
    )
  );

  texto(
    'pagos-compensacion-monto-original',
    formatCurrency(
      pago.monto
    )
  );

  texto(
    'pagos-compensacion-metodo',
    formatMetodoPago(
      pago.metodoPago
    )
  );

  texto(
    'pagos-compensacion-referencia',
    pago.referencia ||
      '—'
  );

  texto(
    'pagos-compensacion-usuario',
    pago.usuarioResponsable
  );

  texto(
    'pagos-compensacion-acumulado-actual',
    formatCurrency(
      pago.cuenta
        .acumuladoNeto
    )
  );

  actualizarProyeccion();
}

function obtenerProyeccion() {
  if (!pagoOriginal) {
    return null;
  }

  return proyectarCompensacion({
    totalCotizacion:
      pagoOriginal
        .cuenta
        .totalCotizacion,

    importeRequerido:
      pagoOriginal
        .cuenta
        .importeRequerido,

    acumuladoBruto:
      pagoOriginal
        .cuenta
        .acumuladoBruto,

    totalCompensado:
      pagoOriginal
        .cuenta
        .totalCompensado,

    montoCompensacion:
      montoCompensacion()
  });
}

function actualizarProyeccion() {
  const proyeccion =
    obtenerProyeccion();

  if (!proyeccion) {
    return;
  }

  texto(
    'pagos-compensacion-resumen-anterior',
    formatCurrency(
      pagoOriginal
        .cuenta
        .acumuladoNeto
    )
  );

  texto(
    'pagos-compensacion-resumen-monto',
    formatCurrency(
      montoCompensacion()
    )
  );

  texto(
    'pagos-compensacion-resumen-resultante',
    formatCurrency(
      proyeccion
        .acumuladoNeto
    )
  );

  texto(
    'pagos-compensacion-resumen-confirmacion',
    formatCurrency(
      proyeccion
        .saldoConfirmacion
    )
  );

  texto(
    'pagos-compensacion-resumen-liquidacion',
    formatCurrency(
      proyeccion
        .saldoLiquidacion
    )
  );
}

function validar() {
  mostrarError(
    'pagos-compensacion-monto-error',
    ''
  );

  mostrarError(
    'pagos-compensacion-motivo-error',
    ''
  );

  elemento(
    'pagos-compensacion-monto'
  )?.removeAttribute(
    'aria-invalid'
  );

  elemento(
    'pagos-compensacion-motivo'
  )?.removeAttribute(
    'aria-invalid'
  );

  let valido = true;

  if (
    montoCompensacion() <= 0
  ) {
    elemento(
      'pagos-compensacion-monto'
    )?.setAttribute(
      'aria-invalid',
      'true'
    );

    mostrarError(
      'pagos-compensacion-monto-error',
      'El monto compensado debe ser mayor que cero.'
    );

    valido = false;
  }

  if (
    !valor(
      'pagos-compensacion-motivo'
    )
  ) {
    elemento(
      'pagos-compensacion-motivo'
    )?.setAttribute(
      'aria-invalid',
      'true'
    );

    mostrarError(
      'pagos-compensacion-motivo-error',
      'El motivo es obligatorio.'
    );

    valido = false;
  }

  return valido;
}

function prepararConfirmacion() {
  const proyeccion =
    obtenerProyeccion();

  texto(
    'pagos-compensacion-confirmacion-pago',
    pagoOriginal
      .folioMovimiento
  );

  texto(
    'pagos-compensacion-confirmacion-monto',
    formatCurrency(
      montoCompensacion()
    )
  );

  texto(
    'pagos-compensacion-confirmacion-motivo',
    valor(
      'pagos-compensacion-motivo'
    )
  );

  texto(
    'pagos-compensacion-confirmacion-acumulado',
    formatCurrency(
      proyeccion
        .acumuladoNeto
    )
  );
}

function abrirConfirmacion() {
  if (!validar()) {
    return;
  }

  prepararConfirmacion();

  const dialogo =
    elemento(
      'pagos-compensacion-dialog'
    );

  if (
    dialogo &&
    typeof dialogo.showModal ===
      'function'
  ) {
    dialogo.showModal();
  }
}

function cerrarConfirmacion() {
  elemento(
    'pagos-compensacion-dialog'
  )?.close();
}

function establecerProcesando(
  estado
) {
  procesando = estado;

  ocultar(
    'pagos-compensacion-procesando',
    !estado
  );

  obtenerRoot()
    ?.querySelectorAll(
      'input, textarea, button'
    )
    .forEach(control => {
      control.disabled =
        estado;
    });
}

async function confirmar() {
  if (procesando) {
    mostrarError(
      'pagos-compensacion-error',
      'La operación ya se encuentra en proceso.'
    );

    return;
  }

  cerrarConfirmacion();

  establecerProcesando(
    true
  );

  try {
    const resultado =
      await registrarMovimientoCompensatorio(
        {
          idPagoOriginal:
            pagoOriginal
              .idMovimiento,

          monto:
            montoCompensacion(),

          motivo:
            valor(
              'pagos-compensacion-motivo'
            ),

          observaciones:
            valor(
              'pagos-compensacion-observaciones'
            )
        }
      );

    renderizarResultado(
      resultado
    );
  } catch (error) {
    mostrarError(
      'pagos-compensacion-error',
      error?.message ||
        'No fue posible registrar el movimiento compensatorio.'
    );
  } finally {
    establecerProcesando(
      false
    );
  }
}

function renderizarResultado(
  resultado
) {
  ocultar(
    'pagos-compensacion-formulario',
    true
  );

  ocultar(
    'pagos-compensacion-resultado',
    false
  );

  texto(
    'pagos-compensacion-resultado-folio',
    resultado
      .folioMovimiento
  );

  texto(
    'pagos-compensacion-resultado-pago',
    resultado
      .folioPagoOriginal
  );

  texto(
    'pagos-compensacion-resultado-acumulado',
    formatCurrency(
      resultado
        .cuenta
        .acumuladoNeto
    )
  );

  const enlace =
    elemento(
      'btn-pagos-compensacion-ver-cuenta'
    );

  if (enlace) {
    const parametros =
      new URLSearchParams();

    parametros.set(
      'idCotizacion',
      String(
        resultado.idCotizacion
      )
    );

    parametros.set(
      'idVersion',
      String(
        resultado.idVersion
      )
    );

    enlace.href =
      '#/pagos/cuenta?' +
      parametros.toString();
  }
}

async function cargar() {
  const {
    idPago
  } = obtenerParametros();

  if (
    !Number.isFinite(
      idPago
    )
  ) {
    ocultar(
      'pagos-compensacion-no-encontrado',
      false
    );

    return;
  }

  ocultar(
    'pagos-compensacion-cargando',
    false
  );

  try {
    const pago =
      await obtenerPagoOriginal(
        idPago
      );

    if (
      pago.tipoMovimiento !==
      'PAGO'
    ) {
      throw new Error(
        'Solo puede compensarse un pago original.'
      );
    }

    pagoOriginal =
      pago;

    renderizarPagoOriginal(
      pago
    );

    const volver =
      elemento(
        'btn-pagos-compensacion-volver'
      );

    if (volver) {
      volver.href =
        returnTo;
    }

    ocultar(
      'pagos-compensacion-formulario',
      false
    );
  } catch (error) {
    mostrarError(
      'pagos-compensacion-error',
      error?.message ||
        'No fue posible consultar el pago original.'
    );
  } finally {
    ocultar(
      'pagos-compensacion-cargando',
      true
    );
  }
}

function registrarEventos() {
  elemento(
    'pagos-compensacion-monto'
  )?.addEventListener(
    'input',
    actualizarProyeccion
  );

  elemento(
    'btn-pagos-compensacion-guardar'
  )?.addEventListener(
    'click',
    abrirConfirmacion
  );

  elemento(
    'btn-pagos-compensacion-confirmacion-cancelar'
  )?.addEventListener(
    'click',
    cerrarConfirmacion
  );

  elemento(
    'btn-pagos-compensacion-confirmacion-confirmar'
  )?.addEventListener(
    'click',
    confirmar
  );
}

export function init() {
  const root =
    obtenerRoot();

  if (!root) {
    return;
  }

  if (!puedeGestionar()) {
    ocultar(
      'pagos-compensacion-contenido',
      true
    );

    ocultar(
      'pagos-compensacion-acceso-denegado',
      false
    );

    return;
  }

  registrarEventos();

  cargar();
}