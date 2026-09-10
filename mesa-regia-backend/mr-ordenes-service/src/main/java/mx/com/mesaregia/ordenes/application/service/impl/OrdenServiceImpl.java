package mx.com.mesaregia.ordenes.application.service.impl;

import mx.com.mesaregia.ordenes.api.request.*;
import mx.com.mesaregia.ordenes.api.response.OrdenResponse;
import mx.com.mesaregia.ordenes.application.service.OrdenService;
import mx.com.mesaregia.ordenes.domain.enums.EstadoOrden;
import mx.com.mesaregia.ordenes.exception.BusinessRuleException;
import mx.com.mesaregia.ordenes.mapper.OrdenMapper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class OrdenServiceImpl implements OrdenService {
  private final OrdenSupport s;
  private final OrdenMapper m;

  public OrdenServiceImpl(OrdenSupport s, OrdenMapper m) {
    this.s = s;
    this.m = m;
  }

  @Transactional
  public OrdenResponse registrarRevisionVentas(Long id, RevisionRequest r) {
    var o = s.get(id);
    s.version(o, r.version());
    if (o.getEstado() != EstadoOrden.EN_REVISION_VENTAS)
      throw new BusinessRuleException("La revisión solo aplica en EN_REVISION_VENTAS");
    if (!s.has(id, "REVISION_VENTAS_CONFIRMADA"))
      s.history(o, EstadoOrden.EN_REVISION_VENTAS, EstadoOrden.EN_REVISION_VENTAS, "REVISION_VENTAS_CONFIRMADA",
          r.comentario(), r.idUsuario());
    return response(o);
  }

  @Transactional
  public OrdenResponse liberarProgramacion(Long id, LiberacionRequest r) {
    var o = s.get(id);
    s.version(o, r.version());
    if (o.getEstado() != EstadoOrden.EN_REVISION_VENTAS)
      throw new BusinessRuleException("La Orden no está en revisión de Ventas");
    if (!s.has(id, "REVISION_VENTAS_CONFIRMADA"))
      throw new BusinessRuleException("Debe registrar la revisión de Ventas antes de liberar la Orden");
    s.change(o, EstadoOrden.PENDIENTE_PROGRAMACION, "LIBERADA_A_PROGRAMACION", r.comentario(), r.idUsuario(), null);
    return response(o);
  }

  private OrdenResponse response(mx.com.mesaregia.ordenes.domain.entity.OrdenServicio o) {
    return m.full(o, s.details().findByOrdenServicio_IdOrderByOrdenVisualAscIdAsc(o.getId()),
        s.historyRepo().findByOrdenServicio_IdOrderByFechaHoraAscIdAsc(o.getId()));
  }
}
