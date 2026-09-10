package mx.com.mesaregia.ordenes.application.service;

import mx.com.mesaregia.ordenes.api.request.HitoRequest;
import mx.com.mesaregia.ordenes.api.response.OrdenResponse;

public interface OrdenStateService {
  OrdenResponse aplicarHito(Long id, HitoRequest request, String correlationId);
}