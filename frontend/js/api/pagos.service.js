import {
  getSession
} from '../shared/auth-guard.js';

import {
  hasPermission
} from '../shared/permissions.js';

import {
  cuentasMock,
  cotizacionesHabilitadasMock,
  movimientosMock,
  alertasMock,
  operacionesProcesadasMock,
  secuenciasMock,
  configuracionMock
} from '../modules/pagos/pagos.mock.js';

import {
  calcularResumenDesdeMovimientos,
  alcanzaUmbralPorPrimeraVez,
  obtenerIndicadorPresentacion
} from '../modules/pagos/pagos.calculations.js';

import {
  normalizeSearchText
} from '../modules/pagos/pagos.formatters.js';

const PERMISOS = Object.freeze({
  CONSULTAR:
    'pagos.consultar',

  GESTIONAR:
    'pagos.gestionar',

  ALERTAS:
    'pagos.alertas.consultar'
});

const METODOS_PAGO =
  new Set([
    'EFECTIVO',
    'TRANSFERENCIA'
  ]);

function esperar() {
  const latencia =
    Number(
      configuracionMock.latenciaMs
    );

  return new Promise(
    resolve => {
      window.setTimeout(
        resolve,
        Number.isFinite(latencia)
          ? Math.max(
              latencia,
              0
            )
          : 0
      );
    }
  );
}

function clonar(value) {
  if (
    value === undefined
  ) {
    return undefined;
  }

  if (
    typeof structuredClone ===
    'function'
  ) {
    return structuredClone(
      value
    );
  }

  return JSON.parse(
    JSON.stringify(value)
  );
}

function sesionActual() {
  return getSession();
}

function exigirPermiso(
  permiso
) {
  const session =
    sesionActual();

  if (!session?.user) {
    throw new Error(
      'Sesión expirada.'
    );
  }

  if (
    !hasPermission(
      session,
      permiso
    )
  ) {
    throw new Error(
      'No cuenta con permiso para acceder a esta función.'
    );
  }

  return session;
}

function exigirAlguno(
  permisos
) {
  const session =
    sesionActual();

  if (!session?.user) {
    throw new Error(
      'Sesión expirada.'
    );
  }

  const autorizado =
    permisos.some(
      permiso =>
        hasPermission(
          session,
          permiso
        )
    );

  if (!autorizado) {
    throw new Error(
      'No cuenta con permiso para acceder a esta función.'
    );
  }

  return session;
}

function usuarioResponsable() {
  const session =
    sesionActual();

  return (
    session?.user?.name ||
    session?.user?.username ||
    'Usuario'
  );
}

function obtenerCuentaBase(
  idCotizacion,
  idVersion
) {
  return (
    cuentasMock.find(
      cuenta =>
        Number(
          cuenta.idCotizacion
        ) ===
          Number(
            idCotizacion
          ) &&
        Number(
          cuenta.idVersion
        ) ===
          Number(
            idVersion
          )
    ) ||
    null
  );
}

function movimientosCuenta(
  idCotizacion,
  idVersion
) {
  return movimientosMock.filter(
    movimiento =>
      Number(
        movimiento.idCotizacion
      ) ===
        Number(
          idCotizacion
        ) &&
      Number(
        movimiento.idVersion
      ) ===
        Number(
          idVersion
        )
  );
}

function mapaPagosPorId() {
  return new Map(
    movimientosMock
      .filter(
        movimiento =>
          movimiento
            .tipoMovimiento ===
          'PAGO'
      )
      .map(
        movimiento => [
          Number(
            movimiento.idMovimiento
          ),
          movimiento
        ]
      )
  );
}

function enriquecerMovimiento(
  movimiento,
  pagosPorId =
    mapaPagosPorId()
) {
  const original =
    movimiento
      .tipoMovimiento ===
    'COMPENSACION'
      ? pagosPorId.get(
          Number(
            movimiento
              .idPagoOriginal
          )
        )
      : null;

  return {
    ...clonar(
      movimiento
    ),

    folioPagoOriginal:
      original
        ?.folioMovimiento ||
      null
  };
}

