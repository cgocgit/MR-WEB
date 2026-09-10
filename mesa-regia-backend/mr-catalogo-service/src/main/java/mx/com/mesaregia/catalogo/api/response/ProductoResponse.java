package mx.com.mesaregia.catalogo.api.response;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record ProductoResponse(
        Long id,
        String codigo,
        String nombre,
        String descripcion,
        CategoriaResponse categoria,
        TipoProductoResponse tipoProducto,
        ColorResponse color,
        String unidadMedida,
        BigDecimal precioBase,
        boolean activo,
        LocalDateTime creadoEn,
        LocalDateTime actualizadoEn,
        Long version) {
}
