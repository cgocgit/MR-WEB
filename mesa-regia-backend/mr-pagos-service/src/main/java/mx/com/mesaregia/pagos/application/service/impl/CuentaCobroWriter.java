package mx.com.mesaregia.pagos.application.service.impl;

import mx.com.mesaregia.pagos.domain.entity.CuentaCobro;
import mx.com.mesaregia.pagos.domain.enums.EstadoCuentaCobro;
import mx.com.mesaregia.pagos.integration.dto.CotizacionPaymentContext;
import mx.com.mesaregia.pagos.repository.CuentaCobroRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class CuentaCobroWriter {
  private final CuentaCobroRepository repo;

  public CuentaCobroWriter(CuentaCobroRepository r) {
    repo = r;
  }

  @Transactional
  public CuentaCobro crear(CotizacionPaymentContext x) {
    var c = new CuentaCobro();
    c.setIdCotizacionExterno(x.idCotizacion());
    c.setIdCotizacionVersionExterno(x.idCotizacionVersion());
    c.setIdClienteExterno(x.idCliente());
    c.setFolioCotizacionSnapshot(x.folioCotizacion());
    c.setNumeroVersionSnapshot(x.numeroVersion());
    c.setNombreClienteSnapshot(x.nombreCliente());
    c.setImporteTotal(x.importeTotal());
    c.setPorcentajeConfirmacion(x.porcentajeConfirmacion());
    c.setEstado(EstadoCuentaCobro.ABIERTA);
    return repo.saveAndFlush(c);
  }
}
