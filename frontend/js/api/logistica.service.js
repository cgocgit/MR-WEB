import {
  createLogisticaMockState
} from './logistica.mock.js';

import {
  ESTADOS_FASE_LABELS,
  ESTADOS_FASE_LOGISTICA,
  ESTADOS_INCIDENCIA_LABELS,
  ESTADOS_INCIDENCIA_LOGISTICA,
  ESTADOS_ORDEN_LOGISTICA,
  FASES_LOGISTICAS,
  HITOS_TRASLADO,
  HITOS_TRASLADO_LABELS,
  TIPOS_INCIDENCIA_LABELS,
  TIPOS_INCIDENCIA_POR_ROL,
  obtenerFasesAplicables,
  esIdPositivo
} from './logistica.constants.js';

import {
  getSession
} from '../shared/auth-guard.js';

import {
  hasAnyPermission
} from '../shared/permissions.js';

const state =
  createLogisticaMockState();

const ESTADOS_RECOLECCION_VALIDOS =
  new Set([
    'RECOLECCION_EN_PROCESO',
    'RECOLECCION_COMPLETADA'
  ]);

const PERMISOS_CONSULTA = [
  'logistica.consultar',
  'logistica.gestionar',
  'logistica.asignadas',
  'logistica.proceso.gestion',
  'logistica.traslado',
  'logistica.tolerancias.gestionar'
];

const HITOS_TRASLADO_CAMPOS = {
  [HITOS_TRASLADO.CARGA_REALIZADA]:
    'cargaRealizadaEn',

  [HITOS_TRASLADO.SALIDA_INICIADA]:
    'salidaIniciadaEn',

  [HITOS_TRASLADO.SALIDA_TERMINADA]:
    'salidaTerminadaEn',

  [HITOS_TRASLADO.RETORNO_INICIADO]:
    'retornoIniciadoEn',

  [HITOS_TRASLADO.RETORNO_TERMINADO]:
    'retornoTerminadoEn'
};

const SECUENCIA_TRASLADO = [
  HITOS_TRASLADO.CARGA_REALIZADA,
  HITOS_TRASLADO.SALIDA_INICIADA,
  HITOS_TRASLADO.SALIDA_TERMINADA,
  HITOS_TRASLADO.RETORNO_INICIADO,
  HITOS_TRASLADO.RETORNO_TERMINADO
];

function clonar(valor) {
  return typeof structuredClone ===
    'function'
    ? structuredClone(valor)
    : JSON.parse(
        JSON.stringify(valor)
      );
}

function crearError(
  mensaje,
  codigo = 'LOGISTICA_ERROR'
) {
  const error =
    new Error(mensaje);

  error.codigo = codigo;

  return error;
}

function ahora() {
  return new Date().toISOString();
}

function sesion() {
  return getSession();
}

function usuarioActual() {
  const user =
    sesion()?.user || {};

  const username =
    String(
      user.username || ''
    ).toLowerCase();

  const recurso = [
    ...state.recursos.supervisores,
    ...state.recursos.representantes,
    ...state.recursos.choferes
  ].find(
    item =>
      String(
        item.username || ''
      ).toLowerCase() ===
      username
  );

  return {
    id:
      recurso?.id ??
      user.id ??
      null,

    username,

    nombre:
      recurso?.nombre ||
      user.name ||
      user.username ||
      'Usuario',

    roles:
      Array.isArray(user.roles)
        ? [...user.roles]
        : []
  };
}

function exigirPermiso(
  permisos
) {
  if (
    !hasAnyPermission(
      sesion(),
      permisos
    )
  ) {
    throw crearError(
      'No cuenta con permisos para realizar esta operación.',
      'ACCESO_DENEGADO'
    );
  }
}

function formatoFechaHora(
  valor
) {
  if (!valor) {
    return '—';
  }

  const fecha =
    new Date(valor);

  if (
    Number.isNaN(
      fecha.getTime()
    )
  ) {
    return String(valor);
  }

  return new Intl.DateTimeFormat(
    'es-MX',
    {
      dateStyle: 'medium',
      timeStyle: 'short'
    }
  ).format(fecha);
}

function formatoFecha(
  valor
) {
  if (!valor) {
    return '—';
  }

  const fecha =
    new Date(
      `${valor}T00:00:00`
    );

  if (
    Number.isNaN(
      fecha.getTime()
    )
  ) {
    return String(valor);
  }

  return new Intl.DateTimeFormat(
    'es-MX',
    {
      dateStyle: 'medium'
    }
  ).format(fecha);
}

function textoContiene(
  valor,
  filtro
) {
  if (!filtro) {
    return true;
  }

  return String(
    valor ?? ''
  )
    .toLowerCase()
    .includes(
      String(filtro)
        .trim()
        .toLowerCase()
    );
}

function siguienteId(
  items,
  campo,
  base
) {
  return Math.max(
    base,
    ...items.map(
      item =>
        Number(
          item[campo]
        ) || 0
    )
  ) + 1;
}

function obtenerOrdenInterna(
  idOrden
) {
  const id =
    Number(idOrden);

  const orden =
    state.ordenes.find(
      item =>
        Number(item.idOrden) ===
        id
    );

  if (!orden) {
    throw crearError(
      'Registro no encontrado.',
      'ORDEN_NO_ENCONTRADA'
    );
  }

  return orden;
}

function obtenerProgramacionInternaPorOrden(
  idOrden
) {
  const id =
    Number(idOrden);

  return (
    state.programaciones.find(
      item =>
        item.idOrdenes.some(
          ordenId =>
            Number(ordenId) === id
        )
    ) ||
    null
  );
}

function obtenerRutaInterna(
  idRuta
) {
  const id =
    Number(idRuta);

  const ruta =
    state.rutas.find(
      item =>
        Number(item.idRuta) ===
        id
    );

  if (!ruta) {
    throw crearError(
      'Registro no encontrado.',
      'RUTA_NO_ENCONTRADA'
    );
  }

  return ruta;
}

function obtenerIncidenciaInterna(
  idIncidencia
) {
  const incidencia =
    state.incidencias.find(
      item =>
        Number(
          item.idIncidencia
        ) ===
        Number(idIncidencia)
    );

  if (!incidencia) {
    throw crearError(
      'Incidencia no encontrada.',
      'INCIDENCIA_NO_ENCONTRADA'
    );
  }

  return incidencia;
}

function recursoPorId(
  coleccion,
  id
) {
  return (
    coleccion.find(
      item =>
        Number(item.id) ===
        Number(id)
    ) ||
    null
  );
}

function recursoPorUsername(
  coleccion,
  username
) {
  return (
    coleccion.find(
      item =>
        String(
          item.username || ''
        ).toLowerCase() ===
        String(
          username || ''
        ).toLowerCase()
    ) ||
    null
  );
}

function nombreRecurso(
  coleccion,
  id
) {
  return (
    recursoPorId(
      coleccion,
      id
    )?.nombre ||
    '—'
  );
}

function referenciaOrden(
  idOrden
) {
  const orden =
    state.ordenes.find(
      item =>
        Number(item.idOrden) ===
        Number(idOrden)
    );

  return (
    orden?.folioOrden ||
    `Orden ${idOrden}`
  );
}

function faseDefinicion(
  codigo
) {
  return (
    FASES_LOGISTICAS.find(
      item =>
        item.codigo === codigo
    ) ||
    null
  );
}

function toleranciaVigente(
  codigoFase
) {
  return (
    state.tolerancias.find(
      item =>
        item.codigoFase ===
        codigoFase
    ) ||
    null
  );
}

function mapearProgramacion(
  programacion
) {
  if (!programacion) {
    return null;
  }

  const ruta =
    state.rutas.find(
      item =>
        Number(item.idRuta) ===
        Number(
          programacion.idRuta
        )
    );

  return {
    ...clonar(programacion),

    nombreRuta:
      programacion.nombreRuta ||
      ruta?.identificador ||
      null,

    rutaIdentificador:
      ruta?.identificador ||
      programacion.nombreRuta ||
      null,

    chofer:
      nombreRecurso(
        state.recursos.choferes,
        programacion.idChofer
      ),

    representante:
      nombreRecurso(
        state.recursos
          .representantes,
        programacion
          .idRepresentante
      ),

    supervisor:
      nombreRecurso(
        state.recursos
          .supervisores,
        programacion.idSupervisor
      )
  };
}

function minutosTranscurridos(
  fechaInicio,
  fechaFin = null
) {
  if (!fechaInicio) {
    return null;
  }

  const inicio =
    new Date(fechaInicio);

  const fin =
    fechaFin
      ? new Date(fechaFin)
      : new Date();

  if (
    Number.isNaN(
      inicio.getTime()
    ) ||
    Number.isNaN(
      fin.getTime()
    )
  ) {
    return null;
  }

  return Math.max(
    0,
    Math.round(
      (
        fin.getTime() -
        inicio.getTime()
      ) /
      60000
    )
  );
}

function situacionTiempo(
  fase
) {
  if (
    fase.toleranciaMinutos == null ||
    !fase.fechaHoraInicio
  ) {
    return 'No aplica';
  }

  const transcurrido =
    minutosTranscurridos(
      fase.fechaHoraInicio,
      fase.fechaHoraTermino
    );

  if (transcurrido == null) {
    return 'En tiempo';
  }

  const limite =
    Number(
      fase
        .duracionEstimadaMinutos ||
      0
    ) +
    Number(
      fase.toleranciaMinutos ||
      0
    );

  return transcurrido >
    limite
    ? 'Fuera de tolerancia'
    : 'En tiempo';
}

function recursosOcupados(
  fechaHoraInicio,
  excluirIdProgramacion = null
) {
  if (!fechaHoraInicio) {
    return {
      representantes:
        new Set(),

      choferes:
        new Set(),

      placas:
        new Set()
    };
  }

  const fecha =
    String(
      fechaHoraInicio
    ).slice(0, 10);

  const programaciones =
    state.programaciones.filter(
      item =>
        Number(
          item.idProgramacion
        ) !==
          Number(
            excluirIdProgramacion
          ) &&
        String(
          item
            .fechaHoraPreparacion ||
          ''
        ).slice(
          0,
          10
        ) ===
          fecha
    );

  return {
    representantes:
      new Set(
        programaciones.map(
          item =>
            Number(
              item.idRepresentante
            )
        )
      ),

    choferes:
      new Set(
        programaciones.map(
          item =>
            Number(
              item.idChofer
            )
        )
      ),

    placas:
      new Set(
        programaciones.map(
          item =>
            String(
              item.placaVehiculo
            )
        )
      )
  };
}

function usuarioAsignadoAProgramacion(
  programacion
) {
  const user =
    usuarioActual();

  const representante =
    recursoPorUsername(
      state.recursos
        .representantes,
      user.username
    );

  const chofer =
    recursoPorUsername(
      state.recursos.choferes,
      user.username
    );

  return (
    Number(
      programacion
        .idRepresentante
    ) ===
      Number(
        representante?.id
      ) ||
    Number(
      programacion.idChofer
    ) ===
      Number(
        chofer?.id
      )
  );
}

function usuarioAsignadoARuta(
  ruta
) {
  const user =
    usuarioActual();

  const representante =
    recursoPorUsername(
      state.recursos
        .representantes,
      user.username
    );

  const chofer =
    recursoPorUsername(
      state.recursos.choferes,
      user.username
    );

  return (
    Number(
      ruta.idRepresentante
    ) ===
      Number(
        representante?.id
      ) ||
    Number(ruta.idChofer) ===
      Number(
        chofer?.id
      )
  );
}

