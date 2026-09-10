package mx.com.mesaregia.reportes.application.service;

import mx.com.mesaregia.reportes.domain.model.ReporteCriterios;
import mx.com.mesaregia.reportes.domain.model.ReporteResultado;

public interface ReporteInventarioService {
  ReporteResultado generar(ReporteCriterios criterios);
}
