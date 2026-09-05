import {
  createCotizacionesMockState
} from './cotizaciones.mock.js';

import {
  CONFIG_COTIZACIONES,
  DISPONIBILIDAD_COTIZACION,
  ESTADO_COTIZACION_GENERAL_LABELS,
  ESTADOS_COTIZACION_GENERAL,
  ESTADOS_TERMINALES_COTIZACION,
  ESTADOS_VERSION_COTIZACION,
  PERMISOS_COTIZACIONES,
  TIPOS_CONCEPTO_COTIZACION
} from './cotizaciones.constants.js';

import {
  resolverPrecioProducto
} from './listas-precios.service.js';

import {
  obtenerProducto,
  obtenerServicio,
  obtenerPaquete
} from './catalogo.service.js';

import {
  getSession
} from '../shared/auth-guard.js';

import {
  hasPermission
} from '../shared/permissions.js';

const mockState =
  createCotizacionesMockState();

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

function crearError(
  code,
  message,
  details = null
) {
  const error = new Error(message);

  error.code = code;
  error.codigo = code;
  error.details = details;
  error.detalles = details;

  return error;
}

function normalizarId(
  id,
  entidad = 'registro'
) {
  const valor = Number(id);

  if (
    !Number.isInteger(valor) ||
    valor <= 0
  ) {
    throw crearError(
      'ID_INVALIDO',
      `El identificador de ${entidad} no es válido.`
    );
  }

  return valor;
}

function normalizarTexto(value) {
  return typeof value === 'string'
    ? value.trim()
    : '';
}

function normalizarFecha(value) {
  const fecha =
    normalizarTexto(value);

  if (
    !/^\d{4}-\d{2}-\d{2}$/.test(
      fecha
    )
  ) {
    throw crearError(
      'FECHA_INVALIDA',
      'La fecha del evento no es válida.'
    );
  }

  const prueba =
    new Date(`${fecha}T00:00:00`);

  if (
    Number.isNaN(
      prueba.getTime()
    )
  ) {
    throw crearError(
      'FECHA_INVALIDA',
      'La fecha del evento no es válida.'
    );
  }

  return fecha;
}

function normalizarHora(value) {
  const hora =
    normalizarTexto(value);

  if (
    !/^([01]\d|2[0-3]):[0-5]\d$/.test(
      hora
    )
  ) {
    throw crearError(
      'HORA_INVALIDA',
      'La hora del evento no es válida.'
    );
  }

  return hora;
}

function normalizarPorcentaje(value) {
  const numero = Number(value);

  if (
    !Number.isFinite(numero) ||
    numero < 0 ||
    numero > 100
  ) {
    throw crearError(
      'PORCENTAJE_INVALIDO',
      'El porcentaje de confirmación debe estar entre 0 y 100.'
    );
  }

  return numero;
}

function redondearMoneda(value) {
  return Math.round(
    (
      Number(value || 0) +
      Number.EPSILON
    ) * 100
  ) / 100;
}

function obtenerUsuarioActual() {
  const session =
    getSession();

  return {
    idUsuario:
      session?.user?.id ?? null,

    nombre:
      session?.user?.name ??
      session?.user?.username ??
      'Usuario mock'
  };
}

function exigirPermiso(permission) {
  const session =
    getSession();

  if (
    !hasPermission(
      session,
      permission
    )
  ) {
    throw crearError(
      'FORBIDDEN',
      'No cuenta con permiso para realizar esta operación.'
    );
  }
}

function exigirConsulta() {
  exigirPermiso(
    PERMISOS_COTIZACIONES.CONSULTAR
  );
}

function exigirGestion() {
  exigirPermiso(
    PERMISOS_COTIZACIONES.GESTIONAR
  );
}

function getCotizacionIndex(id) {
  return mockState.cotizaciones.findIndex(
    item =>
      Number(item.idCotizacion) ===
      Number(id)
  );
}

function getCotizacionOrThrow(id) {
  const idCotizacion =
    normalizarId(
      id,
      'cotización'
    );

  const cotizacion =
    mockState.cotizaciones.find(
      item =>
        Number(
          item.idCotizacion
        ) === idCotizacion
    );

  if (!cotizacion) {
    throw crearError(
      'COTIZACION_NO_ENCONTRADA',
      'La cotización no existe.'
    );
  }

  return cotizacion;
}

function getVersionOrThrow(
  cotizacion,
  idVersion
) {
  const id =
    normalizarId(
      idVersion,
      'versión'
    );

  const version =
    cotizacion.versiones.find(
      item =>
        Number(
          item.idVersion
        ) === id
    );

  if (!version) {
    throw crearError(
      'VERSION_NO_ENCONTRADA',
      'La versión no existe dentro de la cotización.'
    );
  }

  return version;
}

function getNextCotizacionId() {
  return (
    Math.max(
      ...mockState.cotizaciones.map(
        item =>
          Number(
            item.idCotizacion || 0
          )
      ),
      9000
    ) + 1
  );
}

function getNextVersionId() {
  const ids =
    mockState.cotizaciones.flatMap(
      cotizacion =>
        cotizacion.versiones.map(
          version =>
            Number(
              version.idVersion || 0
            )
        )
    );

  return (
    Math.max(
      ...ids,
      90000
    ) + 1
  );
}

function getNextDetalleId() {
  const ids =
    mockState.cotizaciones.flatMap(
      cotizacion =>
        cotizacion.versiones.flatMap(
          version =>
            (version.detalle || [])
              .map(
                detalle =>
                  Number(
                    detalle.idDetalle || 0
                  )
              )
        )
    );

  return (
    Math.max(
      ...ids,
      900000
    ) + 1
  );
}