function tieneErrorIntegracion(
  cuenta
) {
  const resultado =
    cuenta
      .resultadoIntegracion;

  return Boolean(
    resultado?.procesado &&
    resultado.exitoso ===
      false &&
    resultado.idAlerta
  );
}

function construirCuenta(
  cuentaBase
) {
  const movimientos =
    movimientosCuenta(
      cuentaBase
        .idCotizacion,
      cuentaBase
        .idVersion
    );

  const resumen =
    calcularResumenDesdeMovimientos(
      {
        totalCotizacion:
          cuentaBase
            .totalCotizacion,

        importeRequerido:
          cuentaBase
            .importeRequerido,

        movimientos
      }
    );

  const indicadorPresentacion =
    obtenerIndicadorPresentacion(
      {
        tieneErrorIntegracion:
          tieneErrorIntegracion(
            cuentaBase
          ),

        excedente:
          resumen.excedente,

        acumuladoNeto:
          resumen
            .acumuladoNeto,

        totalCotizacion:
          resumen
            .totalCotizacion,

        cotizacionConfirmada:
          Boolean(
            cuentaBase
              .cotizacionConfirmada
          ),

        procesandoConfirmacion:
          false,

        importeRequerido:
          resumen
            .importeRequerido
      }
    );

  const pagosPorId =
    mapaPagosPorId();

  const movimientosOrdenados =
    movimientos
      .map(
        movimiento =>
          enriquecerMovimiento(
            movimiento,
            pagosPorId
          )
      )
      .sort(
        (a, b) =>
          String(
            b.fechaHoraRegistro ||
            ''
          ).localeCompare(
            String(
              a.fechaHoraRegistro ||
              ''
            )
          )
      );

  return {
    ...clonar(
      cuentaBase
    ),

    ...resumen,

    indicadorPresentacion,

    movimientos:
      movimientosOrdenados
  };
}

function todasLasCuentas() {
  return cuentasMock.map(
    construirCuenta
  );
}

function textoIncluye(
  value,
  term
) {
  if (!term) {
    return true;
  }

  return normalizeSearchText(
    value
  ).includes(
    normalizeSearchText(
      term
    )
  );
}

function fechaMovimiento(
  movimiento
) {
  return (
    movimiento.fechaPago ||
    movimiento
      .fechaHoraRegistro ||
    ''
  ).slice(
    0,
    10
  );
}

function fechaEnRango(
  fecha,
  inicial,
  final
) {
  if (!fecha) {
    return false;
  }

  if (
    inicial &&
    fecha < inicial
  ) {
    return false;
  }

  if (
    final &&
    fecha > final
  ) {
    return false;
  }

  return true;
}

function movimientosCumplenFiltros(
  cuenta,
  filtros
) {
  const requiereFiltroMovimiento =
    Boolean(
      filtros.fechaInicial ||
      filtros.fechaFinal ||
      filtros.metodo ||
      filtros.tipo ||
      filtros.usuarioResponsable
    );

  if (
    !requiereFiltroMovimiento
  ) {
    return true;
  }

  return cuenta.movimientos.some(
    movimiento => {
      if (
        filtros.metodo &&
        movimiento.metodoPago !==
          filtros.metodo
      ) {
        return false;
      }

      if (
        filtros.tipo &&
        movimiento
          .tipoMovimiento !==
          filtros.tipo
      ) {
        return false;
      }

      if (
        filtros
          .usuarioResponsable &&
        !textoIncluye(
          movimiento
            .usuarioResponsable,
          filtros
            .usuarioResponsable
        )
      ) {
        return false;
      }

      if (
        filtros.fechaInicial ||
        filtros.fechaFinal
      ) {
        return fechaEnRango(
          fechaMovimiento(
            movimiento
          ),
          filtros.fechaInicial,
          filtros.fechaFinal
        );
      }

      return true;
    }
  );
}

