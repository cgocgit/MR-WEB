import {
  ESTADOS_FASE_LOGISTICA,
  ESTADOS_INCIDENCIA_LOGISTICA,
  ESTADOS_ORDEN_LOGISTICA,
  FASES_LOGISTICAS,
  TIPOS_INCIDENCIA_LOGISTICA,
  TIPOS_ORDEN_LOGISTICA
} from './logistica.constants.js';

function clonar(
  valor
) {
  return typeof structuredClone ===
    'function'
    ? structuredClone(valor)
    : JSON.parse(
        JSON.stringify(valor)
      );
}

function evidenciaDemo(
  numero
) {
  const texto =
    encodeURIComponent(
      `Evidencia ${numero}`
    );

  return (
    'data:image/svg+xml;charset=utf-8,' +
    `<svg xmlns="http://www.w3.org/2000/svg" width="640" height="360">` +
    `<rect width="100%" height="100%" fill="%23f6f7fb"/>` +
    `<text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" ` +
    `font-family="Arial" font-size="30" fill="%236b7280">${texto}</text>` +
    `</svg>`
  );
}

const RECURSOS =
  Object.freeze({
    supervisores: [
      {
        id: 301,
        username: 'supervisor',
        nombre:
          'Supervisor Logística'
      }
    ],

    representantes: [
      {
        id: 401,
        username:
          'representante',
        nombre:
          'Ana Rodríguez'
      },
      {
        id: 402,
        username:
          'representante2',
        nombre:
          'Luis Martínez'
      }
    ],

    choferes: [
      {
        id: 501,
        username: 'chofer',
        nombre:
          'José Hernández'
      },
      {
        id: 502,
        username: 'chofer2',
        nombre:
          'Miguel Torres'
      }
    ],

    vehiculos: [
      {
        id: 601,
        placa: 'SJS-2847'
      },
      {
        id: 602,
        placa: 'KLM-0932'
      },
      {
        id: 603,
        placa: 'MNB-7710'
      }
    ]
  });