const ROLES_CONSULTA_GENERAL =
  new Set([
    'ADMIN',
    'ADMINISTRATIVO',
    'SUPERVISOR',
    'DIRECCION'
  ]);

const FASES_ALCANCE_INVENTARIO =
  new Set([
    'PREPARACION',
    'CARGA_DESPACHO',
    'RECOLECCION',
    'TRASLADO_RETORNO',
    'ENTREGA_ALMACEN',
    'INSPECCION',
    'LIMPIEZA_REACONDICIONAMIENTO',
    'REINGRESO_INVENTARIO'
  ]);

function tieneRolActual(
  rol
) {
  return usuarioActual()
    .roles
    .includes(rol);
}

function puedeConsultarGeneral() {
  return usuarioActual()
    .roles
    .some(
      rol =>
        ROLES_CONSULTA_GENERAL
          .has(rol)
    );
}

function usernameVentasCanonico(
  username
) {
  const valor =
    String(
      username || ''
    ).toLowerCase();

  return valor === 'vendedor'
    ? 'ventas'
    : valor;
}

function ordenVisibleParaUsuario(
  orden
) {
  if (!orden) {
    return false;
  }

  if (puedeConsultarGeneral()) {
    return true;
  }

  const user =
    usuarioActual();

  if (
    user.roles.includes(
      'USER'
    )
  ) {
    return (
      String(
        orden.usuarioVentas ||
        ''
      ).toLowerCase() ===
      usernameVentasCanonico(
        user.username
      )
    );
  }

  if (
    user.roles.includes(
      'INVENTARIO'
    )
  ) {
    return (
      Array.isArray(
        orden.productos
      ) &&
      orden.productos.length > 0
    );
  }

  const programacion =
    obtenerProgramacionInternaPorOrden(
      orden.idOrden
    );

  return Boolean(
    programacion &&
    usuarioAsignadoAProgramacion(
      programacion
    )
  );
}

function programacionVisibleParaUsuario(
  programacion
) {
  if (!programacion) {
    return false;
  }

  if (puedeConsultarGeneral()) {
    return true;
  }

  return programacion.idOrdenes
    .some(
      idOrden => {
        const orden =
          state.ordenes.find(
            item =>
              Number(
                item.idOrden
              ) ===
              Number(idOrden)
          );

        return (
          orden &&
          ordenVisibleParaUsuario(
            orden
          )
        );
      }
    );
}

function rutaVisibleParaUsuario(
  ruta
) {
  if (!ruta) {
    return false;
  }

  if (puedeConsultarGeneral()) {
    return true;
  }

  if (
    usuarioAsignadoARuta(
      ruta
    )
  ) {
    return true;
  }

  return (
    ruta.ordenes || []
  ).some(
    idOrden => {
      const orden =
        state.ordenes.find(
          item =>
            Number(
              item.idOrden
            ) ===
            Number(idOrden)
        );

      return (
        orden &&
        ordenVisibleParaUsuario(
          orden
        )
      );
    }
  );
}

function faseVisibleParaUsuario(
  fase
) {
  if (
    !tieneRolActual(
      'INVENTARIO'
    )
  ) {
    return true;
  }

  return FASES_ALCANCE_INVENTARIO
    .has(
      fase.codigoFase
    );
}

function incidenciaRelacionadaInventario(
  incidencia
) {
  if (
    (
      TIPOS_INCIDENCIA_POR_ROL
        .REPRESENTANTE ||
      []
    ).includes(
      incidencia.tipoIncidencia
    )
  ) {
    return true;
  }

  if (!incidencia.idFase) {
    return false;
  }

  const fase =
    state.programaciones
      .flatMap(
        item =>
          item.fases
      )
      .find(
        item =>
          Number(
            item.idFase
          ) ===
          Number(
            incidencia.idFase
          )
      );

  return Boolean(
    fase &&
    FASES_ALCANCE_INVENTARIO
      .has(
        fase.codigoFase
      )
  );
}

function auditoria(
  accion,
  referencia = {}
) {
  state.auditoria.push({
    fechaHora: ahora(),

    usuario:
      usuarioActual().nombre,

    accion,

    ...clonar(referencia)
  });
}

function validarVersion(
  actual,
  recibida
) {
  if (
    recibida != null &&
    Number(recibida) !==
      Number(actual)
  ) {
    throw crearError(
      'El registro fue actualizado por otro usuario. Actualice la información e intente nuevamente.',
      'CONFLICTO_ACTUALIZACION'
    );
  }
}

function validarOrdenOperable(
  orden
) {
  if (
    orden.cancelada ||
    orden.estadoOrden ===
      ESTADOS_ORDEN_LOGISTICA
        .CANCELADA
  ) {
    throw crearError(
      'La Orden fue cancelada y no permite nuevas operaciones logísticas.',
      'ORDEN_CANCELADA'
    );
  }
}

function normalizarFaseNueva(
  idFase,
  faseEntrada,
  responsable
) {
  const definicion =
    faseDefinicion(
      faseEntrada.codigoFase
    );

  const tolerancia =
    toleranciaVigente(
      faseEntrada.codigoFase
    );

  return {
    idFase,

    codigoFase:
      faseEntrada.codigoFase,

    nombre:
      definicion?.nombre ||
      faseEntrada.codigoFase,

    aplica: true,

    estadoFase:
      ESTADOS_FASE_LOGISTICA
        .PENDIENTE,

    duracionEstimadaMinutos:
      definicion?.traslado
        ? null
        : Number(
            faseEntrada
              .duracionEstimadaMinutos
          ),

    toleranciaMinutos:
      definicion?.traslado
        ? null
        : Number(
            tolerancia
              ?.valorMinutos ??
            30
          ),

    fechaHoraInicio: null,
    fechaHoraTermino: null,

    responsable,

    cantidadPrevista: 1,
    cantidadAtendida: 0,
    cantidadPendiente: 1,

    comentario: null,
    evidencias: [],
    confirmada: false,
    incidencias: [],

    version: 1
  };
}

function incidenciaVisibleParaUsuario(
  incidencia
) {
  if (puedeConsultarGeneral()) {
    return true;
  }

  const user =
    usuarioActual();

  if (
    user.roles.includes(
      'USER'
    )
  ) {
    const orden =
      state.ordenes.find(
        item =>
          Number(
            item.idOrden
          ) ===
          Number(
            incidencia.idOrden
          )
      );

    return (
      orden &&
      ordenVisibleParaUsuario(
        orden
      )
    );
  }

  if (
    user.roles.includes(
      'INVENTARIO'
    )
  ) {
    return incidenciaRelacionadaInventario(
      incidencia
    );
  }

  if (
    String(
      incidencia.reportadoPor
        ?.username ||
      ''
    ).toLowerCase() ===
    user.username
  ) {
    return true;
  }

  if (incidencia.idRuta) {
    try {
      return rutaVisibleParaUsuario(
        obtenerRutaInterna(
          incidencia.idRuta
        )
      );
    } catch {
      return false;
    }
  }

  if (incidencia.idOrden) {
    const programacion =
      obtenerProgramacionInternaPorOrden(
        incidencia.idOrden
      );

    return Boolean(
      programacion &&
      usuarioAsignadoAProgramacion(
        programacion
      )
    );
  }

  return false;
}

export async function obtenerInicioLogistica() {
  exigirPermiso(
    PERMISOS_CONSULTA
  );

  const programacionesBase =
    state.programaciones.filter(
      programacionVisibleParaUsuario
    );

  const incidenciasAbiertas =
    state.incidencias.filter(
      item =>
        item.estadoIncidencia !==
          ESTADOS_INCIDENCIA_LOGISTICA
            .RESUELTA &&
        (
          consultaGeneral ||
          incidenciaVisibleParaUsuario(
            item
          )
        )
    );

  const actividades =
    programacionesBase
      .flatMap(
        programacion => {
          const orden =
            state.ordenes.find(
              item =>
                Number(
                  item.idOrden
                ) ===
                Number(
                  programacion
                    .idOrdenes[0]
                )
            );

          return programacion.fases
            .filter(
              fase =>
                faseVisibleParaUsuario(
                  fase
                ) &&
                fase.estadoFase !==
                ESTADOS_FASE_LOGISTICA
                  .CONCLUIDA
            )
            .map(
              fase => ({
                fechaHora:
                  programacion
                    .fechaHoraPreparacion,

                fechaHoraTexto:
                  formatoFechaHora(
                    programacion
                      .fechaHoraPreparacion
                  ),

                referencia:
                  orden?.folioOrden ||
                  `Ruta ${programacion.idRuta}`,

                actividad:
                  fase.nombre,

                responsable:
                  fase.responsable ||
                  '—',

                situacion:
                  situacionTiempo(
                    fase
                  )
              })
            )
            .slice(0, 2);
        }
      )
      .sort(
        (a, b) =>
          String(a.fechaHora)
            .localeCompare(
              String(b.fechaHora)
            )
      );

  const fasesFuera =
    programacionesBase
      .flatMap(
        item =>
          item.fases
      )
      .filter(
        fase =>
          faseVisibleParaUsuario(
            fase
          ) &&
          situacionTiempo(
            fase
          ) ===
            'Fuera de tolerancia'
      )
      .length;

  return clonar({
    indicadores: {
      pendientesProgramacion:
        state.ordenes.filter(
          item =>
            ordenVisibleParaUsuario(
              item
            ) &&
            item.estadoOrden ===
              ESTADOS_ORDEN_LOGISTICA
                .PENDIENTE_PROGRAMACION &&
            !item.cancelada
        ).length,

      rutasActivas:
        state.rutas.filter(
          rutaVisibleParaUsuario
        ).length,

      incidenciasAbiertas:
        incidenciasAbiertas.length,

            retornosPendientes:
        state.traslados.filter(
          item => {
            if (
              item.retornoTerminadoEn
            ) {
              return false;
            }

            const ruta =
              state.rutas.find(
                rutaItem =>
                  Number(
                    rutaItem.idRuta
                  ) ===
                  Number(
                    item.idRuta
                  )
              );

            return (
              ruta &&
              rutaVisibleParaUsuario(
                ruta
              )
            );
          }
        ).length,

      fasesFueraTolerancia:
        fasesFuera
    },

    actividadesProximas:
      actividades,

    incidenciasRecientes:
      incidenciasAbiertas
        .slice()
        .sort(
          (a, b) =>
            String(
              b.reportadoEn
            ).localeCompare(
              String(
                a.reportadoEn
              )
            )
        )
        .map(
          item => ({
            ...item,

            referencia:
              item.idRuta
                ? `Ruta ${item.idRuta}`
                : referenciaOrden(
                    item.idOrden
                  ),

            tipoTexto:
              TIPOS_INCIDENCIA_LABELS[
                item.tipoIncidencia
              ] ||
              item.tipoIncidencia,

            estadoTexto:
              ESTADOS_INCIDENCIA_LABELS[
                item.estadoIncidencia
              ] ||
              item.estadoIncidencia
          })
        )
  });
}

