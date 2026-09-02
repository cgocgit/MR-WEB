import {
  DISPONIBILIDAD_ALMACEN_MOCK,
  LIMITES_INVENTARIO_MOCK,
  MOVIMIENTOS_INVENTARIO_MOCK,
  RESERVAS_FUTURAS_MOCK,
  clonarDatosInventario,
  simularLatenciaInventario
} from './inventario.mock.js';

export async function getExistencias(){
  return Promise.resolve([
    {producto:'Silla',almacen:'Central',cantidad:120},
    {producto:'Mesa',almacen:'Almacén 1',cantidad:30}
  ]);
}

export async function getMovimientos(){
  return Promise.resolve([
    {id:1,producto:'Silla',tipo:'Salida',cantidad:10,fecha:'2026-08-20'},
  ]);
}

function normalizarCantidadSolicitada(cantidad) {
  const numero = Number(cantidad);

  if (!Number.isInteger(numero) || numero <= 0) {
    throw crearError(
      'CANTIDAD_INVALIDA',
      'La cantidad solicitada debe ser un número entero mayor que cero.',
      'cantidad'
    );
  }

  return numero;
}

function normalizarFecha(valor, campo, etiqueta) {
  if (
    typeof valor !== 'string' ||
    !/^\d{4}-\d{2}-\d{2}$/.test(valor)
  ) {
    throw crearError(
      'FECHA_INVALIDA',
      `${etiqueta} es obligatoria.`,
      campo
    );
  }

  return valor;
}

function periodosSeTraslapan(
  fechaInicioConsulta,
  fechaFinConsulta,
  fechaInicioReserva,
  fechaFinReserva
) {
  return (
    fechaInicioConsulta <= fechaFinReserva &&
    fechaFinConsulta >= fechaInicioReserva
  );
}

/**
 * Consulta disponibilidad futura.
 *
 * Contrato futuro:
 * GET /inventario/disponibilidad-futura?
 *   idProducto={idProducto}&cantidad={cantidad}&
 *   fechaInicio={fechaInicio}&fechaFin={fechaFin}
 */
export async function consultarDisponibilidadFutura({
  idProducto,
  cantidad,
  fechaInicio,
  fechaFin
}) {
  await simularLatenciaInventario();

  const id = normalizarIdProducto(idProducto);
  const cantidadSolicitada = normalizarCantidadSolicitada(cantidad);
  const inicio = normalizarFecha(
    fechaInicio,
    'fechaInicio',
    'La fecha de entrega o inicio'
  );
  const fin = normalizarFecha(
    fechaFin,
    'fechaFin',
    'La fecha de recolección o fin'
  );

  if (fin < inicio) {
    throw crearError(
      'PERIODO_INVALIDO',
      'La fecha de recolección o fin no puede ser anterior a la fecha de entrega o inicio.',
      'fechaFin'
    );
  }

  await obtenerProducto(id);

  const almacenes = obtenerDisponibilidadAlmacenes(id);
  const totales = calcularTotales(almacenes);

  const reservas = RESERVAS_FUTURAS_MOCK
    .filter(reserva =>
      reserva.idProducto === id &&
      reserva.estado === 'CONFIRMADA' &&
      periodosSeTraslapan(
        inicio,
        fin,
        reserva.fechaInicio,
        reserva.fechaFin
      )
    )
    .map(reserva => ({ ...reserva }));

  const cantidadComprometida = reservas.reduce(
    (total, reserva) => total + reserva.cantidadReservada,
    0
  );

  const cantidadDisponiblePeriodo = Math.max(
    0,
    totales.existenciaFisica - cantidadComprometida
  );

  return clonarDatosInventario({
    idProducto: id,
    cantidadSolicitada,
    fechaInicio: inicio,
    fechaFin: fin,
    cantidadRegistrada: totales.existenciaFisica,
    cantidadComprometida,
    cantidadDisponiblePeriodo,
    disponible: cantidadDisponiblePeriodo >= cantidadSolicitada,
    reservas
  });
}
