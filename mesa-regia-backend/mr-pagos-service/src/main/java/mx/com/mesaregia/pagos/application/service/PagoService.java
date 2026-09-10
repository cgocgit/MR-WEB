package mx.com.mesaregia.pagos.application.service;

import mx.com.mesaregia.pagos.api.request.PagoCreateRequest;
import mx.com.mesaregia.pagos.api.response.PagoRegistroResponse;

public interface PagoService {
  PagoRegistroResponse registrar(String idempotencyKey, PagoCreateRequest request);
}
