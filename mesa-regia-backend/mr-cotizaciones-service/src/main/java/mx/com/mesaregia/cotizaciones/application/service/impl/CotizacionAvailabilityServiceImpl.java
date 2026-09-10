package mx.com.mesaregia.cotizaciones.application.service.impl;

import mx.com.mesaregia.cotizaciones.api.response.DisponibilidadResponse;
import mx.com.mesaregia.cotizaciones.application.service.CotizacionAvailabilityService;
import mx.com.mesaregia.cotizaciones.domain.enums.TipoConcepto;
import mx.com.mesaregia.cotizaciones.integration.client.InventarioAvailabilityPort;
import mx.com.mesaregia.cotizaciones.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional(readOnly = true)
public class CotizacionAvailabilityServiceImpl implements CotizacionAvailabilityService {
  private final CotizacionSupport s;
  private final CotizacionDetalleRepository dr;
  private final EventoRepository er;
  private final InventarioAvailabilityPort inv;

  public CotizacionAvailabilityServiceImpl(CotizacionSupport s, CotizacionDetalleRepository d, EventoRepository e,
      InventarioAvailabilityPort i) {
    this.s = s;
    dr = d;
    er = e;
    inv = i;
  }

  public DisponibilidadResponse consultar(Long c, Long v) {
    var ver = s.version(c, v);
    var ev = er.findByIdCotizacion(c).orElseThrow();
    var req = dr.findByIdCotizacionVersionOrderByOrdenAsc(ver.getId()).stream()
        .filter(x -> x.getTipoConcepto() == TipoConcepto.PRODUCTO)
        .map(x -> new InventarioAvailabilityPort.Solicitud(x.getIdConceptoExterno(), x.getCantidad())).toList();
    var out = inv.consultar(ev.getFechaEvento(), ev.getHoraEvento(), req);
    return new DisponibilidadResponse(c, v, out, "Disponibilidad informativa; no bloquea creación ni envío");
  }
}
