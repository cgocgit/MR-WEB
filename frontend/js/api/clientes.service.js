import {
  DEFAULT_PAGE_SIZE,
  ESTADOS_CLIENTE_PROSPECTO,
  TIPOS_MEDIO_CONTACTO
} from './clientes.constants.js';

import {
  createClientesMockState
} from './clientes.mock.js';

import {
  getSession
} from '../shared/auth-guard.js';

const mockState =
  createClientesMockState();

const estadosDestinoPermitidos =
  new Set([
    ESTADOS_CLIENTE_PROSPECTO.CLIENTE,

    ESTADOS_CLIENTE_PROSPECTO
      .PROSPECTO_REVISADO
  ]);

const tiposContactoPermitidos =
  new Set(
    Object.values(
      TIPOS_MEDIO_CONTACTO
    )
  );

function clone(value) {
  if (
    typeof structuredClone ===
    'function'
  ) {
    return structuredClone(value);
  }

  return JSON.parse(
    JSON.stringify(value)
  );
}

function normalizeText(value) {
  return typeof value === 'string'
    ? value.trim()
    : '';
}

function normalizeId(id) {
  const numericId = Number(id);

  if (
    !Number.isInteger(numericId) ||
    numericId <= 0
  ) {
    throw new Error(
      'El identificador del registro no es válido.'
    );
  }

  return numericId;
}

function normalizePageNumber(value) {
  const page = Number(value);

  return Number.isInteger(page) &&
    page > 0
      ? page
      : 1;
}

function normalizePageSize(value) {
  const size = Number(value);

  if (
    !Number.isInteger(size) ||
    size <= 0
  ) {
    return DEFAULT_PAGE_SIZE;
  }

  return Math.min(size, 100);
}

function normalizeBooleanFilter(value) {
  if (
    value === true ||
    value === 'true'
  ) {
    return true;
  }

  if (
    value === false ||
    value === 'false'
  ) {
    return false;
  }

  return null;
}

function normalizeContactos(
  contactos
) {
  if (!Array.isArray(contactos)) {
    return [];
  }

  return contactos
    .map(contacto => ({
      tipoMedioContacto:
        normalizeText(
          contacto?.tipoMedioContacto
        ),

      medioContacto:
        normalizeText(
          contacto?.medioContacto
        )
    }))
    .filter(contacto => {
      if (
        !contacto.tipoMedioContacto &&
        !contacto.medioContacto
      ) {
        return false;
      }

      if (
        !tiposContactoPermitidos.has(
          contacto.tipoMedioContacto
        )
      ) {
        throw new Error(
          'El tipo de medio de contacto no es válido.'
        );
      }

      if (!contacto.medioContacto) {
        throw new Error(
          'Debe indicar el medio de contacto.'
        );
      }

      return true;
    });
}

function normalizePayload(
  payload = {}
) {
  return {
    nombres:
      normalizeText(
        payload.nombres
      ),

    apellidos:
      normalizeText(
        payload.apellidos
      ),

    contactos:
      normalizeContactos(
        payload.contactos
      ),

    evento:
      normalizeText(
        payload.evento
      )
  };
}

function findRegistroIndex(id) {
  return mockState.registros.findIndex(
    registro =>
      registro.id === id
  );
}

function getRegistroOrThrow(id) {
  const numericId =
    normalizeId(id);

  const registro =
    mockState.registros.find(
      item =>
        item.id === numericId
    );

  if (!registro) {
    const error =
      new Error(
        'El cliente o prospecto no existe.'
      );

    error.code = 'NOT_FOUND';

    throw error;
  }

  return registro;
}

function getNextRegistroId() {
  if (
    mockState.registros.length === 0
  ) {
    return 1;
  }

  return (
    Math.max(
      ...mockState.registros.map(
        registro => registro.id
      )
    ) + 1
  );
}

function getNextAuditReference() {
  return (
    `AUD-${String(
      mockState.auditoria.length + 1
    ).padStart(4, '0')}`
  );
}

function getCurrentUser() {
  const session =
    getSession();

  return {
    id:
      session?.user?.id ?? null,

    nombre:
      session?.user?.name ??
      session?.user?.username ??
      'Usuario mock'
  };
}

