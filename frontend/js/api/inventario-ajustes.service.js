import {
  consultarExistenciasInventario
} from './inventario.service.js';

import {
  listarCortesFisicos,
  obtenerCorteFisico,
  ESTADOS_CORTE_FISICO
} from './inventario-cortes.service.js';

import {
  DISPONIBILIDAD_ALMACEN_MOCK,
  MOVIMIENTOS_INVENTARIO_MOCK
} from './inventario.mock.js';

import {
  AJUSTES_INVENTARIO_MOCK,
  clonarDatosAjustes,
  simularLatenciaAjustes
} from './inventario-ajustes.mock.js';

import {
  getSession
} from '../shared/auth-guard.js';

import {
  hasPermission,
  hasAnyRole
} from '../shared/permissions.js';

const ID_ALMACEN_CENTRAL = 1;

const ORIGEN_CORTE = 'CORTE_FISICO';
const ORIGEN_SOPORTE = 'SOPORTE_ADMINISTRADOR';

function crearError(
  codigo,
  mensaje,
  campo = null
) {
  const error = new Error(mensaje);

  error.codigo = codigo;
  error.campo = campo;

  return error;
}

function obtenerSesionAutorizada() {
  const session = getSession();

  if (
    !session ||
    !hasPermission(
      session,
      'inventario.gestionar'
    )
  ) {
    throw crearError(
      'ACCESO_DENEGADO',
      'No dispone de permisos para registrar ajustes.'
    );
  }

  return session;
}

function esAdministrador(session) {
  return hasAnyRole(
    session,
    ['ADMIN']
  );
}

function obtenerUsuario(session) {
  return (
    session?.user?.name ||
    session?.user?.username ||
    'Usuario autenticado'
  );
}

function normalizarId(
  valor,
  campo,
  mensaje
) {
  const id = Number(valor);

  if (
    !Number.isInteger(id) ||
    id <= 0
  ) {
    throw crearError(
      'IDENTIFICADOR_INVALIDO',
      mensaje,
      campo
    );
  }

  return id;
}

function normalizarCantidad(valor) {
  if (
    valor === '' ||
    valor === null ||
    valor === undefined
  ) {
    throw crearError(
      'CANTIDAD_REQUERIDA',
      'La cantidad física corregida es obligatoria.',
      'cantidadFisicaCorregida'
    );
  }

  const cantidad = Number(valor);

  if (
    !Number.isInteger(cantidad) ||
    cantidad < 0
  ) {
    throw crearError(
      'CANTIDAD_INVALIDA',
      'La cantidad física corregida debe ser un número entero igual o mayor que cero.',
      'cantidadFisicaCorregida'
    );
  }

  return cantidad;
}

function normalizarComentario(valor) {
  const comentario =
    String(valor ?? '').trim();

  if (!comentario) {
    throw crearError(
      'COMENTARIO_REQUERIDO',
      'El comentario del ajuste es obligatorio.',
      'comentario'
    );
  }

  return comentario;
}

function buscarRegistroInventario(
  idProducto,
  idAlmacen
) {
  const registro =
    DISPONIBILIDAD_ALMACEN_MOCK.find(
      item =>
        item.idProducto === idProducto &&
        item.idAlmacen === idAlmacen
    );

  if (!registro) {
    throw crearError(
      'INVENTARIO_NO_ENCONTRADO',
      'El producto no cuenta con registro de Inventario para el almacén seleccionado.'
    );
  }

  return registro;
}

function existeAjusteCorteProducto(
  idCorte,
  idProducto
) {
  return AJUSTES_INVENTARIO_MOCK.some(
    item =>
      item.origenAjuste ===
        ORIGEN_CORTE &&
      item.idCorte === idCorte &&
      item.idProducto === idProducto
  );
}

function generarIdMovimiento() {
  return (
    MOVIMIENTOS_INVENTARIO_MOCK.reduce(
      (maximo, movimiento) =>
        Math.max(
          maximo,
          Number(
            movimiento.idMovimiento || 0
          )
        ),
      0
    ) + 1
  );
}

function generarIdAjuste() {
  return (
    AJUSTES_INVENTARIO_MOCK.reduce(
      (maximo, ajuste) =>
        Math.max(
          maximo,
          Number(
            ajuste.idAjuste || 0
          )
        ),
      0
    ) + 1
  );
}

function generarFolioMovimiento(
  idMovimiento
) {
  return (
    'AJ-' +
    String(idMovimiento)
      .padStart(6, '0')
  );
}

