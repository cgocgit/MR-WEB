package mx.com.mesaregia.catalogo.api.response;

import mx.com.mesaregia.catalogo.domain.enums.TipoComponente;
import java.math.BigDecimal;

public record PaqueteComponenteResponse(
        Long id,
        TipoComponente tipo,
        Long idConcepto,
        String codigo,
        String nombre,
        BigDecimal cantidad,
        Integer orden,
        boolean conceptoActivo) {
}