function hasCotizaciones(
  registroId
) {
  return mockState.cotizaciones.some(
    cotizacion =>
      cotizacion.clienteProspectoId ===
      registroId
  );
}

function matchesText(
  registro,
  search
) {
  if (!search) {
    return true;
  }

  const normalizedSearch =
    search.toLocaleLowerCase(
      'es-MX'
    );

  const searchableValues = [
    registro.nombres,
    registro.apellidos,
    registro.evento,

    ...(registro.contactos || [])
      .map(contacto =>
        contacto.medioContacto
      )
  ];

  return searchableValues.some(
    value =>
      normalizeText(value)
        .toLocaleLowerCase(
          'es-MX'
        )
        .includes(
          normalizedSearch
        )
  );
}

/**
 * Lista clientes y prospectos.
 *
 * @param {Object} filtros
 * @param {Object} pagina
 */
export async function
listClientesProspectos(
  filtros = {},
  pagina = {}
) {
  const search =
    normalizeText(
      filtros.busqueda
    );

  const estado =
    normalizeText(
      filtros.estado
    );

  const evento =
    normalizeText(
      filtros.evento
    );

  const tipoMedioContacto =
    normalizeText(
      filtros.tipoMedioContacto
    );

  const conCotizaciones =
    normalizeBooleanFilter(
      filtros.conCotizaciones
    );

  let registros =
    mockState.registros.filter(
      registro => {
        if (
          !matchesText(
            registro,
            search
          )
        ) {
          return false;
        }

        if (
          estado &&
          registro.estado !== estado
        ) {
          return false;
        }

        if (
          evento &&
          !normalizeText(
            registro.evento
          )
            .toLocaleLowerCase(
              'es-MX'
            )
            .includes(
              evento.toLocaleLowerCase(
                'es-MX'
              )
            )
        ) {
          return false;
        }

        if (
          tipoMedioContacto &&
          !registro.contactos.some(
            contacto =>
              contacto
                .tipoMedioContacto ===
              tipoMedioContacto
          )
        ) {
          return false;
        }

        if (
          conCotizaciones !== null &&
          hasCotizaciones(
            registro.id
          ) !== conCotizaciones
        ) {
          return false;
        }

        return true;
      }
    );

  /*
   * Orden estable provisional.
   * La fecha más recientemente
   * actualizada aparece primero.
   */
  registros =
    registros.sort(
      (a, b) =>
        new Date(
          b.fechaActualizacion
        ) -
        new Date(
          a.fechaActualizacion
        )
    );

  const currentPage =
    normalizePageNumber(
      pagina.pagina
    );

  const pageSize =
    normalizePageSize(
      pagina.tamanio
    );

  const totalRegistros =
    registros.length;

  const totalPaginas =
    Math.max(
      1,
      Math.ceil(
        totalRegistros /
        pageSize
      )
    );

  const start =
    (currentPage - 1) *
    pageSize;

  const items =
    registros.slice(
      start,
      start + pageSize
    );

  return clone({
    items,

    pagina: currentPage,

    tamanio: pageSize,

    totalRegistros,

    totalPaginas
  });
}

/**
 * Obtiene un cliente o prospecto.
 */
export async function
getClienteProspecto(id) {
  return clone(
    getRegistroOrThrow(id)
  );
}

/**
 * Registra siempre un Prospecto.
 *
 * El estado no se toma del payload.
 */
export async function
createProspecto(payload) {
  const normalized =
    normalizePayload(payload);

  const now =
    new Date().toISOString();

  const nuevoRegistro = {
    id:
      getNextRegistroId(),

    ...normalized,

    estado:
      ESTADOS_CLIENTE_PROSPECTO
        .PROSPECTO,

    version: 1,

    fechaCreacion: now,
    fechaActualizacion: now
  };

  mockState.registros.push(
    nuevoRegistro
  );

  return clone(
    nuevoRegistro
  );
}

/**
 * Actualiza información pero no permite
 * modificar el estado directamente.
 */
