package mx.com.mesaregia.cotizaciones.api.response;

import mx.com.mesaregia.cotizaciones.domain.enums.TipoConcepto;
import java.math.BigDecimal;

public record DetalleResponse(Long id, TipoConcepto tipoConcepto, Long idConcepto, String codigo, String nombre,
    BigDecimal cantidad, BigDecimal precioUnitario, BigDecimal porcentajeAdicional, Integer orden,
    BigDecimal subtotal) {
}