function getNextHistorialId() {
  const ids =
    mockState.cotizaciones.flatMap(
      cotizacion =>
        (cotizacion.historial || [])
          .map(
            item =>
              Number(
                item.idHistorial || 0
              )
          )
    );

  return (
    Math.max(
      ...ids,
      0
    ) + 1
  );
}

function getNextConsecutivo(
  ejercicio
) {
  const consecutivos =
    mockState.cotizaciones
      .filter(
        item =>
          Number(
            item.ejercicio
          ) ===
          Number(ejercicio)
      )
      .map(
        item =>
          Number(
            item.consecutivo || 0
          )
      );

  return (
    Math.max(
      ...consecutivos,
      0
    ) + 1
  );
}

function construirFolioGeneral(
  cotizacion
) {
  const ejercicio =
    String(
      cotizacion.ejercicio || ''
    ).slice(-2);

  const consecutivo =
    String(
      Number(
        cotizacion.consecutivo || 0
      )
    ).padStart(
      CONFIG_COTIZACIONES
        .DIGITOS_CONSECUTIVO,
      '0'
    );

  return (
    `${CONFIG_COTIZACIONES.PREFIJO_FOLIO}` +
    `-${ejercicio}-${consecutivo}`
  );
}

function registrarHistorial(
  cotizacion,
  tipo,
  descripcion,
  usuario = obtenerUsuarioActual()
) {
  if (
    !Array.isArray(
      cotizacion.historial
    )
  ) {
    cotizacion.historial = [];
  }

  cotizacion.historial.push({
    idHistorial:
      getNextHistorialId(),

    tipo,
    descripcion,

    usuario:
      usuario.nombre,

    fechaHora:
      new Date().toISOString()
  });
}

function fechaHoraEvento(
  cotizacion
) {
  if (
    !cotizacion.fechaEvento ||
    !cotizacion.horaEvento
  ) {
    return null;
  }

  const value =
    new Date(
      `${cotizacion.fechaEvento}` +
      `T${cotizacion.horaEvento}:00`
    );

  return Number.isNaN(
    value.getTime()
  )
    ? null
    : value;
}

function esCotizacionConfirmada(
  cotizacion
) {
  return [
    ESTADOS_COTIZACION_GENERAL
      .CONFIRMADA,

    ESTADOS_COTIZACION_GENERAL
      .CONFIRMADA_RESERVADA
  ].includes(
    cotizacion.estadoGeneral
  );
}

function exigirCotizacionNoConfirmada(
  cotizacion
) {
  if (
    !esCotizacionConfirmada(
      cotizacion
    )
  ) {
    return;
  }

  throw crearError(
    'COTIZACION_CONFIRMADA',
    'La cotización ya fue confirmada. Para realizar una nueva propuesta debe cancelarse y generarse una nueva cotización.'
  );
}

function aplicarVencimientoAutomatico() {
  const ahora =
    new Date();

  mockState.cotizaciones.forEach(
    cotizacion => {
      if (
        esCotizacionConfirmada(
          cotizacion
        ) ||
        ESTADOS_TERMINALES_COTIZACION
          .includes(
            cotizacion.estadoGeneral
          )
      ) {
        return;
      }

      const evento =
        fechaHoraEvento(
          cotizacion
        );

      if (
        !evento ||
        evento > ahora
      ) {
        return;
      }

      cotizacion.estadoGeneral =
        ESTADOS_COTIZACION_GENERAL
          .VENCIDA;

      cotizacion.fechaActualizacion =
        ahora.toISOString();

      registrarHistorial(
        cotizacion,
        'COTIZACION_VENCIDA',
        'La cotización venció automáticamente al alcanzar la fecha y hora del evento.',
        {
          idUsuario: null,
          nombre: 'Sistema'
        }
      );
    }
  );
}

function vencidaVisibleEnInicio(
  cotizacion,
  ahora = new Date()
) {
  if (
    cotizacion.estadoGeneral !==
    ESTADOS_COTIZACION_GENERAL
      .VENCIDA
  ) {
    return true;
  }

  const evento =
    fechaHoraEvento(
      cotizacion
    );

  if (!evento) {
    return false;
  }

  const limite =
    new Date(
      evento.getTime() +
      24 * 60 * 60 * 1000
    );

  return ahora <= limite;
}

function obtenerVersionElegida(
  cotizacion
) {
  if (
    !cotizacion.idVersionElegida
  ) {
    return null;
  }

  return (
    cotizacion.versiones.find(
      version =>
        Number(
          version.idVersion
        ) ===
        Number(
          cotizacion
            .idVersionElegida
        )
    ) || null
  );
}

function ordenarCotizaciones(
  a,
  b
) {
  const aVencida =
    a.estadoGeneral ===
    ESTADOS_COTIZACION_GENERAL
      .VENCIDA;

  const bVencida =
    b.estadoGeneral ===
    ESTADOS_COTIZACION_GENERAL
      .VENCIDA;

  if (
    aVencida !==
    bVencida
  ) {
    return aVencida ? 1 : -1;
  }

  return (
    new Date(
      b.fechaActualizacion ||
      b.fechaCreacion ||
      0
    ) -
    new Date(
      a.fechaActualizacion ||
      a.fechaCreacion ||
      0
    )
  );
}

function normalizarPagina(value) {
  const numero =
    Number(value);

  return (
    Number.isInteger(numero) &&
    numero > 0
  )
    ? numero
    : 1;
}

