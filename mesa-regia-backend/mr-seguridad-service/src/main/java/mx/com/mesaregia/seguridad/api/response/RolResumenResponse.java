package mx.com.mesaregia.seguridad.api.response;

public record RolResumenResponse(Long id, String codigo, String nombre, boolean activo, Long version) {
}