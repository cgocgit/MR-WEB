package mx.com.mesaregia.reportes.domain.model;

import java.time.LocalDate;
import java.util.Collections;
import java.util.LinkedHashMap;
import java.util.Map;

public record ReporteCriterios(LocalDate fechaInicio, LocalDate fechaFin, Map<String, String> filtros) {
  public ReporteCriterios {
    filtros = filtros == null ? Map.of() : Collections.unmodifiableMap(new LinkedHashMap<>(filtros));
  }
}