const ORDENES =
  Object.freeze([
    {
      idOrden: 5001,
      folioOrden:
        'ORD-2026-001',

      folioCotizacion:
        'COTMR-26-000018',

      versionCotizacion:
        'V1',

      usuarioVentas:
        'ventas',

      estadoOrden:
        ESTADOS_ORDEN_LOGISTICA
          .EN_EJECUCION,

      tipoOrden:
        TIPOS_ORDEN_LOGISTICA
          .MIXTA,

      cliente:
        'Mariana López Hernández',

      contacto:
        '81 1234 5678',

      domicilioEvento:
        'Evento A',

      fechaHoraEvento:
        '2026-09-12T16:00:00',

      productos: [
        {
          idProducto: 1001,
          nombre:
            'Silla Windsor',
          cantidad: 10
        },
        {
          idProducto: 1002,
          nombre:
            'Mesa Redonda',
          cantidad: 2
        }
      ],

      servicios: [
        {
          idServicio: 2001,
          nombre:
            'Banquete Ejecutivo',
          cantidad: 1
        }
      ],

      observaciones:
        'Orden integrada con Inventario.',

      cancelada: false
    },

    {
      idOrden: 5002,
      folioOrden:
        'ORD-2026-002',

      folioCotizacion: null,
      versionCotizacion: null,

      usuarioVentas:
        'ventas',

      estadoOrden:
        ESTADOS_ORDEN_LOGISTICA
          .PENDIENTE_PROGRAMACION,

      tipoOrden:
        TIPOS_ORDEN_LOGISTICA
          .PRODUCTOS,

      cliente: 'Cliente B',
      contacto: null,

      domicilioEvento:
        'Evento B',

      fechaHoraEvento:
        '2026-09-13T08:00:00',

      productos: [],
      servicios: [],

      observaciones: null,
      cancelada: false
    },

    {
      idOrden: 5101,
      folioOrden:
        'ORD-2026-101',

      folioCotizacion:
        'COTMR-26-000101',

      versionCotizacion:
        'V1',

      usuarioVentas:
        'ventas',

      estadoOrden:
        ESTADOS_ORDEN_LOGISTICA
          .PENDIENTE_PROGRAMACION,

      tipoOrden:
        TIPOS_ORDEN_LOGISTICA
          .PRODUCTOS,

      cliente:
        'Eventos del Norte',

      contacto:
        'Laura García',

      domicilioEvento:
        'Av. Constitución 1800, Monterrey, N.L.',

      fechaHoraEvento:
        '2026-09-08T18:00:00',

      productos: [
        {
          idProducto: 1001,
          nombre:
            'Silla Windsor',
          cantidad: 80
        },
        {
          idProducto: 1002,
          nombre:
            'Mesa Redonda',
          cantidad: 10
        }
      ],

      servicios: [],

      observaciones:
        'Acceso por estacionamiento lateral.',

      cancelada: false
    },

    {
      idOrden: 5102,
      folioOrden:
        'ORD-2026-102',

      folioCotizacion:
        'COTMR-26-000102',

      versionCotizacion:
        'V2',
      
      usuarioVentas:
        'ventas',

      estadoOrden:
        ESTADOS_ORDEN_LOGISTICA
          .PROGRAMADA,

      tipoOrden:
        TIPOS_ORDEN_LOGISTICA
          .SERVICIOS,

      cliente:
        'Grupo Empresarial RG',

      contacto:
        'Roberto Garza',

      domicilioEvento:
        'Pabellón M, Monterrey, N.L.',

      fechaHoraEvento:
        '2026-09-09T09:00:00',

      productos: [],

      servicios: [
        {
          idServicio: 2002,
          nombre:
            'Decoración Elegante',
          cantidad: 1
        }
      ],

      observaciones: null,
      cancelada: false
    },

    {
      idOrden: 5103,
      folioOrden:
        'ORD-2026-103',

      folioCotizacion:
        'COTMR-26-000103',

      versionCotizacion:
        'V1',

      usuarioVentas:
        'ventas',

      estadoOrden:
        ESTADOS_ORDEN_LOGISTICA
          .EN_EJECUCION,

      tipoOrden:
        TIPOS_ORDEN_LOGISTICA
          .MIXTA,

      cliente:
        'Constructora Loma',

      contacto:
        'Sofía Villarreal',

      domicilioEvento:
        'San Pedro Garza García, N.L.',

      fechaHoraEvento:
        '2026-09-10T14:00:00',

      productos: [
        {
          idProducto: 1005,
          nombre:
            'Mantel de Lino',
          cantidad: 20
        }
      ],

      servicios: [
        {
          idServicio: 2003,
          nombre:
            'Flete y Logística',
          cantidad: 1
        }
      ],

      observaciones:
        'Servicio mixto.',

      cancelada: false
    },

    {
      idOrden: 5104,
      folioOrden:
        'ORD-2026-104',

      folioCotizacion:
        'COTMR-26-000104',

      versionCotizacion:
        'V1',

      usuarioVentas:
        'ventas',

      estadoOrden:
        ESTADOS_ORDEN_LOGISTICA
          .CANCELADA,

      tipoOrden:
        TIPOS_ORDEN_LOGISTICA
          .PRODUCTOS,

      cliente:
        'Cliente Cancelado',

      contacto:
        'Contacto cancelado',

      domicilioEvento:
        'Monterrey, N.L.',

      fechaHoraEvento:
        '2026-09-11T12:00:00',

      productos: [
        {
          idProducto: 1001,
          nombre:
            'Silla Windsor',
          cantidad: 20
        }
      ],

      servicios: [],

      observaciones:
        'Conservar historial.',

      cancelada: true
    }
  ]);

