/**
 * Cálculos de presentación del módulo Pagos.
 *
 * Durante la etapa simulada, esta es la única
 * ubicación donde deben calcularse acumulados,
 * saldos, porcentaje y excedente.
 *
 * Cuando exista REST, los valores oficiales
 * deberán provenir del backend.
 */

function toNumber(value) {
  const number = Number(value);

  return Number.isFinite(number)
    ? number
    : 0;
}

function roundMoney(value) {
  return Math.round(
    (toNumber(value) + Number.EPSILON) * 100
  ) / 100;
}

/**
 * Calcula el acumulado bruto de una cuenta.
 */
export function calcularAcumuladoBruto(
  pagos = []
) {
  return roundMoney(
    pagos.reduce(
      (total, pago) =>
        total + toNumber(pago.monto),
      0
    )
  );
}

/**
 * Calcula el total de movimientos
 * compensatorios de una cuenta.
 */
export function calcularTotalCompensado(
  compensaciones = []
) {
  return roundMoney(
    compensaciones.reduce(
      (total, movimiento) =>
        total +
        toNumber(movimiento.monto),
      0
    )
  );
}

/**
 * Fórmulas oficiales para la simulación
 * definidas por la especificación.
 */
export function calcularResumenCuenta({
  totalCotizacion = 0,
  importeRequerido = 0,
  acumuladoBruto = 0,
  totalCompensado = 0
} = {}) {
  const total =
    roundMoney(totalCotizacion);

  const requerido =
    roundMoney(importeRequerido);

  const bruto =
    roundMoney(acumuladoBruto);

  const compensado =
    roundMoney(totalCompensado);

  const acumuladoNeto =
    roundMoney(
      bruto - compensado
    );

  const saldoConfirmacion =
    roundMoney(
      Math.max(
        requerido - acumuladoNeto,
        0
      )
    );

  const saldoLiquidacion =
    roundMoney(
      Math.max(
        total - acumuladoNeto,
        0
      )
    );

  const porcentajeCubierto =
    total > 0
      ? roundMoney(
          acumuladoNeto /
            total *
            100
        )
      : 0;

  const excedente =
    roundMoney(
      Math.max(
        acumuladoNeto - total,
        0
      )
    );

  return {
    totalCotizacion: total,
    importeRequerido: requerido,
    acumuladoBruto: bruto,
    totalCompensado: compensado,
    acumuladoNeto,
    saldoConfirmacion,
    saldoLiquidacion,
    porcentajeCubierto,
    excedente
  };
}

/**
 * Calcula el resumen a partir de los
 * movimientos registrados.
 */
export function calcularResumenDesdeMovimientos({
  totalCotizacion = 0,
  importeRequerido = 0,
  movimientos = []
} = {}) {
  const pagos =
    movimientos.filter(
      movimiento =>
        movimiento.tipoMovimiento ===
        'PAGO'
    );

  const compensaciones =
    movimientos.filter(
      movimiento =>
        movimiento.tipoMovimiento ===
        'COMPENSACION'
    );

  return calcularResumenCuenta({
    totalCotizacion,
    importeRequerido,
    acumuladoBruto:
      calcularAcumuladoBruto(pagos),
    totalCompensado:
      calcularTotalCompensado(
        compensaciones
      )
  });
}

/**
 * Determina si un nuevo pago provoca
 * por primera vez el cumplimiento del
 * importe requerido.
 */
export function alcanzaUmbralPorPrimeraVez({
  acumuladoAnterior = 0,
  acumuladoNuevo = 0,
  importeRequerido = 0,
  cotizacionConfirmada = false
} = {}) {
  if (cotizacionConfirmada) {
    return false;
  }

  return (
    toNumber(acumuladoAnterior) <
      toNumber(importeRequerido) &&
    toNumber(acumuladoNuevo) >=
      toNumber(importeRequerido)
  );
}

/**
 * Limita únicamente la representación
 * visual de la barra de progreso.
 *
 * El porcentaje textual puede superar
 * el 100 % cuando existe excedente.
 */
export function calcularPorcentajeVisual(
  porcentajeCubierto = 0
) {
  return Math.min(
    Math.max(
      toNumber(porcentajeCubierto),
      0
    ),
    100
  );
}

/**
 * Indicador visual de una cuenta.
 *
 * Se respeta estrictamente la precedencia
 * definida en la especificación.
 */
export function obtenerIndicadorPresentacion({
  tieneErrorIntegracion = false,
  excedente = 0,
  acumuladoNeto = 0,
  totalCotizacion = 0,
  cotizacionConfirmada = false,
  procesandoConfirmacion = false,
  importeRequerido = 0
} = {}) {
  if (tieneErrorIntegracion) {
    return 'CON_ERROR_INTEGRACION';
  }

  if (toNumber(excedente) > 0) {
    return 'EXCEDENTE_DETECTADO';
  }

  if (
    toNumber(totalCotizacion) > 0 &&
    toNumber(acumuladoNeto) ===
      toNumber(totalCotizacion)
  ) {
    return 'LIQUIDADA';
  }

  if (
    cotizacionConfirmada &&
    toNumber(acumuladoNeto) <
      toNumber(totalCotizacion)
  ) {
    return 'CONFIRMADA_SALDO_PENDIENTE';
  }

  if (
    procesandoConfirmacion &&
    toNumber(acumuladoNeto) >=
      toNumber(importeRequerido)
  ) {
    return 'PROCESANDO_CONFIRMACION';
  }

  return 'PENDIENTE_CONFIRMACION';
}

/**
 * Calcula la proyección de una cuenta
 * antes de confirmar el registro de pago.
 */
export function proyectarPago({
  totalCotizacion = 0,
  importeRequerido = 0,
  acumuladoBruto = 0,
  totalCompensado = 0,
  montoPago = 0
} = {}) {
  return calcularResumenCuenta({
    totalCotizacion,
    importeRequerido,
    acumuladoBruto:
      toNumber(acumuladoBruto) +
      toNumber(montoPago),
    totalCompensado
  });
}

/**
 * Calcula la proyección previa al registro
 * de un movimiento compensatorio.
 */
export function proyectarCompensacion({
  totalCotizacion = 0,
  importeRequerido = 0,
  acumuladoBruto = 0,
  totalCompensado = 0,
  montoCompensacion = 0
} = {}) {
  return calcularResumenCuenta({
    totalCotizacion,
    importeRequerido,
    acumuladoBruto,
    totalCompensado:
      toNumber(totalCompensado) +
      toNumber(montoCompensacion)
  });
}