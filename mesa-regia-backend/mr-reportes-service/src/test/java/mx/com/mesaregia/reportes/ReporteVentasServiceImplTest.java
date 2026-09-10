package mx.com.mesaregia.reportes;

import mx.com.mesaregia.reportes.application.service.impl.ReporteComposer;
import mx.com.mesaregia.reportes.application.service.impl.ReporteVentasServiceImpl;
import mx.com.mesaregia.reportes.domain.model.FuenteReporteData;
import mx.com.mesaregia.reportes.domain.model.ReporteColumna;
import mx.com.mesaregia.reportes.domain.model.ReporteCriterios;
import mx.com.mesaregia.reportes.exception.ReporteValidationException;
import mx.com.mesaregia.reportes.integration.port.ReportGenerationAuditPort;
import mx.com.mesaregia.reportes.integration.port.VentasReportSourcePort;
import org.junit.jupiter.api.Test;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.*;

class ReporteVentasServiceImplTest {
  @Test
  void generaVistaConFechaCorteYDatosDeLaFuente() {
    VentasReportSourcePort source = mock(VentasReportSourcePort.class);
    ReportGenerationAuditPort audit = mock(ReportGenerationAuditPort.class);
    var criterios = new ReporteCriterios(LocalDate.of(2026, 9, 1), LocalDate.of(2026, 9, 9),
        Map.of("estado", "CONFIRMADA"));
    when(source.consultar(criterios)).thenReturn(new FuenteReporteData("Cotizaciones/Pagos",
        List.of(new ReporteColumna("folio", "Folio")), List.of(Map.of("folio", "COT-1"))));
    var service = new ReporteVentasServiceImpl(source, new ReporteComposer(), audit);
    var result = service.generar(criterios);
    assertThat(result.filas()).hasSize(1);
    assertThat(result.fuente()).isEqualTo("Cotizaciones/Pagos");
    assertThat(result.fechaCorte()).isNotNull();
    verify(audit).registrar(result, null);
  }

  @Test
  void rechazaPeriodoInvertido() {
    var service = new ReporteVentasServiceImpl(mock(VentasReportSourcePort.class), new ReporteComposer(),
        mock(ReportGenerationAuditPort.class));
    var criterios = new ReporteCriterios(LocalDate.of(2026, 9, 10), LocalDate.of(2026, 9, 1), Map.of());
    assertThatThrownBy(() -> service.generar(criterios)).isInstanceOf(ReporteValidationException.class);
  }
}
