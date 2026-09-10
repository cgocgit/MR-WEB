package mx.com.mesaregia.logistica.application.service.impl;

import mx.com.mesaregia.logistica.api.response.*;
import mx.com.mesaregia.logistica.application.service.ProgramacionLogisticaQueryService;
import mx.com.mesaregia.logistica.domain.enums.EstadoProgramacion;
import mx.com.mesaregia.logistica.exception.ResourceNotFoundException;
import mx.com.mesaregia.logistica.mapper.LogisticaMapper;
import mx.com.mesaregia.logistica.repository.*;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;

@Service
public class ProgramacionLogisticaQueryServiceImpl implements ProgramacionLogisticaQueryService {
  private final ProgramacionLogisticaRepository repo;
  private final AsignacionLogisticaRepository asig;
  private final EtapaLogisticaRepository etapas;
  private final LogisticaMapper map;

  public ProgramacionLogisticaQueryServiceImpl(ProgramacionLogisticaRepository r, AsignacionLogisticaRepository a,
      EtapaLogisticaRepository e, LogisticaMapper m) {
    repo = r;
    asig = a;
    etapas = e;
    map = m;
  }

  @Transactional(readOnly = true)
  public PageResponse<ProgramacionResponse> buscar(EstadoProgramacion estado, LocalDateTime desde, LocalDateTime hasta,
      Pageable p) {
    if (desde != null && hasta != null && desde.isAfter(hasta))
      throw new mx.com.mesaregia.logistica.exception.BusinessRuleException("El rango de fechas es inválido");
    var page = repo.buscar(estado, desde, hasta, p)
        .map(x -> map.programacion(x, asig.findAllByProgramacionIdOrderByOrdenParadaAsc(x.getId()),
            etapas.findAllByProgramacionIdOrderByOrdenEtapaAsc(x.getId())));
    return PageResponse.of(page);
  }

  @Transactional(readOnly = true)
  public ProgramacionResponse obtener(Long id) {
    var p = repo.findById(id).orElseThrow(() -> new ResourceNotFoundException("Programación no encontrada"));
    return map.programacion(p, asig.findAllByProgramacionIdOrderByOrdenParadaAsc(id),
        etapas.findAllByProgramacionIdOrderByOrdenEtapaAsc(id));
  }
}
