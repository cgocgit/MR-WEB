package mx.com.mesaregia.cotizaciones.application.service;

import mx.com.mesaregia.cotizaciones.api.request.ConfirmacionRequest;
import mx.com.mesaregia.cotizaciones.api.response.ConfirmacionResponse;

public interface CotizacionConfirmationOrchestrator {
  ConfirmacionResponse confirmar(Long idCotizacion, String idempotencyKey, String correlationId, ConfirmacionRequest r);

  void reconciliarPendientes();
}
