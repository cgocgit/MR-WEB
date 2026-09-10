package mx.com.mesaregia.reportes.domain.enums;

import mx.com.mesaregia.reportes.exception.ReporteValidationException;

import java.util.Locale;

public enum TipoReporte {
  VENTAS("ventas"),
  CLIENTES("clientes"),
  COTIZACIONES("cotizaciones"),
  INVENTARIO("inventario");

  private final String path;

  TipoReporte(String path) {
    this.path = path;
  }

  public String path() {
    return path;
  }

  public static TipoReporte fromPath(String value) {
    if (value == null)
      throw new ReporteValidationException("El tipo de reporte es obligatorio");
    String normalized = value.trim().toLowerCase(Locale.ROOT);
    for (TipoReporte tipo : values())
      if (tipo.path.equals(normalized))
        return tipo;
    throw new ReporteValidationException("Tipo de reporte no permitido: " + value);
  }
}
