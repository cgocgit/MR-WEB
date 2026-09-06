const currencyFormatter =
  new Intl.NumberFormat(
    'es-MX',
    {
      style: 'currency',
      currency: 'MXN',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }
  );

const numberFormatter =
  new Intl.NumberFormat(
    'es-MX',
    {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    }
  );

const dateFormatter =
  new Intl.DateTimeFormat(
    'es-MX',
    {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }
  );

const dateTimeFormatter =
  new Intl.DateTimeFormat(
    'es-MX',
    {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }
  );

const INDICADORES = Object.freeze({
  CON_ERROR_INTEGRACION: {
    codigo: 'CON_ERROR_INTEGRACION',
    texto: 'Con error de integración',
    clase: 'pagos-indicador--error'
  },

  EXCEDENTE_DETECTADO: {
    codigo: 'EXCEDENTE_DETECTADO',
    texto: '⚠ Excedente detectado',
    clase: 'pagos-indicador--advertencia'
  },

  LIQUIDADA: {
    codigo: 'LIQUIDADA',
    texto: 'Liquidada',
    clase: 'pagos-indicador--exito'
  },

  CONFIRMADA_SALDO_PENDIENTE: {
    codigo:
      'CONFIRMADA_SALDO_PENDIENTE',
    texto:
      'Confirmada con saldo pendiente',
    clase: 'pagos-indicador--informativo'
  },

  PROCESANDO_CONFIRMACION: {
    codigo:
      'PROCESANDO_CONFIRMACION',
    texto:
      'Procesando confirmación',
    clase: 'pagos-indicador--proceso'
  },

  PENDIENTE_CONFIRMACION: {
    codigo:
      'PENDIENTE_CONFIRMACION',
    texto:
      'Pendiente de confirmación',
    clase: 'pagos-indicador--pendiente'
  }
});

export function formatCurrency(value) {
  const number = Number(value);

  return currencyFormatter.format(
    Number.isFinite(number)
      ? number
      : 0
  );
}

export function formatNumber(value) {
  const number = Number(value);

  return numberFormatter.format(
    Number.isFinite(number)
      ? number
      : 0
  );
}

export function formatPercentage(
  value
) {
  const number = Number(value);

  return `${
    numberFormatter.format(
      Number.isFinite(number)
        ? number
        : 0
    )
  } %`;
}

function toValidDate(value) {
  if (!value) {
    return null;
  }

  if (value instanceof Date) {
    return Number.isNaN(
      value.getTime()
    )
      ? null
      : value;
  }

  const textoFecha =
    String(value).trim();

  const soloFecha =
    /^(\d{4})-(\d{2})-(\d{2})$/
      .exec(textoFecha);

  const date =
    soloFecha
      ? new Date(
          Number(soloFecha[1]),
          Number(soloFecha[2]) - 1,
          Number(soloFecha[3])
        )
      : new Date(textoFecha);

  return Number.isNaN(
    date.getTime()
  )
    ? null
    : date;
}

export function formatDate(value) {
  const date = toValidDate(value);

  return date
    ? dateFormatter.format(date)
    : '—';
}

export function formatDateTime(
  value
) {
  const date = toValidDate(value);

  return date
    ? dateTimeFormatter.format(
        date
      )
    : '—';
}

export function formatMetodoPago(
  metodo
) {
  switch (metodo) {
    case 'EFECTIVO':
      return 'Efectivo';

    case 'TRANSFERENCIA':
      return 'Transferencia';

    default:
      return 'No aplica';
  }
}

export function formatTipoMovimiento(
  tipo
) {
  switch (tipo) {
    case 'PAGO':
      return '● Pago';

    case 'COMPENSACION':
      return '↺ Movimiento compensatorio';

    default:
      return '—';
  }
}

export function getIndicadorMeta(
  codigo
) {
  return (
    INDICADORES[codigo] ||
    INDICADORES.PENDIENTE_CONFIRMACION
  );
}

export function formatResultadoIntegracion(
  resultado
) {
  if (!resultado) {
    return 'Sin proceso registrado';
  }

  if (
    resultado.procesado &&
    resultado.exitoso
  ) {
    return 'Procesado correctamente';
  }

  if (
    resultado.procesado &&
    !resultado.exitoso
  ) {
    return 'Con fallo de integración';
  }

  return 'Pendiente de procesamiento';
}

export function formatReferencia(
  value
) {
  if (
    value === null ||
    value === undefined ||
    value === ''
  ) {
    return '—';
  }

  return String(value);
}

export function normalizeSearchText(
  value
) {
  return String(
    value ?? ''
  )
    .normalize('NFD')
    .replace(
      /[\u0300-\u036f]/g,
      ''
    )
    .toLocaleLowerCase('es-MX')
    .trim();
}