package mx.com.mesaregia.logistica.application.service;

import mx.com.mesaregia.logistica.api.response.*;
import mx.com.mesaregia.logistica.domain.enums.EstadoProgramacion;
import org.springframework.data.domain.Pageable;
import java.time.LocalDateTime;

public interface ProgramacionLogisticaQueryService {
  PageResponse<ProgramacionResponse> buscar(EstadoProgramacion estado, LocalDateTime desde, LocalDateTime hasta,
      Pageable pageable);

  ProgramacionResponse obtener(Long id);
}
