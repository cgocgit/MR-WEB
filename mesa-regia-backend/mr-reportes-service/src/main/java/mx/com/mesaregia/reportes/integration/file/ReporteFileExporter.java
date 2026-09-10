package mx.com.mesaregia.reportes.integration.file;

import mx.com.mesaregia.reportes.domain.enums.FormatoExportacion;
import mx.com.mesaregia.reportes.domain.model.ReporteResultado;

public interface ReporteFileExporter {
  FormatoExportacion formato();

  byte[] exportar(ReporteResultado reporte);
}
