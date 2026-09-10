package mx.com.mesaregia.pagos.application.service.impl;

import mx.com.mesaregia.pagos.domain.entity.CuentaCobro;
import mx.com.mesaregia.pagos.domain.enums.NaturalezaMovimiento;
import mx.com.mesaregia.pagos.repository.MovimientoCuentaRepository;
import org.springframework.stereotype.Component;
import java.math.*;

@Component
public class CuentaCobroCalculator {
  private static final BigDecimal CIEN = new BigDecimal("100");
  private final MovimientoCuentaRepository repo;

  public CuentaCobroCalculator(MovimientoCuentaRepository r) {
    this.repo = r;
  }

  public Totales calcular(CuentaCobro c) {
    BigDecimal abono = n(repo.totalNaturaleza(c.getId(), NaturalezaMovimiento.ABONO));
    BigDecimal cargo = n(repo.totalNaturaleza(c.getId(), NaturalezaMovimiento.CARGO));
    BigDecimal neto = abono.subtract(cargo);
    BigDecimal req = c.getImporteTotal().multiply(c.getPorcentajeConfirmacion()).divide(CIEN);
    BigDecimal sConf = max(req.subtract(neto), BigDecimal.ZERO);
    BigDecimal sLiq = max(c.getImporteTotal().subtract(neto), BigDecimal.ZERO);
    BigDecimal exc = max(neto.subtract(c.getImporteTotal()), BigDecimal.ZERO);
    BigDecimal pct = c.getImporteTotal().signum() == 0 ? (neto.signum() > 0 ? new BigDecimal("100") : BigDecimal.ZERO)
        : neto.divide(c.getImporteTotal(), 4, RoundingMode.HALF_UP).multiply(CIEN).setScale(2, RoundingMode.HALF_UP);
    return new Totales(abono, cargo, neto, req, sConf, sLiq, exc, pct);
  }

  private BigDecimal n(BigDecimal v) {
    return v == null ? BigDecimal.ZERO : v;
  }

  private BigDecimal max(BigDecimal a, BigDecimal b) {
    return a.compareTo(b) >= 0 ? a : b;
  }

  public record Totales(BigDecimal acumuladoBruto, BigDecimal totalCompensado, BigDecimal acumuladoNeto,
      BigDecimal importeRequerido, BigDecimal saldoConfirmar, BigDecimal saldoLiquidar, BigDecimal excedente,
      BigDecimal porcentajeCubierto) {
  }
}
