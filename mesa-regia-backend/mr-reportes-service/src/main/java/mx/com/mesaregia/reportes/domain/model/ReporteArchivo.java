package mx.com.mesaregia.reportes.domain.model;

public record ReporteArchivo(byte[] contenido, String mediaType, String nombreArchivo) { }