export async function listarOrdenesProgramacion(
  filtros = {}
) {
  exigirPermiso([
    'logistica.consultar',
    'logistica.gestionar'
  ]);

  const items =
    state.ordenes
      .filter(
        ordenVisibleParaUsuario
      )
      .map(
        orden => {
          const programacion =
            obtenerProgramacionInternaPorOrden(
              orden.idOrden
            );

          const ruta =
            programacion
              ? state.rutas.find(
                  item =>
                    Number(
                      item.idRuta
                    ) ===
                    Number(
                      programacion.idRuta
                    )
                )
              : null;

          return {
            ...orden,

            fechaHoraEventoTexto:
              formatoFechaHora(
                orden.fechaHoraEvento
              ),

            destinoResumen:
              orden.domicilioEvento,

            ruta:
              ruta?.identificador ||
              null,

            placaVehiculo:
              programacion
                ?.placaVehiculo ||
              null,

            chofer:
              programacion
                ? nombreRecurso(
                    state.recursos
                      .choferes,
                    programacion
                      .idChofer
                  )
                : null,

            representante:
              programacion
                ? nombreRecurso(
                    state.recursos
                      .representantes,
                    programacion
                      .idRepresentante
                  )
                : null,

            situacion:
              programacion
                ?.historialReprogramaciones
                ?.length
                ? 'REPROGRAMADA'
                : orden.estadoOrden
          };
        }
      )
      .filter(
        item =>
          textoContiene(
            item.folioOrden,
            filtros.folio
          ) &&

          textoContiene(
            item.cliente,
            filtros.cliente
          ) &&

          (
            !filtros.fechaInicio ||
            String(
              item.fechaHoraEvento
            ).slice(0, 10) >=
              filtros.fechaInicio
          ) &&

          (
            !filtros.fechaFin ||
            String(
              item.fechaHoraEvento
            ).slice(0, 10) <=
              filtros.fechaFin
          ) &&

          (
            !filtros.tipoOrden ||
            item.tipoOrden ===
              filtros.tipoOrden
          ) &&

          (
            !filtros.situacion ||
            item.situacion ===
              filtros.situacion ||
            item.estadoOrden ===
              filtros.situacion
          ) &&

          textoContiene(
            item.placaVehiculo,
            filtros.placa
          ) &&

          textoContiene(
            item.chofer,
            filtros.chofer
          ) &&

          textoContiene(
            item.representante,
            filtros.representante
          )
      );

  return clonar({
    items,
    total: items.length
  });
}

export async function obtenerOrdenLogistica(
  idOrden
) {
  exigirPermiso(
    PERMISOS_CONSULTA
  );

  const orden =
    obtenerOrdenInterna(
      idOrden
    );

      if (
    !ordenVisibleParaUsuario(
      orden
    )
  ) {
    throw crearError(
      'No cuenta con acceso a esta Orden.',
      'ACCESO_DENEGADO'
    );
  }

  return clonar({
    ...orden,

    fechaHoraEventoTexto:
      formatoFechaHora(
        orden.fechaHoraEvento
      )
  });
}

export async function obtenerProgramacionPorOrden(
  idOrden
) {
  exigirPermiso(
    PERMISOS_CONSULTA
  );

  const orden =
    obtenerOrdenInterna(
      idOrden
    );

  if (
    !ordenVisibleParaUsuario(
      orden
    )
  ) {
    throw crearError(
      'No cuenta con acceso a esta programación.',
      'ACCESO_DENEGADO'
    );
  }

  const programacion =
    obtenerProgramacionInternaPorOrden(
      idOrden
    );

  if (!programacion) {
    throw crearError(
      'La Orden aún no tiene programación logística.',
      'PROGRAMACION_NO_ENCONTRADA'
    );
  }

  return mapearProgramacion(
    programacion
  );
}

export async function listarOrdenesAgrupables(
  idOrdenPrincipal
) {
  exigirPermiso([
    'logistica.gestionar'
  ]);

  const principal =
    obtenerOrdenInterna(
      idOrdenPrincipal
    );

  validarOrdenOperable(
    principal
  );

  return clonar(
    state.ordenes.filter(
      item =>
        !item.cancelada &&
        item.estadoOrden !==
          ESTADOS_ORDEN_LOGISTICA
            .REALIZADA
    )
  );
}

export async function obtenerRecursosProgramacion({
  fechaHoraInicio = null,
  excluirIdProgramacion = null
} = {}) {
  exigirPermiso([
    'logistica.gestionar'
  ]);

  const ocupados =
    recursosOcupados(
      fechaHoraInicio,
      excluirIdProgramacion
    );

  return clonar({
    supervisores:
      state.recursos
        .supervisores,

    representantes:
      state.recursos
        .representantes
        .map(
          item => ({
            ...item,

            disponible:
              !ocupados
                .representantes
                .has(
                  Number(item.id)
                )
          })
        ),

    choferes:
      state.recursos
        .choferes
        .map(
          item => ({
            ...item,

            disponible:
              !ocupados
                .choferes
                .has(
                  Number(item.id)
                )
          })
        ),

    vehiculos:
      state.recursos
        .vehiculos
        .map(
          item => ({
            ...item,

            disponible:
              !ocupados
                .placas
                .has(
                  String(
                    item.placa
                  )
                )
          })
        )
  });
}

export async function consultarDisponibilidadRecursos(
  payload = {}
) {
  exigirPermiso([
    'logistica.gestionar'
  ]);

  const ocupados =
    recursosOcupados(
      payload.fechaHoraPreparacion ||
        payload.fechaHoraInicio,

      payload.excluirIdProgramacion
    );

  const conflictos = [];

  if (
    ocupados
      .representantes
      .has(
        Number(
          payload.idRepresentante
        )
      )
  ) {
    conflictos.push(
      'Representante'
    );
  }

  if (
    ocupados
      .choferes
      .has(
        Number(
          payload.idChofer
        )
      )
  ) {
    conflictos.push(
      'Chófer'
    );
  }

  if (
    ocupados
      .placas
      .has(
        String(
          payload.placaVehiculo
        )
      )
  ) {
    conflictos.push(
      'placa'
    );
  }

  if (conflictos.length) {
    throw crearError(
      `Recurso no disponible: ${conflictos.join(', ')}.`,
      'RECURSO_NO_DISPONIBLE'
    );
  }

  return {
    disponible: true
  };
}

function validarPayloadProgramacion(
  payload,
  esReprogramacion = false
) {
  if (
    !esIdPositivo(
      payload.idOrden
    ) ||
    !payload.fechaHoraPreparacion ||
    !esIdPositivo(
      payload.idRepresentante
    ) ||
    !esIdPositivo(
      payload.idChofer
    ) ||
    !payload.placaVehiculo
  ) {
    throw crearError(
      'La programación contiene datos obligatorios incompletos.',
      'VALIDACION'
    );
  }

  if (
    !Array.isArray(
      payload.paradas
    ) ||
    payload.paradas.length === 0
  ) {
    throw crearError(
      'Debe registrar al menos una parada.',
      'VALIDACION'
    );
  }

  if (
    !Array.isArray(
      payload.fases
    ) ||
    payload.fases.some(
      item =>
        !Number.isInteger(
          Number(
            item
              .duracionEstimadaMinutos
          )
        ) ||
        Number(
          item
            .duracionEstimadaMinutos
        ) <= 0
    )
  ) {
    throw crearError(
      'Las duraciones deben ser enteros mayores que cero.',
      'VALIDACION'
    );
  }

  if (
    esReprogramacion &&
    !String(
      payload
        .motivoReprogramacion ||
      ''
    ).trim()
  ) {
    throw crearError(
      'Debe indicar el motivo de la reprogramación.',
      'VALIDACION'
    );
  }
}

function construirParadas(
  payload,
  idRuta
) {
  return payload.paradas.map(
    (parada, indice) => ({
      ...clonar(parada),

      idParada:
        parada.idParada ||
        Number(
          `${idRuta}${indice + 1}`
        ),

      posicion:
        indice + 1
    })
  );
}

function sincronizarTrasladoRuta(
  ruta,
  programacion
) {
  let traslado =
    state.traslados.find(
      item =>
        Number(item.idRuta) ===
        Number(ruta.idRuta)
    );

  const ordenesTransportadas =
    [
      ...programacion.idOrdenes
    ];

  if (!traslado) {
    traslado = {
      idTraslado:
        siguienteId(
          state.traslados,
          'idTraslado',
          9000
        ),

      idRuta:
        ruta.idRuta,

      placaVehiculo:
        ruta.placaVehiculo,

      idChofer:
        ruta.idChofer,

      idRepresentante:
        ruta.idRepresentante,

      ordenesTransportadas,

      cargaRealizadaEn: null,
      salidaIniciadaEn: null,
      salidaTerminadaEn: null,
      retornoIniciadoEn: null,
      retornoTerminadoEn: null,

      evidencias: [],
      comentarios: [],

      auditoria: [
        {
          hito:
            'TRASLADO_CREADO',

          usuario:
            usuarioActual().nombre,

          fechaHora:
            ahora()
        }
      ],

      version: 1
    };

    state.traslados.push(
      traslado
    );

    return traslado;
  }

  const cambio =
    traslado.placaVehiculo !==
      ruta.placaVehiculo ||
    Number(traslado.idChofer) !==
      Number(ruta.idChofer) ||
    Number(
      traslado.idRepresentante
    ) !==
      Number(
        ruta.idRepresentante
      ) ||
    JSON.stringify(
      traslado.ordenesTransportadas
    ) !==
      JSON.stringify(
        ordenesTransportadas
      );

  if (!cambio) {
    return traslado;
  }

  traslado.placaVehiculo =
    ruta.placaVehiculo;

  traslado.idChofer =
    ruta.idChofer;

  traslado.idRepresentante =
    ruta.idRepresentante;

  traslado.ordenesTransportadas =
    ordenesTransportadas;

  traslado.version += 1;

  traslado.auditoria.push({
    hito:
      'REPROGRAMACION_RUTA',

    usuario:
      usuarioActual().nombre,

    fechaHora:
      ahora()
  });

  return traslado;
}

function responsableFase(
  codigoFase,
  payload
) {
  const definicion =
    faseDefinicion(
      codigoFase
    );

  if (definicion?.traslado) {
    return nombreRecurso(
      state.recursos.choferes,
      payload.idChofer
    );
  }

  return nombreRecurso(
    state.recursos
      .representantes,
    payload.idRepresentante
  );
}

