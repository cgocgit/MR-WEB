package mx.com.mesaregia.seguridad.application.service;

import mx.com.mesaregia.seguridad.api.response.*;
import org.springframework.data.domain.Pageable;
import java.time.LocalDateTime;

public interface AuditoriaService {
  PageResponse<AuditoriaResponse> buscar(LocalDateTime desde, LocalDateTime hasta, Long idUsuario, String modulo,
      String accion, String correlacion, Pageable pageable);

  void registrar(String modulo, String accion, String tipoRecurso, String identificador, String motivo, Object anterior,
      Object nuevo, String detalle);
}
