package mx.com.mesaregia.reportes.application.service;

import mx.com.mesaregia.reportes.domain.model.ReporteCriterios;
import mx.com.mesaregia.reportes.domain.model.ReporteResultado;

public interface ReporteClientesService {
    ReporteResultado generar(ReporteCriterios criterios);
}
