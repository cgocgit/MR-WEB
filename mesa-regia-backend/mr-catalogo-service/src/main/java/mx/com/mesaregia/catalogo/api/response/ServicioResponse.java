package mx.com.mesaregia.catalogo.api.response;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record ServicioResponse(
        Long id,
        String codigo,
        String nombre,
        String descripcion,
        CategoriaResponse categoria,
        String tipoServicio,
        BigDecimal tarifaBase,
        boolean activo,
        LocalDateTime creadoEn,
        LocalDateTime actualizadoEn,
        Long version) {
}
