package mx.com.mesaregia.cotizaciones.integration.dto;

public record ClienteContext(Long id, String nombreCompleto, String contactoPrincipal, boolean activo, String estado) {
}
