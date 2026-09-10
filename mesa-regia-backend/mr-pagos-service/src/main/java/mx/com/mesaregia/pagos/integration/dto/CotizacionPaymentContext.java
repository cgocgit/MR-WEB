package mx.com.mesaregia.pagos.integration.dto;

import java.math.BigDecimal;

public record CotizacionPaymentContext(Long idCotizacion, Long idCotizacionVersion, Long idCliente,
    String folioCotizacion, Integer numeroVersion, String nombreCliente, BigDecimal importeTotal,
    BigDecimal porcentajeConfirmacion, boolean versionElegida) {
}
