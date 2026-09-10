package mx.com.mesaregia.cotizaciones.application.service;

import mx.com.mesaregia.cotizaciones.api.response.ConfirmacionResponse;
import mx.com.mesaregia.cotizaciones.domain.entity.SagaConfirmacion;
import mx.com.mesaregia.cotizaciones.integration.dto.*;

public interface SagaConfirmacionStore {
  SagaConfirmacion iniciar(String key, Long c, Long v, Long usuario, String correlation);

  SagaConfirmacion pago(Long id, String ref);

  SagaConfirmacion reserva(Long id, ReservaResultado r);

  SagaConfirmacion orden(Long id, OrdenResultado r);

  SagaConfirmacion vinculada(Long id);

  SagaConfirmacion error(Long id, String error, boolean compensacionPendiente);

  SagaConfirmacion compensada(Long id);

  ConfirmacionResponse confirmarLocal(Long idSaga, Long idUsuario);
}