function crearFase({
  idFase,
  codigo,
  estado =
    ESTADOS_FASE_LOGISTICA
      .PENDIENTE,

  duracion = 60,
  tolerancia = 30,
  responsable = null,
  cantidadPrevista = 1,
  cantidadAtendida = 0,
  inicio = null,
  termino = null,
  comentario = null,
  evidencias = [],
  confirmada = false,
  version = 1
}) {
  const definicion =
    FASES_LOGISTICAS.find(
      item =>
        item.codigo === codigo
    );

  return {
    idFase,
    codigoFase: codigo,

    nombre:
      definicion?.nombre ||
      codigo,

    aplica: true,
    estadoFase: estado,

    duracionEstimadaMinutos:
      definicion?.traslado
        ? null
        : duracion,

    toleranciaMinutos:
      definicion?.traslado
        ? null
        : tolerancia,

    fechaHoraInicio: inicio,
    fechaHoraTermino: termino,

    responsable,

    cantidadPrevista,
    cantidadAtendida,

    cantidadPendiente:
      Math.max(
        0,
        cantidadPrevista -
        cantidadAtendida
      ),

    comentario,

    evidencias:
      clonar(evidencias),

    confirmada,

    incidencias: [],
    version
  };
}

const PROGRAMACIONES =
  Object.freeze([
    {
      idProgramacion: 7001,
      idOrdenes: [5001],

      fechaHoraPreparacion:
        '2026-09-12T08:00:00',

      idSupervisor: 301,
      idRepresentante: 401,
      idChofer: 501,

      placaVehiculo:
        'SJS-2847',

      idRuta: 8002,

      motivoReprogramacion:
        null,

      historialReprogramaciones:
        [],

      fases: [
        crearFase({
          idFase: 7101,
          codigo:
            'PREPARACION',

          estado:
            ESTADOS_FASE_LOGISTICA
              .CONCLUIDA,

          cantidadPrevista: 12,
          cantidadAtendida: 12,

          responsable:
            'Ana Rodríguez',

          inicio:
            '2026-09-12T08:00:00',

          termino:
            '2026-09-12T08:50:00',

          comentario:
            'Preparación completa.',

          evidencias: [
            evidenciaDemo(1),
            evidenciaDemo(2),
            evidenciaDemo(3)
          ],

          confirmada: true
        }),

        crearFase({
          idFase: 7102,
          codigo:
            'CARGA_DESPACHO',

          estado:
            ESTADOS_FASE_LOGISTICA
              .PARCIAL,

          cantidadPrevista: 12,
          cantidadAtendida: 8,

          responsable:
            'Ana Rodríguez',

          inicio:
            '2026-09-12T09:00:00'
        }),

        crearFase({
          idFase: 7103,
          codigo:
            'TRASLADO_SITIO',

          estado:
            ESTADOS_FASE_LOGISTICA
              .EN_PROCESO,

          responsable:
            'José Hernández',

          inicio:
            '2026-09-12T10:00:00'
        })
      ],

      paradas: [
        {
          idParada: 8201,
          posicion: 1,
          tipoParada: 'CARGA',
          domicilio:
            'Almacén Mesa Regia',
          horario:
            '2026-09-12T09:00:00',

          idOrden: 5001,
          codigoFase:
            'CARGA_DESPACHO',

          situacion:
            'CONCLUIDA'
        },
        {
          idParada: 8202,
          posicion: 2,
          tipoParada: 'ENTREGA',
          domicilio:
            'Evento A',

          horario:
            '2026-09-12T12:00:00',

          idOrden: 5001,
          codigoFase:
            'ENTREGA',

          situacion:
            'PENDIENTE'
        }
      ],

      version: 1,

      auditoria: [
        {
          fechaHora:
            '2026-09-05T10:00:00',

          usuario:
            'Supervisor Logística',

          accion:
            'PROGRAMACION_CONFIRMADA'
        }
      ]
    },

    {
      idProgramacion: 7002,
      idOrdenes: [5102],

      fechaHoraPreparacion:
        '2026-09-09T06:30:00',

      idSupervisor: 301,
      idRepresentante: 402,
      idChofer: 502,

      placaVehiculo:
        'KLM-0932',

      idRuta: 8001,

      motivoReprogramacion:
        null,

      historialReprogramaciones:
        [],

      fases: [
        crearFase({
          idFase: 7201,
          codigo: 'PLANEACION',

          estado:
            ESTADOS_FASE_LOGISTICA
              .CONCLUIDA,

          responsable:
            'Supervisor Logística',

          cantidadPrevista: 1,
          cantidadAtendida: 1,

          inicio:
            '2026-09-05T09:00:00',

          termino:
            '2026-09-05T09:20:00',

          comentario:
            'Programación confirmada.',

          evidencias: [
            evidenciaDemo(1),
            evidenciaDemo(2),
            evidenciaDemo(3)
          ],

          confirmada: true
        }),

        crearFase({
          idFase: 7202,
          codigo:
            'TRASLADO_SITIO',

          responsable:
            'Miguel Torres'
        }),

        crearFase({
          idFase: 7203,
          codigo: 'EJECUCION',

          responsable:
            'Luis Martínez'
        })
      ],

      paradas: [
        {
          idParada: 8101,
          posicion: 1,
          tipoParada:
            'ATENCION',

          domicilio:
            'Pabellón M, Monterrey, N.L.',

          horario:
            '2026-09-09T09:00:00',

          idOrden: 5102,
          codigoFase:
            'EJECUCION',

          situacion:
            'PROGRAMADA'
        }
      ],

      version: 1,
      auditoria: []
    },

    {
      idProgramacion: 7003,
      idOrdenes: [5103],

      fechaHoraPreparacion:
        '2026-09-10T07:30:00',

      idSupervisor: 301,
      idRepresentante: 401,
      idChofer: 501,

      placaVehiculo:
        'MNB-7710',

      idRuta: 8003,

      motivoReprogramacion:
        null,

      historialReprogramaciones:
        [],

      fases: [
        crearFase({
          idFase: 7301,
          codigo:
            'PREPARACION',

          estado:
            ESTADOS_FASE_LOGISTICA
              .CONCLUIDA,

          responsable:
            'Ana Rodríguez',

          cantidadPrevista: 20,
          cantidadAtendida: 20,

          inicio:
            '2026-09-10T07:30:00',

          termino:
            '2026-09-10T08:25:00',

          comentario:
            'Preparación completa.',

          evidencias: [
            evidenciaDemo(1),
            evidenciaDemo(2),
            evidenciaDemo(3)
          ],

          confirmada: true
        }),

        crearFase({
          idFase: 7302,
          codigo: 'ENTREGA',

          estado:
            ESTADOS_FASE_LOGISTICA
              .PARCIAL,

          responsable:
            'Ana Rodríguez',

          cantidadPrevista: 20,
          cantidadAtendida: 12,

          inicio:
            '2026-09-10T10:00:00'
        }),

        crearFase({
          idFase: 7303,
          codigo: 'MONTAJE',

          estado:
            ESTADOS_FASE_LOGISTICA
              .EN_PROCESO,

          responsable:
            'Ana Rodríguez',

          cantidadPrevista: 1,
          cantidadAtendida: 0,

          inicio:
            '2026-09-10T10:30:00'
        })
      ],

      paradas: [
        {
          idParada: 8301,
          posicion: 1,
          tipoParada: 'CARGA',
          domicilio:
            'Almacén Mesa Regia',

          horario:
            '2026-09-10T08:30:00',

          idOrden: 5103,
          codigoFase:
            'CARGA_DESPACHO',

          situacion:
            'CONCLUIDA'
        },

        {
          idParada: 8302,
          posicion: 2,
          tipoParada: 'ENTREGA',

          domicilio:
            'San Pedro Garza García, N.L.',

          horario:
            '2026-09-10T10:00:00',

          idOrden: 5103,
          codigoFase:
            'ENTREGA',

          situacion:
            'EN_PROCESO'
        }
      ],

      version: 2,
      auditoria: []
    }
  ]);