function compararValores(
  a,
  b,
  direccion
) {
  const factor =
    direccion === 'asc'
      ? 1
      : -1;

  const aNumero =
    Number(a);

  const bNumero =
    Number(b);

  if (
    Number.isFinite(
      aNumero
    ) &&
    Number.isFinite(
      bNumero
    )
  ) {
    return (
      aNumero -
      bNumero
    ) * factor;
  }

  return (
    String(
      a ?? ''
    ).localeCompare(
      String(
        b ?? ''
      ),
      'es-MX',
      {
        sensitivity:
          'base'
      }
    ) * factor
  );
}

function ordenarItems(
  items,
  campo,
  direccion = 'asc',
  campoAlterno = null
) {
  const campoReal =
    campo &&
    items.some(
      item =>
        item[campo] !==
        undefined
    )
      ? campo
      : campoAlterno;

  if (!campoReal) {
    return [...items];
  }

  return [...items].sort(
    (a, b) =>
      compararValores(
        a[campoReal],
        b[campoReal],
        direccion
      )
  );
}

function paginar(
  items,
  skip = 0,
  limit = 10
) {
  const inicio =
    Math.max(
      Number(skip) ||
        0,
      0
    );

  const cantidad =
    Math.max(
      Number(limit) ||
        10,
      1
    );

  return {
    items:
      items.slice(
        inicio,
        inicio +
          cantidad
      ),

    total:
      items.length,

    skip:
      inicio,

    limit:
      cantidad
  };
}

function generarClaveOperacion() {
  if (
    globalThis.crypto
      ?.randomUUID
  ) {
    return (
      'PAG-' +
      globalThis
        .crypto
        .randomUUID()
    );
  }

  return (
    'PAG-' +
    Date.now() +
    '-' +
    Math.random()
      .toString(36)
      .slice(2)
  );
}

function validarPago(
  payload
) {
  if (!payload) {
    throw new Error(
      'Los datos del pago son obligatorios.'
    );
  }

  const cuentaBase =
    obtenerCuentaBase(
      payload
        .idCotizacion,
      payload
        .idVersion
    );

  if (!cuentaBase) {
    throw new Error(
      'La cotización y su versión aceptada no están habilitadas para recibir pagos.'
    );
  }

  if (!payload.fechaPago) {
    throw new Error(
      'La fecha del pago es obligatoria.'
    );
  }

  const monto =
    Number(
      payload.monto
    );

  if (
    !Number.isFinite(
      monto
    ) ||
    monto <= 0
  ) {
    throw new Error(
      'El monto debe ser mayor que cero.'
    );
  }

  if (
    !METODOS_PAGO.has(
      payload
        .metodoPago
    )
  ) {
    throw new Error(
      'El método de pago debe ser Efectivo o Transferencia.'
    );
  }

  return {
    cuentaBase,
    monto
  };
}

function siguienteIdMovimiento() {
  secuenciasMock
    .movimiento += 1;

  return secuenciasMock
    .movimiento;
}

function siguienteFolioPago() {
  secuenciasMock
    .pago += 1;

  return (
    'PGO-' +
    String(
      secuenciasMock
        .pago
    ).padStart(
      4,
      '0'
    )
  );
}

function siguienteFolioCompensacion() {
  secuenciasMock
    .compensacion += 1;

  return (
    'CMP-' +
    String(
      secuenciasMock
        .compensacion
    ).padStart(
      4,
      '0'
    )
  );
}

function siguienteAlertaId() {
  secuenciasMock
    .alerta += 1;

  return secuenciasMock
    .alerta;
}

function siguienteFolioAlerta() {
  secuenciasMock
    .folioAlerta += 1;

  return (
    'ALT-PAG-' +
    String(
      secuenciasMock
        .folioAlerta
    ).padStart(
      4,
      '0'
    )
  );
}

function referenciaDerivada(
  prefijo,
  idMovimiento
) {
  return (
    `${prefijo}-2026-` +
    String(
      idMovimiento
    ).padStart(
      4,
      '0'
    )
  );
}

