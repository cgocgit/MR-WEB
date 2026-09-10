package mx.com.mesaregia.ordenes.application.service.impl;

import mx.com.mesaregia.ordenes.api.request.CancelacionRequest;
import mx.com.mesaregia.ordenes.api.response.OrdenResponse;
import mx.com.mesaregia.ordenes.application.service.OrdenCancellationOrchestrator;
import mx.com.mesaregia.ordenes.domain.enums.EstadoOrden;
import mx.com.mesaregia.ordenes.exception.BusinessRuleException;
import mx.com.mesaregia.ordenes.integration.client.*;
import mx.com.mesaregia.ordenes.mapper.OrdenMapper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class OrdenCancellationOrchestratorImpl implements OrdenCancellationOrchestrator {
  private final OrdenSupport s;
  private final OrdenMapper m;
  private final InventarioCancellationPort inv;
  private final LogisticaCancellationPort log;

  public OrdenCancellationOrchestratorImpl(OrdenSupport s, OrdenMapper m, InventarioCancellationPort inv,
      LogisticaCancellationPort log) {
    this.s = s;
    this.m = m;
    this.inv = inv;
    this.log = log;
  }

  @Transactional
  public OrdenResponse cancelar(Long id, CancelacionRequest r, String corr) {
    var o = s.get(id);
    s.version(o, r.version());
    if (o.getEstado() == EstadoOrden.CANCELADA)
      return response(o);
    if (o.getEstado() == EstadoOrden.REALIZADA)
      throw new BusinessRuleException("Una Orden realizada no puede cancelarse");
    inv.liberarReserva(id, r.motivo(), corr);
    log.cancelarOrden(id, r.motivo(), corr);
    s.change(o, EstadoOrden.CANCELADA, "ORDEN_CANCELADA", r.motivo(), r.idUsuario(), corr);
    return response(o);
  }

  private OrdenResponse response(mx.com.mesaregia.ordenes.domain.entity.OrdenServicio o) {
    return m.full(o, s.details().findByOrdenServicio_IdOrderByOrdenVisualAscIdAsc(o.getId()),
        s.historyRepo().findByOrdenServicio_IdOrderByFechaHoraAscIdAsc(o.getId()));
  }
}