export async function crearProgramacion(
  payload = {}
) {
  exigirPermiso([
    'logistica.gestionar'
  ]);

  validarPayloadProgramacion(
    payload
  );

  const orden =
    obtenerOrdenInterna(
      payload.idOrden
    );

  validarOrdenOperable(
    orden
  );

  if (
    orden.estadoOrden !==
      ESTADOS_ORDEN_LOGISTICA
        .PENDIENTE_PROGRAMACION
  ) {
    throw crearError(
      'Solo pueden programarse Órdenes pendientes de programación.',
      'ORDEN_NO_PROGRAMABLE'
    );
  }

  if (
    obtenerProgramacionInternaPorOrden(
      payload.idOrden
    )
  ) {
    throw crearError(
      'La Orden ya cuenta con programación logística.',
      'CONFLICTO_ACTUALIZACION'
    );
  }

  await consultarDisponibilidadRecursos(
    payload
  );

  const idProgramacion =
    siguienteId(
      state.programaciones,
      'idProgramacion',
      7000
    );

  const idRuta =
    siguienteId(
      state.rutas,
      'idRuta',
      8000
    );

  let siguienteFase =
    siguienteId(
      state.programaciones
        .flatMap(
          item =>
            item.fases
        ),
      'idFase',
      7100
    );

  const fasesAplicables =
    obtenerFasesAplicables(
      orden.tipoOrden
    );

  const fasePayload =
    new Map(
      payload.fases.map(
        item => [
          item.codigoFase,
          item
        ]
      )
    );

  const fases =
    fasesAplicables.map(
      definicion => {
        const entrada =
          fasePayload.get(
            definicion.codigo
          ) || {
            codigoFase:
              definicion.codigo,

            duracionEstimadaMinutos:
              definicion.traslado
                ? 1
                : 60
          };

        return normalizarFaseNueva(
          siguienteFase++,
          entrada,
          responsableFase(
            definicion.codigo,
            payload
          )
        );
      }
    );

  const paradas =
    construirParadas(
      payload,
      idRuta
    );

  const supervisorMock =
    recursoPorUsername(
      state.recursos
        .supervisores,
      usuarioActual().username
    );

  const programacion = {
    idProgramacion,

    idOrdenes:
      Array.from(
        new Set([
          Number(
            payload.idOrden
          ),

          ...(
            payload.idOrdenes ||
            []
          )
            .map(Number)
            .filter(
              esIdPositivo
            )
        ])
      ),

    fechaHoraPreparacion:
      payload
        .fechaHoraPreparacion,

    idSupervisor:
      supervisorMock?.id ||
      payload.idSupervisor ||
      301,

    idRepresentante:
      Number(
        payload.idRepresentante
      ),

    idChofer:
      Number(
        payload.idChofer
      ),

    placaVehiculo:
      payload.placaVehiculo,

    idRuta,

    nombreRuta:
      payload.nombreRuta ||
      `RUT-${String(idRuta).padStart(4, '0')}`,

    motivoReprogramacion:
      null,

    historialReprogramaciones:
      [],

    fases,
    paradas,

    version: 1,

    auditoria: [
      {
        fechaHora:
          ahora(),

        usuario:
          usuarioActual().nombre,

        accion:
          'PROGRAMACION_CONFIRMADA'
      }
    ]
  };

  const ruta = {
    idRuta,

    identificador:
      programacion.nombreRuta,

    fecha:
      String(
        payload
          .fechaHoraPreparacion
      ).slice(0, 10),

    placaVehiculo:
      payload.placaVehiculo,

    idChofer:
      Number(
        payload.idChofer
      ),

    chofer:
      nombreRecurso(
        state.recursos.choferes,
        payload.idChofer
      ),

    idRepresentante:
      Number(
        payload.idRepresentante
      ),

    representante:
      nombreRecurso(
        state.recursos
          .representantes,
        payload.idRepresentante
      ),

    ordenes:
      [...programacion.idOrdenes],

    paradas:
      clonar(paradas),

    primeraSalida:
      payload
        .fechaHoraPreparacion,

    retornoPrevisto:
      null,

    avance: 0,

    incidenciasAbiertas:
      0,

    version: 1
  };

  sincronizarTrasladoRuta(
    ruta,
    programacion
  );

  state.programaciones.push(
    programacion
  );

  state.rutas.push(
    ruta
  );

  programacion.idOrdenes
    .forEach(
      idOrden => {
        const item =
          state.ordenes.find(
            ordenItem =>
              Number(
                ordenItem.idOrden
              ) ===
              Number(idOrden)
          );

        if (
          item &&
          !item.cancelada
        ) {
          item.estadoOrden =
            ESTADOS_ORDEN_LOGISTICA
              .PROGRAMADA;
        }
      }
    );

  auditoria(
    'PROGRAMACION_CONFIRMADA',
    {
      idProgramacion,
      idRuta,

      idOrden:
        Number(
          payload.idOrden
        )
    }
  );

  return clonar({
    idOrden:
      Number(
        payload.idOrden
      ),

    ...mapearProgramacion(
      programacion
    )
  });
}

export async function reprogramar(
  idOrden,
  payload = {}
) {
  exigirPermiso([
    'logistica.gestionar'
  ]);

  const orden =
    obtenerOrdenInterna(
      idOrden
    );

  validarOrdenOperable(
    orden
  );

  if (
    orden.estadoOrden ===
      ESTADOS_ORDEN_LOGISTICA
        .REALIZADA
  ) {
    throw crearError(
      'Una Orden realizada no puede reprogramarse.',
      'ORDEN_NO_PROGRAMABLE'
    );
  }

  const programacion =
    obtenerProgramacionInternaPorOrden(
      idOrden
    );

  if (!programacion) {
    throw crearError(
      'La Orden no cuenta con programación para reprogramar.',
      'PROGRAMACION_NO_ENCONTRADA'
    );
  }

  validarPayloadProgramacion(
    {
      ...payload,

      idOrden:
        Number(idOrden)
    },
    true
  );

  validarVersion(
    programacion.version,
    payload.version
  );

  await consultarDisponibilidadRecursos({
    ...payload,

    excluirIdProgramacion:
      programacion
        .idProgramacion
  });

  const anterior =
    clonar(programacion);

  programacion
    .historialReprogramaciones
    .push({
      fechaHora:
        ahora(),

      usuario:
        usuarioActual().nombre,

      motivo:
        payload
          .motivoReprogramacion,

      programacionAnterior:
        anterior
    });

  programacion.fechaHoraPreparacion =
    payload.fechaHoraPreparacion;

  programacion.idRepresentante =
    Number(
      payload.idRepresentante
    );

  programacion.idChofer =
    Number(
      payload.idChofer
    );

  programacion.placaVehiculo =
    payload.placaVehiculo;

  programacion.nombreRuta =
    payload.nombreRuta ||
    programacion.nombreRuta;

  programacion.motivoReprogramacion =
    payload.motivoReprogramacion;

  programacion.idOrdenes =
    Array.from(
      new Set([
        Number(idOrden),

        ...(
          payload.idOrdenes ||
          []
        )
          .map(Number)
          .filter(
            esIdPositivo
          )
      ])
    );

  const duraciones =
    new Map(
      payload.fases.map(
        item => [
          item.codigoFase,

          Number(
            item
              .duracionEstimadaMinutos
          )
        ]
      )
    );

  programacion.fases.forEach(
    fase => {
      if (
        fase.estadoFase ===
          ESTADOS_FASE_LOGISTICA
            .PENDIENTE &&
        duraciones.has(
          fase.codigoFase
        ) &&
        fase
          .duracionEstimadaMinutos !=
          null
      ) {
        fase.duracionEstimadaMinutos =
          duraciones.get(
            fase.codigoFase
          );
      }
    }
  );

  programacion.paradas =
    construirParadas(
      payload,
      programacion.idRuta
    );

  programacion.version += 1;

  programacion.auditoria.push({
    fechaHora:
      ahora(),

    usuario:
      usuarioActual().nombre,

    accion:
      'REPROGRAMACION_CONFIRMADA',

    motivo:
      payload.motivoReprogramacion
  });

  const ruta =
    obtenerRutaInterna(
      programacion.idRuta
    );

  ruta.identificador =
    programacion.nombreRuta ||
    ruta.identificador;

  ruta.fecha =
    String(
      payload.fechaHoraPreparacion
    ).slice(0, 10);

  ruta.placaVehiculo =
    payload.placaVehiculo;

  ruta.idChofer =
    Number(
      payload.idChofer
    );

  ruta.chofer =
    nombreRecurso(
      state.recursos.choferes,
      payload.idChofer
    );

  ruta.idRepresentante =
    Number(
      payload.idRepresentante
    );

  ruta.representante =
    nombreRecurso(
      state.recursos
        .representantes,
      payload.idRepresentante
    );

  ruta.ordenes =
    [...programacion.idOrdenes];

  ruta.paradas =
    clonar(
      programacion.paradas
    );

  ruta.version += 1;

  sincronizarTrasladoRuta(
    ruta,
    programacion
  );

  auditoria(
    'REPROGRAMACION_CONFIRMADA',
    {
      idOrden:
        Number(idOrden),

      idProgramacion:
        programacion
          .idProgramacion
    }
  );

  return clonar({
    idOrden:
      Number(idOrden),

    ...mapearProgramacion(
      programacion
    )
  });
}

export async function listarConsultaLogistica(
  filtros = {}
) {
  exigirPermiso(
    PERMISOS_CONSULTA
  );

  const consultaGeneral =
    puedeConsultarGeneral();

  let programaciones =
    state.programaciones.filter(
      programacionVisibleParaUsuario
    );

  const hoy =
    new Date();

  const hoyTexto =
    hoy.toISOString().slice(0, 10);

  if (
    filtros.periodo === 'HOY'
  ) {
    programaciones =
      programaciones.filter(
        item =>
          String(
            item.fechaHoraPreparacion
          ).slice(0, 10) ===
          hoyTexto
      );
  }

  if (
    filtros.periodo ===
      'PROXIMOS_7_DIAS' ||
    filtros.periodo ===
      'PROXIMOS_30_DIAS'
  ) {
    const dias =
      filtros.periodo ===
      'PROXIMOS_7_DIAS'
        ? 7
        : 30;

    const limite =
      new Date(hoy);

    limite.setDate(
      limite.getDate() + dias
    );

    programaciones =
      programaciones.filter(
        item => {
          const fecha =
            new Date(
              item.fechaHoraPreparacion
            );

          return (
            fecha >= hoy &&
            fecha <= limite
          );
        }
      );
  }

  const items =
    programaciones
      .flatMap(
        programacion => {
          const ruta =
            state.rutas.find(
              item =>
                Number(
                  item.idRuta
                ) ===
                Number(
                  programacion.idRuta
                )
            );

          return programacion.idOrdenes
            .flatMap(
              idOrden => {
                const orden =
                  state.ordenes.find(
                    item =>
                      Number(
                        item.idOrden
                      ) ===
                      Number(idOrden)
                  );

                if (!orden) {
                  return [];
                }

                return programacion.fases
                  .filter(
                    faseVisibleParaUsuario
                  )
                  .map(
                    fase => {
                      const incidencias =
                        state.incidencias
                          .filter(
                            incidencia =>
                              Number(
                                incidencia.idOrden
                              ) ===
                                Number(idOrden) &&
                              Number(
                                incidencia.idFase
                              ) ===
                                Number(
                                  fase.idFase
                                ) &&
                              incidencia
                                .estadoIncidencia !==
                                ESTADOS_INCIDENCIA_LOGISTICA
                                  .RESUELTA
                          );

                      return {
                        idOrden:
                          Number(
                            idOrden
                          ),

                        idRuta:
                          ruta?.idRuta ||
                          null,

                        fechaHora:
                          programacion
                            .fechaHoraPreparacion,

                        fecha:
                          String(
                            programacion
                              .fechaHoraPreparacion
                          ).slice(
                            0,
                            10
                          ),

                        hora:
                          String(
                            programacion
                              .fechaHoraPreparacion
                          ).slice(
                            11,
                            16
                          ),

                        fechaHoraTexto:
                          formatoFechaHora(
                            programacion
                              .fechaHoraPreparacion
                          ),

                        referencia:
                          ruta
                            ?.identificador ||
                          orden.folioOrden,

                        clienteDestino:
                          `${orden.cliente} · ${orden.domicilioEvento}`,

                        fase:
                          fase.nombre,

                        codigoFase:
                          fase.codigoFase,

                        responsable:
                          fase.responsable ||
                          '—',

                        placaVehiculo:
                          programacion
                            .placaVehiculo,

                        situacionTiempo:
                          situacionTiempo(
                            fase
                          ),

                        incidenciasAbiertas:
                          incidencias.length
                      };
                    }
                  );
              }
            );
        }
      )
      .filter(
        item =>
          textoContiene(
            item.referencia,
            filtros.orden
          ) &&

          textoContiene(
            item.referencia,
            filtros.ruta
          ) &&

          (
            !filtros.fase ||
            item.codigoFase ===
              filtros.fase
          ) &&

          textoContiene(
            item.responsable,
            filtros.responsable
          ) &&

          textoContiene(
            item.placaVehiculo,
            filtros.placa
          ) &&

          (
            !filtros.tiempo ||
            (
              filtros.tiempo ===
                'EN_TIEMPO' &&
              item.situacionTiempo ===
                'En tiempo'
            ) ||
            (
              filtros.tiempo ===
                'FUERA_TOLERANCIA' &&
              item.situacionTiempo ===
                'Fuera de tolerancia'
            )
          ) &&

          (
            !filtros.incidencia ||
            (
              filtros.incidencia ===
                'CON_INCIDENCIA' &&
              item.incidenciasAbiertas >
                0
            ) ||
            (
              filtros.incidencia ===
                'SIN_INCIDENCIA' &&
              item.incidenciasAbiertas ===
                0
            )
          )
      );

  return clonar({
    items,
    total: items.length
  });
}