function crearAlertaIntegracion({
  movimiento,
  cuentaBase,
  mensaje
}) {
  const idAlerta =
    siguienteAlertaId();

  const folioAlerta =
    siguienteFolioAlerta();

  const fechaHora =
    new Date()
      .toISOString();

  const alerta = {
    idAlerta,
    folioAlerta,

    idPago:
      movimiento
        .idMovimiento,

    folioPago:
      movimiento
        .folioMovimiento,

    idCotizacion:
      cuentaBase
        .idCotizacion,

    folioCotizacion:
      cuentaBase
        .folioCotizacion,

    idVersion:
      cuentaBase
        .idVersion,

    numeroVersion:
      cuentaBase
        .numeroVersion,

    idCliente:
      cuentaBase
        .idCliente,

    nombreCliente:
      cuentaBase
        .nombreCliente,

    operacionFallida:
      'CONFIRMAR_COTIZACION',

    descripcionError:
      mensaje,

    fechaHora,

    estado:
      'PENDIENTE',

    resultadoConocido:
      'Pago registrado; confirmación no completada.',

    referenciasGeneradas: {
      cotizacionConfirmada:
        null,

      reservaInventario:
        null,

      ordenServicio:
        null
    }
  };

  alertasMock.push(
    alerta
  );

  return alerta;
}

async function procesarConfirmacion({
  movimiento,
  cuentaBase
}) {
  await esperar();

  const fechaHoraProceso =
    new Date()
      .toISOString();

  if (
    configuracionMock
      .integracion
      ?.modo ===
    'FALLO'
  ) {
    const mensaje =
      'No fue posible completar el proceso con Cotizaciones.';

    const alerta =
      crearAlertaIntegracion(
        {
          movimiento,
          cuentaBase,
          mensaje
        }
      );

    const resultado = {
      procesado:
        true,

      exitoso:
        false,

      fechaHoraProceso,

      referenciaCotizacionConfirmada:
        null,

      referenciaReserva:
        null,

      referenciaOrdenServicio:
        null,

      idAlerta:
        alerta.idAlerta,

      folioAlerta:
        alerta.folioAlerta,

      mensaje
    };

    cuentaBase
      .resultadoIntegracion =
      resultado;

    return resultado;
  }

  const resultado = {
    procesado:
      true,

    exitoso:
      true,

    fechaHoraProceso,

    referenciaCotizacionConfirmada:
      cuentaBase
        .folioCotizacion,

    referenciaReserva:
      referenciaDerivada(
        'RES',
        movimiento
          .idMovimiento
      ),

    referenciaOrdenServicio:
      referenciaDerivada(
        'OS',
        movimiento
          .idMovimiento
      ),

    idAlerta:
      null,

    folioAlerta:
      null,

    mensaje:
      'Cotización confirmada y proceso posterior completado correctamente.'
  };

  cuentaBase
    .cotizacionConfirmada =
    true;

  cuentaBase
    .resultadoIntegracion =
    resultado;

  return resultado;
}

export async function consultarResumenPagos() {
  exigirPermiso(
    PERMISOS.CONSULTAR
  );

  await esperar();

  const cuentas =
    todasLasCuentas();

  const resumen = {
    pendientesConfirmacion:
      cuentas.filter(
        cuenta =>
          cuenta
            .indicadorPresentacion ===
          'PENDIENTE_CONFIRMACION'
      ).length,

    confirmadasSaldoPendiente:
      cuentas.filter(
        cuenta =>
          cuenta
            .indicadorPresentacion ===
          'CONFIRMADA_SALDO_PENDIENTE'
      ).length,

    liquidadas:
      cuentas.filter(
        cuenta =>
          cuenta
            .indicadorPresentacion ===
          'LIQUIDADA'
      ).length,

    conAlertaIntegracion:
      cuentas.filter(
        cuenta =>
          cuenta
            .indicadorPresentacion ===
          'CON_ERROR_INTEGRACION'
      ).length
  };

  const actividadReciente =
    movimientosMock
      .map(
        enriquecerMovimiento
      )
      .sort(
        (a, b) =>
          String(
            b
              .fechaHoraRegistro ||
            ''
          ).localeCompare(
            String(
              a
                .fechaHoraRegistro ||
              ''
            )
          )
      )
      .slice(
        0,
        8
      );

  return clonar({
    resumen,
    actividadReciente
  });
}

