package mx.com.mesaregia.reportes.application.service;

import mx.com.mesaregia.reportes.domain.model.ReporteCriterios;
import mx.com.mesaregia.reportes.domain.model.ReporteResultado;

public interface ReporteCotizacionesService {
    ReporteResultado generar(ReporteCriterios criterios);
}
