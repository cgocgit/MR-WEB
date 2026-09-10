package mx.com.mesaregia.reportes.application.service;

import mx.com.mesaregia.reportes.domain.enums.FormatoExportacion;
import mx.com.mesaregia.reportes.domain.enums.TipoReporte;
import mx.com.mesaregia.reportes.domain.model.ReporteArchivo;
import mx.com.mesaregia.reportes.domain.model.ReporteCriterios;

public interface ReporteExportService {
  ReporteArchivo exportar(TipoReporte tipo, FormatoExportacion formato, ReporteCriterios criterios);
}
