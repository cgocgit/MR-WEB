package mx.com.mesaregia.reportes.domain.enums;

import mx.com.mesaregia.reportes.exception.ReporteValidationException;

import java.util.Locale;

public enum FormatoExportacion {
  PDF("application/pdf", "pdf"),
  XLSX("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", "xlsx"),
  CSV("text/csv; charset=UTF-8", "csv");

  private final String mediaType;
  private final String extension;

  FormatoExportacion(String mediaType, String extension) {
    this.mediaType = mediaType;
    this.extension = extension;
  }

  public String mediaType() {
    return mediaType;
  }

  public String extension() {
    return extension;
  }

  public static FormatoExportacion from(String value) {
    if (value == null || value.isBlank())
      throw new ReporteValidationException("El formato es obligatorio: PDF, XLSX o CSV");
    try {
      return valueOf(value.trim().toUpperCase(Locale.ROOT));
    } catch (IllegalArgumentException ex) {
      throw new ReporteValidationException("Formato no permitido: " + value);
    }
  }
}
