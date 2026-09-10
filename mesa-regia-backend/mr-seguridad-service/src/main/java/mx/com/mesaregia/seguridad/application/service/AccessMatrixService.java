package mx.com.mesaregia.seguridad.application.service;

import mx.com.mesaregia.seguridad.api.response.MatrizAccesoItemResponse;
import java.util.List;

public interface AccessMatrixService {
  List<MatrizAccesoItemResponse> consultar(Long idRol, String modulo, String permiso);
}