const RUTAS =
  Object.freeze([
    {
      idRuta: 8001,
      identificador:
        'RUT-0001',

      fecha:
        '2026-09-09',

      placaVehiculo:
        'KLM-0932',

      idChofer: 502,
      chofer:
        'Miguel Torres',

      idRepresentante: 402,
      representante:
        'Luis Martínez',

      ordenes: [5102],

      paradas:
        clonar(
          PROGRAMACIONES[1]
            .paradas
        ),

      primeraSalida:
        '2026-09-09T07:30:00',

      retornoPrevisto:
        '2026-09-09T12:00:00',

      avance: 25,
      incidenciasAbiertas: 0,

      version: 1
    },

    {
      idRuta: 8002,
      identificador:
        'RUT-0002',

      fecha:
        '2026-09-12',

      placaVehiculo:
        'SJS-2847',

      idChofer: 501,
      chofer:
        'José Hernández',

      idRepresentante: 401,
      representante:
        'Ana Rodríguez',

      ordenes: [5001],

      paradas:
        clonar(
          PROGRAMACIONES[0]
            .paradas
        ),

      primeraSalida:
        '2026-09-12T10:00:00',

      retornoPrevisto:
        '2026-09-14T22:00:00',

      avance: 42,
      incidenciasAbiertas: 1,

      version: 1
    },

    {
      idRuta: 8003,
      identificador:
        'RUT-0003',

      fecha:
        '2026-09-10',

      placaVehiculo:
        'MNB-7710',

      idChofer: 501,
      chofer:
        'José Hernández',

      idRepresentante: 401,
      representante:
        'Ana Rodríguez',

      ordenes: [
        5103,
        5001
      ],

      paradas:
        clonar(
          PROGRAMACIONES[2]
            .paradas
        ),

      primeraSalida:
        '2026-09-10T09:00:00',

      retornoPrevisto:
        '2026-09-10T19:00:00',

      avance: 60,
      incidenciasAbiertas: 1,

      version: 1
    }
  ]);

