package mx.com.mesaregia.pagos.integration.event;

import java.math.BigDecimal;
import java.time.OffsetDateTime;

public record ImporteRequeridoCubiertoEvent(Long idCuentaCobro, Long idCotizacion, Long idCotizacionVersion,
    BigDecimal acumuladoNeto, BigDecimal importeRequerido, String correlationId, OffsetDateTime ocurridoEn) {
}
