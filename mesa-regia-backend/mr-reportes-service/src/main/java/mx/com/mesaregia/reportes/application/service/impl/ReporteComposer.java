package mx.com.mesaregia.reportes.application.service.impl;

import mx.com.mesaregia.reportes.domain.enums.TipoReporte;
import mx.com.mesaregia.reportes.domain.model.FuenteReporteData;
import mx.com.mesaregia.reportes.domain.model.ReporteCriterios;
import mx.com.mesaregia.reportes.domain.model.ReporteResultado;
import mx.com.mesaregia.reportes.exception.ReporteValidationException;
import org.springframework.stereotype.Component;

import java.time.OffsetDateTime;

@Component
public class ReporteComposer {
  public void validar(ReporteCriterios criterios) {
    if (criterios.fechaInicio() != null && criterios.fechaFin() != null
        && criterios.fechaInicio().isAfter(criterios.fechaFin())) {
      throw new ReporteValidationException("fechaInicio no puede ser posterior a fechaFin");
    }
  }

  public ReporteResultado compose(TipoReporte tipo, ReporteCriterios criterios, FuenteReporteData data) {
    validar(criterios);
    return new ReporteResultado(tipo, OffsetDateTime.now(), criterios, data.fuente(), data.columnas(), data.filas());
  }
}
