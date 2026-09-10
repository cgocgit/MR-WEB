package mx.com.mesaregia.pagos.application.service.impl;

import mx.com.mesaregia.pagos.api.request.PagoCreateRequest;
import mx.com.mesaregia.pagos.application.service.PagoCoverageService;
import mx.com.mesaregia.pagos.domain.entity.*;
import mx.com.mesaregia.pagos.domain.enums.*;
import mx.com.mesaregia.pagos.exception.*;
import mx.com.mesaregia.pagos.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class PagoWriteService {
  private final CuentaCobroRepository cuentas;
  private final PagoRepository pagos;
  private final AplicacionPagoRepository apps;
  private final MovimientoCuentaRepository movs;
  private final FolioService folios;
  private final PagoCoverageService coverage;

  public PagoWriteService(CuentaCobroRepository c, PagoRepository p, AplicacionPagoRepository a,
      MovimientoCuentaRepository m, FolioService f, PagoCoverageService pc) {
    cuentas = c;
    pagos = p;
    apps = a;
    movs = m;
    folios = f;
    coverage = pc;
  }

  @Transactional
  public Resultado registrar(Long idCuenta, String key, PagoCreateRequest r) {
    var prev = pagos.findByClaveOperacion(key);
    if (prev.isPresent())
      return new Resultado(prev.get().getId(), false, true);
    var cuenta = cuentas.findForUpdate(idCuenta)
        .orElseThrow(() -> new ResourceNotFoundException("Cuenta de cobro no encontrada"));
    if (cuenta.getEstado() == EstadoCuentaCobro.CANCELADA)
      throw new ConflictException("La cuenta de cobro está cancelada");
    var p = new Pago();
    p.setFolio(folios.generar("PAG"));
    p.setFechaPago(r.fechaPago());
    p.setMonto(r.monto());
    p.setMetodoPago(r.metodoPago());
    p.setReferenciaPago(r.referenciaPago());
    p.setObservaciones(r.observaciones());
    p.setClaveOperacion(key);
    p.setIdUsuarioExterno(r.idUsuarioExterno());
    p = pagos.saveAndFlush(p);
    var a = new AplicacionPago();
    a.setPago(p);
    a.setCuentaCobro(cuenta);
    a.setMontoAplicado(r.monto());
    apps.saveAndFlush(a);
    var m = new MovimientoCuenta();
    m.setCuentaCobro(cuenta);
    m.setPago(p);
    m.setFolio(folios.generar("MOV"));
    m.setTipoMovimiento(TipoMovimientoCuenta.PAGO);
    m.setNaturaleza(NaturalezaMovimiento.ABONO);
    m.setMonto(r.monto());
    m.setIdUsuarioExterno(r.idUsuarioExterno());
    m.setDescripcion(r.observaciones());
    movs.saveAndFlush(m);
    boolean ev = coverage.evaluarYPublicar(cuenta, p);
    return new Resultado(p.getId(), ev, false);
  }

  public record Resultado(Long idPago, boolean eventoGenerado, boolean idempotente) {
  }
}