export async function
updateClienteProspecto(
  id,
  payload,
  version
) {
  const numericId =
    normalizeId(id);

  const current =
    getRegistroOrThrow(
      numericId
    );

  if (
    Number(version) !==
    current.version
  ) {
    const error =
      new Error(
        'El registro fue modificado por otro usuario.'
      );

    error.code =
      'VERSION_CONFLICT';

    throw error;
  }

  const normalized =
    normalizePayload(payload);

  const updated = {
    ...current,
    ...normalized,

    /*
     * El estado actual se conserva.
     * No puede escribirse mediante
     * el formulario de actualización.
     */
    estado: current.estado,

    version:
      current.version + 1,

    fechaActualizacion:
      new Date().toISOString()
  };

  const index =
    findRegistroIndex(
      numericId
    );

  mockState.registros[index] =
    updated;

  return clone(updated);
}

/**
 * Obtiene cotizaciones asociadas.
 */
export async function
getCotizacionesByClienteProspecto(
  id
) {
  const numericId =
    normalizeId(id);

  /*
   * Primero se comprueba que
   * exista el registro.
   */
  getRegistroOrThrow(
    numericId
  );

  return clone(
    mockState.cotizaciones.filter(
      cotizacion =>
        cotizacion
          .clienteProspectoId ===
        numericId
    )
  );
}

/**
 * Ejecuta la transición:
 *
 * PROSPECTO -> CLIENTE
 * PROSPECTO -> PROSPECTO_REVISADO
 */
export async function
clasificarProspecto(
  id,
  estadoDestino,
  version
) {
  const numericId =
    normalizeId(id);

  if (
    mockState
      .errorClasificacionIds
      .has(numericId)
  ) {
    const error =
      new Error(
        'Error de servicio simulado.'
      );

    error.code =
      'SERVICE_ERROR';

    throw error;
  }

  const current =
    getRegistroOrThrow(
      numericId
    );

  if (
    current.estado !==
    ESTADOS_CLIENTE_PROSPECTO
      .PROSPECTO
  ) {
    const error =
      new Error(
        'Solo un Prospecto puede cambiar de estado.'
      );

    error.code =
      'INVALID_STATE';

    throw error;
  }

  if (
    !estadosDestinoPermitidos.has(
      estadoDestino
    )
  ) {
    const error =
      new Error(
        'El estado destino no está permitido.'
      );

    error.code =
      'INVALID_DESTINATION';

    throw error;
  }

  if (
    Number(version) !==
    current.version
  ) {
    const error =
      new Error(
        'El registro cambió antes de confirmar la clasificación.'
      );

    error.code =
      'VERSION_CONFLICT';

    throw error;
  }

  const estadoAnterior =
    current.estado;

  const fechaOperacion =
    new Date().toISOString();

  const ejecutadoPor =
    getCurrentUser();

  const auditReference =
    getNextAuditReference();

  const updated = {
    ...current,

    estado:
      estadoDestino,

    version:
      current.version + 1,

    fechaActualizacion:
      fechaOperacion
  };

  const index =
    findRegistroIndex(
      numericId
    );

  mockState.registros[index] =
    updated;

  mockState.auditoria.push({
    id:
      auditReference,

    clienteProspectoId:
      numericId,

    operacion:
      'CLASIFICACION',

    estadoAnterior,

    estadoNuevo:
      estadoDestino,

    fechaOperacion,

    ejecutadoPor
  });

  return clone({
    success: true,

    message:
      'Clasificación realizada correctamente.',

    estadoAnterior,

    estadoNuevo:
      estadoDestino,

    fechaOperacion,

    ejecutadoPor,

    auditReference,

    version:
      updated.version
  });
}

/**
 * Consulta auxiliar de auditoría.
 *
 * Se incorpora para preparar la
 * consulta documentada del perfil
 * que tenga auditoria.consultar.
 */
export async function
getAuditoriaByClienteProspecto(
  id
) {
  const numericId =
    normalizeId(id);

  getRegistroOrThrow(
    numericId
  );

  return clone(
    mockState.auditoria.filter(
      item =>
        item.clienteProspectoId ===
        numericId
    )
  );
}