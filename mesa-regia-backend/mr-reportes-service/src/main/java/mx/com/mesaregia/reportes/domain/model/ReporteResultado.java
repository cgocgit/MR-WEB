package mx.com.mesaregia.reportes.domain.model;

import mx.com.mesaregia.reportes.domain.enums.TipoReporte;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Map;

public record ReporteResultado(
        TipoReporte tipo,
        OffsetDateTime fechaCorte,
        ReporteCriterios criterios,
        String fuente,
        List<ReporteColumna> columnas,
        List<Map<String, Object>> filas) {
    public ReporteResultado {
        columnas = columnas == null ? List.of() : List.copyOf(columnas);
        filas = filas == null ? List.of() : List.copyOf(filas);
    }
}