export async function listarRutas(
  filtros = {}
) {
  exigirPermiso(
    PERMISOS_CONSULTA
  );

  const rutas =
    state.rutas
      .filter(
        rutaVisibleParaUsuario
      )
      .filter(
        ruta =>
          (
            !filtros.fecha ||
            ruta.fecha ===
              filtros.fecha
          ) &&

          textoContiene(
            ruta.placaVehiculo,
            filtros.placa
          ) &&

          (
            !filtros.responsable ||
            textoContiene(
              ruta.chofer,
              filtros.responsable
            ) ||
            textoContiene(
              ruta.representante,
              filtros.responsable
            )
          )
      )
      .map(
        ruta => ({
          ...ruta,

          ordenPrincipal:
            ruta.ordenes?.[0] ||
            null,

          numeroOrdenes:
            ruta.ordenes?.length ||
            0,

          numeroParadas:
            ruta.paradas?.length ||
            0,

          fechaTexto:
            formatoFecha(
              ruta.fecha
            ),

          primeraSalidaTexto:
            formatoFechaHora(
              ruta.primeraSalida
            ),

          retornoPrevistoTexto:
            formatoFechaHora(
              ruta.retornoPrevisto
            )
        })
      );

  return clonar({
    items: rutas,
    total: rutas.length
  });
}

export async function obtenerRuta(
  idRuta
) {
  exigirPermiso(
    PERMISOS_CONSULTA
  );

  const ruta =
    obtenerRutaInterna(
      idRuta
    );

    if (
    !rutaVisibleParaUsuario(
      ruta
    )
  ) {
    throw crearError(
      'La ruta no está asignada al usuario autenticado.',
      'ACTIVIDAD_NO_ASIGNADA'
    );
  }

  const paradas =
    ruta.paradas
      .slice()
      .sort(
        (a, b) =>
          Number(a.posicion) -
          Number(b.posicion)
      )
      .map(
        parada => ({
          ...parada,

          tipoTexto:
            parada.tipoParada,

          horarioTexto:
            formatoFechaHora(
              parada.horario
            ),

          folioOrden:
            referenciaOrden(
              parada.idOrden
            )
        })
      );

  return clonar({
    ...ruta,

    fechaTexto:
      formatoFecha(
        ruta.fecha
      ),

    avanceTexto:
      `${ruta.avance || 0}%`,

    numeroOrdenes:
      ruta.ordenes?.length || 0,

    numeroParadas:
      ruta.paradas?.length || 0,

    paradas
  });
}

export async function guardarOrdenParadas(
  idRuta,
  paradas = [],
  version = null
) {
  exigirPermiso([
    'logistica.gestionar'
  ]);

  const ruta =
    obtenerRutaInterna(
      idRuta
    );

  validarVersion(
    ruta.version,
    version
  );

  if (
    !Array.isArray(paradas) ||
    paradas.length !==
      ruta.paradas.length
  ) {
    throw crearError(
      'El orden de paradas no es válido.',
      'VALIDACION'
    );
  }

  const idsRecibidos =
    new Set(
      paradas.map(
        item =>
          Number(item.idParada)
      )
    );

  const idsActuales =
    new Set(
      ruta.paradas.map(
        item =>
          Number(item.idParada)
      )
    );

  if (
    idsRecibidos.size !==
      idsActuales.size ||
    [
      ...idsRecibidos
    ].some(
      id =>
        !idsActuales.has(id)
    )
  ) {
    throw crearError(
      'Las paradas indicadas no corresponden a la ruta.',
      'VALIDACION'
    );
  }

  const ordenAnterior =
    ruta.paradas.map(
      item => ({
        idParada:
          item.idParada,

        posicion:
          item.posicion
      })
    );

  const nuevas =
    paradas
      .slice()
      .sort(
        (a, b) =>
          Number(a.posicion) -
          Number(b.posicion)
      )
      .map(
        (item, indice) => {
          const original =
            ruta.paradas.find(
              parada =>
                Number(
                  parada.idParada
                ) ===
                Number(
                  item.idParada
                )
            );

          return {
            ...original,
            posicion:
              indice + 1
          };
        }
      );

  ruta.paradas =
    nuevas;

  ruta.version += 1;

  const programacion =
    state.programaciones.find(
      item =>
        Number(
          item.idRuta
        ) ===
        Number(idRuta)
    );

  if (programacion) {
    programacion.paradas =
      clonar(nuevas);

    programacion.version += 1;

    programacion.auditoria.push({
      fechaHora:
        ahora(),

      usuario:
        usuarioActual().nombre,

      accion:
        'ORDEN_PARADAS_MODIFICADO',

      ordenAnterior
    });
  }

  auditoria(
    'ORDEN_PARADAS_MODIFICADO',
    {
      idRuta:
        Number(idRuta),

      ordenAnterior
    }
  );

  return obtenerRuta(
    idRuta
  );
}

export async function obtenerDetalleLogisticoOrden(
  idOrden
) {
  exigirPermiso(
    PERMISOS_CONSULTA
  );

  const orden =
    obtenerOrdenInterna(
      idOrden
    );

  if (
    !ordenVisibleParaUsuario(
      orden
    )
  ) {
    throw crearError(
      'No cuenta con acceso a esta Orden.',
      'ACCESO_DENEGADO'
    );
  }

  const programacion =
    obtenerProgramacionInternaPorOrden(
      idOrden
    );

  const user =
    usuarioActual();

  const esRepresentante =
    user.roles.includes(
      'REPRESENTANTE'
    );

  const fases =
    (
      programacion?.fases ||
      []
    )
    .filter(
      faseVisibleParaUsuario
    )
    .map(
      fase => {
        const propia =
          fase.responsable ===
            user.nombre;

        const gestionable =
          esRepresentante &&
          propia &&
          fase.estadoFase !==
            ESTADOS_FASE_LOGISTICA
              .CONCLUIDA;

        return {
          ...fase,

          idOrden:
            Number(idOrden),

          puedeAbrir:
            puedeConsultarGeneral() ||
            propia,

          soloConsulta:
            !gestionable
        };
      }
    );

  const incidencias =
    state.incidencias
      .filter(
        item =>
          Number(
            item.idOrden
          ) ===
            Number(idOrden) &&
          incidenciaVisibleParaUsuario(
            item
          )
      )
      .map(
        item => ({
          ...item,

          tipoTexto:
            TIPOS_INCIDENCIA_LABELS[
              item.tipoIncidencia
            ] ||
            item.tipoIncidencia
        })
      );

  const historial =
    [
      ...(
        programacion
          ?.auditoria ||
        []
      ),

      ...state.auditoria.filter(
        item =>
          Number(
            item.idOrden
          ) ===
          Number(idOrden)
      )
    ]
      .map(
        item => ({
          ...item,

          fechaHoraTexto:
            formatoFechaHora(
              item.fechaHora
            )
        })
      )
      .sort(
        (a, b) =>
          String(
            b.fechaHora
          ).localeCompare(
            String(
              a.fechaHora
            )
          )
      );

  const permiteAbrirInventario =
    hasAnyPermission(
      sesion(),
      [
        'inventario.consultar',
        'inventario.gestionar'
      ]
    ) &&
    Array.isArray(
      orden.productos
    ) &&
    orden.productos.length > 0;

  return clonar({
    orden: {
      ...orden,

      fechaHoraEventoTexto:
        formatoFechaHora(
          orden.fechaHoraEvento
        )
    },

    programacion:
      programacion
        ? mapearProgramacion(
            programacion
          )
        : null,

        fases,
        incidencias,
        historial,

        permiteAbrirInventario
  });
}

export async function listAsignadas(
  filtros = {}
) {
  exigirPermiso([
    'logistica.asignadas'
  ]);

  const user =
    usuarioActual();

  const representante =
    recursoPorUsername(
      state.recursos
        .representantes,
      user.username
    );

  const chofer =
    recursoPorUsername(
      state.recursos.choferes,
      user.username
    );

  const asignaciones = [];

  state.programaciones
    .filter(
      programacion =>
        Number(
          programacion
            .idRepresentante
        ) ===
          Number(
            representante?.id
          )
    )
    .forEach(
      programacion => {
        programacion.idOrdenes
          .forEach(
            idOrden => {
              const orden =
                state.ordenes.find(
                  item =>
                    Number(
                      item.idOrden
                    ) ===
                    Number(idOrden)
                );

              programacion.fases
                .filter(
                  fase =>
                    fase.responsable ===
                      user.nombre &&
                    fase.estadoFase !==
                      ESTADOS_FASE_LOGISTICA
                        .CONCLUIDA
                )
                .forEach(
                  fase => {
                    const incidencias =
                      state.incidencias
                        .filter(
                          item =>
                            Number(
                              item.idFase
                            ) ===
                              Number(
                                fase.idFase
                              ) &&
                            item
                              .estadoIncidencia !==
                              ESTADOS_INCIDENCIA_LOGISTICA
                                .RESUELTA
                        );

                    asignaciones.push({
                      tipoAsignacion:
                        'FASE',

                      idOrden:
                        Number(
                          idOrden
                        ),

                      idFase:
                        fase.idFase,

                      idRuta:
                        programacion
                          .idRuta,

                      referencia:
                        orden
                          ?.folioOrden ||
                        referenciaOrden(
                          idOrden
                        ),

                      fechaHora:
                        programacion
                          .fechaHoraPreparacion,

                      fechaHoraTexto:
                        formatoFechaHora(
                          programacion
                            .fechaHoraPreparacion
                        ),

                      fase:
                        fase.nombre,

                      actividadSiguiente:
                        fase.nombre,

                      estado:
                        fase.estadoFase,

                      estadoTexto:
                        ESTADOS_FASE_LABELS[
                          fase.estadoFase
                        ] ||
                        fase.estadoFase,

                      incidencia:
                        incidencias.length >
                        0,

                      evidenciaPendiente:
                        (
                          fase.evidencias
                            ?.length ||
                          0
                        ) < 3
                    });
                  }
                );
            }
          );
      }
    );

  state.rutas
    .filter(
      ruta =>
        Number(
          ruta.idChofer
        ) ===
          Number(
            chofer?.id
          ) ||
        Number(
          ruta.idRepresentante
        ) ===
          Number(
            representante?.id
          )
    )
    .forEach(
      ruta => {
        const traslado =
          state.traslados.find(
            item =>
              Number(
                item.idRuta
              ) ===
              Number(
                ruta.idRuta
              )
          );

        if (
          traslado &&
          !traslado
            .retornoTerminadoEn
        ) {
          asignaciones.push({
            tipoAsignacion:
              'TRASLADO',

            idRuta:
              ruta.idRuta,

            referencia:
              ruta.identificador,

            fechaHora:
              ruta.primeraSalida,

            fechaHoraTexto:
              formatoFechaHora(
                ruta.primeraSalida
              ),

            fase:
              'Traslado',

            actividadSiguiente:
              'Control de traslado',

            estado:
              'EN_PROCESO',

            estadoTexto:
              'En proceso',

            incidencia:
              state.incidencias
                .some(
                  incidencia =>
                    Number(
                      incidencia.idRuta
                    ) ===
                      Number(
                        ruta.idRuta
                      ) &&
                    incidencia
                      .estadoIncidencia !==
                      ESTADOS_INCIDENCIA_LOGISTICA
                        .RESUELTA
                ),

            evidenciaPendiente:
              false
          });
        }
      }
    );

  let items =
    asignaciones;

  if (filtros.estado) {
    items =
      items.filter(
        item =>
          item.estado ===
          filtros.estado
      );
  }

  if (filtros.incidencia) {
    items =
      items.filter(
        item =>
          item.incidencia
      );
  }

  if (
    filtros.evidenciaPendiente
  ) {
    items =
      items.filter(
        item =>
          item.evidenciaPendiente
      );
  }

  return clonar({
    items,
    total: items.length
  });
}

