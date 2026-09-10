package mx.com.mesaregia.ordenes.application.service.impl;

import mx.com.mesaregia.ordenes.api.response.*;
import mx.com.mesaregia.ordenes.application.service.OrdenQueryService;
import mx.com.mesaregia.ordenes.domain.entity.OrdenServicio;
import mx.com.mesaregia.ordenes.domain.enums.*;
import mx.com.mesaregia.ordenes.mapper.OrdenMapper;
import org.springframework.data.domain.*;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.*;

@Service
public class OrdenQueryServiceImpl implements OrdenQueryService {
  private final OrdenSupport s;
  private final OrdenMapper m;

  public OrdenQueryServiceImpl(OrdenSupport s, OrdenMapper m) {
    this.s = s;
    this.m = m;
  }

  @Transactional(readOnly = true)
  public PageResponse<OrdenListItemResponse> buscar(String texto, Long cot, Long cliente, EstadoOrden estado,
      TipoCompromiso tipo, LocalDate desde, LocalDate hasta, int page, int size) {
    Specification<OrdenServicio> sp = Specification.where(null);
    if (texto != null && !texto.isBlank()) {
      String q = "%" + texto.toLowerCase() + "%";
      sp = sp.and((r, c, b) -> b.or(b.like(b.lower(r.get("folio")), q), b.like(b.lower(r.get("clienteSnapshot")), q),
          b.like(b.lower(r.get("contactoSnapshot")), q), b.like(b.lower(r.get("eventoSnapshot")), q)));
    }
    if (cot != null)
      sp = sp.and((r, c, b) -> b.equal(r.get("idCotizacionExterno"), cot));
    if (cliente != null)
      sp = sp.and((r, c, b) -> b.equal(r.get("idClienteProspectoExterno"), cliente));
    if (estado != null)
      sp = sp.and((r, c, b) -> b.equal(r.get("estado"), estado));
    if (tipo != null)
      sp = sp.and((r, c, b) -> b.equal(r.get("tipoCompromiso"), tipo));
    if (desde != null)
      sp = sp.and((r, c, b) -> b.greaterThanOrEqualTo(r.get("fechaHoraEventoSnapshot"), desde.atStartOfDay()));
    if (hasta != null)
      sp = sp.and((r, c, b) -> b.lessThan(r.get("fechaHoraEventoSnapshot"), hasta.plusDays(1).atStartOfDay()));
    var p = s.orders().findAll(sp, PageRequest.of(page, size, Sort.by(Sort.Direction.ASC, "fechaHoraEventoSnapshot")));
    return new PageResponse<>(p.map(m::list).getContent(), page, size, p.getTotalElements(), p.getTotalPages());
  }

  @Transactional(readOnly = true)
  public OrdenResponse detalle(Long id) {
    var o = s.get(id);
    return m.full(o, s.details().findByOrdenServicio_IdOrderByOrdenVisualAscIdAsc(id),
        s.historyRepo().findByOrdenServicio_IdOrderByFechaHoraAscIdAsc(id));
  }
}
