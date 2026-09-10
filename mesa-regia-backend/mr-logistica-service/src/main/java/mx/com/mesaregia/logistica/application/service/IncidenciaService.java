package mx.com.mesaregia.logistica.application.service;

import mx.com.mesaregia.logistica.api.request.*;
import mx.com.mesaregia.logistica.api.response.*;
import mx.com.mesaregia.logistica.domain.enums.*;
import org.springframework.data.domain.Pageable;
import java.util.List;

public interface IncidenciaService {
  PageResponse<IncidenciaResponse> buscar(EstadoIncidencia estado, Long idOrden, Long idProgramacion, Pageable p);

  IncidenciaResponse obtener(Long id);

  List<TipoIncidenciaResponse> tipos(PerfilReportante perfil);

  IncidenciaResponse reportar(IncidenciaCreateRequest r);

  IncidenciaResponse seguir(Long id, SeguimientoRequest r);

  IncidenciaResponse resolver(Long id, ResolverIncidenciaRequest r);
}