const TRASLADOS =
  Object.freeze([
    {
      idTraslado: 9001,
      idRuta: 8001,

      placaVehiculo:
        'KLM-0932',

      idChofer: 502,
      idRepresentante: 402,

      ordenesTransportadas:
        [5102],

      cargaRealizadaEn:
        '2026-09-09T07:10:00',

      salidaIniciadaEn:
        '2026-09-09T07:30:00',

      salidaTerminadaEn: null,
      retornoIniciadoEn: null,
      retornoTerminadoEn: null,

      evidencias: [],
      comentarios: [],

      auditoria: [
        {
          hito:
            'CARGA_REALIZADA',

          usuario:
            'Miguel Torres',

          fechaHora:
            '2026-09-09T07:10:00'
        }
      ],

      version: 1
    },

    {
      idTraslado: 9002,
      idRuta: 8003,

      placaVehiculo:
        'MNB-7710',

      idChofer: 501,
      idRepresentante: 401,

      ordenesTransportadas:
        [5103],

      cargaRealizadaEn:
        '2026-09-10T08:40:00',

      salidaIniciadaEn:
        '2026-09-10T09:00:00',

      salidaTerminadaEn:
        '2026-09-10T09:50:00',

      retornoIniciadoEn:
        '2026-09-10T18:00:00',

      retornoTerminadoEn:
        '2026-09-10T18:45:00',

      evidencias: [],
      comentarios: [],

      auditoria: [],
      version: 1
    }
  ]);

