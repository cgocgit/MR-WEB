import {
  listarProductos,
  obtenerProducto
} from './catalogo.service.js';

import {
  DISPONIBILIDAD_ALMACEN_MOCK,
  LIMITES_INVENTARIO_MOCK,
  MOVIMIENTOS_INVENTARIO_MOCK,
  RESERVAS_FUTURAS_MOCK,
  clonarDatosInventario,
  simularLatenciaInventario
} from './inventario.mock.js';

function crearError(codigo, mensaje, campo = null) {
  const error = new Error(mensaje);
  error.codigo = codigo;
  error.campo = campo;

  return error;
}

function normalizarIdProducto(idProducto) {
  const id = Number(idProducto);

  if (!Number.isInteger(id) || id <= 0) {
    throw crearError(
      'PRODUCTO_INVALIDO',
      'Seleccione un producto válido.',
      'idProducto'
    );
  }

  return id;
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

function obtenerDisponibilidadAlmacenes(idProducto) {
  return DISPONIBILIDAD_ALMACEN_MOCK
    .filter(item => item.idProducto === idProducto)
    .map(item => ({
      idAlmacen: item.idAlmacen,
      almacen: item.almacen,
      existenciaFisica: item.existenciaFisica,
      cantidadReservada: item.cantidadReservada,
      disponibilidad: Math.max(
        0,
        item.existenciaFisica - item.cantidadReservada
      )
    }));
}

function calcularTotales(almacenes) {
  return almacenes.reduce(
    (totales, almacen) => ({
      existenciaFisica:
        totales.existenciaFisica + almacen.existenciaFisica,
      cantidadReservada:
        totales.cantidadReservada + almacen.cantidadReservada,
      disponibilidad:
        totales.disponibilidad + almacen.disponibilidad
    }),
    {
      existenciaFisica: 0,
      cantidadReservada: 0,
      disponibilidad: 0
    }
  );
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

export async function listarProductosInventariables() {
  const resultado = await listarProductos({
    soloActivos: true,
    skip: 0,
    limit: 1000
  });

  return resultado.items.map(producto => ({
    idProducto: producto.idProducto,
    codigo: producto.codigo,
    nombre: producto.nombre,
    unidadMedida: producto.unidadMedida
  }));
}

export async function getExistencias() {
  const productos = await listarProductosInventariables();

  const productosPorId = new Map(
    productos.map(producto => [
      producto.idProducto,
      producto
    ])
  );

  return clonarDatosInventario(
    DISPONIBILIDAD_ALMACEN_MOCK.map(item => ({
      idProducto: item.idProducto,
      producto:
        productosPorId.get(item.idProducto)?.nombre ||
        `Producto ${item.idProducto}`,
      almacen: item.almacen,
      cantidad: item.existenciaFisica,
      reservado: item.cantidadReservada,
      disponible: Math.max(
        0,
        item.existenciaFisica - item.cantidadReservada
      )
    }))
  );
}

export async function getMovimientos() {
  await simularLatenciaInventario();

  return clonarDatosInventario(MOVIMIENTOS_INVENTARIO_MOCK);
}

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