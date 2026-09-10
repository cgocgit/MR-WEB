package mx.com.mesaregia.logistica.application.service;

import mx.com.mesaregia.logistica.api.request.ToleranciaUpdateRequest;
import mx.com.mesaregia.logistica.api.response.ToleranciaResponse;
import mx.com.mesaregia.logistica.domain.enums.CodigoEtapa;
import java.util.List;

public interface ToleranciaService {
  List<ToleranciaResponse> listar();

  ToleranciaResponse actualizar(CodigoEtapa codigo, ToleranciaUpdateRequest r);
}