async function obtenerExistencia(
  idProducto
) {
  const resultado =
    await consultarExistenciasInventario({
      idProducto,
      mostrarInactivos: true,
      skip: 0,
      limit: 1000
    });

  const existencia =
    resultado.items.find(
      item =>
        item.idProducto === idProducto &&
        item.idAlmacen ===
          ID_ALMACEN_CENTRAL &&
        item.idInventario !== null
    );

  if (!existencia) {
    throw crearError(
      'INVENTARIO_NO_ENCONTRADO',
      'El producto no cuenta con registro de Inventario.'
    );
  }

  return existencia;
}

function construirProductoAjuste(
  existencia
) {
  return {
    idInventario:
      existencia.idInventario,

    idProducto:
      existencia.idProducto,

    idAlmacen:
      existencia.idAlmacen,

    almacen:
      existencia.almacen,

    codigo:
      existencia.codigo,

    nombre:
      existencia.nombre,

    unidadMedida:
      existencia.unidadMedida,

    imagenUrl:
      existencia.imagenUrl,

    activo:
      existencia.activo,

    existenciaFisica:
      existencia.cantidadRegistrada,

    cantidadReservada:
      existencia.cantidadReservada,

    disponibilidad:
      existencia.cantidadDisponible,

    minimo:
      existencia.stockMinimo,

    maximo:
      existencia.stockMaximo,

    fechaActualizacion:
      existencia.fechaActualizacion
  };
}

/**
 * Productos que realmente cuentan
 * con un registro de Inventario.
 *
 * Incluye inactivos porque la especificación
 * permite corregirlos cuando conservan
 * existencia.
 */
export async function listarProductosAjustables() {
  obtenerSesionAutorizada();

  const resultado =
    await consultarExistenciasInventario({
      mostrarInactivos: true,
      skip: 0,
      limit: 1000
    });

  return resultado.items
    .filter(
      item =>
        item.idInventario !== null &&
        item.idAlmacen ===
          ID_ALMACEN_CENTRAL
    )
    .map(item => ({
      idProducto: item.idProducto,
      codigo: item.codigo,
      nombre: item.nombre,
      activo: item.activo
    }));
}

/**
 * Consulta el producto y su existencia
 * vigente para construir la pantalla.
 */
export async function consultarProductoAjuste(
  idProducto
) {
  obtenerSesionAutorizada();

  const id =
    normalizarId(
      idProducto,
      'idProducto',
      'Seleccione un producto válido.'
    );

  const existencia =
    await obtenerExistencia(id);

  return clonarDatosAjustes(
    construirProductoAjuste(
      existencia
    )
  );
}

/**
 * Lista únicamente cortes concluidos
 * que mantienen diferencias pendientes.
 */
export async function listarCortesAjustables() {
  obtenerSesionAutorizada();

  const cortes =
    await listarCortesFisicos({
      estado:
        ESTADOS_CORTE_FISICO
          .DIFERENCIAS_PENDIENTES
    });

  const resultado = [];

  for (const corteResumen of cortes) {
    const corte =
      await obtenerCorteFisico(
        corteResumen.idCorte
      );

    const productos =
      corte.detalle.filter(
        item =>
          Number(item.diferencia) !== 0 &&
          !existeAjusteCorteProducto(
            corte.idCorte,
            item.idProducto
          )
      );

    if (productos.length > 0) {
      resultado.push({
        idCorte: corte.idCorte,
        folio: corte.folio,
        fechaInicio: corte.fechaInicio,
        fechaConclusion:
          corte.fechaConclusion,

        responsable:
          corte.responsable,

        observaciones:
          corte.observaciones,

        productos: productos.map(
          item => ({
            idProducto:
              item.idProducto,

            codigo:
              item.codigo,

            nombre:
              item.producto,

            unidadMedida:
              item.unidadMedida,

            cantidadRegistrada:
              Number(
                item.cantidadRegistrada
              ),

            cantidadFisica:
              Number(
                item.cantidadFisica
              ),

            diferencia:
              Number(
                item.diferencia
              )
          })
        )
      });
    }
  }

  return clonarDatosAjustes(
    resultado
  );
}

/**
 * Recupera nuevamente un corte para
 * evitar depender del objeto previamente
 * presentado en pantalla.
 */