export async function consultarCuentasPagos(
  filtros = {}
) {
  exigirPermiso(
    PERMISOS.CONSULTAR
  );

  await esperar();

  let items =
    todasLasCuentas();

  items =
    items.filter(
      cuenta => {
        if (
          filtros
            .folioCotizacion &&
          !textoIncluye(
            cuenta
              .folioCotizacion,
            filtros
              .folioCotizacion
          )
        ) {
          return false;
        }

        if (
          filtros.version &&
          !textoIncluye(
            cuenta
              .numeroVersion,
            filtros.version
          )
        ) {
          return false;
        }

        if (
          filtros.cliente &&
          !textoIncluye(
            cuenta
              .nombreCliente,
            filtros.cliente
          )
        ) {
          return false;
        }

        if (
          filtros.situacion &&
          cuenta
            .indicadorPresentacion !==
            filtros.situacion
        ) {
          return false;
        }

        return movimientosCumplenFiltros(
          cuenta,
          filtros
        );
      }
    );

  items =
    ordenarItems(
      items,
      filtros
        .ordenCampo,
      filtros
        .ordenDireccion ||
        'desc',
      'fechaUltimoMovimiento'
    );

  return clonar(
    paginar(
      items,
      filtros.skip,
      filtros.limit
    )
  );
}

export async function consultarMovimientosPagos(
  filtros = {}
) {
  exigirPermiso(
    PERMISOS.CONSULTAR
  );

  await esperar();

  let items =
    movimientosMock.map(
      enriquecerMovimiento
    );

  items =
    items.filter(
      movimiento => {
        if (
          filtros
            .folioCotizacion &&
          !textoIncluye(
            movimiento
              .folioCotizacion,
            filtros
              .folioCotizacion
          )
        ) {
          return false;
        }

        if (
          filtros.version &&
          !textoIncluye(
            movimiento
              .numeroVersion,
            filtros.version
          )
        ) {
          return false;
        }

        if (
          filtros.cliente &&
          !textoIncluye(
            movimiento
              .nombreCliente,
            filtros.cliente
          )
        ) {
          return false;
        }

        if (
          filtros.metodo &&
          movimiento
            .metodoPago !==
            filtros.metodo
        ) {
          return false;
        }

        if (
          filtros.tipo &&
          movimiento
            .tipoMovimiento !==
            filtros.tipo
        ) {
          return false;
        }

        if (
          filtros
            .usuarioResponsable &&
          !textoIncluye(
            movimiento
              .usuarioResponsable,
            filtros
              .usuarioResponsable
          )
        ) {
          return false;
        }

        if (
          filtros.fechaInicial ||
          filtros.fechaFinal
        ) {
          if (
            !fechaEnRango(
              fechaMovimiento(
                movimiento
              ),
              filtros
                .fechaInicial,
              filtros
                .fechaFinal
            )
          ) {
            return false;
          }
        }

        if (
          filtros.situacion
        ) {
          const cuenta =
            construirCuenta(
              obtenerCuentaBase(
                movimiento
                  .idCotizacion,
                movimiento
                  .idVersion
              )
            );

          if (
            cuenta
              .indicadorPresentacion !==
            filtros.situacion
          ) {
            return false;
          }
        }

        return true;
      }
    );

  items =
    ordenarItems(
      items,
      filtros
        .ordenCampo,
      filtros
        .ordenDireccion ||
        'desc',
      'fechaHoraRegistro'
    );

  return clonar(
    paginar(
      items,
      filtros.skip,
      filtros.limit
    )
  );
}