function normalizarTamanio(value) {
  const numero =
    Number(value);

  if (
    !Number.isInteger(numero) ||
    numero <= 0
  ) {
    return CONFIG_COTIZACIONES
      .TAMANIO_PAGINA;
  }

  return Math.min(
    numero,
    100
  );
}

function cumpleFiltros(
  cotizacion,
  filtros
) {
  const folio =
    normalizarTexto(
      filtros.folio ??
      filtros.consecutivo
    ).toLocaleLowerCase(
      'es-MX'
    );

  if (
    folio &&
    !construirFolioGeneral(
      cotizacion
    )
      .toLocaleLowerCase(
        'es-MX'
      )
      .includes(folio)
  ) {
    return false;
  }

  if (
    filtros.idClienteProspecto !==
      undefined &&
    filtros.idClienteProspecto !==
      null &&
    filtros.idClienteProspecto !==
      '' &&
    Number(
      cotizacion
        .idClienteProspecto
    ) !==
      Number(
        filtros
          .idClienteProspecto
      )
  ) {
    return false;
  }

  const estado =
    normalizarTexto(
      filtros.estadoGeneral ??
      filtros.estado
    );

  if (
    estado &&
    cotizacion.estadoGeneral !==
      estado
  ) {
    return false;
  }

  const fechaEvento =
    normalizarTexto(
      filtros.fechaEvento
    );

  if (
    fechaEvento &&
    cotizacion.fechaEvento !==
      fechaEvento
  ) {
    return false;
  }

  const vendedor =
    normalizarTexto(
      filtros.vendedor
    ).toLocaleLowerCase(
      'es-MX'
    );

  if (
    vendedor &&
    !normalizarTexto(
      cotizacion
        .responsable?.nombre
    )
      .toLocaleLowerCase(
        'es-MX'
      )
      .includes(vendedor)
  ) {
    return false;
  }

  const disponibilidad =
    normalizarTexto(
      filtros.disponibilidad
    );

  if (disponibilidad) {
    const elegida =
      obtenerVersionElegida(
        cotizacion
      );

    if (
      elegida
        ?.disponibilidadGlobal !==
      disponibilidad
    ) {
      return false;
    }
  }

  return true;
}

async function normalizarDetalleVersion(
  versionActual,
  idListaPrecio,
  detalle = []
) {
  if (!Array.isArray(detalle)) {
    throw crearError(
      'DETALLE_INVALIDO',
      'El detalle de la versión no es válido.'
    );
  }

  const clavesConcepto =
    new Set();

  const idsExistentes =
    new Set(
      (versionActual.detalle || [])
        .map(
          item =>
            Number(
              item.idDetalle
            )
        )
        .filter(
          id =>
            Number.isInteger(id) &&
            id > 0
        )
    );

  const normalizados = [];

  for (const item of detalle) {
    const tipo =
      item.tipoConcepto;

    if (
      ![
        TIPOS_CONCEPTO_COTIZACION.PRODUCTO,
        TIPOS_CONCEPTO_COTIZACION.SERVICIO,
        TIPOS_CONCEPTO_COTIZACION.PAQUETE
      ].includes(tipo)
    ) {
      throw crearError(
        'TIPO_CONCEPTO_INVALIDO',
        'El tipo de concepto no es válido.'
      );
    }

    const cantidad =
      Number(item.cantidad);

    if (
      !Number.isInteger(cantidad) ||
      cantidad <= 0
    ) {
      throw crearError(
        'CANTIDAD_INVALIDA',
        'La cantidad debe ser un entero mayor a cero.'
      );
    }

    let idProducto = null;
    let idServicio = null;
    let idPaquete = null;

    let descripcionHistorica = '';
    let precioBase = 0;
    let precioLista = null;
    let porcentajeAdicional = 0;
    let precioAplicado = 0;
    let composicion = null;

    if (
      tipo ===
      TIPOS_CONCEPTO_COTIZACION.PRODUCTO
    ) {
      idProducto =
        normalizarId(
          item.idProducto,
          'producto'
        );

      const clave =
        `PRODUCTO:${idProducto}`;

      if (clavesConcepto.has(clave)) {
        throw crearError(
          'CONCEPTO_DUPLICADO',
          'El producto ya existe en la versión.'
        );
      }

      const [
        producto,
        precio
      ] =
        await Promise.all([
          obtenerProducto(
            idProducto
          ),

          resolverPrecioProducto({
            idListaPrecio,
            idProducto
          })
        ]);

      descripcionHistorica =
        producto.nombre;

      precioBase =
        Number(
          precio.precioBase || 0
        );

      precioLista =
        precio.precioLista === null
          ? null
          : Number(
              precio.precioLista
            );

      porcentajeAdicional =
        Number(
          precio
            .porcentajeAdicional ||
          0
        );

      precioAplicado =
        Number(
          precio
            .precioAplicado ||
          0
        );

      clavesConcepto.add(clave);
    }

    if (
      tipo ===
      TIPOS_CONCEPTO_COTIZACION.SERVICIO
    ) {
      idServicio =
        normalizarId(
          item.idServicio,
          'servicio'
        );

      const clave =
        `SERVICIO:${idServicio}`;

      if (clavesConcepto.has(clave)) {
        throw crearError(
          'CONCEPTO_DUPLICADO',
          'El servicio ya existe en la versión.'
        );
      }

      const servicio =
        await obtenerServicio(
          idServicio
        );

      descripcionHistorica =
        servicio.nombre;

      precioBase =
        Number(
          servicio.tarifaBase || 0
        );

      precioAplicado =
        precioBase;

      clavesConcepto.add(clave);
    }

    if (
      tipo ===
      TIPOS_CONCEPTO_COTIZACION.PAQUETE
    ) {
      idPaquete =
        normalizarId(
          item.idPaquete,
          'paquete'
        );

      const clave =
        `PAQUETE:${idPaquete}`;

      if (clavesConcepto.has(clave)) {
        throw crearError(
          'CONCEPTO_DUPLICADO',
          'El paquete ya existe en la versión.'
        );
      }

      const paquete =
        await obtenerPaquete(
          idPaquete
        );

      descripcionHistorica =
        paquete.nombre;

      precioBase =
        Number(
          paquete.precio || 0
        );

      precioAplicado =
        precioBase;

      composicion = {
        productos:
          (
            paquete.detalleProductos ||
            []
          ).map(
            componente => ({
              idProducto:
                Number(
                  componente.idProducto
                ),

              nombre:
                componente.nombre,

              cantidad:
                Number(
                  componente.cantidad ||
                  0
                )
            })
          ),

        servicios:
          (
            paquete.detalleServicios ||
            []
          ).map(
            componente => ({
              idServicio:
                Number(
                  componente.idServicio
                ),

              nombre:
                componente.nombre,

              cantidad:
                Number(
                  componente.cantidad ||
                  0
                )
            })
          )
      };

      clavesConcepto.add(clave);
    }

    const idDetalleOriginal =
      Number(
        item.idDetalle
      );

    const idDetalle =
      Number.isInteger(
        idDetalleOriginal
      ) &&
      idDetalleOriginal > 0 &&
      idsExistentes.has(
        idDetalleOriginal
      )
        ? idDetalleOriginal
        : getNextDetalleId() +
          normalizados.length;

    normalizados.push({
      idDetalle,

      tipoConcepto:
        tipo,

      idProducto,
      idServicio,
      idPaquete,

      descripcionHistorica,

      cantidad,

      precioBase,
      precioLista,
      porcentajeAdicional,
      precioAplicado,

      descuentoAutorizado:
        Number(
          item
            .descuentoAutorizado ||
          0
        ),

      impuesto:
        Number(
          item.impuesto || 0
        ),

      cargos:
        Number(
          item.cargos || 0
        ),

      subtotal:
        redondearMoneda(
          cantidad *
          precioAplicado
        ),

      composicion,

      disponibilidad:
        Object.values(
          DISPONIBILIDAD_COTIZACION
        ).includes(
          item.disponibilidad
        )
          ? item.disponibilidad
          : null
    });
  }

  return normalizados;
}

