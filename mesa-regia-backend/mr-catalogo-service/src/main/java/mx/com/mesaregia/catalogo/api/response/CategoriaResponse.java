package mx.com.mesaregia.catalogo.api.response;

import mx.com.mesaregia.catalogo.domain.enums.AmbitoCategoria;
import java.time.LocalDateTime;

public record CategoriaResponse(
        Long id,
        String nombre,
        AmbitoCategoria ambito,
        boolean activo,
        LocalDateTime actualizadoEn,
        Long version) {
}
