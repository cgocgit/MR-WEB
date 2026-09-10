package mx.com.mesaregia.reportes.domain.model;

import java.util.List;
import java.util.Map;

public record FuenteReporteData(String fuente, List<ReporteColumna> columnas, List<Map<String, Object>> filas) {
  public FuenteReporteData {
    columnas = columnas == null ? List.of() : List.copyOf(columnas);
    filas = filas == null ? List.of() : List.copyOf(filas);
  }
}
