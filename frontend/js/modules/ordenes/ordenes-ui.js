import {
  ESTADO_ORDEN_LABELS,
  TIPO_COMPROMISO_ORDEN_LABELS
} from '../../api/ordenes.constants.js';

export function escaparHtml(valor) {
  return String(valor ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

export function valorDisponible(
  valor,
  reemplazo = '—'
) {
  if (
    valor === null ||
    valor === undefined ||
    String(valor).trim() === ''
  ) {
    return reemplazo;
  }

  return String(valor);
}

export function formatearFechaHora(valor) {
  if (!valor) {
    return '—';
  }

  const fecha = new Date(valor);

  if (
    Number.isNaN(
      fecha.getTime()
    )
  ) {
    return valorDisponible(valor);
  }

  return new Intl.DateTimeFormat(
    'es-MX',
    {
      dateStyle: 'medium',
      timeStyle: 'short'
    }
  ).format(fecha);
}

export function formatearFecha(valor) {
  if (!valor) {
    return '—';
  }

  const fecha = new Date(valor);

  if (
    Number.isNaN(
      fecha.getTime()
    )
  ) {
    return valorDisponible(valor);
  }

  return new Intl.DateTimeFormat(
    'es-MX',
    {
      dateStyle: 'medium'
    }
  ).format(fecha);
}

export function obtenerEtiquetaEstadoOrden(
  estado
) {
  return (
    ESTADO_ORDEN_LABELS[
      estado
    ] ||
    valorDisponible(estado)
  );
}

export function obtenerEtiquetaTipoCompromiso(
  tipo
) {
  return (
    TIPO_COMPROMISO_ORDEN_LABELS[
      tipo
    ] ||
    valorDisponible(tipo)
  );
}

export function obtenerClaseEstadoOrden(
  estado
) {
  const mapa = {
    EN_REVISION_VENTAS:
      'ordenes-badge--warning',

    PENDIENTE_PROGRAMACION:
      'ordenes-badge--info',

    PROGRAMADA:
      'ordenes-badge--primary',

    EN_EJECUCION:
      'ordenes-badge--active',

    REALIZADA:
      'ordenes-badge--success',

    CANCELADA:
      'ordenes-badge--danger'
  };

  return (
    mapa[estado] ||
    'ordenes-badge--neutral'
  );
}

export function obtenerClaseEstadoReserva(
  estado
) {
  const normalizado =
    String(
      estado ?? ''
    ).toUpperCase();

  const mapa = {
    CONFIRMADA:
      'ordenes-badge--info',

    ACTIVA:
      'ordenes-badge--active',

    LIBERADA:
      'ordenes-badge--success',

    CANCELADA:
      'ordenes-badge--danger',

    MIXTA:
      'ordenes-badge--warning'
  };

  return (
    mapa[normalizado] ||
    'ordenes-badge--neutral'
  );
}

export function obtenerClaseEstadoLogistico(
  estado
) {
  const normalizado =
    String(
      estado ?? ''
    ).toUpperCase();

  if (
    normalizado.includes(
      'COMPLET'
    )
  ) {
    return 'ordenes-badge--success';
  }

  if (
    normalizado.includes(
      'PROCES'
    ) ||
    normalizado.includes(
      'EJEC'
    )
  ) {
    return 'ordenes-badge--active';
  }

  if (
    normalizado.includes(
      'CANCEL'
    )
  ) {
    return 'ordenes-badge--danger';
  }

  return 'ordenes-badge--neutral';
}

export function crearBadge(
  texto,
  clase =
    'ordenes-badge--neutral'
) {
  return `
    <span
      class="ordenes-badge ${clase}"
    >
      ${escaparHtml(
        valorDisponible(texto)
      )}
    </span>
  `;
}

export function obtenerIdOrdenHash() {
  const query =
    new URLSearchParams(
      (
        location.hash.split('?')[1] ||
        ''
      )
    );

  const id =
    Number(
      query.get('id')
    );

  return (
    Number.isInteger(id) &&
    id > 0
  )
    ? id
    : null;
}

export function normalizarEstadoVisible(
  valor
) {
  return String(
    valor ?? ''
  )
    .replaceAll('_', ' ')
    .trim();
}