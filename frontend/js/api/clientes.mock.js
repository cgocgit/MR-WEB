import {
  ESTADOS_CLIENTE_PROSPECTO,
  ESTADOS_COTIZACION,
  TIPOS_MEDIO_CONTACTO
} from './clientes.constants.js';

const REGISTROS_INICIALES = [
  {
    id: 101,

    nombres: 'Mariana',
    apellidos: 'López Hernández',

    contactos: [
      {
        tipoMedioContacto:
          TIPOS_MEDIO_CONTACTO.CELULAR,

        medioContacto:
          '81 1234 5678'
      },
      {
        tipoMedioContacto:
          TIPOS_MEDIO_CONTACTO.EMAIL,

        medioContacto:
          'mariana@example.com'
      }
    ],

    evento: 'Boda',

    estado:
      ESTADOS_CLIENTE_PROSPECTO.PROSPECTO,

    version: 2,

    fechaCreacion:
      '2026-08-20T11:00:00',

    fechaActualizacion:
      '2026-08-30T14:25:00'
  },

  {
    id: 102,

    nombres: 'Daniel',
    apellidos: 'Ramírez Flores',

    contactos: [
      {
        tipoMedioContacto:
          TIPOS_MEDIO_CONTACTO.TELEFONO,

        medioContacto:
          '81 5555 0102'
      }
    ],

    evento: 'XV años',

    estado:
      ESTADOS_CLIENTE_PROSPECTO.PROSPECTO,

    version: 1,

    fechaCreacion:
      '2026-08-25T10:15:00',

    fechaActualizacion:
      '2026-08-25T10:15:00'
  },

  {
    id: 103,

    nombres: 'Laura',
    apellidos: 'Martínez Sánchez',

    contactos: [],

    evento: '',

    estado:
      ESTADOS_CLIENTE_PROSPECTO.PROSPECTO,

    version: 1,

    fechaCreacion:
      '2026-08-26T09:00:00',

    fechaActualizacion:
      '2026-08-26T09:00:00'
  },

  {
    id: 104,

    nombres: 'Roberto',
    apellidos: 'García Martínez',

    contactos: [
      {
        tipoMedioContacto:
          TIPOS_MEDIO_CONTACTO.CELULAR,

        medioContacto:
          '81 5555 0104'
      },
      {
        tipoMedioContacto:
          TIPOS_MEDIO_CONTACTO.EMAIL,

        medioContacto:
          'roberto@example.com'
      }
    ],

    evento: 'Evento empresarial',

    estado:
      ESTADOS_CLIENTE_PROSPECTO.CLIENTE,

    version: 3,

    fechaCreacion:
      '2026-08-10T12:00:00',

    fechaActualizacion:
      '2026-08-29T13:40:00'
  },

  {
    id: 105,

    nombres: 'Fernanda',
    apellidos: 'Torres Salazar',

    contactos: [
      {
        tipoMedioContacto:
          TIPOS_MEDIO_CONTACTO.EMAIL,

        medioContacto:
          'fernanda@example.com'
      }
    ],

    evento: 'Graduación',

    estado:
      ESTADOS_CLIENTE_PROSPECTO
        .PROSPECTO_REVISADO,

    version: 2,

    fechaCreacion:
      '2026-08-18T16:00:00',

    fechaActualizacion:
      '2026-08-28T09:20:00'
  },

  /*
   * Registro reservado para probar
   * el escenario de error de servicio
   * durante clasificación.
   */
  {
    id: 106,

    nombres: 'Miguel',
    apellidos: 'Castañeda Ruiz',

    contactos: [
      {
        tipoMedioContacto:
          TIPOS_MEDIO_CONTACTO.CELULAR,

        medioContacto:
          '81 5555 0106'
      }
    ],

    evento: 'Cumpleaños',

    estado:
      ESTADOS_CLIENTE_PROSPECTO.PROSPECTO,

    version: 1,

    fechaCreacion:
      '2026-08-30T15:00:00',

    fechaActualizacion:
      '2026-08-30T15:00:00'
  }
];

const COTIZACIONES_INICIALES = [
  {
    id: 9001,

    clienteProspectoId: 101,

    folio: 'COT-9001',

    fecha: '2026-08-25',

    vigencia: '2026-09-10',

    estado:
      ESTADOS_COTIZACION.ENVIADA,

    importe: 12500.00
  },

  {
    id: 9002,

    clienteProspectoId: 101,

    folio: 'COT-9002',

    fecha: '2026-08-29',

    vigencia: '2026-09-15',

    estado:
      ESTADOS_COTIZACION.BORRADOR,

    importe: 8200.00
  },

  {
    id: 9003,

    clienteProspectoId: 104,

    folio: 'COT-9003',

    fecha: '2026-08-20',

    vigencia: '2026-09-05',

    estado:
      ESTADOS_COTIZACION.ACEPTADA,

    importe: 18000.00
  }
];

const AUDITORIA_INICIAL = [
  {
    id: 'AUD-0001',

    clienteProspectoId: 104,

    operacion:
      'CLASIFICACION_CLIENTE',

    estadoAnterior:
      ESTADOS_CLIENTE_PROSPECTO.PROSPECTO,

    estadoNuevo:
      ESTADOS_CLIENTE_PROSPECTO.CLIENTE,

    fechaOperacion:
      '2026-08-29T13:40:00',

    ejecutadoPor: {
      id: 5001,
      nombre: 'Supervisor'
    }
  },

  {
    id: 'AUD-0002',

    clienteProspectoId: 105,

    operacion:
      'CLASIFICACION_PROSPECTO_REVISADO',

    estadoAnterior:
      ESTADOS_CLIENTE_PROSPECTO.PROSPECTO,

    estadoNuevo:
      ESTADOS_CLIENTE_PROSPECTO
        .PROSPECTO_REVISADO,

    fechaOperacion:
      '2026-08-28T09:20:00',

    ejecutadoPor: {
      id: 5001,
      nombre: 'Supervisor'
    }
  }
];

/**
 * IDs configurados para simular
 * un error al clasificar.
 */
const ERROR_CLASIFICACION_IDS =
  new Set([106]);

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

/**
 * Devuelve un estado independiente.
 *
 * Esto permite reiniciar los mocks
 * simplemente recargando la aplicación.
 */
export function createClientesMockState() {
  return {
    registros:
      clone(REGISTROS_INICIALES),

    cotizaciones:
      clone(COTIZACIONES_INICIALES),

    auditoria:
      clone(AUDITORIA_INICIAL),

    errorClasificacionIds:
      new Set(ERROR_CLASIFICACION_IDS)
  };
}