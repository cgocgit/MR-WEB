package mx.com.mesaregia.reportes.integration.port;

import mx.com.mesaregia.reportes.domain.model.FuenteReporteData;
import mx.com.mesaregia.reportes.domain.model.ReporteCriterios;

public interface InventarioReportSourcePort {
  FuenteReporteData consultar(ReporteCriterios criterios);
}
