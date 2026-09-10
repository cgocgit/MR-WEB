package mx.com.mesaregia.logistica.application.service.impl;

import mx.com.mesaregia.logistica.api.response.RutaResponse;
import mx.com.mesaregia.logistica.application.service.RutaLogisticaQueryService;
import mx.com.mesaregia.logistica.exception.ResourceNotFoundException;
import mx.com.mesaregia.logistica.mapper.LogisticaMapper;
import mx.com.mesaregia.logistica.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class RutaLogisticaQueryServiceImpl implements RutaLogisticaQueryService {
  private final ProgramacionLogisticaRepository repo;
  private final AsignacionLogisticaRepository asig;
  private final EtapaLogisticaRepository etapas;
  private final LogisticaMapper map;

  public RutaLogisticaQueryServiceImpl(ProgramacionLogisticaRepository r, AsignacionLogisticaRepository a,
      EtapaLogisticaRepository e, LogisticaMapper m) {
    repo = r;
    asig = a;
    etapas = e;
    map = m;
  }

  @Transactional(readOnly = true)
  public RutaResponse detalle(Long id) {
    var p = repo.findById(id).orElseThrow(() -> new ResourceNotFoundException("Programación no encontrada"));
    return map.ruta(p, asig.findAllByProgramacionIdOrderByOrdenParadaAsc(id),
        etapas.findAllByProgramacionIdOrderByOrdenEtapaAsc(id));
  }
}
