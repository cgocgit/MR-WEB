export const PERMISOS_LOGISTICA =
  Object.freeze({
    CONSULTAR:
      'logistica.consultar',

    GESTIONAR:
      'logistica.gestionar',

    ASIGNADAS:
      'logistica.asignadas',

    PROCESO_GESTION:
      'logistica.proceso.gestion',

    TRASLADO:
      'logistica.traslado',

    TOLERANCIAS_GESTIONAR:
      'logistica.tolerancias.gestionar'
  });

export const ROLES_LOGISTICA =
  Object.freeze({
    ADMIN: 'ADMIN',
    ADMINISTRATIVO: 'ADMINISTRATIVO',
    USER: 'USER',
    INVENTARIO: 'INVENTARIO',
    SUPERVISOR: 'SUPERVISOR',
    REPRESENTANTE: 'REPRESENTANTE',
    CHOFER: 'CHOFER',
    DIRECCION: 'DIRECCION'
  });

export const ESTADOS_ORDEN_LOGISTICA =
  Object.freeze({
    PENDIENTE_PROGRAMACION:
      'PENDIENTE_PROGRAMACION',

    PROGRAMADA:
      'PROGRAMADA',

    EN_EJECUCION:
      'EN_EJECUCION',

    REALIZADA:
      'REALIZADA',

    CANCELADA:
      'CANCELADA'
  });

export const ESTADOS_ORDEN_LABELS =
  Object.freeze({
    PENDIENTE_PROGRAMACION:
      'Pendiente de programación',

    PROGRAMADA:
      'Programada',

    EN_EJECUCION:
      'En ejecución',

    REALIZADA:
      'Realizada',

    CANCELADA:
      'Cancelada'
  });

export const TIPOS_ORDEN_LOGISTICA =
  Object.freeze({
    PRODUCTOS: 'PRODUCTOS',
    SERVICIOS: 'SERVICIOS',
    MIXTA: 'MIXTA'
  });

export const TIPOS_ORDEN_LABELS =
  Object.freeze({
    PRODUCTOS: 'Productos',
    SERVICIOS: 'Servicios',
    MIXTA: 'Mixta'
  });

export const ESTADOS_FASE_LOGISTICA =
  Object.freeze({
    PENDIENTE: 'PENDIENTE',
    EN_PROCESO: 'EN_PROCESO',
    PARCIAL: 'PARCIAL',
    CONCLUIDA: 'CONCLUIDA',
    NO_APLICA: 'NO_APLICA'
  });

export const ESTADOS_FASE_LABELS =
  Object.freeze({
    PENDIENTE: 'Pendiente',
    EN_PROCESO: 'En proceso',
    PARCIAL: 'Parcial',
    CONCLUIDA: 'Concluida',
    NO_APLICA: 'No aplica'
  });

export const ESTADOS_INCIDENCIA_LOGISTICA =
  Object.freeze({
    REPORTADA: 'REPORTADA',
    EN_SEGUIMIENTO:
      'EN_SEGUIMIENTO',
    RESUELTA: 'RESUELTA'
  });

export const ESTADOS_INCIDENCIA_LABELS =
  Object.freeze({
    REPORTADA: 'Reportada',
    EN_SEGUIMIENTO:
      'En seguimiento',
    RESUELTA: 'Resuelta'
  });

export const TIPOS_INCIDENCIA_LOGISTICA =
  Object.freeze({
    MATERIAL_INCORRECTO:
      'MATERIAL_INCORRECTO',

    MATERIAL_DANADO:
      'MATERIAL_DANADO',

    INCIDENTE_VIAL:
      'INCIDENTE_VIAL',

    DANO_VEHICULO:
      'DANO_VEHICULO'
  });

export const TIPOS_INCIDENCIA_LABELS =
  Object.freeze({
    MATERIAL_INCORRECTO:
      'Material incorrecto',

    MATERIAL_DANADO:
      'Material dañado',

    INCIDENTE_VIAL:
      'Incidente vial',

    DANO_VEHICULO:
      'Daño en vehículo'
  });

export const TIPOS_INCIDENCIA_POR_ROL =
  Object.freeze({
    REPRESENTANTE: Object.freeze([
      TIPOS_INCIDENCIA_LOGISTICA
        .MATERIAL_INCORRECTO,

      TIPOS_INCIDENCIA_LOGISTICA
        .MATERIAL_DANADO
    ]),

    CHOFER: Object.freeze([
      TIPOS_INCIDENCIA_LOGISTICA
        .INCIDENTE_VIAL,

      TIPOS_INCIDENCIA_LOGISTICA
        .DANO_VEHICULO
    ])
  });

export const TIPOS_PARADA_LOGISTICA =
  Object.freeze({
    CARGA: 'CARGA',
    ENTREGA: 'ENTREGA',
    ATENCION: 'ATENCION',
    RECOLECCION: 'RECOLECCION',
    RETORNO: 'RETORNO'
  });

export const TIPOS_PARADA_LABELS =
  Object.freeze({
    CARGA: 'Carga',
    ENTREGA: 'Entrega',
    ATENCION: 'Atención',
    RECOLECCION: 'Recolección',
    RETORNO: 'Retorno'
  });

export const HITOS_TRASLADO =
  Object.freeze({
    CARGA_REALIZADA:
      'CARGA_REALIZADA',

    SALIDA_INICIADA:
      'SALIDA_INICIADA',

    SALIDA_TERMINADA:
      'SALIDA_TERMINADA',

    RETORNO_INICIADO:
      'RETORNO_INICIADO',

    RETORNO_TERMINADO:
      'RETORNO_TERMINADO'
  });