export async function buscarCotizacionesHabilitadas({
  termino = ''
} = {}) {
  exigirPermiso(
    PERMISOS.GESTIONAR
  );

  await esperar();

  const idsHabilitados =
    new Set(
      cotizacionesHabilitadasMock.map(
        cuenta =>
          `${cuenta.idCotizacion}:${cuenta.idVersion}`
      )
    );

  const items =
    todasLasCuentas()
      .filter(
        cuenta =>
          idsHabilitados.has(
            `${cuenta.idCotizacion}:${cuenta.idVersion}`
          )
      )
      .filter(
        cuenta =>
          cuenta
            .saldoLiquidacion >
          0
      )
      .filter(
        cuenta =>
          !termino ||
          textoIncluye(
            cuenta
              .folioCotizacion,
            termino
          ) ||
          textoIncluye(
            cuenta
              .nombreCliente,
            termino
          )
      )
      .sort(
        (a, b) =>
          String(
            b
              .fechaUltimoMovimiento ||
            ''
          ).localeCompare(
            String(
              a
                .fechaUltimoMovimiento ||
              ''
            )
          )
      );

  return clonar({
    items,
    total:
      items.length
  });
}

export async function obtenerCuentaPago(
  idCotizacion,
  idVersion
) {
  exigirAlguno([
    PERMISOS.CONSULTAR,
    PERMISOS.GESTIONAR
  ]);

  await esperar();

  const cuentaBase =
    obtenerCuentaBase(
      idCotizacion,
      idVersion
    );

  if (!cuentaBase) {
    throw new Error(
      'Cuenta de pago no encontrada.'
    );
  }

  return clonar(
    construirCuenta(
      cuentaBase
    )
  );
}

export async function obtenerPagoOriginal(
  idPago
) {
  exigirPermiso(
    PERMISOS.GESTIONAR
  );

  await esperar();

  const pago =
    movimientosMock.find(
      movimiento =>
        Number(
          movimiento
            .idMovimiento
        ) ===
          Number(
            idPago
          ) &&
        movimiento
          .tipoMovimiento ===
          'PAGO'
    );

  if (!pago) {
    throw new Error(
      'Pago original no encontrado.'
    );
  }

  const cuenta =
    construirCuenta(
      obtenerCuentaBase(
        pago.idCotizacion,
        pago.idVersion
      )
    );

  return clonar({
    ...enriquecerMovimiento(
      pago
    ),
    cuenta
  });
}

