package mx.com.mesaregia.catalogo.api.response;

import mx.com.mesaregia.catalogo.domain.enums.TipoConceptoPrecio;
import java.math.BigDecimal;

public record ListaPrecioDetalleResponse(
        Long id,
        TipoConceptoPrecio tipo,
        Long idConcepto,
        String codigo,
        String nombre,
        BigDecimal precio,
        boolean activo,
        Long version) {
}