function recalcularEconomia(
  detalle,
  versionActual
) {
  const importeConceptos =
    redondearMoneda(
      detalle.reduce(
        (total, item) =>
          total +
          Number(
            item.subtotal || 0
          ),
        0
      )
    );

  const descuentos =
    redondearMoneda(
      versionActual
        .descuentos || 0
    );

  const impuestos =
    redondearMoneda(
      versionActual
        .impuestos || 0
    );

  const cargos =
    redondearMoneda(
      versionActual
        .cargos || 0
    );

  const subtotal =
    redondearMoneda(
      Math.max(
        0,
        importeConceptos -
        descuentos
      )
    );

  const total =
    redondearMoneda(
      subtotal +
      impuestos +
      cargos
    );

  return {
    importeConceptos,
    descuentos,
    subtotal,
    impuestos,
    cargos,
    total
  };
}

/**
 * Consulta paginada para
 * Inicio / Cotizaciones.
 */
export async function searchCotizaciones(
  filtros = {},
  pagina = {}
) {
  exigirConsulta();
  aplicarVencimientoAutomatico();

  const ahora =
    new Date();

  const itemsFiltrados =
    mockState.cotizaciones
      .filter(
        cotizacion =>
          vencidaVisibleEnInicio(
            cotizacion,
            ahora
          )
      )
      .filter(
        cotizacion =>
          cumpleFiltros(
            cotizacion,
            filtros
          )
      )
      .sort(
        ordenarCotizaciones
      );

  const numeroPagina =
    normalizarPagina(
      pagina.pagina
    );

  const tamanio =
    normalizarTamanio(
      pagina.tamanio
    );

  const totalRegistros =
    itemsFiltrados.length;

  const totalPaginas =
    Math.max(
      1,
      Math.ceil(
        totalRegistros /
        tamanio
      )
    );

  const inicio =
    (numeroPagina - 1) *
    tamanio;

  return clone({
    items:
      itemsFiltrados.slice(
        inicio,
        inicio + tamanio
      ),

    pagina:
      numeroPagina,

    tamanio,
    totalRegistros,
    totalPaginas
  });
}

/**
 * Compatibilidad temporal con
 * lista.html existente.
 */
export async function listCotizaciones() {
  const resultado =
    await searchCotizaciones(
      {},
      {
        pagina: 1,
        tamanio: 100
      }
    );

  return resultado.items.map(
    cotizacion => {
      const elegida =
        obtenerVersionElegida(
          cotizacion
        );

      const referencia =
        elegida ||
        cotizacion.versiones.at(-1) ||
        null;

      return {
        id:
          cotizacion.idCotizacion,

        cliente:
          `Cliente/Prospecto ${cotizacion.idClienteProspecto}`,

        total:
          Number(
            referencia?.total || 0
          ),

        estado:
          ESTADO_COTIZACION_GENERAL_LABELS[
            cotizacion.estadoGeneral
          ] ||
          cotizacion.estadoGeneral
      };
    }
  );
}