export async function registrarPago(
  payload,
  opciones = {}
) {
  exigirPermiso(
    PERMISOS.GESTIONAR
  );

  const claveOperacion =
    opciones
      .claveOperacion ||
    payload
      ?.claveOperacion ||
    generarClaveOperacion();

  if (
    operacionesProcesadasMock.has(
      claveOperacion
    )
  ) {
    return clonar(
      operacionesProcesadasMock.get(
        claveOperacion
      )
    );
  }

  const {
    cuentaBase,
    monto
  } = validarPago(
    payload
  );

  await esperar();

  const cuentaAnterior =
    construirCuenta(
      cuentaBase
    );

  const idMovimiento =
    siguienteIdMovimiento();

  const folioPago =
    siguienteFolioPago();

  const movimiento = {
    idMovimiento,

    folioMovimiento:
      folioPago,

    tipoMovimiento:
      'PAGO',

    idPagoOriginal:
      null,

    idCotizacion:
      cuentaBase
        .idCotizacion,

    folioCotizacion:
      cuentaBase
        .folioCotizacion,

    idVersion:
      cuentaBase
        .idVersion,

    numeroVersion:
      cuentaBase
        .numeroVersion,

    idCliente:
      cuentaBase
        .idCliente,

    nombreCliente:
      cuentaBase
        .nombreCliente,

    fechaPago:
      payload.fechaPago,

    fechaHoraRegistro:
      new Date()
        .toISOString(),

    monto,

    metodoPago:
      payload.metodoPago,

    referencia:
      payload.referencia ||
      '',

    observaciones:
      payload.observaciones ||
      '',

    comprobante:
      payload.comprobante
        ? clonar(
            payload
              .comprobante
          )
        : null,

    motivoCompensacion:
      null,

    usuarioResponsable:
      usuarioResponsable()
  };

  movimientosMock.push(
    movimiento
  );

  cuentaBase
    .fechaUltimoMovimiento =
    movimiento
      .fechaHoraRegistro;

  let cuentaNueva =
    construirCuenta(
      cuentaBase
    );

  const debeConfirmar =
    alcanzaUmbralPorPrimeraVez(
      {
        acumuladoAnterior:
          cuentaAnterior
            .acumuladoNeto,

        acumuladoNuevo:
          cuentaNueva
            .acumuladoNeto,

        importeRequerido:
          cuentaNueva
            .importeRequerido,

        cotizacionConfirmada:
          cuentaBase
            .cotizacionConfirmada
      }
    );

  let resultadoIntegracion =
    cuentaBase
      .resultadoIntegracion ||
    null;

  if (debeConfirmar) {
    resultadoIntegracion =
      await procesarConfirmacion(
        {
          movimiento,
          cuentaBase
        }
      );

    cuentaNueva =
      construirCuenta(
        cuentaBase
      );
  }

  const falloIntegracion =
    Boolean(
      resultadoIntegracion &&
      resultadoIntegracion
        .procesado &&
      resultadoIntegracion
        .exitoso ===
        false
    );

  const resultado = {
    claveOperacion,

    idPago:
      movimiento
        .idMovimiento,

    folioPago,

    idCotizacion:
      cuentaBase
        .idCotizacion,

    idVersion:
      cuentaBase
        .idVersion,

    cuenta:
      cuentaNueva,

    umbralAlcanzado:
      cuentaNueva
        .acumuladoNeto >=
      cuentaNueva
        .importeRequerido,

    confirmacionSolicitada:
      debeConfirmar,

    resultadoIntegracion,

    falloIntegracion,

    folioAlerta:
      resultadoIntegracion
        ?.folioAlerta ||
      null
  };

  operacionesProcesadasMock.set(
    claveOperacion,
    clonar(
      resultado
    )
  );

  return clonar(
    resultado
  );
}

export async function registrarMovimientoCompensatorio(
  payload
) {
  exigirPermiso(
    PERMISOS.GESTIONAR
  );

  if (!payload) {
    throw new Error(
      'Los datos de la compensación son obligatorios.'
    );
  }

  const pagoOriginal =
    movimientosMock.find(
      movimiento =>
        Number(
          movimiento
            .idMovimiento
        ) ===
          Number(
            payload
              .idPagoOriginal
          ) &&
        movimiento
          .tipoMovimiento ===
          'PAGO'
    );

  if (!pagoOriginal) {
    throw new Error(
      'Pago original no encontrado.'
    );
  }

  const monto =
    Number(
      payload.monto
    );

  if (
    !Number.isFinite(
      monto
    ) ||
    monto <= 0
  ) {
    throw new Error(
      'El monto compensado debe ser mayor que cero.'
    );
  }

  const motivo =
    String(
      payload.motivo ||
      ''
    ).trim();

  if (!motivo) {
    throw new Error(
      'El motivo de la compensación es obligatorio.'
    );
  }

  await esperar();

  const cuentaBase =
    obtenerCuentaBase(
      pagoOriginal
        .idCotizacion,
      pagoOriginal
        .idVersion
    );

  const movimiento = {
    idMovimiento:
      siguienteIdMovimiento(),

    folioMovimiento:
      siguienteFolioCompensacion(),

    tipoMovimiento:
      'COMPENSACION',

    idPagoOriginal:
      pagoOriginal
        .idMovimiento,

    idCotizacion:
      pagoOriginal
        .idCotizacion,

    folioCotizacion:
      pagoOriginal
        .folioCotizacion,

    idVersion:
      pagoOriginal
        .idVersion,

    numeroVersion:
      pagoOriginal
        .numeroVersion,

    idCliente:
      pagoOriginal
        .idCliente,

    nombreCliente:
      pagoOriginal
        .nombreCliente,

    fechaPago:
      null,

    fechaHoraRegistro:
      new Date()
        .toISOString(),

    monto,

    metodoPago:
      null,

    referencia:
      '',

    observaciones:
      payload.observaciones ||
      '',

    comprobante:
      null,

    motivoCompensacion:
      motivo,

    usuarioResponsable:
      usuarioResponsable()
  };

  movimientosMock.push(
    movimiento
  );

  cuentaBase
    .fechaUltimoMovimiento =
    movimiento
      .fechaHoraRegistro;

  const cuenta =
    construirCuenta(
      cuentaBase
    );

  return clonar({
    idMovimiento:
      movimiento
        .idMovimiento,

    folioMovimiento:
      movimiento
        .folioMovimiento,

    idPagoOriginal:
      pagoOriginal
        .idMovimiento,

    folioPagoOriginal:
      pagoOriginal
        .folioMovimiento,

    idCotizacion:
      cuentaBase
        .idCotizacion,

    idVersion:
      cuentaBase
        .idVersion,

    cuenta
  });
}

