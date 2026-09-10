package mx.com.mesaregia.seguridad.api.response;

import mx.com.mesaregia.seguridad.domain.enums.TipoDatoConfiguracion;

public record ConfiguracionResponse(Long id, String clave, String nombre, String descripcion,
    TipoDatoConfiguracion tipoDato, String valor, boolean activo, Long version) {
}