const INCIDENCIAS =
  Object.freeze([
    {
      idIncidencia: 10001,

      folioIncidencia:
        'INC-2026-001',

      tipoIncidencia:
        TIPOS_INCIDENCIA_LOGISTICA
          .MATERIAL_INCORRECTO,

      estadoIncidencia:
        ESTADOS_INCIDENCIA_LOGISTICA
          .REPORTADA,

      idOrden: 5001,
      idProgramacion: 7001,
      idRuta: 8002,
      idParada: 8202,
      idFase: 7102,

      placaVehiculo:
        'SJS-2847',

      idProducto: 1001,
      cantidadAfectada: 2,

      descripcionReporte:
        'Se identificaron dos piezas distintas a las solicitadas.',

      evidenciasAdicionales: [],

      reportadoPor: {
        id: 401,
        username:
          'representante',

        nombre:
          'Ana Rodríguez',

        rol:
          'REPRESENTANTE'
      },

      reportadoEn:
        '2026-09-12T09:20:00',

      accionesSeguimiento: [],
      supervisorResponsable: null,

      resolucion: null,
      resueltoEn: null,

      historialEstados: [
        {
          estado:
            'REPORTADA',

          fechaHora:
            '2026-09-12T09:20:00',

          usuario:
            'Ana Rodríguez'
        }
      ],

      version: 1
    },

    {
      idIncidencia: 10002,

      folioIncidencia:
        'INC-2026-002',

      tipoIncidencia:
        TIPOS_INCIDENCIA_LOGISTICA
          .MATERIAL_DANADO,

      estadoIncidencia:
        ESTADOS_INCIDENCIA_LOGISTICA
          .REPORTADA,

      idOrden: 5103,
      idProgramacion: 7003,
      idRuta: 8003,
      idParada: 8302,
      idFase: 7302,

      placaVehiculo:
        'MNB-7710',

      idProducto: 1005,
      cantidadAfectada: 1,

      descripcionReporte:
        'Material con daño visible durante entrega.',

      evidenciasAdicionales: [],

      reportadoPor: {
        id: 401,
        username:
          'representante',

        nombre:
          'Ana Rodríguez',

        rol:
          'REPRESENTANTE'
      },

      reportadoEn:
        '2026-09-10T10:15:00',

      accionesSeguimiento: [],
      supervisorResponsable: null,

      resolucion: null,
      resueltoEn: null,

      historialEstados: [
        {
          estado:
            'REPORTADA',

          fechaHora:
            '2026-09-10T10:15:00',

          usuario:
            'Ana Rodríguez'
        }
      ],

      version: 1
    },

    {
      idIncidencia: 10003,

      folioIncidencia:
        'INC-2026-003',

      tipoIncidencia:
        TIPOS_INCIDENCIA_LOGISTICA
          .INCIDENTE_VIAL,

      estadoIncidencia:
        ESTADOS_INCIDENCIA_LOGISTICA
          .EN_SEGUIMIENTO,

      idOrden: 5001,
      idProgramacion: 7001,
      idRuta: 8002,
      idParada: null,
      idFase: 7103,

      placaVehiculo:
        'SJS-2847',

      idProducto: null,
      cantidadAfectada: null,

      descripcionReporte:
        'Incidente vial menor sin afectación a la continuidad de la ruta.',

      evidenciasAdicionales: [],

      reportadoPor: {
        id: 501,
        username:
          'chofer',

        nombre:
          'José Hernández',

        rol:
          'CHOFER'
      },

      reportadoEn:
        '2026-09-12T10:30:00',

      accionesSeguimiento: [
        {
          descripcion:
            'Se confirmó continuidad segura de la ruta.',

          fechaHora:
            '2026-09-12T10:40:00',

          usuario:
            'Supervisor Logística'
        }
      ],

      supervisorResponsable: {
        id: 301,
        nombre:
          'Supervisor Logística'
      },

      resolucion: null,
      resueltoEn: null,

      historialEstados: [
        {
          estado:
            'REPORTADA',

          fechaHora:
            '2026-09-12T10:30:00',

          usuario:
            'José Hernández'
        },

        {
          estado:
            'EN_SEGUIMIENTO',

          fechaHora:
            '2026-09-12T10:40:00',

          usuario:
            'Supervisor Logística'
        }
      ],

      version: 2
    },

    {
      idIncidencia: 10004,

      folioIncidencia:
        'INC-2026-004',

      tipoIncidencia:
        TIPOS_INCIDENCIA_LOGISTICA
          .DANO_VEHICULO,

      estadoIncidencia:
        ESTADOS_INCIDENCIA_LOGISTICA
          .RESUELTA,

      idOrden: 5102,
      idProgramacion: 7002,
      idRuta: 8001,
      idParada: null,
      idFase: 7202,

      placaVehiculo:
        'KLM-0932',

      idProducto: null,
      cantidadAfectada: null,

      descripcionReporte:
        'Daño menor reportado en vehículo asignado.',

      evidenciasAdicionales: [],

      reportadoPor: {
        id: 502,
        username:
          'chofer2',

        nombre:
          'Miguel Torres',

        rol:
          'CHOFER'
      },

      reportadoEn:
        '2026-09-05T08:00:00',

      accionesSeguimiento: [
        {
          descripcion:
            'Vehículo revisado.',

          fechaHora:
            '2026-09-05T08:20:00',

          usuario:
            'Supervisor Logística'
        }
      ],

      supervisorResponsable: {
        id: 301,
        nombre:
          'Supervisor Logística'
      },

      resolucion:
        'Se confirmó que el daño no afecta la operación.',

      resueltoEn:
        '2026-09-05T08:35:00',

      historialEstados: [
        {
          estado:
            'REPORTADA',

          fechaHora:
            '2026-09-05T08:00:00',

          usuario:
            'Miguel Torres'
        },
        {
          estado:
            'EN_SEGUIMIENTO',

          fechaHora:
            '2026-09-05T08:20:00',

          usuario:
            'Supervisor Logística'
        },
        {
          estado:
            'RESUELTA',

          fechaHora:
            '2026-09-05T08:35:00',

          usuario:
            'Supervisor Logística'
        }
      ],

      version: 3
    }
  ]);

