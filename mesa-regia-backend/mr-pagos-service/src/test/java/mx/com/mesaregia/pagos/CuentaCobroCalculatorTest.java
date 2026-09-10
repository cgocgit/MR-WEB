package mx.com.mesaregia.pagos;

import mx.com.mesaregia.pagos.application.service.impl.CuentaCobroCalculator;
import mx.com.mesaregia.pagos.domain.entity.CuentaCobro;
import mx.com.mesaregia.pagos.domain.enums.NaturalezaMovimiento;
import mx.com.mesaregia.pagos.repository.MovimientoCuentaRepository;
import org.junit.jupiter.api.*;
import java.math.BigDecimal;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class CuentaCobroCalculatorTest {
  @Test
  void calculaAcumuladoYSaldos() {
    var r = mock(MovimientoCuentaRepository.class);
    when(r.totalNaturaleza(1L, NaturalezaMovimiento.ABONO)).thenReturn(new BigDecimal("4000.00"));
    when(r.totalNaturaleza(1L, NaturalezaMovimiento.CARGO)).thenReturn(new BigDecimal("500.00"));
    var c = new CuentaCobro();
    c.setId(1L);
    c.setImporteTotal(new BigDecimal("10000.00"));
    c.setPorcentajeConfirmacion(new BigDecimal("30.00"));
    var t = new CuentaCobroCalculator(r).calcular(c);
    assertEquals(new BigDecimal("3500.00"), t.acumuladoNeto());
    assertEquals(new BigDecimal("3000.0000"), t.importeRequerido());
    assertEquals(BigDecimal.ZERO, t.saldoConfirmar());
    assertEquals(new BigDecimal("6500.00"), t.saldoLiquidar());
  }
}
