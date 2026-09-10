package mx.com.mesaregia.logistica.application.service;

import mx.com.mesaregia.logistica.api.response.InternalLogisticaOrdenContextResponse;

public interface LogisticaIntegrationQueryService {
  InternalLogisticaOrdenContextResponse contextoOrden(Long idOrden);
}
