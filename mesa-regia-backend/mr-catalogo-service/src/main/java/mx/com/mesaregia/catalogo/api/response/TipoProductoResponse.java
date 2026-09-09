package mx.com.mesaregia.catalogo.api.response;

import java.time.LocalDateTime;

public record TipoProductoResponse(
        Long id,
        String nombre,
        boolean activo,
        LocalDateTime actualizadoEn,
        Long version) {
}
