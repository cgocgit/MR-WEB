package mx.com.mesaregia.ordenes;

import mx.com.mesaregia.ordenes.api.request.HitoRequest;
import mx.com.mesaregia.ordenes.application.service.impl.*;
import mx.com.mesaregia.ordenes.domain.entity.OrdenServicio;
import mx.com.mesaregia.ordenes.domain.enums.*;
import mx.com.mesaregia.ordenes.mapper.OrdenMapper;
import mx.com.mesaregia.ordenes.repository.*;
import mx.com.mesaregia.ordenes.integration.event.DomainEventPublisher;
import org.junit.jupiter.api.Test;
import static org.mockito.Mockito.*;
import java.util.*;

class OrdenStateServiceImplTest {
  @Test
  void programaOrdenPendiente() {
    var or = mock(OrdenServicioRepository.class);
    var dr = mock(OrdenDetalleRepository.class);
    var hr = mock(HistorialEstadoOrdenRepository.class);
    var ev = mock(DomainEventPublisher.class);
    var support = new OrdenSupport(or, dr, hr, ev);
    var mapper = new OrdenMapper();
    var svc = new OrdenStateServiceImpl(support, mapper);
    var o = new OrdenServicio();
    o.setId(1L);
    o.setFolio("OSMR-26-000001");
    o.setEstado(EstadoOrden.PENDIENTE_PROGRAMACION);
    o.setTipoCompromiso(TipoCompromiso.SERVICIOS);
    o.setVersion(1L);
    when(or.findById(1L)).thenReturn(Optional.of(o));
    when(hr.existsByOrdenServicio_IdAndAccion(anyLong(), anyString())).thenReturn(false);
    when(dr.findByOrdenServicio_IdOrderByOrdenVisualAscIdAsc(1L)).thenReturn(List.of());
    when(hr.findByOrdenServicio_IdOrderByFechaHoraAscIdAsc(1L)).thenReturn(List.of());
    svc.aplicarHito(1L, new HitoRequest(HitoOrden.PROGRAMACION_CONFIRMADA, 1L, null, null), "c1");
    org.junit.jupiter.api.Assertions.assertEquals(EstadoOrden.PROGRAMADA, o.getEstado());
  }
}
