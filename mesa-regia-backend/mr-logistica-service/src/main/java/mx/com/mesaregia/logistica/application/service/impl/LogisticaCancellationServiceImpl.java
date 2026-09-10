package mx.com.mesaregia.logistica.application.service.impl;

import mx.com.mesaregia.logistica.application.service.LogisticaCancellationService;
import mx.com.mesaregia.logistica.domain.enums.*;
import mx.com.mesaregia.logistica.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class LogisticaCancellationServiceImpl implements LogisticaCancellationService {
  private final AsignacionLogisticaRepository asig;
  private final ProgramacionLogisticaRepository prog;

  public LogisticaCancellationServiceImpl(AsignacionLogisticaRepository a, ProgramacionLogisticaRepository p) {
    asig = a;
    prog = p;
  }

  @Transactional
  public void cancelarPorOrden(Long idOrden) {
    var xs = asig.findAllByIdOrdenExternoAndEstadoNot(idOrden, EstadoAsignacion.CANCELADA);
    for (var a : xs) {
      a.setEstado(EstadoAsignacion.CANCELADA);
      var p = a.getProgramacion();
      asig.save(a);
      boolean ninguna = asig.findAllByProgramacionIdOrderByOrdenParadaAsc(p.getId()).stream()
          .noneMatch(x -> x.getEstado() != EstadoAsignacion.CANCELADA);
      if (ninguna) {
        p.setEstado(EstadoProgramacion.CANCELADA);
        prog.save(p);
      }
    }
  }
}