function localizarFase(
  idOrden,
  idFase
) {
  const programacion =
    obtenerProgramacionInternaPorOrden(
      idOrden
    );

  if (!programacion) {
    throw crearError(
      'La Orden no cuenta con programación logística.',
      'PROGRAMACION_NO_ENCONTRADA'
    );
  }

  const fase =
    programacion.fases.find(
      item =>
        Number(
          item.idFase
        ) ===
        Number(idFase)
    );

  if (!fase) {
    throw crearError(
      'La fase indicada no existe.',
      'FASE_NO_ENCONTRADA'
    );
  }

  return {
    programacion,
    fase
  };
}

function validarAsignacionFase(
  programacion,
  fase
) {
  const user =
    usuarioActual();

  if (
    !user.roles.includes(
      'REPRESENTANTE'
    ) ||
    !usuarioAsignadoAProgramacion(
      programacion
    ) ||
    fase.responsable !==
      user.nombre
  ) {
    throw crearError(
      'La fase no está asignada al usuario autenticado.',
      'ACTIVIDAD_NO_ASIGNADA'
    );
  }
}

function mapearFase(
  idOrden,
  programacion,
  fase
) {
  const orden =
    obtenerOrdenInterna(
      idOrden
    );

  const user =
    usuarioActual();

  const concluida =
    fase.estadoFase ===
      ESTADOS_FASE_LOGISTICA
        .CONCLUIDA;

  const esRepresentante =
    user.roles.includes(
      'REPRESENTANTE'
    );

  const propia =
    usuarioAsignadoAProgramacion(
      programacion
    ) &&
    fase.responsable ===
      user.nombre;

  const puedeGestionar =
    esRepresentante &&
    propia &&
    !concluida;

  return {
    ...clonar(fase),

    idOrden:
      Number(idOrden),

    folioOrden:
      orden.folioOrden,

    fechaHoraProgramada:
      programacion
        .fechaHoraPreparacion,

    fechaHoraProgramadaTexto:
      formatoFechaHora(
        programacion
          .fechaHoraPreparacion
      ),

    tiempoTranscurridoTexto:
      fase.fechaHoraInicio
        ? `${
            minutosTranscurridos(
              fase.fechaHoraInicio,
              fase.fechaHoraTermino
            ) || 0
          } min`
        : 'No iniciado',

    estadoTexto:
      ESTADOS_FASE_LABELS[
        fase.estadoFase
      ] ||
      fase.estadoFase,

    concluida,

    soloConsulta:
      !puedeGestionar
  };
}

export async function obtenerFase(
  idOrden,
  idFase
) {
  exigirPermiso([
    'logistica.proceso.gestion',
    'logistica.gestionar'
  ]);

  const {
    programacion,
    fase
  } = localizarFase(
    idOrden,
    idFase
  );

  const esSupervisor =
    hasAnyPermission(
      sesion(),
      [
        'logistica.gestionar'
      ]
    );

  if (!esSupervisor) {
    validarAsignacionFase(
      programacion,
      fase
    );
  }

  return mapearFase(
    idOrden,
    programacion,
    fase
  );
}

export async function guardarAvanceParcial(
  idOrden,
  idFase,
  payload = {}
) {
  exigirPermiso([
    'logistica.proceso.gestion'
  ]);

  const orden =
    obtenerOrdenInterna(
      idOrden
    );

  validarOrdenOperable(
    orden
  );

  const {
    programacion,
    fase
  } = localizarFase(
    idOrden,
    idFase
  );

  validarAsignacionFase(
    programacion,
    fase
  );

  validarVersion(
    fase.version,
    payload.version
  );

  if (
    fase.estadoFase ===
      ESTADOS_FASE_LOGISTICA
        .CONCLUIDA
  ) {
    throw crearError(
      'Una fase concluida no puede modificarse.',
      'FASE_CONCLUIDA'
    );
  }

  const cantidad =
    Number(payload.cantidad);

  if (
    !Number.isFinite(
      cantidad
    ) ||
    cantidad <= 0 ||
    cantidad >
      fase.cantidadPendiente
  ) {
    throw crearError(
      'La cantidad del avance no es válida.',
      'VALIDACION'
    );
  }

  if (
    !fase.fechaHoraInicio
  ) {
    fase.fechaHoraInicio =
      ahora();

    fase.estadoFase =
      ESTADOS_FASE_LOGISTICA
        .EN_PROCESO;

    if (
      fase.codigoFase ===
        'PREPARACION'
    ) {
      orden.estadoOrden =
        ESTADOS_ORDEN_LOGISTICA
          .EN_EJECUCION;
    }
  }

  fase.cantidadAtendida +=
    cantidad;

  fase.cantidadPendiente =
    Math.max(
      0,
      fase.cantidadPrevista -
        fase.cantidadAtendida
    );

  fase.estadoFase =
    fase.cantidadPendiente > 0
      ? ESTADOS_FASE_LOGISTICA
          .PARCIAL
      : ESTADOS_FASE_LOGISTICA
          .EN_PROCESO;

  if (
    String(
      payload.comentario ||
      ''
    ).trim()
  ) {
    fase.comentario =
      String(
        payload.comentario
      ).trim();
  }

  if (
    Array.isArray(
      payload.evidencias
    ) &&
    payload.evidencias.length
  ) {
    fase.evidencias =
      clonar(
        payload.evidencias
      );
  }

  fase.version += 1;
  programacion.version += 1;

  programacion.auditoria.push({
    fechaHora:
      ahora(),

    usuario:
      usuarioActual().nombre,

    accion:
      'AVANCE_PARCIAL',

    idFase:
      fase.idFase,

    cantidad
  });

  auditoria(
    'AVANCE_PARCIAL',
    {
      idOrden:
        Number(idOrden),

      idFase:
        Number(idFase)
    }
  );

  return mapearFase(
    idOrden,
    programacion,
    fase
  );
}

function evaluarOrdenRealizada(
  orden,
  programacion
) {
  const fases =
    programacion.fases;

  if (
    orden.tipoOrden ===
      'SERVICIOS'
  ) {
    const pendientes =
      fases.some(
        fase =>
          fase.estadoFase !==
            ESTADOS_FASE_LOGISTICA
              .CONCLUIDA
      );

    if (!pendientes) {
      orden.estadoOrden =
        ESTADOS_ORDEN_LOGISTICA
          .REALIZADA;
    }

    return;
  }

  const inspeccion =
    fases.find(
      fase =>
        fase.codigoFase ===
        'INSPECCION'
    );

  if (
    inspeccion?.confirmada
  ) {
    const serviciosPendientes =
      orden.tipoOrden ===
        'MIXTA'
        ? fases.some(
            fase =>
              [
                'EJECUCION',
                'MONTAJE',
                'DESMONTAJE'
              ].includes(
                fase.codigoFase
              ) &&
              fase.estadoFase !==
                ESTADOS_FASE_LOGISTICA
                  .CONCLUIDA
          )
        : false;

    if (
      !serviciosPendientes
    ) {
      orden.estadoOrden =
        ESTADOS_ORDEN_LOGISTICA
          .REALIZADA;
    }
  }
}

export async function confirmarFase(
  idOrden,
  idFase,
  payload = {}
) {
  exigirPermiso([
    'logistica.proceso.gestion'
  ]);

  const orden =
    obtenerOrdenInterna(
      idOrden
    );

  validarOrdenOperable(
    orden
  );

  const {
    programacion,
    fase
  } = localizarFase(
    idOrden,
    idFase
  );

  validarAsignacionFase(
    programacion,
    fase
  );

  validarVersion(
    fase.version,
    payload.version
  );

  const cantidad =
    Number(payload.cantidad);

  if (
    cantidad !==
      fase.cantidadPendiente
  ) {
    throw crearError(
      'Para concluir debe completar la cantidad pendiente.',
      'VALIDACION'
    );
  }

  if (
    !Array.isArray(
      payload.evidencias
    ) ||
    payload.evidencias.length !==
      3
  ) {
    throw crearError(
      'Se requieren tres fotografías para concluir la fase.',
      'EVIDENCIA_INCOMPLETA'
    );
  }

  if (
    !String(
      payload.comentario ||
      ''
    ).trim()
  ) {
    throw crearError(
      'El comentario es obligatorio.',
      'COMENTARIO_OBLIGATORIO'
    );
  }

  if (
    payload.confirmacion !==
      true
  ) {
    throw crearError(
      'Debe confirmar la conclusión de la fase.',
      'CONFIRMACION_OBLIGATORIA'
    );
  }

  if (
    !fase.fechaHoraInicio
  ) {
    fase.fechaHoraInicio =
      ahora();
  }

  fase.cantidadAtendida =
    fase.cantidadPrevista;

  fase.cantidadPendiente = 0;

  fase.evidencias =
    clonar(
      payload.evidencias
    );

  fase.comentario =
    String(
      payload.comentario
    ).trim();

  fase.confirmada = true;

  fase.estadoFase =
    ESTADOS_FASE_LOGISTICA
      .CONCLUIDA;

  fase.fechaHoraTermino =
    ahora();

  fase.version += 1;
  programacion.version += 1;

  if (
    fase.codigoFase ===
      'PREPARACION'
  ) {
    orden.estadoOrden =
      ESTADOS_ORDEN_LOGISTICA
        .EN_EJECUCION;
  }

  evaluarOrdenRealizada(
    orden,
    programacion
  );

  programacion.auditoria.push({
    fechaHora:
      ahora(),

    usuario:
      usuarioActual().nombre,

    accion:
      'FASE_CONCLUIDA',

    idFase:
      fase.idFase,

    codigoFase:
      fase.codigoFase
  });

  auditoria(
    'FASE_CONCLUIDA',
    {
      idOrden:
        Number(idOrden),

      idFase:
        Number(idFase)
    }
  );

  return mapearFase(
    idOrden,
    programacion,
    fase
  );
}

