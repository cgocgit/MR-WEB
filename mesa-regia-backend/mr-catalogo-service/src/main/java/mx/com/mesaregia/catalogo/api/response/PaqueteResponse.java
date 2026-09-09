package mx.com.mesaregia.catalogo.api.response;

import java.time.LocalDateTime;

public record PaqueteResponse(
        Long id,
        String codigo,
        String nombre,
        String descripcion,
        boolean activo,
        long cantidadComponentes,
        LocalDateTime creadoEn,
        LocalDateTime actualizadoEn,
        Long version) {
}