export async function getCotizacion(
  idCotizacion
) {
  exigirConsulta();
  aplicarVencimientoAutomatico();

  return clone(
    getCotizacionOrThrow(
      idCotizacion
    )
  );
}

export async function getCotizacionVersion(
  idCotizacion,
  idVersion
) {
  exigirConsulta();
  aplicarVencimientoAutomatico();

  const cotizacion =
    getCotizacionOrThrow(
      idCotizacion
    );

  return clone(
    getVersionOrThrow(
      cotizacion,
      idVersion
    )
  );
}

/**
 * Entrada intermodular desde Pagos.
 *
 * Cotizaciones no procesa el pago.
 * Únicamente recibe su confirmación.
 */
export async function registrarConfirmacionPagoCotizacion(
  idCotizacion,
  confirmacion = {}
) {
  const cotizacion =
    getCotizacionOrThrow(
      idCotizacion
    );

  const confirmado =
    confirmacion.confirmada ===
    true;

  const ahora =
    new Date().toISOString();

  cotizacion.confirmacionPago = {
    confirmada:
      confirmado,

    referenciaPago:
      normalizarTexto(
        confirmacion
          .referenciaPago
      ) || null,

    fechaConfirmacion:
      confirmado
        ? (
            confirmacion
              .fechaConfirmacion ||
            ahora
          )
        : null
  };

  cotizacion.fechaActualizacion =
    ahora;

  if (confirmado) {
    registrarHistorial(
      cotizacion,
      'PAGO_CONFIRMADO',
      'Se recibió la confirmación del porcentaje requerido desde el módulo Pagos.',
      {
        idUsuario: null,
        nombre: 'Pagos'
      }
    );
  }

  return clone(
    cotizacion
      .confirmacionPago
  );
}


/**
 * Entrada intermodular desde Inventario.
 *
 * Cotizaciones no crea ni administra
 * la reserva. Únicamente recibe
 * la confirmación y su referencia.
 */
export async function registrarConfirmacionReservaCotizacion(
  idCotizacion,
  reserva = {}
) {
  const cotizacion =
    getCotizacionOrThrow(
      idCotizacion
    );

  const confirmada =
    reserva.confirmada ===
    true;

  if (
    confirmada &&
    reserva.idReserva ===
      undefined &&
    !normalizarTexto(
      reserva.referenciaReserva
    )
  ) {
    throw crearError(
      'REFERENCIA_RESERVA_REQUERIDA',
      'La confirmación de Inventario debe incluir la referencia de la reserva.'
    );
  }

  const ahora =
    new Date().toISOString();

  cotizacion.reservaInventario = {
    confirmada,

    idReserva:
      reserva.idReserva ??
      null,

    referenciaReserva:
      normalizarTexto(
        reserva
          .referenciaReserva
      ) || null,

    fechaConfirmacion:
      confirmada
        ? (
            reserva
              .fechaConfirmacion ||
            ahora
          )
        : null
  };

  cotizacion.fechaActualizacion =
    ahora;

  if (confirmada) {
    const versionElegida =
      obtenerVersionElegida(
        cotizacion
      );

    if (versionElegida) {
      versionElegida
        .disponibilidadGlobal =
        DISPONIBILIDAD_COTIZACION
          .DISPONIBLE;
    }
  }

  if (confirmada) {
    registrarHistorial(
      cotizacion,
      'RESERVA_CONFIRMADA',
      'Se recibió la confirmación de reserva desde Inventario.',
      {
        idUsuario: null,
        nombre: 'Inventario'
      }
    );
  }

  return clone(
    cotizacion
      .reservaInventario
  );
}


/**
 * Formaliza la cotización después de
 * haber recibido las confirmaciones
 * correspondientes.
 *
 * No procesa pagos.
 * No crea reservas.
 * No genera Orden de Servicio.
 */
export async function confirmCotizacion(
  idCotizacion
) {
  exigirGestion();
  aplicarVencimientoAutomatico();

  const cotizacion =
    getCotizacionOrThrow(
      idCotizacion
    );

  /*
   * Operación idempotente.
   */
  if (
    esCotizacionConfirmada(
      cotizacion
    )
  ) {
    return clone(
      cotizacion
    );
  }

  if (
    cotizacion.estadoGeneral !==
    ESTADOS_COTIZACION_GENERAL
      .EN_SEGUIMIENTO
  ) {
    throw crearError(
      'ESTADO_INVALIDO',
      'La cotización debe encontrarse En seguimiento para ser confirmada.'
    );
  }

  const versionElegida =
    obtenerVersionElegida(
      cotizacion
    );

  if (!versionElegida) {
    throw crearError(
      'VERSION_ELEGIDA_REQUERIDA',
      'Debe existir una versión elegida.'
    );
  }

  if (
    versionElegida.estadoVersion !==
    ESTADOS_VERSION_COTIZACION
      .ENVIADA
  ) {
    throw crearError(
      'VERSION_NO_ENVIADA',
      'La versión elegida debe encontrarse Enviada.'
    );
  }

  if (
    !cotizacion.fechaEvento ||
    !cotizacion.horaEvento
  ) {
    throw crearError(
      'FECHA_HORA_REQUERIDA',
      'La fecha y hora del evento son obligatorias.'
    );
  }

  /*
   * Pagos es dueño de la validación.
   * Cotizaciones únicamente consume
   * la confirmación recibida.
   */
  if (
    cotizacion
      .confirmacionPago
      ?.confirmada !== true
  ) {
    throw crearError(
      'PAGO_NO_CONFIRMADO',
      'Aún no se ha recibido la confirmación del porcentaje requerido desde Pagos.'
    );
  }

  if (
    versionElegida
      .disponibilidadGlobal !==
    DISPONIBILIDAD_COTIZACION
      .DISPONIBLE
  ) {
    throw crearError(
      'DISPONIBILIDAD_INSUFICIENTE',
      'La versión elegida no tiene disponibilidad suficiente.'
    );
  }

  /*
   * Inventario es dueño de la reserva.
   * Cotizaciones únicamente consume
   * la confirmación recibida.
   */
  if (
    cotizacion
      .reservaInventario
      ?.confirmada !== true
  ) {
    throw crearError(
      'RESERVA_NO_CONFIRMADA',
      'Aún no se ha recibido la confirmación de reserva desde Inventario.'
    );
  }

  const ahora =
    new Date().toISOString();

  cotizacion.estadoGeneral =
    ESTADOS_COTIZACION_GENERAL
      .CONFIRMADA_RESERVADA;

  cotizacion.fechaConfirmacion =
    ahora;

  cotizacion.fechaActualizacion =
    ahora;

  registrarHistorial(
    cotizacion,
    'COTIZACION_CONFIRMADA_RESERVADA',
    `La cotización fue confirmada con la versión V${versionElegida.numeroVersion} y la reserva de Inventario asociada.`
  );

  return clone(
    cotizacion
  );
}

