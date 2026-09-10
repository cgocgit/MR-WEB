package mx.com.mesaregia.seguridad.application.service;

import mx.com.mesaregia.seguridad.api.request.*;
import mx.com.mesaregia.seguridad.api.response.RolResponse;
import java.util.List;

public interface RolService {
  List<RolResponse> buscar(Boolean activo);

  RolResponse obtener(Long id);

  RolResponse registrar(RolCreateRequest r);

  RolResponse actualizar(Long id, RolUpdateRequest r);

  RolResponse cambiarEstado(Long id, EstadoRequest r);
}
