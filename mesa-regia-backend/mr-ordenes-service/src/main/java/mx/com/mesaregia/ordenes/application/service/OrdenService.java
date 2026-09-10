package mx.com.mesaregia.ordenes.application.service;

import mx.com.mesaregia.ordenes.api.request.*;
import mx.com.mesaregia.ordenes.api.response.OrdenResponse;

public interface OrdenService {
  OrdenResponse registrarRevisionVentas(Long id, RevisionRequest request);

  OrdenResponse liberarProgramacion(Long id, LiberacionRequest request);
}