/**
 * Crea Cotización general + V1.
 *
 * Mantiene compatibilidad temporal
 * con formulario.html anterior.
 */
export async function createCotizacion(
  payload = {}
) {
  exigirGestion();

  if (
    payload.idClienteProspecto ===
      undefined ||
    payload.idClienteProspecto ===
      null ||
    payload.idClienteProspecto ===
      ''
  ) {
    return {
      id: Date.now(),

      cliente:
        normalizarTexto(
          payload.cliente
        ),

      total: 0,
      estado: 'Borrador'
    };
  }

  const idClienteProspecto =
    normalizarId(
      payload.idClienteProspecto,
      'cliente o prospecto'
    );

  const fechaEvento =
    normalizarFecha(
      payload.fechaEvento
    );

  const horaEvento =
    normalizarHora(
      payload.horaEvento
    );

  const porcentajeConfirmacion =
    normalizarPorcentaje(
      payload.porcentajeConfirmacion
    );

  const ahora =
    new Date();

  const ejercicio =
    ahora.getFullYear();

  const usuario =
    obtenerUsuarioActual();

  const idCotizacion =
    getNextCotizacionId();

  const idVersion =
    getNextVersionId();

  const cotizacion = {
    idCotizacion,
    ejercicio,

    consecutivo:
      getNextConsecutivo(
        ejercicio
      ),

    idClienteProspecto,

    evento:
      normalizarTexto(
        payload.evento
      ),

    fechaEvento,
    horaEvento,
    porcentajeConfirmacion,

    estadoGeneral:
      ESTADOS_COTIZACION_GENERAL
        .BORRADOR,

    idVersionElegida: null,

    confirmacionPago: {
      confirmada: false,
      referenciaPago: null,
      fechaConfirmacion: null
    },

    reservaInventario: {
      confirmada: false,
      idReserva: null,
      referenciaReserva: null,
      fechaConfirmacion: null
    },

    fechaConfirmacion: null,

    responsable:
      usuario,

    motivoCancelacion: null,
    motivoRechazo: null,

    fechaCreacion:
      ahora.toISOString(),

    fechaActualizacion:
      ahora.toISOString(),

    versiones: [
      {
        idVersion,
        idCotizacion,
        numeroVersion: 1,
        idListaPrecio: null,

        estadoVersion:
          ESTADOS_VERSION_COTIZACION
            .BORRADOR,

        elegida: false,

        disponibilidadGlobal:
          null,

        importeConceptos: 0,
        descuentos: 0,
        subtotal: 0,
        impuestos: 0,
        cargos: 0,
        total: 0,

        fechaCreacion:
          ahora.toISOString(),

        fechaEnvio: null,

        usuarioCreador:
          usuario.nombre,

        detalle: []
      }
    ],

    historial: []
  };

  mockState.cotizaciones.push(
    cotizacion
  );

  registrarHistorial(
    cotizacion,
    'COTIZACION_CREADA',
    'Se creó la cotización general y la versión V1 en Borrador.',
    usuario
  );

  return clone(
    cotizacion
  );
}

export async function createCotizacionVersion(
  idCotizacion
) {
  exigirGestion();
  aplicarVencimientoAutomatico();

  const cotizacion =
    getCotizacionOrThrow(
      idCotizacion
    );
  
  exigirCotizacionNoConfirmada(
    cotizacion
  );

  if (
    ESTADOS_TERMINALES_COTIZACION
      .includes(
        cotizacion.estadoGeneral
      )
  ) {
    throw crearError(
      'ESTADO_INVALIDO',
      'No pueden crearse nuevas versiones para una cotización Cancelada, Rechazada o Vencida.'
    );
  }

  const ahora =
    new Date().toISOString();

  const usuario =
    obtenerUsuarioActual();

  const numeroVersion =
    Math.max(
      ...cotizacion.versiones.map(
        version =>
          Number(
            version.numeroVersion || 0
          )
      ),
      0
    ) + 1;

  const nuevaVersion = {
    idVersion:
      getNextVersionId(),

    idCotizacion:
      cotizacion.idCotizacion,

    numeroVersion,
    idListaPrecio: null,

    estadoVersion:
      ESTADOS_VERSION_COTIZACION
        .BORRADOR,

    elegida: false,

    disponibilidadGlobal:
      null,

    importeConceptos: 0,
    descuentos: 0,
    subtotal: 0,
    impuestos: 0,
    cargos: 0,
    total: 0,

    fechaCreacion:
      ahora,

    fechaEnvio: null,

    usuarioCreador:
      usuario.nombre,

    detalle: []
  };

  cotizacion.versiones.push(
    nuevaVersion
  );

  cotizacion.fechaActualizacion =
    ahora;

  registrarHistorial(
    cotizacion,
    'VERSION_CREADA',
    `Se creó la versión V${numeroVersion} en Borrador.`,
    usuario
  );

  return clone(
    nuevaVersion
  );
}

