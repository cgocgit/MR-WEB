import {
  CONFIG_COTIZACIONES,
  DISPONIBILIDAD_COTIZACION,
  DISPONIBILIDAD_COTIZACION_LABELS,
  ESTADO_COTIZACION_GENERAL_LABELS,
  ESTADO_VERSION_COTIZACION_LABELS,
  ESTADOS_COTIZACION_GENERAL,
  ESTADOS_VERSION_COTIZACION
} from '../../api/cotizaciones.constants.js';

function normalizarFecha(fecha) {
  if (!fecha) {
    return null;
  }

  if (fecha instanceof Date) {
    return Number.isNaN(
      fecha.getTime()
    )
      ? null
      : fecha;
  }

  const valor =
    String(fecha).trim();

  const fechaSimple =
    /^(\d{4})-(\d{2})-(\d{2})$/
      .exec(valor);

  if (fechaSimple) {
    const [
      ,
      anio,
      mes,
      dia
    ] = fechaSimple;

    return new Date(
      Number(anio),
      Number(mes) - 1,
      Number(dia)
    );
  }

  const fechaConvertida =
    new Date(valor);

  return Number.isNaN(
    fechaConvertida.getTime()
  )
    ? null
    : fechaConvertida;
}

export function escaparHtml(valor) {
  return String(valor ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

export function formatearMoneda(valor) {
  const numero = Number(valor);

  if (!Number.isFinite(numero)) {
    return '$0.00';
  }

  return new Intl.NumberFormat(
    'es-MX',
    {
      style: 'currency',
      currency: 'MXN',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }
  ).format(numero);
}

export function formatearFecha(fecha) {
  const valor =
    normalizarFecha(fecha);

  if (!valor) {
    return '—';
  }

  return new Intl.DateTimeFormat(
    'es-MX',
    {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }
  ).format(valor);
}

export function formatearFechaHora(
  fecha,
  hora = null
) {
  if (!fecha) {
    return '—';
  }

  if (hora) {
    return `${formatearFecha(fecha)} ${hora}`;
  }

  const valor =
    normalizarFecha(fecha);

  if (!valor) {
    return '—';
  }

  return new Intl.DateTimeFormat(
    'es-MX',
    {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    }
  ).format(valor);
}

export function obtenerEtiquetaEstadoGeneral(
  estado
) {
  return (
    ESTADO_COTIZACION_GENERAL_LABELS[
      estado
    ] ||
    estado ||
    '—'
  );
}

export function obtenerEtiquetaEstadoVersion(
  estado
) {
  return (
    ESTADO_VERSION_COTIZACION_LABELS[
      estado
    ] ||
    estado ||
    '—'
  );
}

export function obtenerEtiquetaDisponibilidad(
  disponibilidad
) {
  return (
    DISPONIBILIDAD_COTIZACION_LABELS[
      disponibilidad
    ] ||
    disponibilidad ||
    '—'
  );
}

export function obtenerClaseEstadoGeneral(
  estado
) {
  const clases = {
    [
      ESTADOS_COTIZACION_GENERAL
        .BORRADOR
    ]:
      'cotizaciones-badge--neutral',

    [
      ESTADOS_COTIZACION_GENERAL
        .EN_SEGUIMIENTO
    ]:
      'cotizaciones-badge--warning',

    [
      ESTADOS_COTIZACION_GENERAL
        .CONFIRMADA
    ]:
      'cotizaciones-badge--success',

    [
      ESTADOS_COTIZACION_GENERAL
        .CONFIRMADA_RESERVADA
    ]:
      'cotizaciones-badge--success',
    
    [
      ESTADOS_COTIZACION_GENERAL
        .CANCELADA
    ]:
      'cotizaciones-badge--danger',

    [
      ESTADOS_COTIZACION_GENERAL
        .RECHAZADA
    ]:
      'cotizaciones-badge--danger',

    [
      ESTADOS_COTIZACION_GENERAL
        .VENCIDA
    ]:
      'cotizaciones-badge--danger'
  };

  return (
    clases[estado] ||
    'cotizaciones-badge--neutral'
  );
}

export function obtenerClaseEstadoVersion(
  estado
) {
  const clases = {
    [
      ESTADOS_VERSION_COTIZACION
        .BORRADOR
    ]:
      'cotizaciones-badge--neutral',

    [
      ESTADOS_VERSION_COTIZACION
        .ENVIADA
    ]:
      'cotizaciones-badge--info'
  };

  return (
    clases[estado] ||
    'cotizaciones-badge--neutral'
  );
}

export function obtenerClaseDisponibilidad(
  disponibilidad
) {
  const clases = {
    [
      DISPONIBILIDAD_COTIZACION
        .DISPONIBLE
    ]:
      'cotizaciones-badge--success',

    [
      DISPONIBILIDAD_COTIZACION
        .INCOMPLETO
    ]:
      'cotizaciones-badge--danger'
  };

  return (
    clases[disponibilidad] ||
    'cotizaciones-badge--neutral'
  );
}

export function crearBadge(
  texto,
  claseModificador =
    'cotizaciones-badge--neutral'
) {
  return `
    <span
      class="cotizaciones-badge ${escaparHtml(
        claseModificador
      )}"
    >
      ${escaparHtml(texto)}
    </span>
  `.trim();
}

export function construirFolioCotizacion(
  ejercicio,
  consecutivo
) {
  const anio =
    String(
      ejercicio ?? ''
    ).slice(-2);

  const numero =
    String(
      Number(consecutivo) || 0
    ).padStart(
      CONFIG_COTIZACIONES
        .DIGITOS_CONSECUTIVO,
      '0'
    );

  return (
    `${CONFIG_COTIZACIONES.PREFIJO_FOLIO}` +
    `-${anio}-${numero}`
  );
}

export function construirFolioVersion(
  ejercicio,
  consecutivo,
  numeroVersion
) {
  return (
    `${construirFolioCotizacion(
      ejercicio,
      consecutivo
    )}` +
    `-V${Number(numeroVersion) || 1}`
  );
}

export function obtenerIniciales(nombre) {
  const partes =
    String(nombre || '')
      .trim()
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2);

  if (!partes.length) {
    return '—';
  }

  return partes
    .map(
      parte =>
        parte
          .charAt(0)
          .toUpperCase()
    )
    .join('');
}

export function leerParametroEntero(
  nombre,
  search = window.location.search
) {
  const params =
    new URLSearchParams(search);

  const valor =
    Number(
      params.get(nombre)
    );

  return (
    Number.isInteger(valor) &&
    valor > 0
  )
    ? valor
    : null;
}