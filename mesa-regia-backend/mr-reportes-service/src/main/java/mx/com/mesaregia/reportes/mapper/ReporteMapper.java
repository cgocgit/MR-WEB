package mx.com.mesaregia.reportes.mapper;

import mx.com.mesaregia.reportes.api.response.ReporteResponse;
import mx.com.mesaregia.reportes.domain.model.ReporteResultado;
import org.springframework.stereotype.Component;

@Component
public class ReporteMapper {
  public ReporteResponse toResponse(ReporteResultado r) {
    return new ReporteResponse(
        r.tipo(), r.fechaCorte(), r.criterios().fechaInicio(), r.criterios().fechaFin(), r.criterios().filtros(),
        r.fuente(), r.filas().size(), r.columnas(), r.filas());
  }
}