export async function obtenerTraslado(
  idRuta
) {
  exigirPermiso([
    'logistica.traslado',
    'logistica.gestionar'
  ]);

  const ruta =
    obtenerRutaInterna(
      idRuta
    );

  const traslado =
    state.traslados.find(
      item =>
        Number(
          item.idRuta
        ) ===
        Number(idRuta)
    );

  if (!traslado) {
    throw crearError(
      'No existe traslado asociado a la ruta.',
      'TRASLADO_NO_ENCONTRADO'
    );
  }

  const puedeGestionar =
    hasAnyPermission(
      sesion(),
      [
        'logistica.gestionar'
      ]
    );

  const asignado =
    usuarioAsignadoARuta(
      ruta
    );

  if (
    !puedeGestionar &&
    !asignado
  ) {
    throw crearError(
      'El traslado no está asignado al usuario autenticado.',
      'ACTIVIDAD_NO_ASIGNADA'
    );
  }

  return clonar({
    ...traslado,

    rutaIdentificador:
      ruta.identificador,

    chofer:
      nombreRecurso(
        state.recursos.choferes,
        traslado.idChofer
      ),

    representante:
      nombreRecurso(
        state.recursos
          .representantes,
        traslado.idRepresentante
      ),

    ordenesTexto:
      traslado
        .ordenesTransportadas
        .map(
          referenciaOrden
        )
        .join(', '),

    puedeRegistrar:
      !puedeGestionar &&
      asignado
  });
}

export async function registrarHitoTraslado(
  idRuta,
  hito,
  payload = {}
) {
  exigirPermiso([
    'logistica.traslado'
  ]);

  const ruta =
    obtenerRutaInterna(
      idRuta
    );

  if (
    !usuarioAsignadoARuta(
      ruta
    )
  ) {
    throw crearError(
      'El traslado no está asignado al usuario autenticado.',
      'ACTIVIDAD_NO_ASIGNADA'
    );
  }

  const traslado =
    state.traslados.find(
      item =>
        Number(
          item.idRuta
        ) ===
        Number(idRuta)
    );

  if (!traslado) {
    throw crearError(
      'Traslado no encontrado.',
      'TRASLADO_NO_ENCONTRADO'
    );
  }

  validarVersion(
    traslado.version,
    payload.version
  );

  if (
    !SECUENCIA_TRASLADO
      .includes(hito)
  ) {
    throw crearError(
      'El hito indicado no es válido.',
      'VALIDACION'
    );
  }

  const siguiente =
    SECUENCIA_TRASLADO.find(
      item =>
        !traslado[
          HITOS_TRASLADO_CAMPOS[
            item
          ]
        ]
    );

  if (
    siguiente !== hito
  ) {
    throw crearError(
      'El hito no puede registrarse fuera de secuencia.',
      'SECUENCIA_INVALIDA'
    );
  }

  const campo =
    HITOS_TRASLADO_CAMPOS[
      hito
    ];

  const fechaHora =
    ahora();

  traslado[campo] =
    fechaHora;

  if (
    String(
      payload.comentario ||
      ''
    ).trim()
  ) {
    traslado.comentarios.push({
      hito,

      comentario:
        String(
          payload.comentario
        ).trim(),

      usuario:
        usuarioActual().nombre,

      fechaHora
    });
  }

  traslado.auditoria.push({
    hito,

    usuario:
      usuarioActual().nombre,

    fechaHora
  });

  traslado.version += 1;

  auditoria(
    'HITO_TRASLADO_REGISTRADO',
    {
      idRuta:
        Number(idRuta),

      hito
    }
  );

  return obtenerTraslado(
    idRuta
  );
}

function mapearIncidencia(
  incidencia
) {
  const fase =
    state.programaciones
      .flatMap(
        item =>
          item.fases
      )
      .find(
        item =>
          Number(
            item.idFase
          ) ===
          Number(
            incidencia.idFase
          )
      );

  const ultimaFecha =
    incidencia
      .historialEstados
      ?.slice()
      .sort(
        (a, b) =>
          String(
            b.fechaHora
          ).localeCompare(
            String(
              a.fechaHora
            )
          )
      )[0]
      ?.fechaHora ||
    incidencia.reportadoEn;

  return {
    ...clonar(incidencia),

    referencia:
      incidencia.idRuta
        ? `Ruta ${incidencia.idRuta} · ${referenciaOrden(
            incidencia.idOrden
          )}`
        : referenciaOrden(
            incidencia.idOrden
          ),

    faseTexto:
      fase?.nombre ||
      '—',

    tipoTexto:
      TIPOS_INCIDENCIA_LABELS[
        incidencia.tipoIncidencia
      ] ||
      incidencia.tipoIncidencia,

    estadoTexto:
      ESTADOS_INCIDENCIA_LABELS[
        incidencia.estadoIncidencia
      ] ||
      incidencia.estadoIncidencia,

    reportadoPorTexto:
      incidencia.reportadoPor
        ?.nombre ||
      '—',

    supervisorTexto:
      incidencia
        .supervisorResponsable
        ?.nombre ||
      '—',

    reportadoEnTexto:
      formatoFechaHora(
        incidencia.reportadoEn
      ),

    ultimaActualizacionTexto:
      formatoFechaHora(
        ultimaFecha
      )
  };
}

export async function listarIncidencias(
  filtros = {}
) {
  exigirPermiso(
    PERMISOS_CONSULTA
  );

  let items =
    state.incidencias.filter(
      incidenciaVisibleParaUsuario
    );

  items =
    items.filter(
      item => {
        const mapeada =
          mapearIncidencia(
            item
          );

        return (
          textoContiene(
            item.folioIncidencia,
            filtros.folio
          ) &&

          textoContiene(
            referenciaOrden(
              item.idOrden
            ),
            filtros.orden
          ) &&

          textoContiene(
            item.idRuta,
            filtros.ruta
          ) &&

          (
            !filtros.tipo ||
            item.tipoIncidencia ===
              filtros.tipo
          ) &&

          (
            !filtros.estado ||
            item.estadoIncidencia ===
              filtros.estado
          ) &&

          (
            !filtros.perfil ||
            item.reportadoPor
              ?.rol ===
              filtros.perfil
          ) &&

          (
            !filtros.fechaInicio ||
            String(
              item.reportadoEn
            ).slice(0, 10) >=
              filtros.fechaInicio
          ) &&

          (
            !filtros.fechaFin ||
            String(
              item.reportadoEn
            ).slice(0, 10) <=
              filtros.fechaFin
          ) &&

          textoContiene(
            mapeada
              .supervisorTexto,
            filtros.supervisor
          )
        );
      }
    );

  const resultado =
    items
      .map(
        mapearIncidencia
      )
      .sort(
        (a, b) =>
          String(
            b.reportadoEn
          ).localeCompare(
            String(
              a.reportadoEn
            )
          )
      );

  return clonar({
    items: resultado,
    total:
      resultado.length
  });
}

export async function obtenerIncidencia(
  idIncidencia
) {
  exigirPermiso(
    PERMISOS_CONSULTA
  );

  const incidencia =
    obtenerIncidenciaInterna(
      idIncidencia
    );

  if (
    !incidenciaVisibleParaUsuario(
      incidencia
    )
  ) {
    throw crearError(
      'No cuenta con acceso a esta incidencia.',
      'ACCESO_DENEGADO'
    );
  }

  return mapearIncidencia(
    incidencia
  );
}

export async function reportarIncidencia(
  payload = {}
) {
  exigirPermiso([
    'logistica.proceso.gestion',
    'logistica.traslado'
  ]);

  const user =
    usuarioActual();

  const rol =
    user.roles.find(
      item =>
        item ===
          'REPRESENTANTE' ||
        item === 'CHOFER'
    );

  const permitidos =
    TIPOS_INCIDENCIA_POR_ROL[
      rol
    ] ||
    [];

  if (
    !permitidos.includes(
      payload.tipoIncidencia
    )
  ) {
    throw crearError(
      'El tipo de incidencia no está autorizado para el perfil.',
      'ACCESO_DENEGADO'
    );
  }

  if (
    !String(
      payload.descripcionReporte ||
      ''
    ).trim()
  ) {
    throw crearError(
      'La descripción de la incidencia es obligatoria.',
      'VALIDACION'
    );
  }

  if (payload.idOrden) {
    const orden =
      obtenerOrdenInterna(
        payload.idOrden
      );

    const programacion =
      obtenerProgramacionInternaPorOrden(
        payload.idOrden
      );

    if (
      programacion &&
      !usuarioAsignadoAProgramacion(
        programacion
      )
    ) {
      throw crearError(
        'La Orden no está asignada al usuario autenticado.',
        'ACTIVIDAD_NO_ASIGNADA'
      );
    }

    if (
      orden.cancelada
    ) {
      throw crearError(
        'La Orden está cancelada.',
        'ORDEN_CANCELADA'
      );
    }
  }

  if (payload.idRuta) {
    const ruta =
      obtenerRutaInterna(
        payload.idRuta
      );

    if (
      !usuarioAsignadoARuta(
        ruta
      )
    ) {
      throw crearError(
        'La ruta no está asignada al usuario autenticado.',
        'ACTIVIDAD_NO_ASIGNADA'
      );
    }
  }

  const idIncidencia =
    siguienteId(
      state.incidencias,
      'idIncidencia',
      10000
    );

  const folioIncidencia =
    `INC-2026-${String(
      idIncidencia - 10000
    ).padStart(3, '0')}`;

  const incidencia = {
    idIncidencia,

    folioIncidencia,

    tipoIncidencia:
      payload.tipoIncidencia,

    estadoIncidencia:
      ESTADOS_INCIDENCIA_LOGISTICA
        .REPORTADA,

    idOrden:
      payload.idOrden ||
      null,

    idProgramacion:
      payload.idOrden
        ? obtenerProgramacionInternaPorOrden(
            payload.idOrden
          )?.idProgramacion ||
          null
        : null,

    idRuta:
      payload.idRuta ||
      null,

    idParada:
      payload.idParada ||
      null,

    idFase:
      payload.idFase ||
      null,

    placaVehiculo:
      payload.idRuta
        ? obtenerRutaInterna(
            payload.idRuta
          ).placaVehiculo
        : null,

    idProducto:
      payload.idProducto ||
      null,

    cantidadAfectada:
      payload.cantidadAfectada ||
      null,

    descripcionReporte:
      String(
        payload.descripcionReporte
      ).trim(),

    evidenciasAdicionales:
      clonar(
        payload.evidenciasAdicionales ||
        []
      ),

    reportadoPor: {
      id:
        user.id,

      username:
        user.username,

      nombre:
        user.nombre,

      rol
    },

    reportadoEn:
      ahora(),

    accionesSeguimiento:
      [],

    supervisorResponsable:
      null,

    resolucion:
      null,

    resueltoEn:
      null,

    historialEstados: [
      {
        estado:
          ESTADOS_INCIDENCIA_LOGISTICA
            .REPORTADA,

        fechaHora:
          ahora(),

        usuario:
          user.nombre
      }
    ],

    version: 1
  };

  state.incidencias.push(
    incidencia
  );

  if (payload.idFase) {
    const fase =
      state.programaciones
        .flatMap(
          item =>
            item.fases
        )
        .find(
          item =>
            Number(
              item.idFase
            ) ===
            Number(
              payload.idFase
            )
        );

    if (fase) {
      fase.incidencias.push(
        idIncidencia
      );
    }
  }

  auditoria(
    'INCIDENCIA_REPORTADA',
    {
      idIncidencia,

      idOrden:
        payload.idOrden ||
        null,

      idRuta:
        payload.idRuta ||
        null
    }
  );

  return mapearIncidencia(
    incidencia
  );
}

