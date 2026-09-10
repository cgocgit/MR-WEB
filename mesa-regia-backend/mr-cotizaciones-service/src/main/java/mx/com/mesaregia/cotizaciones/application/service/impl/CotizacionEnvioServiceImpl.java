package mx.com.mesaregia.cotizaciones.application.service.impl;

import mx.com.mesaregia.cotizaciones.api.request.EnvioRequest;
import mx.com.mesaregia.cotizaciones.api.response.EnvioResponse;
import mx.com.mesaregia.cotizaciones.application.service.CotizacionEnvioService;
import mx.com.mesaregia.cotizaciones.domain.entity.EnvioCotizacion;
import mx.com.mesaregia.cotizaciones.domain.enums.*;
import mx.com.mesaregia.cotizaciones.exception.*;
import mx.com.mesaregia.cotizaciones.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class CotizacionEnvioServiceImpl implements CotizacionEnvioService {
  private final CotizacionSupport s;
  private final CotizacionVersionRepository vr;
  private final CotizacionDetalleRepository dr;
  private final EnvioCotizacionRepository er;
  private final CotizacionRepository cr;

  public CotizacionEnvioServiceImpl(CotizacionSupport s, CotizacionVersionRepository v, CotizacionDetalleRepository d,
      EnvioCotizacionRepository e, CotizacionRepository c) {
    this.s = s;
    vr = v;
    dr = d;
    er = e;
    cr = c;
  }

  @Transactional
  public EnvioResponse registrarEnvio(Long c, Long v, EnvioRequest r) {
    var q = s.get(c);
    var ver = s.version(c, v);
    if (ver.getEstadoVersion() != EstadoVersion.BORRADOR)
      throw new ConflictException("La versión ya fue enviada");
    if (dr.findByIdCotizacionVersionOrderByOrdenAsc(v).isEmpty())
      throw new BusinessRuleException("La versión debe contener al menos un concepto");
    ver.setEstadoVersion(EstadoVersion.ENVIADA);
    vr.saveAndFlush(ver);
    if (q.getEstadoGeneral() != EstadoCotizacion.CONFIRMADA) {
      q.setEstadoGeneral(EstadoCotizacion.EN_SEGUIMIENTO);
      q = cr.saveAndFlush(q);
    }
    var e = new EnvioCotizacion();
    e.setIdCotizacionVersion(v);
    e.setMedio(r.medio());
    e.setDestinatario(r.destinatario());
    e.setReferenciaEnvio(r.referenciaEnvio());
    e.setResultado(ResultadoEnvio.ENVIADO);
    e.setIdUsuarioExterno(r.idUsuario());
    e = er.save(e);
    s.history(c, v, "VERSION_ENVIADA", EstadoVersion.BORRADOR.name(), EstadoVersion.ENVIADA.name(), null,
        r.idUsuario());
    return new EnvioResponse(e.getId(), v, e.getResultado().name(), e.getFechaHoraEnvio(), e.getReferenciaEnvio());
  }
}
