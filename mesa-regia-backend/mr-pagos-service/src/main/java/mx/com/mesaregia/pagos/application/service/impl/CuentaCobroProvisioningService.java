package mx.com.mesaregia.pagos.application.service.impl;

import mx.com.mesaregia.pagos.domain.entity.CuentaCobro;
import mx.com.mesaregia.pagos.exception.BusinessRuleException;
import mx.com.mesaregia.pagos.integration.client.CotizacionPaymentContextPort;
import mx.com.mesaregia.pagos.repository.CuentaCobroRepository;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;

@Service
public class CuentaCobroProvisioningService {
  private final CuentaCobroRepository repo;
  private final CotizacionPaymentContextPort port;
  private final CuentaCobroWriter writer;

  public CuentaCobroProvisioningService(CuentaCobroRepository r, CotizacionPaymentContextPort p, CuentaCobroWriter w) {
    repo = r;
    port = p;
    writer = w;
  }

  public CuentaCobro obtenerOCrear(Long c, Long v) {
    var e = repo.findByIdCotizacionExternoAndIdCotizacionVersionExterno(c, v);
    if (e.isPresent())
      return e.get();
    var ctx = port.obtener(c, v);
    if (!ctx.versionElegida())
      throw new BusinessRuleException("El pago debe asociarse con la versión elegida de la cotización");
    try {
      return writer.crear(ctx);
    } catch (DataIntegrityViolationException ex) {
      return repo.findByIdCotizacionExternoAndIdCotizacionVersionExterno(c, v).orElseThrow(() -> ex);
    }
  }
}
