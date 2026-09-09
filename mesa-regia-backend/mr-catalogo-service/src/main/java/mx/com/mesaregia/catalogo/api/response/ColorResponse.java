package mx.com.mesaregia.catalogo.api.response;

import java.time.LocalDateTime;

public record ColorResponse(
        Long id,
        String nombre,
        boolean activo,
        LocalDateTime actualizadoEn,
        Long version) {
}
