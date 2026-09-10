package mx.com.mesaregia.reportes.integration.file;

import mx.com.mesaregia.reportes.domain.model.ReporteResultado;

import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.List;

final class ReporteFileSupport {
  private ReporteFileSupport() {
  }

  static String value(Object v) {
    return v == null ? "" : String.valueOf(v);
  }

  static List<List<String>> rows(ReporteResultado reporte) {
    List<List<String>> out = new ArrayList<>();
    out.add(List.of("Reporte", reporte.tipo().name()));
    out.add(List.of("Fecha de corte", reporte.fechaCorte().toString()));
    out.add(List.of("Periodo inicio", value(reporte.criterios().fechaInicio())));
    out.add(List.of("Periodo fin", value(reporte.criterios().fechaFin())));
    if (!reporte.criterios().filtros().isEmpty())
      out.add(List.of("Filtros", reporte.criterios().filtros().toString()));
    out.add(List.of());
    out.add(reporte.columnas().stream().map(c -> c.titulo()).toList());
    for (var fila : reporte.filas()) {
      out.add(reporte.columnas().stream().map(c -> value(fila.get(c.clave()))).toList());
    }
    return out;
  }

  static String xml(String s) {
    if (s == null)
      return "";
    return s.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;").replace("\"", "&quot;").replace("'",
        "&apos;");
  }

  static String pdfEscape(String s) {
    if (s == null)
      return "";
    return s.replace("\\", "\\\\").replace("(", "\\(").replace(")", "\\)")
        .replace("\r", " ").replace("\n", " ");
  }

  static byte[] cp1252(String s) {
    return s.getBytes(java.nio.charset.Charset.forName("windows-1252"));
  }
}
