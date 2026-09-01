import {
  ESTADO_LABELS,
  TIPO_MEDIO_CONTACTO_LABELS
} from '../../api/clientes.constants.js';

/**
 * Construye el nombre para presentación.
 *
 * No almacenamos nombreCompleto porque
 * sería información duplicada.
 */
export function getNombreCompleto(
  registro
) {
  const nombres =
    typeof registro?.nombres === 'string'
      ? registro.nombres.trim()
      : '';

  const apellidos =
    typeof registro?.apellidos === 'string'
      ? registro.apellidos.trim()
      : '';

  return [
    nombres,
    apellidos
  ]
    .filter(Boolean)
    .join(' ');
}

export function getEstadoLabel(
  estado
) {
  return (
    ESTADO_LABELS[estado] ||
    estado ||
    'No especificado'
  );
}

export function getTipoContactoLabel(
  tipoMedioContacto
) {
  return (
    TIPO_MEDIO_CONTACTO_LABELS[
      tipoMedioContacto
    ] ||
    tipoMedioContacto ||
    'No especificado'
  );
}

export function getContactoPrincipal(
  registro
) {
  if (
    !Array.isArray(
      registro?.contactos
    ) ||
    registro.contactos.length === 0
  ) {
    return null;
  }

  return registro.contactos[0];
}

export function formatDateTime(
  value
) {
  if (!value) {
    return 'No registrado';
  }

  const date =
    new Date(value);

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return value;
  }

  return new Intl.DateTimeFormat(
    'es-MX',
    {
      dateStyle: 'medium',
      timeStyle: 'short'
    }
  ).format(date);
}

export function formatDate(
  value
) {
  if (!value) {
    return 'No registrada';
  }

  const date =
    new Date(
      `${value}T00:00:00`
    );

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return value;
  }

  return new Intl.DateTimeFormat(
    'es-MX',
    {
      dateStyle: 'medium'
    }
  ).format(date);
}

export function formatCurrency(
  value
) {
  const amount =
    Number(value);

  if (
    !Number.isFinite(amount)
  ) {
    return 'No registrado';
  }

  return new Intl.NumberFormat(
    'es-MX',
    {
      style: 'currency',
      currency: 'MXN'
    }
  ).format(amount);
}