export async function obtenerCorteAjustable(
  idCorte
) {
  obtenerSesionAutorizada();

  const id =
    normalizarId(
      idCorte,
      'idCorte',
      'Seleccione un corte físico válido.'
    );

  const corte =
    await obtenerCorteFisico(id);

  if (
    corte.estado !==
      ESTADOS_CORTE_FISICO
        .DIFERENCIAS_PENDIENTES
  ) {
    throw crearError(
      'CORTE_NO_AJUSTABLE',
      'El corte físico ya no cuenta con diferencias pendientes susceptibles de ajuste.'
    );
  }

  const productos =
    corte.detalle.filter(
      item =>
        Number(item.diferencia) !== 0 &&
        !existeAjusteCorteProducto(
          corte.idCorte,
          item.idProducto
        )
    );

  return clonarDatosAjustes({
    idCorte: corte.idCorte,
    folio: corte.folio,
    fechaInicio: corte.fechaInicio,
    fechaConclusion:
      corte.fechaConclusion,

    responsable:
      corte.responsable,

    observaciones:
      corte.observaciones,

    productos: productos.map(
      item => ({
        idProducto:
          item.idProducto,

        codigo:
          item.codigo,

        nombre:
          item.producto,

        unidadMedida:
          item.unidadMedida,

        cantidadRegistrada:
          Number(
            item.cantidadRegistrada
          ),

        cantidadFisica:
          Number(
            item.cantidadFisica
          ),

        diferencia:
          Number(
            item.diferencia
          )
      })
    )
  });
}

function validarOrigen(
  origenAjuste,
  session
) {
  if (
    origenAjuste !== ORIGEN_CORTE &&
    origenAjuste !== ORIGEN_SOPORTE
  ) {
    throw crearError(
      'ORIGEN_INVALIDO',
      'Seleccione un origen de ajuste válido.',
      'origenAjuste'
    );
  }

  if (
    origenAjuste ===
      ORIGEN_SOPORTE &&
    !esAdministrador(session)
  ) {
    throw crearError(
      'SOPORTE_NO_AUTORIZADO',
      'Solo el Administrador puede registrar ajustes por soporte.'
    );
  }
}

async function validarCorte({
  idCorte,
  idProducto,
  cantidadFisicaCorregida,
  existenciaActual
}) {
  const corte =
    await obtenerCorteFisico(
      idCorte
    );

  if (
    corte.estado !==
      ESTADOS_CORTE_FISICO
        .DIFERENCIAS_PENDIENTES
  ) {
    throw crearError(
      'CORTE_NO_AJUSTABLE',
      'El corte físico ya no permite registrar este ajuste.'
    );
  }

  const detalle =
    corte.detalle.find(
      item =>
        item.idProducto ===
          idProducto
    );

  if (
    !detalle ||
    Number(detalle.diferencia) === 0
  ) {
    throw crearError(
      'DIFERENCIA_NO_DISPONIBLE',
      'El producto seleccionado no tiene una diferencia pendiente en el corte.'
    );
  }

  if (
    existeAjusteCorteProducto(
      corte.idCorte,
      idProducto
    )
  ) {
    throw crearError(
      'AJUSTE_DUPLICADO',
      'La diferencia de este corte y producto ya fue ajustada.'
    );
  }

  if (
    Number(
      detalle.cantidadFisica
    ) !==
      cantidadFisicaCorregida
  ) {
    throw crearError(
      'CANTIDAD_CORTE_INVALIDA',
      'La cantidad física del ajuste ya no coincide con el corte seleccionado.'
    );
  }

  /*
   * El corte conserva la existencia que
   * estaba registrada al momento de realizarlo.
   */
  if (
    Number(
      detalle.cantidadRegistrada
    ) !==
      Number(
        existenciaActual
          .existenciaFisica
      )
  ) {
    throw crearError(
      'EXISTENCIA_CAMBIO_DESDE_CORTE',
      'La existencia cambió después del corte. Realice una nueva validación física antes de ajustar.'
    );
  }

  return corte;
}

/**
 * Registra el ajuste.
 *
 * Todas las validaciones se realizan antes
 * de modificar los arreglos en memoria.
 * No existe await entre la actualización
 * de existencia y el registro del movimiento.
 */