export const HITOS_TRASLADO_LABELS =
  Object.freeze({
    CARGA_REALIZADA:
      'Carga realizada',

    SALIDA_INICIADA:
      'Inicio de traslado de salida',

    SALIDA_TERMINADA:
      'Término de traslado de salida',

    RETORNO_INICIADO:
      'Inicio de traslado de retorno',

    RETORNO_TERMINADO:
      'Término de traslado de retorno'
  });

export const FASES_LOGISTICAS =
  Object.freeze([
    {
      codigo: 'RECEPCION',
      nombre:
        'Recepción logística de la Orden',
      orden: 1,
      traslado: false
    },
    {
      codigo: 'PLANEACION',
      nombre:
        'Planeación y asignación',
      orden: 2,
      traslado: false
    },
    {
      codigo: 'PREPARACION',
      nombre:
        'Preparación y surtido',
      orden: 3,
      traslado: false
    },
    {
      codigo: 'CARGA_DESPACHO',
      nombre:
        'Carga y despacho',
      orden: 4,
      traslado: false
    },
    {
      codigo: 'TRASLADO_SITIO',
      nombre:
        'Traslado al sitio',
      orden: 5,
      traslado: true
    },
    {
      codigo: 'ENTREGA',
      nombre:
        'Entrega',
      orden: 6,
      traslado: false
    },
    {
      codigo: 'MONTAJE',
      nombre:
        'Montaje',
      orden: 7,
      traslado: false
    },
    {
      codigo: 'EJECUCION',
      nombre:
        'Ejecución o permanencia',
      orden: 8,
      traslado: false
    },
    {
      codigo: 'DESMONTAJE',
      nombre:
        'Desmontaje',
      orden: 9,
      traslado: false
    },
    {
      codigo: 'RECOLECCION',
      nombre:
        'Recolección',
      orden: 10,
      traslado: false
    },
    {
      codigo: 'TRASLADO_RETORNO',
      nombre:
        'Traslado de retorno',
      orden: 11,
      traslado: true
    },
    {
      codigo: 'ENTREGA_ALMACEN',
      nombre:
        'Entrega al almacén',
      orden: 12,
      traslado: false
    },
    {
      codigo: 'INSPECCION',
      nombre:
        'Inspección',
      orden: 13,
      traslado: false
    },
    {
      codigo:
        'LIMPIEZA_REACONDICIONAMIENTO',

      nombre:
        'Limpieza y reacondicionamiento',

      orden: 14,
      traslado: false
    },
    {
      codigo: 'REINGRESO_INVENTARIO',
      nombre:
        'Reingreso a Inventario',
      orden: 15,
      traslado: false
    },
    {
      codigo: 'CIERRE',
      nombre:
        'Cierre logístico',
      orden: 16,
      traslado: false
    }
  ]);

const FASES_PRODUCTOS =
  Object.freeze([
    'RECEPCION',
    'PLANEACION',
    'PREPARACION',
    'CARGA_DESPACHO',
    'TRASLADO_SITIO',
    'ENTREGA',
    'RECOLECCION',
    'TRASLADO_RETORNO',
    'ENTREGA_ALMACEN',
    'INSPECCION',
    'LIMPIEZA_REACONDICIONAMIENTO',
    'REINGRESO_INVENTARIO',
    'CIERRE'
  ]);

const FASES_SERVICIOS =
  Object.freeze([
    'RECEPCION',
    'PLANEACION',
    'TRASLADO_SITIO',
    'EJECUCION',
    'CIERRE'
  ]);

const FASES_MIXTA =
  Object.freeze(
    FASES_LOGISTICAS.map(
      item => item.codigo
    )
  );

export const RUTAS_LOGISTICA =
  Object.freeze({
    INICIO:
      '#/logistica',

    PROGRAMACION:
      '#/logistica/programacion',

    PROGRAMACION_FORMULARIO:
      '#/logistica/programacion/formulario',

    CONSULTA:
      '#/logistica/consulta',

    RUTAS:
      '#/logistica/rutas',

    RUTA_DETALLE:
      '#/logistica/rutas/detalle',

    ORDEN_DETALLE:
      '#/logistica/orden/detalle',

    ASIGNADAS:
      '#/logistica/asignadas',

    EJECUCION:
      '#/logistica/ejecucion',

    TRASLADO:
      '#/logistica/traslado',

    INCIDENCIAS:
      '#/logistica/incidencias',

    TOLERANCIAS:
      '#/logistica/tolerancias'
  });

export function obtenerFasesAplicables(
  tipoOrden
) {
  let codigos = [];

  if (
    tipoOrden ===
    TIPOS_ORDEN_LOGISTICA.PRODUCTOS
  ) {
    codigos = FASES_PRODUCTOS;
  } else if (
    tipoOrden ===
    TIPOS_ORDEN_LOGISTICA.SERVICIOS
  ) {
    codigos = FASES_SERVICIOS;
  } else if (
    tipoOrden ===
    TIPOS_ORDEN_LOGISTICA.MIXTA
  ) {
    codigos = FASES_MIXTA;
  }

  return FASES_LOGISTICAS.filter(
    fase =>
      codigos.includes(
        fase.codigo
      )
  );
}

export function obtenerFaseLogistica(
  codigo
) {
  return (
    FASES_LOGISTICAS.find(
      fase =>
        fase.codigo === codigo
    ) ||
    null
  );
}

export function esIdPositivo(
  valor
) {
  const numero =
    Number(valor);

  return (
    Number.isInteger(numero) &&
    numero > 0
  );
}