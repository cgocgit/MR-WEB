package mx.com.mesaregia.ordenes.api.response;

import mx.com.mesaregia.ordenes.domain.enums.TipoConcepto;
import java.math.BigDecimal;

public record OrdenDetalleResponse(Long id, Long idDetallePadre, TipoConcepto tipoConcepto, Long idConceptoExterno,
    String codigo, String nombre, BigDecimal cantidad, Integer orden) {
}