export async function registrarAjuste({
  origenAjuste,
  idAlmacen,
  idProducto,
  cantidadFisicaCorregida,
  comentario,
  idCorte = null,
  existenciaConsultada,
  fechaActualizacionConsultada = null
}) {
  const session =
    obtenerSesionAutorizada();

  validarOrigen(
    origenAjuste,
    session
  );

  const almacen =
    normalizarId(
      idAlmacen,
      'idAlmacen',
      'El almacén seleccionado no es válido.'
    );

  if (
    almacen !==
    ID_ALMACEN_CENTRAL
  ) {
    throw crearError(
      'ALMACEN_NO_SOPORTADO',
      'El ajuste solamente está disponible para Almacén Central.'
    );
  }

  const producto =
    normalizarId(
      idProducto,
      'idProducto',
      'Seleccione un producto válido.'
    );

  const cantidad =
    normalizarCantidad(
      cantidadFisicaCorregida
    );

  const comentarioNormalizado =
    normalizarComentario(
      comentario
    );

  /*
   * Nueva consulta inmediatamente antes
   * de guardar para control de concurrencia.
   */
  const existenciaVigente =
    await obtenerExistencia(
      producto
    );

  const existenciaActual =
    construirProductoAjuste(
      existenciaVigente
    );

  if (
    Number(existenciaConsultada) !==
      Number(
        existenciaActual
          .existenciaFisica
      ) ||
    (
      fechaActualizacionConsultada &&
      fechaActualizacionConsultada !==
        existenciaActual
          .fechaActualizacion
    )
  ) {
    throw crearError(
      'EXISTENCIA_DESACTUALIZADA',
      'La existencia cambió desde la última consulta. Revise nuevamente el ajuste con los datos vigentes.'
    );
  }

  let corte = null;
  let corteId = null;

  if (
    origenAjuste ===
    ORIGEN_CORTE
  ) {
    corteId =
      normalizarId(
        idCorte,
        'idCorte',
        'Seleccione un corte físico válido.'
      );

    corte =
      await validarCorte({
        idCorte: corteId,
        idProducto: producto,
        cantidadFisicaCorregida:
          cantidad,
        existenciaActual
      });
  }

  const diferencia =
    cantidad -
    existenciaActual.existenciaFisica;

  if (diferencia === 0) {
    throw crearError(
      'SIN_DIFERENCIA',
      'La cantidad física corregida es igual a la existencia vigente; no existe ajuste para registrar.'
    );
  }

  /*
   * Se vuelve a obtener el registro interno
   * después de completar las validaciones.
   */
  const registro =
    buscarRegistroInventario(
      producto,
      almacen
    );

  /*
   * Validación final sin latencia.
   */
  if (
    Number(registro.existenciaFisica) !==
    Number(
      existenciaActual.existenciaFisica
    )
  ) {
    throw crearError(
      'EXISTENCIA_DESACTUALIZADA',
      'La existencia cambió antes de guardar el ajuste.'
    );
  }

  const fecha =
    new Date().toISOString();

  const usuario =
    obtenerUsuario(session);

  const disponibilidadResultante =
    Math.max(
      0,
      cantidad -
        existenciaActual
          .cantidadReservada
    );

  const idMovimiento =
    generarIdMovimiento();

  const folioMovimiento =
    generarFolioMovimiento(
      idMovimiento
    );

  const movimiento = {
    idMovimiento,
    folioMovimiento,
    idProducto: producto,
    idAlmacen: almacen,

    tipo: 'AJUSTE',

    cantidad: diferencia,

    sentido:
      diferencia > 0
        ? 'INCREMENTO'
        : 'DECREMENTO',

    fecha,

    motivo:
      comentarioNormalizado,

    comentario:
      comentarioNormalizado,

    usuario,

    origenAjuste,

    idCorte: corteId,

    folioCorte:
      corte?.folio || null,

    existenciaAnterior:
      existenciaActual
        .existenciaFisica,

    cantidadFisicaCorregida:
      cantidad,

    existenciaResultante:
      cantidad,

    reservaConservada:
      existenciaActual
        .cantidadReservada,

    disponibilidadResultante
  };

  const ajuste = {
    idAjuste:
      generarIdAjuste(),

    idMovimiento,
    folioMovimiento,

    origenAjuste,

    idAlmacen: almacen,
    idProducto: producto,
    idCorte: corteId,

    fecha,
    usuario,

    comentario:
      comentarioNormalizado,

    existenciaAnterior:
      existenciaActual
        .existenciaFisica,

    cantidadFisicaCorregida:
      cantidad,

    diferencia,

    existenciaResultante:
      cantidad,

    reservaConservada:
      existenciaActual
        .cantidadReservada,

    disponibilidadResultante
  };

  /*
   * Operación en memoria sin operaciones
   * asíncronas entre las mutaciones.
   */
  registro.existenciaFisica =
    cantidad;

  registro.fechaActualizacion =
    fecha;

  MOVIMIENTOS_INVENTARIO_MOCK.push(
    movimiento
  );

  AJUSTES_INVENTARIO_MOCK.push(
    ajuste
  );

  await simularLatenciaAjustes();

  return clonarDatosAjustes({
    ...ajuste,

    tipo: 'AJUSTE',

    sentido:
      diferencia > 0
        ? 'INCREMENTO'
        : 'DECREMENTO',

    bajoMinimo:
      Number.isInteger(
        existenciaActual.minimo
      ) &&
      cantidad <
        existenciaActual.minimo,

    sobreMaximo:
      Number.isInteger(
        existenciaActual.maximo
      ) &&
      cantidad >
        existenciaActual.maximo,

    reservaSuperiorExistencia:
      existenciaActual
        .cantidadReservada >
      cantidad
  });
}