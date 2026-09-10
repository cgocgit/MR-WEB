package mx.com.mesaregia.cotizaciones.domain.enums;

public enum EstadoSagaConfirmacion {
  INICIADA, PAGO_VALIDADO, RESERVA_CREADA, ORDEN_CREADA, RESERVA_VINCULADA, CONFIRMADA, COMPENSACION_PENDIENTE,
  COMPENSADA, ERROR
}