const TOLERANCIAS =
  Object.freeze(
    FASES_LOGISTICAS.map(
      fase => ({
        codigoFase:
          fase.codigo,

        nombreFase:
          fase.nombre,

        unidad:
          fase.traslado
            ? 'FECHA_HORA'
            : 'MINUTOS',

        valorMinutos:
          fase.traslado
            ? null
            : 30,

        aplica:
          !fase.traslado,

        modificadoPor:
          'Sistema',

        modificadoEn:
          '2026-09-01T00:00:00',

        version: 1,

        historialCambios: []
      })
    )
  );

const COMPATIBILIDAD_LEGACY =
  Object.freeze([
    {
      id: 7001,
      idActividadLogistica: 7001,
      orden: 5001,
      idOrden: 5001,

      fase: 'Salida',
      direccion:
        'Evento A',

      fechaInicio:
        '2026-09-12T08:00:00',

      fechaFin:
        '2026-09-14T22:00:00',

      responsable:
        'Responsable de Logística',

      vehiculo:
        'SJS-2847',

      estadoRecoleccion:
        'RECOLECCION_EN_PROCESO'
    },

    {
      id: 7002,
      idActividadLogistica: 7002,
      orden: 5002,
      idOrden: 5002,

      fase: 'Salida',
      direccion:
        'Evento B',

      fechaInicio:
        '2026-09-13T08:00:00',

      fechaFin:
        '2026-09-15T22:00:00',

      responsable:
        'Responsable de Logística',

      vehiculo:
        'KLM-0932',

      estadoRecoleccion:
        'RECOLECCION_EN_PROCESO'
    }
  ]);

export function createLogisticaMockState() {
  return {
    ordenes:
      clonar(ORDENES),

    programaciones:
      clonar(PROGRAMACIONES),

    rutas:
      clonar(RUTAS),

    traslados:
      clonar(TRASLADOS),

    incidencias:
      clonar(INCIDENCIAS),

    tolerancias:
      clonar(TOLERANCIAS),

    recursos:
      clonar(RECURSOS),

    compatibilidadLegacy:
      clonar(
        COMPATIBILIDAD_LEGACY
      ),

    auditoria: []
  };
}