export async function updateCotizacionVersion(
  idCotizacion,
  idVersion,
  payload = {}
) {
  exigirGestion();
  aplicarVencimientoAutomatico();

  const cotizacion =
    getCotizacionOrThrow(
      idCotizacion
    );

  exigirCotizacionNoConfirmada(
    cotizacion
  );

  const version =
    getVersionOrThrow(
      cotizacion,
      idVersion
    );

  if (
    version.estadoVersion !==
    ESTADOS_VERSION_COTIZACION
      .BORRADOR
  ) {
    throw crearError(
      'VERSION_INMUTABLE',
      'Solo una versión en Borrador puede modificarse.'
    );
  }

  if (
    ESTADOS_TERMINALES_COTIZACION
      .includes(
        cotizacion.estadoGeneral
      )
  ) {
    throw crearError(
      'ESTADO_INVALIDO',
      'La cotización se encuentra en un estado terminal y no puede modificarse.'
    );
  }

  const idListaPrecio =
    normalizarId(
      payload.idListaPrecio,
      'lista de precios'
    );

  const detalle =
    await normalizarDetalleVersion(
      version,
      idListaPrecio,
      payload.detalle || []
    );

  const economia =
    recalcularEconomia(
      detalle,
      version
    );

  const disponibilidadGlobal =
    Object.values(
      DISPONIBILIDAD_COTIZACION
    ).includes(
      payload.disponibilidadGlobal
    )
      ? payload.disponibilidadGlobal
      : null;

  version.idListaPrecio =
    idListaPrecio;

  version.detalle =
    detalle;

  version.disponibilidadGlobal =
    disponibilidadGlobal;

  Object.assign(
    version,
    economia
  );

  const ahora =
    new Date().toISOString();

  const usuario =
    obtenerUsuarioActual();

  version.fechaActualizacion =
    ahora;

  version.usuarioModificacion =
    usuario.nombre;

  cotizacion.fechaActualizacion =
    ahora;

  registrarHistorial(
    cotizacion,
    'VERSION_MODIFICADA',
    `Se modificó la versión V${version.numeroVersion} en Borrador.`,
    usuario
  );

  return clone(
    version
  );
}

export async function deleteCotizacionVersion(
  idCotizacion,
  idVersion
) {
  exigirGestion();
  aplicarVencimientoAutomatico();

  const cotizacion =
    getCotizacionOrThrow(
      idCotizacion
    );

  exigirCotizacionNoConfirmada(
    cotizacion
  );

  const version =
    getVersionOrThrow(
      cotizacion,
      idVersion
    );

  if (
    version.estadoVersion !==
    ESTADOS_VERSION_COTIZACION
      .BORRADOR
  ) {
    throw crearError(
      'VERSION_NO_ELIMINABLE',
      'Solo una versión en Borrador puede eliminarse.'
    );
  }

  const index =
    cotizacion.versiones.findIndex(
      item =>
        Number(
          item.idVersion
        ) ===
        Number(
          version.idVersion
        )
    );

  cotizacion.versiones.splice(
    index,
    1
  );

  if (
    Number(
      cotizacion.idVersionElegida
    ) ===
    Number(
      version.idVersion
    )
  ) {
    cotizacion.idVersionElegida =
      null;
  }

  cotizacion.fechaActualizacion =
    new Date().toISOString();

  registrarHistorial(
    cotizacion,
    'VERSION_ELIMINADA',
    `Se eliminó la versión V${version.numeroVersion} en Borrador.`
  );

  return clone({
    success: true,
    idVersion:
      version.idVersion
  });
}

export async function sendCotizacionVersion(
  idCotizacion,
  idVersion
) {
  exigirGestion();
  aplicarVencimientoAutomatico();

  const cotizacion =
    getCotizacionOrThrow(
      idCotizacion
    );

  exigirCotizacionNoConfirmada(
    cotizacion
  );

  const version =
    getVersionOrThrow(
      cotizacion,
      idVersion
    );

  if (
    version.estadoVersion !==
    ESTADOS_VERSION_COTIZACION
      .BORRADOR
  ) {
    throw crearError(
      'VERSION_INMUTABLE',
      'La versión ya fue enviada y no puede enviarse nuevamente.'
    );
  }

  if (
    ESTADOS_TERMINALES_COTIZACION
      .includes(
        cotizacion.estadoGeneral
      )
  ) {
    throw crearError(
      'ESTADO_INVALIDO',
      'No puede enviarse una versión de una cotización Cancelada, Rechazada o Vencida.'
    );
  }

  if (
    !version.idListaPrecio
  ) {
    throw crearError(
      'LISTA_PRECIO_REQUERIDA',
      'La versión debe tener una Lista de Precios seleccionada.'
    );
  }

  const ahora =
    new Date().toISOString();

  version.estadoVersion =
    ESTADOS_VERSION_COTIZACION
      .ENVIADA;

  version.fechaEnvio =
    ahora;

  if (
    cotizacion.estadoGeneral ===
    ESTADOS_COTIZACION_GENERAL
      .BORRADOR
  ) {
    cotizacion.estadoGeneral =
      ESTADOS_COTIZACION_GENERAL
        .EN_SEGUIMIENTO;
  }

  cotizacion.fechaActualizacion =
    ahora;

  registrarHistorial(
    cotizacion,
    'VERSION_ENVIADA',
    `La versión V${version.numeroVersion} fue enviada.`
  );

  return clone(
    version
  );
}

