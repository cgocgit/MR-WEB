package mx.com.mesaregia.reportes.api.response;

import mx.com.mesaregia.reportes.domain.enums.TipoReporte;
import mx.com.mesaregia.reportes.domain.model.ReporteColumna;

import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.Map;

public record ReporteResponse(
    TipoReporte tipo,
    OffsetDateTime fechaCorte,
    LocalDate fechaInicio,
    LocalDate fechaFin,
    Map<String, String> filtros,
    String fuente,
    int totalRegistros,
    List<ReporteColumna> columnas,
    List<Map<String, Object>> filas) {
}
