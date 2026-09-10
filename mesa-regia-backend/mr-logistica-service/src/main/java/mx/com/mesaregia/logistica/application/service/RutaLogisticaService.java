package mx.com.mesaregia.logistica.application.service;

import mx.com.mesaregia.logistica.api.request.*;
import mx.com.mesaregia.logistica.api.response.RutaResponse;

public interface RutaLogisticaService {
  RutaResponse agregarAsignacion(Long id, AsignacionCreateRequest r);

  RutaResponse cancelarAsignacion(Long id, Long idAsignacion, Long version);

  RutaResponse ordenarParadas(Long id, OrdenParadasRequest r);
}
