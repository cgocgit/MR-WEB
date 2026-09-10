package mx.com.mesaregia.logistica.application.service;

import mx.com.mesaregia.logistica.api.request.*;
import mx.com.mesaregia.logistica.api.response.VehiculoResponse;
import java.util.List;

public interface VehiculoService {
  List<VehiculoResponse> listar();

  VehiculoResponse crear(VehiculoCreateRequest r);

  VehiculoResponse actualizar(Long id, VehiculoUpdateRequest r);

  VehiculoResponse estado(Long id, VehiculoEstadoRequest r);
}