export async function selectCotizacionVersion(
  idCotizacion,
  idVersion
) {
  exigirGestion();
  aplicarVencimientoAutomatico();

  const cotizacion =
    getCotizacionOrThrow(
      idCotizacion
    );

 if (
    esCotizacionConfirmada(
      cotizacion
    ) ||
    ESTADOS_TERMINALES_COTIZACION
      .includes(
        cotizacion.estadoGeneral
      )
  ) {
    throw crearError(
      'SELECCION_BLOQUEADA',
      'La versión elegida ya no puede cambiarse en el estado actual de la cotización.'
    );
  }

  const version =
    getVersionOrThrow(
      cotizacion,
      idVersion
    );

  if (
    version.estadoVersion !==
    ESTADOS_VERSION_COTIZACION
      .ENVIADA
  ) {
    throw crearError(
      'VERSION_NO_ELEGIBLE',
      'Solo una versión Enviada puede marcarse como elegida.'
    );
  }

  cotizacion.versiones.forEach(
    item => {
      item.elegida =
        Number(
          item.idVersion
        ) ===
        Number(
          version.idVersion
        );
    }
  );

  cotizacion.idVersionElegida =
    version.idVersion;

  cotizacion.fechaActualizacion =
    new Date().toISOString();

  registrarHistorial(
    cotizacion,
    'VERSION_ELEGIDA',
    `La versión V${version.numeroVersion} fue marcada como elegida.`
  );

  return clone(
    version
  );
}

export async function rejectCotizacion(
  idCotizacion,
  motivo
) {
  exigirGestion();
  aplicarVencimientoAutomatico();

  const cotizacion =
    getCotizacionOrThrow(
      idCotizacion
    );

  if (
    esCotizacionConfirmada(
      cotizacion
    ) ||
    ESTADOS_TERMINALES_COTIZACION
      .includes(
        cotizacion.estadoGeneral
      )
  ) {
    throw crearError(
      'ESTADO_INVALIDO',
      'La cotización no puede rechazarse en su estado actual.'
    );
  }

  const motivoNormalizado =
    normalizarTexto(
      motivo
    );

  if (
    !motivoNormalizado
  ) {
    throw crearError(
      'MOTIVO_REQUERIDO',
      'El motivo del rechazo es obligatorio.'
    );
  }

  cotizacion.estadoGeneral =
    ESTADOS_COTIZACION_GENERAL
      .RECHAZADA;

  cotizacion.motivoRechazo =
    motivoNormalizado;

  cotizacion.fechaActualizacion =
    new Date().toISOString();

  registrarHistorial(
    cotizacion,
    'COTIZACION_RECHAZADA',
    `La cotización fue rechazada. Motivo: ${motivoNormalizado}`
  );

  return clone(
    cotizacion
  );
}

export async function cancelCotizacion(
  idCotizacion,
  motivo
) {
  exigirGestion();
  aplicarVencimientoAutomatico();

  const cotizacion =
    getCotizacionOrThrow(
      idCotizacion
    );

  if (
    ESTADOS_TERMINALES_COTIZACION
      .includes(
        cotizacion.estadoGeneral
      )
  ) {
    throw crearError(
      'ESTADO_INVALIDO',
      'La cotización ya se encuentra en un estado terminal.'
    );
  }

  const motivoNormalizado =
    normalizarTexto(
      motivo
    );

  if (
    !motivoNormalizado
  ) {
    throw crearError(
      'MOTIVO_REQUERIDO',
      'El motivo de cancelación es obligatorio.'
    );
  }

  cotizacion.estadoGeneral =
    ESTADOS_COTIZACION_GENERAL
      .CANCELADA;

  cotizacion.motivoCancelacion =
    motivoNormalizado;

  cotizacion.fechaActualizacion =
    new Date().toISOString();

  registrarHistorial(
    cotizacion,
    'COTIZACION_CANCELADA',
    `La cotización fue cancelada. Motivo: ${motivoNormalizado}`
  );

  return clone(
    cotizacion
  );
}

export async function deleteCotizacion(
  idCotizacion
) {
  exigirGestion();
  aplicarVencimientoAutomatico();

  const cotizacion =
    getCotizacionOrThrow(
      idCotizacion
    );

  const todasBorrador =
    cotizacion.versiones.every(
      version =>
        version.estadoVersion ===
        ESTADOS_VERSION_COTIZACION
          .BORRADOR
    );

  if (
    !todasBorrador
  ) {
    throw crearError(
      'COTIZACION_NO_ELIMINABLE',
      'La cotización general solo puede eliminarse cuando todas sus versiones están en Borrador.'
    );
  }

  const index =
    getCotizacionIndex(
      cotizacion.idCotizacion
    );

  mockState.cotizaciones.splice(
    index,
    1
  );

  return clone({
    success: true,

    idCotizacion:
      cotizacion.idCotizacion
  });
}