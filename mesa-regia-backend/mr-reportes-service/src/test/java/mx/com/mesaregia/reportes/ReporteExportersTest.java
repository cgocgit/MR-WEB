package mx.com.mesaregia.reportes;

import mx.com.mesaregia.reportes.domain.enums.TipoReporte;
import mx.com.mesaregia.reportes.domain.model.*;
import mx.com.mesaregia.reportes.integration.file.CsvReporteExporter;
import mx.com.mesaregia.reportes.integration.file.PdfReporteExporter;
import mx.com.mesaregia.reportes.integration.file.XlsxReporteExporter;
import org.junit.jupiter.api.Test;

import java.nio.charset.StandardCharsets;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;

class ReporteExportersTest {
  private ReporteResultado sample() {
    return new ReporteResultado(TipoReporte.CLIENTES, OffsetDateTime.now(), new ReporteCriterios(null, null, Map.of()),
        "Clientes", List.of(new ReporteColumna("nombre", "Nombre")), List.of(Map.of("nombre", "Cliente Uno")));
  }

  @Test
  void csvEsDescargable() {
    byte[] data = new CsvReporteExporter().exportar(sample());
    assertThat(new String(data, StandardCharsets.UTF_8)).contains("Cliente Uno");
  }

  @Test
  void xlsxTieneFirmaZip() {
    byte[] data = new XlsxReporteExporter().exportar(sample());
    assertThat(data).startsWith((byte) 'P', (byte) 'K');
  }

  @Test
  void pdfTieneFirmaPdf() {
    byte[] data = new PdfReporteExporter().exportar(sample());
    assertThat(new String(data, 0, 5, StandardCharsets.ISO_8859_1)).isEqualTo("%PDF-");
  }
}