export async function consultarAlertasPagos(
  filtros = {}
) {
  exigirPermiso(
    PERMISOS.ALERTAS
  );

  await esperar();

  let items = [
    ...alertasMock
  ];

  items =
    items.filter(
      alerta => {
        if (
          filtros.folioAlerta &&
          !textoIncluye(
            alerta.folioAlerta,
            filtros.folioAlerta
          )
        ) {
          return false;
        }

        if (
          filtros.folioPago &&
          !textoIncluye(
            alerta.folioPago,
            filtros.folioPago
          )
        ) {
          return false;
        }

        if (
          filtros
            .folioCotizacion &&
          !textoIncluye(
            alerta
              .folioCotizacion,
            filtros
              .folioCotizacion
          )
        ) {
          return false;
        }

        if (
          filtros.cliente &&
          !textoIncluye(
            alerta
              .nombreCliente,
            filtros.cliente
          )
        ) {
          return false;
        }

        if (
          filtros
            .operacionFallida &&
          alerta
            .operacionFallida !==
            filtros
              .operacionFallida
        ) {
          return false;
        }

        if (
          filtros.fechaInicial ||
          filtros.fechaFinal
        ) {
          if (
            !fechaEnRango(
              String(
                alerta.fechaHora ||
                ''
              ).slice(
                0,
                10
              ),
              filtros
                .fechaInicial,
              filtros
                .fechaFinal
            )
          ) {
            return false;
          }
        }

        return true;
      }
    );

  items.sort(
    (a, b) =>
      String(
        b.fechaHora ||
        ''
      ).localeCompare(
        String(
          a.fechaHora ||
          ''
        )
      )
  );

  return clonar(
    paginar(
      items,
      filtros.skip,
      filtros.limit
    )
  );
}

/**
 * Utilidad únicamente para pruebas
 * manuales del servicio simulado.
 *
 * No debe exponerse como acción
 * de interfaz.
 */
export function configurarModoIntegracionPagos(
  modo
) {
  if (
    ![
      'EXITO',
      'FALLO'
    ].includes(
      modo
    )
  ) {
    throw new Error(
      'Modo de integración no válido.'
    );
  }

  configuracionMock
    .integracion
    .modo =
    modo;
}

/**
 * Compatibilidad temporal con
 * lista.html legado.
 *
 * Retirar junto con esa pantalla
 * al cierre de la implementación.
 */
export async function listPagos() {
  exigirPermiso(
    PERMISOS.CONSULTAR
  );

  await esperar();

  return movimientosMock
    .filter(
      movimiento =>
        movimiento
          .tipoMovimiento ===
        'PAGO'
    )
    .map(
      movimiento => ({
        id:
          movimiento
            .idMovimiento,

        orden:
          '—',

        monto:
          movimiento.monto,

        fecha:
          movimiento.fechaPago,

        metodo:
          movimiento
            .metodoPago ===
            'TRANSFERENCIA'
            ? 'Transferencia'
            : 'Efectivo'
      })
    );
}