function exigirSupervisor() {
  exigirPermiso([
    'logistica.gestionar'
  ]);
}

export async function iniciarSeguimientoIncidencia(
  idIncidencia,
  acciones,
  version = null
) {
  exigirSupervisor();

  const incidencia =
    obtenerIncidenciaInterna(
      idIncidencia
    );

  validarVersion(
    incidencia.version,
    version
  );

  if (
    incidencia.estadoIncidencia !==
      ESTADOS_INCIDENCIA_LOGISTICA
        .REPORTADA
  ) {
    throw crearError(
      'Solo una incidencia reportada puede iniciar seguimiento.',
      'TRANSICION_INVALIDA'
    );
  }

  if (
    !String(
      acciones ||
      ''
    ).trim()
  ) {
    throw crearError(
      'Debe registrar las acciones de seguimiento.',
      'VALIDACION'
    );
  }

  const user =
    usuarioActual();

  const fechaHora =
    ahora();

  incidencia.estadoIncidencia =
    ESTADOS_INCIDENCIA_LOGISTICA
      .EN_SEGUIMIENTO;

  incidencia.supervisorResponsable = {
    id:
      user.id,

    nombre:
      user.nombre
  };

  incidencia
    .accionesSeguimiento
    .push({
      descripcion:
        String(
          acciones
        ).trim(),

      fechaHora,

      usuario:
        user.nombre
    });

  incidencia
    .historialEstados
    .push({
      estado:
        ESTADOS_INCIDENCIA_LOGISTICA
          .EN_SEGUIMIENTO,

      fechaHora,

      usuario:
        user.nombre
    });

  incidencia.version += 1;

  auditoria(
    'INCIDENCIA_EN_SEGUIMIENTO',
    {
      idIncidencia:
        incidencia.idIncidencia
    }
  );

  return mapearIncidencia(
    incidencia
  );
}

export async function guardarSeguimientoIncidencia(
  idIncidencia,
  acciones,
  version = null
) {
  exigirSupervisor();

  const incidencia =
    obtenerIncidenciaInterna(
      idIncidencia
    );

  validarVersion(
    incidencia.version,
    version
  );

  if (
    incidencia.estadoIncidencia !==
      ESTADOS_INCIDENCIA_LOGISTICA
        .EN_SEGUIMIENTO
  ) {
    throw crearError(
      'Solo una incidencia en seguimiento admite nuevas acciones.',
      'TRANSICION_INVALIDA'
    );
  }

  if (
    !String(
      acciones ||
      ''
    ).trim()
  ) {
    throw crearError(
      'Debe registrar las acciones realizadas.',
      'VALIDACION'
    );
  }

  incidencia
    .accionesSeguimiento
    .push({
      descripcion:
        String(
          acciones
        ).trim(),

      fechaHora:
        ahora(),

      usuario:
        usuarioActual().nombre
    });

  incidencia.version += 1;

  auditoria(
    'SEGUIMIENTO_INCIDENCIA_REGISTRADO',
    {
      idIncidencia:
        incidencia.idIncidencia
    }
  );

  return mapearIncidencia(
    incidencia
  );
}

export async function resolverIncidencia(
  idIncidencia,
  payload = {}
) {
  exigirSupervisor();

  const incidencia =
    obtenerIncidenciaInterna(
      idIncidencia
    );

  validarVersion(
    incidencia.version,
    payload.version
  );

  if (
    incidencia.estadoIncidencia !==
      ESTADOS_INCIDENCIA_LOGISTICA
        .EN_SEGUIMIENTO
  ) {
    throw crearError(
      'La incidencia debe estar en seguimiento antes de resolverse.',
      'TRANSICION_INVALIDA'
    );
  }

  if (
    !String(
      payload.resolucion ||
      ''
    ).trim()
  ) {
    throw crearError(
      'La resolución es obligatoria.',
      'VALIDACION'
    );
  }

  const fechaHora =
    ahora();

  incidencia.estadoIncidencia =
    ESTADOS_INCIDENCIA_LOGISTICA
      .RESUELTA;

  incidencia.resolucion =
    String(
      payload.resolucion
    ).trim();

  incidencia.resueltoEn =
    fechaHora;

  incidencia
    .historialEstados
    .push({
      estado:
        ESTADOS_INCIDENCIA_LOGISTICA
          .RESUELTA,

      fechaHora,

      usuario:
        usuarioActual().nombre
    });

  incidencia.version += 1;

  auditoria(
    'INCIDENCIA_RESUELTA',
    {
      idIncidencia:
        incidencia.idIncidencia
    }
  );

  return mapearIncidencia(
    incidencia
  );
}

export async function listarTolerancias() {
  exigirPermiso([
    'logistica.tolerancias.gestionar',
    'logistica.gestionar'
  ]);

  return clonar(
    state.tolerancias.map(
      item => ({
        ...item,

        modificadoEnTexto:
          formatoFechaHora(
            item.modificadoEn
          )
      })
    )
  );
}

export async function obtenerHistorialTolerancia(
  codigoFase
) {
  exigirPermiso([
    'logistica.tolerancias.gestionar'
  ]);

  const tolerancia =
    state.tolerancias.find(
      item =>
        item.codigoFase ===
        codigoFase
    );

  if (!tolerancia) {
    throw crearError(
      'La fase indicada no existe.',
      'REGISTRO_NO_ENCONTRADO'
    );
  }

  return clonar(
    tolerancia
      .historialCambios
      .map(
        item => ({
          ...item,

          fechaHoraTexto:
            formatoFechaHora(
              item.fechaHora
            )
        })
      )
  );
}

export async function actualizarTolerancias(
  cambios = []
) {
  exigirPermiso([
    'logistica.tolerancias.gestionar'
  ]);

  if (
    !Array.isArray(
      cambios
    ) ||
    !cambios.length
  ) {
    return listarTolerancias();
  }

  cambios.forEach(
    cambio => {
      const numero =
        Number(
          cambio.valorMinutos
        );

      if (
        !Number.isInteger(
          numero
        ) ||
        numero <= 0
      ) {
        throw crearError(
          'Todas las tolerancias deben ser enteros mayores que cero.',
          'VALIDACION'
        );
      }

      const tolerancia =
        state.tolerancias.find(
          item =>
            item.codigoFase ===
            cambio.codigoFase
        );

      if (
        !tolerancia ||
        !tolerancia.aplica
      ) {
        throw crearError(
          'La tolerancia indicada no puede modificarse.',
          'VALIDACION'
        );
      }

      if (
        cambio.version == null
      ) {
        throw crearError(
          'La versión de la tolerancia es obligatoria.',
          'VALIDACION'
        );
      }

      validarVersion(
        tolerancia.version,
        cambio.version
      );
    }
  );

  const fechaHora =
    ahora();

  const user =
    usuarioActual();

  cambios.forEach(
    cambio => {
      const tolerancia =
        state.tolerancias.find(
          item =>
            item.codigoFase ===
            cambio.codigoFase
        );

      const nuevo =
        Number(
          cambio.valorMinutos
        );

      if (
        nuevo ===
        tolerancia.valorMinutos
      ) {
        return;
      }

      tolerancia
        .historialCambios
        .push({
          fechaHora,

          usuario:
            user.nombre,

          valorAnterior:
            tolerancia
              .valorMinutos,

          valorNuevo:
            nuevo
        });

      tolerancia.valorMinutos =
        nuevo;

      tolerancia.modificadoPor =
        user.nombre;

      tolerancia.modificadoEn =
        fechaHora;

      tolerancia.version += 1;
    }
  );

  auditoria(
    'TOLERANCIAS_ACTUALIZADAS'
  );

  return listarTolerancias();
}

/* =========================================================
   CONTRATOS LEGACY
   Se conservan para Órdenes e Inventario.
   ========================================================= */

export async function actualizarFase(
  ordenId,
  fase
) {
  const asignacion =
    state.compatibilidadLegacy
      .find(
        item =>
          Number(
            item.orden
          ) ===
          Number(ordenId)
      );

  if (asignacion) {
    asignacion.fase =
      fase;
  }

  return clonar({
    ordenId:
      Number(ordenId),

    fase,
    ok: true
  });
}

export async function obtenerLogisticaPorOrden(
  ordenId
) {
  const asignacion =
    state.compatibilidadLegacy
      .find(
        item =>
          Number(
            item.orden
          ) ===
          Number(ordenId)
      );

  if (!asignacion) {
    throw crearError(
      'La Orden no tiene información de Logística asociada.',
      'LOGISTICA_NO_ENCONTRADA'
    );
  }

  return clonar(
    asignacion
  );
}

export async function actualizarEstadoRecoleccion(
  ordenId,
  estado
) {
  const asignacion =
    state.compatibilidadLegacy
      .find(
        item =>
          Number(
            item.orden
          ) ===
          Number(ordenId)
      );

  if (!asignacion) {
    throw crearError(
      'La Orden no tiene información de Logística asociada.',
      'LOGISTICA_NO_ENCONTRADA'
    );
  }

  if (
    !ESTADOS_RECOLECCION_VALIDOS
      .has(estado)
  ) {
    throw crearError(
      'El estado de recolección no es válido.',
      'ESTADO_LOGISTICA_INVALIDO'
    );
  }

  asignacion.estadoRecoleccion =
    estado;

  return clonar({
    ordenId:
      Number(ordenId),

    estadoRecoleccion:
      estado,

    ok: true
  });
}

export async function recibirSolicitudCancelacionPorOrden(
  ordenId,
  solicitud = {}
) {
  const idOrden =
    Number(ordenId);

  if (
    !Number.isInteger(idOrden) ||
    idOrden <= 0
  ) {
    throw crearError(
      'La Orden indicada no es válida.',
      'ORDEN_INVALIDA'
    );
  }

  const asignacion =
    state.compatibilidadLegacy
      .find(
        item =>
          Number(
            item.orden
          ) ===
          idOrden
      );

  if (asignacion) {
    asignacion.solicitudCancelacionOrden = {
      estado:
        'PENDIENTE_ATENCION',

      motivo:
        solicitud.motivo ??
        null,

      fechaHora:
        solicitud.fechaHora ??
        ahora(),

      usuario:
        solicitud.usuario ??
        null
    };
  }

  const orden =
    state.ordenes.find(
      item =>
        Number(
          item.idOrden
        ) ===
        idOrden
    );

  if (orden) {
    orden.cancelada = true;

    orden.estadoOrden =
      ESTADOS_ORDEN_LOGISTICA
        .CANCELADA;
  }

  auditoria(
    'CANCELACION_ORDEN_RECIBIDA',
    {
      idOrden,
      motivo:
        solicitud.motivo ??
        null
    }
  );

  return clonar({
    ordenId:
      idOrden,

    recibida:
      true,

    programacionRelacionada:
      Boolean(
        asignacion ||
        obtenerProgramacionInternaPorOrden(
          idOrden
        )
      ),

    estado:
      'PENDIENTE_ATENCION'
  });
}